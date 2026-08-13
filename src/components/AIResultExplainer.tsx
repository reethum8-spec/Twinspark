import React, { useState } from 'react';
import { Sparkles, Lightbulb, TrendingDown, ShieldAlert, Cpu, BatteryCharging, Zap, HelpCircle, CheckCircle2 } from 'lucide-react';
import { ProductSpec, PowerMetrics } from '../types/twinspark';

interface AIResultExplainerProps {
  spec: ProductSpec;
  metrics: PowerMetrics;
}

export default function AIResultExplainer({ spec, metrics }: AIResultExplainerProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'insights'>('summary');

  // Check if system is blank or incomplete
  const allComponents = [
    ...(spec.controller ? [spec.controller] : []),
    ...spec.sensors,
    ...(spec.display ? [spec.display] : []),
    ...(spec.wireless ? [spec.wireless] : []),
    ...spec.outputs,
    ...(spec.customComponents || [])
  ].filter(Boolean);

  const isBlankSystem = allComponents.length === 0;

  // Identify top power consumer component
  const sortedShares = [...metrics.componentShares].sort((a, b) => b.percentageShare - a.percentageShare);
  const topConsumerShare = sortedShares.find(s => s.percentageShare > 0);
  const topConsumerComp = topConsumerShare ? allComponents.find(c => c.id === topConsumerShare.componentId) : undefined;

  // Identify visual peripherals (displays, LEDs) that actually exist in user design
  const visualPeripherals = [
    ...(spec.display ? [spec.display] : []),
    ...spec.outputs.filter(o => {
      const n = o.name.toLowerCase();
      return n.includes('led') || n.includes('display') || o.category === 'display';
    })
  ];

  // Identify critical battery or peak current warnings
  const peakWarning = metrics.warnings.find(w => w.id === 'warn-peak-exceeded' || w.id === 'warn-coin-cell-pulse');

  // Find sleep state
  const sleepState = spec.states.find(s => s.name === 'Sleep');
  const sleepDurationSec = sleepState ? sleepState.durationSec : 0;

  // Calculate dynamic projected battery days if sleep interval is increased
  const currentCycleSec = Math.max(1, spec.cyclePeriodSec);
  const extendedCycleSec = currentCycleSec + (sleepDurationSec > 0 ? sleepDurationSec : 300);
  const extendedAvgCurrentmA = (metrics.totalCycleChargemAs / extendedCycleSec) / (Math.max(0.1, spec.regulatorEfficiencyPercent / 100));
  const extendedBatteryLifeDays = spec.battery
    ? (metrics.usableCapacitymAh / (extendedAvgCurrentmA || 0.001)) / 24
    : 0;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl space-y-4">
      {/* Header Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Explain This Result & Power Insights
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">Design insights based on your current settings.</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'summary' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'insights' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dynamic Insights
          </button>
        </div>
      </div>

      {/* ── EMPTY / BLANK SYSTEM STATE ──────────────────────────────────── */}
      {isBlankSystem ? (
        <div className="p-6 bg-slate-950/70 border border-dashed border-slate-800 rounded-2xl text-center space-y-2.5">
          <HelpCircle className="w-8 h-8 text-slate-600 mx-auto" />
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Awaiting Component Configuration</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Add a controller, sensors, battery, or output peripherals to generate hardware power insights and runtime optimization tips tailored to your specific design.
          </p>
        </div>
      ) : (
        <>
          {/* TAB 1: DYNAMIC SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2.5">
                <p>
                  Your design <strong className="text-cyan-300">{spec.name}</strong> has an estimated average current draw of{' '}
                  <strong className="text-amber-400 font-mono font-bold">{metrics.adjustedAvgCurrentmA.toFixed(3)} mA</strong> (adjusted for{' '}
                  {spec.regulatorEfficiencyPercent}% voltage regulator efficiency).
                </p>

                {spec.battery ? (
                  <p>
                    With your <strong className="text-slate-100">{spec.battery.name}</strong> ({spec.battery.capacitymAh} mAh nominal,{' '}
                    {spec.usableCapacityPercent}% usable = <strong className="text-emerald-400 font-mono">{metrics.usableCapacitymAh} mAh</strong>),{' '}
                    the projected battery runtime is{' '}
                    <strong className="text-emerald-400 font-bold font-mono">
                      {metrics.batteryLifeDays >= 1 ? `${metrics.batteryLifeDays.toFixed(1)} Days` : `${metrics.batteryLifeHours.toFixed(1)} Hours`}
                    </strong>{' '}
                    ({metrics.batteryLifeHours.toFixed(0)} total operating hours).
                  </p>
                ) : (
                  <p className="text-amber-400 font-medium">
                    ⚠️ No battery selected. Add a battery to calculate estimated runtime in days and hours.
                  </p>
                )}

                {topConsumerShare && (
                  <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-cyan-200 mt-2 flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Primary Energy Consumer:</strong>{' '}
                      <strong className="text-slate-100">{topConsumerShare.componentName}</strong> accounts for{' '}
                      <strong className="text-amber-300">{topConsumerShare.percentageShare}%</strong> of total energy consumed during each{' '}
                      <span className="font-mono">{(currentCycleSec / 60).toFixed(1)}-minute</span> cycle.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DYNAMICALLY GENERATED INSIGHT CARDS */}
          {activeTab === 'insights' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4" />
                  Hardware & Firmware Optimization Insights
                </h4>
                <span className="text-[10px] text-slate-500 italic">Generated from current design</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">

                {/* 1. Critical Warning Alert (if peak/battery warning exists) */}
                {peakWarning && (
                  <div className="p-3.5 bg-red-500/10 border border-red-500/40 rounded-xl space-y-1 text-xs">
                    <div className="font-bold text-red-300 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-400" />
                      1. {peakWarning.title}
                    </div>
                    <p className="text-[11px] text-red-200/90 pl-6 leading-relaxed">
                      {peakWarning.description}
                    </p>
                  </div>
                )}

                {/* 2. Top Power Consumer Insight */}
                {topConsumerShare && (
                  <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1 text-xs">
                    <div className="font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      Top Contributor: {topConsumerShare.componentName} ({topConsumerShare.percentageShare}% Share)
                    </div>
                    <p className="text-[11px] text-slate-400 pl-4 leading-relaxed">
                      Drawing {topConsumerShare.averageCurrentmA.toFixed(3)} mA average over the cycle.{' '}
                      {topConsumerComp?.category === 'controller'
                        ? 'Enabling deep sleep modes during idle periods will significantly lower baseline current.'
                        : topConsumerComp?.category === 'sensor'
                        ? 'Consider shortening sensor measurement pulse duration or reducing reading frequency.'
                        : topConsumerComp?.category === 'wireless'
                        ? 'Batch sensor readings into fewer wireless transmission bursts to minimize RF power-on time.'
                        : 'Power down or duty-cycle this component when inactive to reclaim energy.'}
                    </p>
                  </div>
                )}

                {/* 3. Visual Peripherals Insight (ONLY shown if display or LED exists in design!) */}
                {visualPeripherals.length > 0 && (
                  <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1 text-xs">
                    <div className="font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Visual Output Management ({visualPeripherals.map(v => v.name).join(', ')})
                    </div>
                    <p className="text-[11px] text-slate-400 pl-4 leading-relaxed">
                      Your design includes {visualPeripherals.map(v => `${v.name} (${v.activeCurrentmA} mA active)`).join(' and ')}.{' '}
                      Turning off displays or status LEDs before starting wireless telemetry or during sleep intervals reduces active burst current.
                    </p>
                  </div>
                )}

                {/* 4. Dynamic Sleep Interval & Duty Cycle Impact */}
                {sleepDurationSec > 0 && spec.battery && (
                  <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1 text-xs">
                    <div className="font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      Duty Cycle & Sleep Interval Adjustment
                    </div>
                    <p className="text-[11px] text-slate-400 pl-4 leading-relaxed">
                      Your device currently operates at a <strong className="text-amber-300 font-mono">{metrics.dutyCyclePercent.toFixed(1)}%</strong> active duty cycle.
                      Increasing sleep duration between cycles from <span className="font-mono">{(currentCycleSec / 60).toFixed(1)} mins</span> to{' '}
                      <span className="font-mono">{(extendedCycleSec / 60).toFixed(1)} mins</span> is projected to extend battery runtime from{' '}
                      <strong className="text-slate-200 font-mono">{metrics.batteryLifeDays.toFixed(1)} days</strong> to approximately{' '}
                      <strong className="text-emerald-400 font-mono font-bold">{extendedBatteryLifeDays.toFixed(1)} days</strong>.
                    </p>
                  </div>
                )}

                {/* 5. Voltage Regulator Efficiency Losses */}
                {spec.regulatorEfficiencyPercent < 95 && (
                  <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1 text-xs">
                    <div className="font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Voltage Regulator Thermal Losses ({spec.regulatorEfficiencyPercent}% Efficiency)
                    </div>
                    <p className="text-[11px] text-slate-400 pl-4 leading-relaxed">
                      Your DC-DC converter efficiency is set to {spec.regulatorEfficiencyPercent}%, dissipating{' '}
                      <span className="text-amber-400 font-bold">{(100 - spec.regulatorEfficiencyPercent).toFixed(0)}%</span> of battery power as heat. Upgrading to a 95% low-quiescent buck converter would increase effective battery runtime by ~{((95 - spec.regulatorEfficiencyPercent) * 0.8).toFixed(1)}%.
                    </p>
                  </div>
                )}

              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
