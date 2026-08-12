import React from 'react';
import { Calendar, Zap, Flame, Activity, AlertTriangle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';
import { ProductSpec, PowerMetrics } from '../types/twinspark';

interface DigitalTwinDashboardProps {
  spec: ProductSpec;
  metrics: PowerMetrics;
}

export default function DigitalTwinDashboard({ spec, metrics }: DigitalTwinDashboardProps) {
  return (
    <div className="space-y-4">
      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Estimated Battery Life */}
        <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-900 border border-emerald-500/30 p-4 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Est. Battery Life</span>
            <Calendar className="w-4 h-4 text-emerald-400 animate-bounce" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-100 font-mono">
              {metrics.batteryLifeDays >= 1 ? metrics.batteryLifeDays.toFixed(1) : metrics.batteryLifeHours.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-emerald-300">
              {metrics.batteryLifeDays >= 1 ? 'Days' : 'Hours'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            ({metrics.batteryLifeHours.toFixed(0)} Total Operating Hours) *Estimated
          </p>
        </div>

        {/* Estimated Average Current */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Est. Avg Current</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-slate-100 font-mono">
              {metrics.adjustedAvgCurrentmA.toFixed(3)}
            </span>
            <span className="text-xs font-semibold text-cyan-400 font-mono">mA</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Raw load: {metrics.avgLoadCurrentmA.toFixed(3)} mA @ {spec.regulatorEfficiencyPercent}% eff.
          </p>
        </div>

        {/* Estimated Peak Current */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">Est. Peak Current</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-slate-100 font-mono">
              {metrics.peakCurrentmA.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-orange-400 font-mono">mA</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Wi-Fi / Sensor burst peak
          </p>
        </div>

        {/* Daily Energy Consumption */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">Daily Energy</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-slate-100 font-mono">
              {metrics.dailyEnergyConsumptionmAh.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-purple-400 font-mono">mAh/day</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {metrics.dailyEnergyConsumptionmWh.toFixed(1)} mWh / day
          </p>
        </div>
      </div>

      {/* Warnings & Alerts System */}
      {metrics.warnings.length > 0 && (
        <div className="space-y-2">
          {metrics.warnings.map(warn => (
            <div
              key={warn.id}
              className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
                warn.severity === 'critical'
                  ? 'bg-red-500/10 border-red-500/40 text-red-200'
                  : warn.severity === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                  : 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
              }`}
            >
              <ShieldAlert className={`w-4 h-4 shrink-0 mt-0.5 ${
                warn.severity === 'critical' ? 'text-red-400' : 'text-amber-400'
              }`} />
              <div>
                <strong className="font-bold block">{warn.title}</strong>
                <span className="text-[11px] leading-relaxed block mt-0.5">{warn.description}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Per-Component Power Contribution Table / Bars */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Per-Component Power Contribution
          </h4>
          <span className="text-[10px] text-slate-400 font-mono">Cycle Total: {metrics.totalCycleChargemAs.toFixed(1)} mAs</span>
        </div>

        <div className="space-y-2.5">
          {metrics.componentShares.map(share => (
            <div key={share.componentId} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-300 font-semibold">{share.componentName}</span>
                <span className="text-cyan-400 font-mono font-bold">{share.percentageShare}%</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(2, share.percentageShare))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assumptions & Formula Notice */}
      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
        <div className="font-bold text-slate-300 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Formula & Calculation Assumptions</span>
        </div>
        <p>
          • <strong>Average Current Formula:</strong> Average Current (mA) = Sum(State Current × Duration) ÷ Total Cycle Duration ÷ (Regulator Efficiency % / 100)
        </p>
        <p>
          • <strong>Battery Life Formula:</strong> Battery Life (Hours) = Usable Battery Capacity (mAh) ÷ Adjusted Average Current (mA)
        </p>
        <p className="text-[10px] text-slate-500 italic">
          *All figures are deterministic baseline estimates. Real-world battery life varies with ambient temperature, battery age, and RF signal strength.
        </p>
      </div>
    </div>
  );
}
