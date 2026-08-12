// Electrical Calculation Engine for TwinSpark

export function calculatePowerMetrics(spec) {
  const { controller, sensors = [], wireless, battery, schedule } = spec;

  const cyclePeriodSec = Math.max(0.1, parseFloat(schedule.cyclePeriodSec) || 60);

  // 1. Controller Calculations
  const mcuActivemA = parseFloat(controller.activeCurrentmA) || 0;
  const mcuSleepuA = parseFloat(controller.sleepCurrentuA) || 0;
  const mcuSleepmA = mcuSleepuA / 1000;
  const mcuActiveSec = Math.min(cyclePeriodSec, parseFloat(controller.activeTimeSec) || 0.1);
  const mcuSleepSec = Math.max(0, cyclePeriodSec - mcuActiveSec);

  const Q_mcu_mAs = (mcuActivemA * mcuActiveSec) + (mcuSleepmA * mcuSleepSec);

  // 2. Sensors Calculations
  let Q_sensors_mAs = 0;
  let sensorActivePeakmA = 0;
  const sensorBreakdowns = sensors.map(sensor => {
    const actmA = parseFloat(sensor.activeCurrentmA) || 0;
    const idleuA = parseFloat(sensor.idleCurrentuA) || 0;
    const idlemA = idleuA / 1000;
    const actSec = Math.min(cyclePeriodSec, parseFloat(sensor.activeTimeSec) || 0.05);
    const idleSec = Math.max(0, cyclePeriodSec - actSec);
    const q_mAs = (actmA * actSec) + (idlemA * idleSec);
    
    Q_sensors_mAs += q_mAs;
    sensorActivePeakmA += actmA;

    return {
      name: sensor.name,
      actmA,
      idleuA,
      actSec,
      q_mAs,
      avgCurrentmA: q_mAs / cyclePeriodSec
    };
  });

  // 3. Wireless Calculations
  const txCurrentmA = parseFloat(wireless.txCurrentmA) || 0;
  const rxCurrentmA = parseFloat(wireless.rxCurrentmA) || 0;
  const wirelessSleepuA = parseFloat(wireless.sleepCurrentuA) || 0;
  const wirelessSleepmA = wirelessSleepuA / 1000;

  const txTimeSec = Math.min(cyclePeriodSec, parseFloat(wireless.txTimeSec) || 0);
  const rxTimeSec = Math.min(cyclePeriodSec - txTimeSec, parseFloat(wireless.rxTimeSec) || 0);
  const wirelessSleepSec = Math.max(0, cyclePeriodSec - txTimeSec - rxTimeSec);

  const Q_wireless_mAs = (txCurrentmA * txTimeSec) + (rxCurrentmA * rxTimeSec) + (wirelessSleepmA * wirelessSleepSec);

  // 4. Total Charge per Cycle
  const Q_total_mAs = Q_mcu_mAs + Q_sensors_mAs + Q_wireless_mAs;
  const I_avg_mA = Q_total_mAs / cyclePeriodSec;
  const I_avg_uA = I_avg_mA * 1000;

  // 5. Peak Current Draw
  const I_peak_mA = mcuActivemA + sensorActivePeakmA + txCurrentmA;

  // 6. Power Supply / Regulator Adjustments
  const efficiency = Math.max(0.1, Math.min(1.0, parseFloat(battery.powerEfficiency) || 0.90));
  const I_avg_battery_mA = I_avg_mA / efficiency;

  // 7. Battery Self Discharge & Derating
  const nominalCapmAh = parseFloat(battery.nominalCapacitymAh) || 1000;
  const nominalVoltage = parseFloat(battery.nominalVoltage) || 3.7;
  const deratingFactor = Math.max(0.1, Math.min(1.0, parseFloat(battery.deratingFactor) || 0.85));
  const selfDischargeYr = parseFloat(battery.selfDischargePercentPerYear) || 2.0;

  const C_eff_mAh = nominalCapmAh * deratingFactor;
  
  // Self discharge equivalent constant current in mA
  // Hours per year = 365.25 * 24 = 8766
  const selfDischargeCapYear = nominalCapmAh * (selfDischargeYr / 100);
  const I_selfDischarge_mA = selfDischargeCapYear / 8766;

  const I_system_total_mA = I_avg_battery_mA + I_selfDischarge_mA;

  // 8. Life Estimates
  const lifeHours = C_eff_mAh / (I_system_total_mA || 0.0001);
  const lifeDays = lifeHours / 24;
  const lifeMonths = lifeDays / 30.4375;
  const lifeYears = lifeDays / 365.25;

  // 9. Daily Energy Consumption
  const mAhPerDay = I_avg_battery_mA * 24;
  const mWhPerDay = mAhPerDay * nominalVoltage;

  // 10. Duty Cycle Percentage
  const maxActiveSec = Math.max(mcuActiveSec, txTimeSec, ...sensors.map(s => s.activeTimeSec || 0));
  const dutyCyclePercent = (maxActiveSec / cyclePeriodSec) * 100;

  // 11. Energy Shares Breakdown
  const mcuShare = (Q_mcu_mAs / Q_total_mAs) * 100 || 0;
  const sensorShare = (Q_sensors_mAs / Q_total_mAs) * 100 || 0;
  const wirelessShare = (Q_wireless_mAs / Q_total_mAs) * 100 || 0;

  return {
    cyclePeriodSec,
    Q_mcu_mAs,
    Q_sensors_mAs,
    Q_wireless_mAs,
    Q_total_mAs,
    I_avg_mA,
    I_avg_uA,
    I_peak_mA,
    I_avg_battery_mA,
    efficiency,
    nominalCapmAh,
    nominalVoltage,
    deratingFactor,
    C_eff_mAh,
    selfDischargeYr,
    I_selfDischarge_mA,
    I_system_total_mA,
    lifeHours,
    lifeDays,
    lifeMonths,
    lifeYears,
    mAhPerDay,
    mWhPerDay,
    dutyCyclePercent,
    shares: {
      mcu: mcuShare,
      sensors: sensorShare,
      wireless: wirelessShare,
    },
    sensorBreakdowns
  };
}

export function generateFormulaSteps(spec, metrics) {
  const { controller, wireless, battery } = spec;

  return [
    {
      id: 'step-1',
      title: '1. Charge per Cycle (Q_cycle)',
      formulaLaTeX: 'Q_{\\text{cycle}} = Q_{\\text{MCU}} + Q_{\\text{sensors}} + Q_{\\text{wireless}}',
      explanation: 'Calculates total microampere-seconds or milliampere-seconds consumed in one repetition window.',
      substitution: `Q_{\\text{cycle}} = ${metrics.Q_mcu_mAs.toFixed(3)} + ${metrics.Q_sensors_mAs.toFixed(3)} + ${metrics.Q_wireless_mAs.toFixed(3)} = ${metrics.Q_total_mAs.toFixed(3)}\\text{ mAs}`,
      numericalResult: `${metrics.Q_total_mAs.toFixed(3)} mAs`
    },
    {
      id: 'step-2',
      title: '2. Average Current Draw (I_avg)',
      formulaLaTeX: 'I_{\\text{avg}} = \\frac{Q_{\\text{cycle}}}{T_{\\text{cycle}}}',
      explanation: 'Averaged current over the cycle time period.',
      substitution: `I_{\\text{avg}} = \\frac{${metrics.Q_total_mAs.toFixed(3)}\\text{ mAs}}{${metrics.cyclePeriodSec}\\text{ s}} = ${metrics.I_avg_mA.toFixed(4)}\\text{ mA} (${metrics.I_avg_uA.toFixed(1)}\\text{ \\mu A})`,
      numericalResult: `${metrics.I_avg_mA.toFixed(4)} mA (${metrics.I_avg_uA.toFixed(1)} µA)`
    },
    {
      id: 'step-3',
      title: '3. Battery Load with Regulator Efficiency (I_battery)',
      formulaLaTeX: 'I_{\\text{battery}} = \\frac{I_{\\text{avg}}}{\\eta_{\\text{pwr}}}',
      explanation: 'Adjusts current draw for buck/boost DC-DC converter or LDO thermal efficiency losses.',
      substitution: `I_{\\text{battery}} = \\frac{${metrics.I_avg_mA.toFixed(4)}\\text{ mA}}{${metrics.efficiency}} = ${metrics.I_avg_battery_mA.toFixed(4)}\\text{ mA}`,
      numericalResult: `${metrics.I_avg_battery_mA.toFixed(4)} mA`
    },
    {
      id: 'step-4',
      title: '4. Effective Battery Capacity (C_eff)',
      formulaLaTeX: 'C_{\\text{eff}} = C_{\\text{nominal}} \\times \\delta_{\\text{derating}}',
      explanation: 'Derates nominal capacity for operating temperature, pulse discharge strain, and aging.',
      substitution: `C_{\\text{eff}} = ${metrics.nominalCapmAh}\\text{ mAh} \\times ${metrics.deratingFactor} = ${metrics.C_eff_mAh.toFixed(1)}\\text{ mAh}`,
      numericalResult: `${metrics.C_eff_mAh.toFixed(1)} mAh`
    },
    {
      id: 'step-5',
      title: '5. Battery Self-Discharge & Total Current',
      formulaLaTeX: 'I_{\\text{total}} = I_{\\text{battery}} + I_{\\text{self\\_discharge}}',
      explanation: 'Adds chemical self-discharge leakage spread over 8,766 operating hours per year.',
      substitution: `I_{\\text{total}} = ${metrics.I_avg_battery_mA.toFixed(4)} + ${metrics.I_selfDischarge_mA.toFixed(5)} = ${metrics.I_system_total_mA.toFixed(4)}\\text{ mA}`,
      numericalResult: `${metrics.I_system_total_mA.toFixed(4)} mA`
    },
    {
      id: 'step-6',
      title: '6. Estimated Battery Lifetime',
      formulaLaTeX: '\\text{Life}_{\\text{years}} = \\frac{C_{\\text{eff}}}{I_{\\text{total}} \\times 24 \\times 365.25}',
      explanation: 'Final projected runtime of the product before battery depletion.',
      substitution: `\\text{Life} = \\frac{${metrics.C_eff_mAh.toFixed(1)}\\text{ mAh}}{${metrics.I_system_total_mA.toFixed(4)}\\text{ mA} \\times 8766\\text{ h}} = ${metrics.lifeYears.toFixed(2)}\\text{ Years}`,
      numericalResult: `${metrics.lifeYears.toFixed(2)} Years (${metrics.lifeDays.toFixed(0)} Days)`
    }
  ];
}
