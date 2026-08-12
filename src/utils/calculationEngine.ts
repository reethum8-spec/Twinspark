import { ProductSpec, PowerMetrics, ComponentPowerShare, StatePowerBreakdown, WarningItem, ComponentItem } from '../types/twinspark';

export function calculateDeterministicMetrics(spec: ProductSpec): PowerMetrics {
  const {
    controller,
    sensors = [],
    display,
    wireless,
    outputs = [],
    customComponents = [],
    battery,
    regulator,
    usableCapacityPercent = 85,
    regulatorEfficiencyPercent = 90,
    cyclePeriodSec = 600,
    states = []
  } = spec;

  // 1. Gather all active components in system
  const allComponents: ComponentItem[] = [
    ...(controller ? [controller] : []),
    ...sensors,
    ...(display ? [display] : []),
    ...(wireless ? [wireless] : []),
    ...outputs,
    ...customComponents
  ].filter(Boolean);

  // Map of componentId -> component
  const compMap = new Map<string, ComponentItem>();
  allComponents.forEach(c => compMap.set(c.id, c));

  // 2. Ensure total cycle duration is valid
  const validCycleDurationSec = Math.max(1, cyclePeriodSec);

  // Cumulative state calculations
  let totalStateDurationSec = 0;
  let totalCycleChargemAs = 0;
  let peakCurrentmA = 0;

  const stateBreakdowns: StatePowerBreakdown[] = [];
  const compChargeAccumulator = new Map<string, number>(); // componentId -> mAs

  // Initialize accumulators for each component
  allComponents.forEach(c => compChargeAccumulator.set(c.id, 0));

  // Evaluate each operating state
  states.forEach(st => {
    const duration = Math.max(0.001, st.durationSec);
    totalStateDurationSec += duration;

    // Determine components active in this state
    let stateCurrentmA = 0;

    if (st.name === 'Sleep') {
      // In sleep mode, sum sleep current of all components
      allComponents.forEach(c => {
        const sleepmA = (c.sleepCurrentuA || 0) / 1000;
        stateCurrentmA += sleepmA;
        compChargeAccumulator.set(c.id, (compChargeAccumulator.get(c.id) || 0) + (sleepmA * duration));
      });
    } else {
      // Active state: active components draw active current, inactive draw sleep current
      const activeIdsSet = new Set(st.activeComponentIds);

      allComponents.forEach(c => {
        const isCompActive = activeIdsSet.has(c.id) || (controller && c.id === controller.id);
        const currentToDraw = isCompActive ? c.activeCurrentmA : ((c.sleepCurrentuA || 0) / 1000);
        
        stateCurrentmA += currentToDraw;
        compChargeAccumulator.set(c.id, (compChargeAccumulator.get(c.id) || 0) + (currentToDraw * duration));

        // Track system peak current (highest active current burst)
        if (isCompActive) {
          const compPeak = c.peakCurrentmA || c.activeCurrentmA;
          if (compPeak > peakCurrentmA) {
            peakCurrentmA = compPeak;
          }
        }
      });
    }

    const stateChargemAs = stateCurrentmA * duration;
    totalCycleChargemAs += stateChargemAs;

    stateBreakdowns.push({
      stateId: st.id,
      stateName: st.name,
      durationSec: duration,
      stateCurrentmA,
      chargeContributionmAs: stateChargemAs
    });
  });

  // Calculate Average Load Current over the entire cycle period
  const avgLoadCurrentmA = totalCycleChargemAs / validCycleDurationSec;

  // 3. Adjust for Voltage Regulator Efficiency
  const efficiencyDecimal = Math.max(0.1, Math.min(1.0, regulatorEfficiencyPercent / 100));
  const adjustedAvgCurrentmA = avgLoadCurrentmA / efficiencyDecimal;

  // 4. Calculate Usable Battery Capacity & Life
  const nominalCapmAh = battery?.capacitymAh || 2000;
  const usableCapDecimal = Math.max(0.1, Math.min(1.0, usableCapacityPercent / 100));
  const usableCapacitymAh = nominalCapmAh * usableCapDecimal;

  const batteryLifeHours = usableCapacitymAh / (adjustedAvgCurrentmA || 0.00001);
  const batteryLifeDays = batteryLifeHours / 24;

  // Daily energy consumption
  const dailyEnergyConsumptionmAh = adjustedAvgCurrentmA * 24;
  const dailyEnergyConsumptionmWh = dailyEnergyConsumptionmAh * (battery?.voltage || 3.7);

  // Duty Cycle Percentage
  const activeTimeSec = states.filter(s => s.name !== 'Sleep').reduce((acc, s) => acc + s.durationSec, 0);
  const dutyCyclePercent = (activeTimeSec / validCycleDurationSec) * 100;

  // 5. Component Power Shares
  const componentShares: ComponentPowerShare[] = allComponents.map(c => {
    const compTotalmAs = compChargeAccumulator.get(c.id) || 0;
    const compAvgmA = compTotalmAs / validCycleDurationSec;
    const sharePercent = totalCycleChargemAs > 0 ? (compTotalmAs / totalCycleChargemAs) * 100 : 0;

    return {
      componentId: c.id,
      componentName: c.name,
      category: c.category,
      averageCurrentmA: compAvgmA,
      percentageShare: Math.round(sharePercent * 10) / 10
    };
  });

  // 6. Warnings Engine
  const warnings: WarningItem[] = [];

  if (allComponents.length === 0) {
    warnings.push({
      id: 'warn-empty-system',
      severity: 'info',
      title: 'Blank System - Add Components',
      description: 'Your project is currently empty. Add a controller, sensors, battery, or custom components to calculate battery life.',
    });
  }

  // Check Peak Current vs Battery Discharge Limit
  if (battery) {
    const maxDischarge = battery.maxContinuousDischargemA || 2000;
    if (peakCurrentmA > maxDischarge) {
      warnings.push({
        id: 'warn-peak-exceeded',
        severity: 'critical',
        title: 'Peak Current Exceeds Battery Continuous Limit',
        description: `Estimated peak current burst (${peakCurrentmA.toFixed(1)} mA) exceeds the safe continuous discharge rating of ${battery.name} (${maxDischarge} mA). This risks brownout resets!`,
        componentId: battery.id
      });
    } else if (battery.name.includes('CR2032') && peakCurrentmA > 15) {
      warnings.push({
        id: 'warn-coin-cell-pulse',
        severity: 'warning',
        title: 'Coin Cell High Pulse Current Strain',
        description: `Peak current burst (${peakCurrentmA.toFixed(1)} mA) exceeds standard CR2032 continuous pulse limits (~15 mA). High internal resistance can drop voltage rapidly unless buffered by a capacitor.`,
        componentId: battery.id
      });
    }
  }

  // Check Low Regulator Efficiency
  if (regulatorEfficiencyPercent < 75) {
    warnings.push({
      id: 'warn-low-efficiency',
      severity: 'info',
      title: 'Low Regulator Efficiency Losses',
      description: `Voltage regulator efficiency is set to ${regulatorEfficiencyPercent}%. Up to ${100 - regulatorEfficiencyPercent}% of battery energy is lost as heat. Consider upgrading to a high-efficiency buck-boost converter.`,
      componentId: regulator?.id
    });
  }

  // Check High Active Duty Cycle
  if (dutyCyclePercent > 20 && controller) {
    warnings.push({
      id: 'warn-high-duty',
      severity: 'warning',
      title: 'High Active Duty Cycle',
      description: `Device spends ${dutyCyclePercent.toFixed(1)}% of its time in active states. Increasing deep sleep duration between sensor transmissions will dramatically extend battery runtime.`,
      componentId: controller.id
    });
  }

  return {
    totalCycleDurationSec: validCycleDurationSec,
    totalCycleChargemAs,
    avgLoadCurrentmA,
    adjustedAvgCurrentmA,
    peakCurrentmA,
    usableCapacitymAh,
    batteryLifeHours,
    batteryLifeDays,
    dailyEnergyConsumptionmAh,
    dailyEnergyConsumptionmWh,
    dutyCyclePercent,
    componentShares,
    stateBreakdowns,
    warnings
  };
}
