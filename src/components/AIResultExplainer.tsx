import React, { useState } from 'react';
import { Sparkles, Lightbulb, TrendingDown, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { ProductSpec, PowerMetrics } from '../types/twinspark';

interface AIResultExplainerProps {
  spec: ProductSpec;
  metrics: PowerMetrics;
  onApplyOptimization?: (action: 'increase-sleep' | 'disable-display-during-tx') => void;
}

export default function AIResultExplainer({ spec, metrics, onApplyOptimization }: AIResultExplainerProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'tips' | 'formulas'>('summary');

  // Identify top power consumer component
  const topConsumer = [...metrics.componentShares].sort((a, b) => b.percentageShare - a.percentageShare)[0];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl space-y-4">
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Explain This Result & Power Insights
            </h3>
            <p className="text-xs text-slate-400">AI analysis of current draw, energy leaks, and runtime optimizations.</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'summary' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'tips' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Power Tips
          </button>
        </div>
      </div>

      {/* TAB 1: SUMMARY */}
      {activeTab === 'summary' && (
        <div className="space-y-3">
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
            <p>
              Your <strong className="text-cyan-300">{spec.name}</strong> has an estimated average current draw of{' '}
              <strong className="text-amber-400 font-mono">{metrics.adjustedAvgCurrentmA.toFixed(3)} mA</strong> (adjusted for{' '}
              {spec.regulatorEfficiencyPercent}% regulator efficiency).
            </p>
            <p>
              With your <strong className="text-slate-100">{spec.battery.name}</strong> ({spec.battery.capacitymAh} mAh nominal,{' '}
              {spec.usableCapacityPercent}% usable = <strong className="text-emerald-400 font-mono">{metrics.usableCapacitymAh} mAh</strong>),{' '}
              the projected battery lifetime is <strong className="text-emerald-400 font-bold font-mono">{metrics.batteryLifeDays.toFixed(1)} Days</strong> ({metrics.batteryLifeHours.toFixed(0)} Hours).
            </p>

            {topConsumer && (
              <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-lg text-cyan-200 mt-2 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Primary Power Consumer:</strong>{' '}
                  {topConsumer.componentName} accounts for <strong className="text-amber-300">{topConsumer.percentageShare}%</strong> of total energy consumed during each 10-minute cycle.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: POWER REDUCTION TIPS */}
      {activeTab === 'tips' && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4" />
            Practical Hardware & Firmware Power Reduction Suggestions
          </h4>

          <div className="grid grid-cols-1 gap-2.5">
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
              <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                1. Increase Sleep Interval between Transmissions
              </div>
              <p className="text-[11px] text-slate-400 pl-4">
                Increasing deep sleep from 10 minutes to 30 minutes reduces average Wi-Fi transmission power share by ~66%, extending battery life from {metrics.batteryLifeDays.toFixed(0)} days to ~{(metrics.batteryLifeDays * 2.8).toFixed(0)} days.
              </p>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
              <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                2. Turn off Display & LEDs during Wi-Fi Handshake
              </div>
              <p className="text-[11px] text-slate-400 pl-4">
                The 0.96" OLED display draws 20 mA and the status LED draws 15 mA. Powering down the screen before starting Wi-Fi association saves 35 mA peak current.
              </p>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
              <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                3. Utilize High-Efficiency Buck Regulator
              </div>
              <p className="text-[11px] text-slate-400 pl-4">
                Your current regulator efficiency is set to {spec.regulatorEfficiencyPercent}%. Upgrading to a 95% low-quiescent buck converter reclaims ~5.5% usable capacity.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
