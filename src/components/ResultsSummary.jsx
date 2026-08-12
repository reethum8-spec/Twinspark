import React from 'react';
import { BatteryCharging, Zap, Flame, Calendar, Activity, Info, AlertTriangle } from 'lucide-react';
import { BATTERY_CHEMISTRIES } from '../data/presets';
import { calculatePowerMetrics } from '../utils/calculator';

export default function ResultsSummary({ spec, metrics }) {
  const isCoinCellWarning = spec.battery.chemistry.includes('CR2032') && metrics.I_peak_mA > 15;

  return (
    <div className="space-y-4">
      {/* 5 Key Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Estimated Battery Life */}
        <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 p-4 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:scale-150 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Est. Battery Life</span>
            <Calendar className="w-4 h-4 text-amber-400 animate-bounce" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-100 font-mono">
              {metrics.lifeYears >= 1 ? metrics.lifeYears.toFixed(1) : metrics.lifeDays.toFixed(0)}
            </span>
            <span className="text-xs font-semibold text-amber-300">
              {metrics.lifeYears >= 1 ? 'Years' : 'Days'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            ({metrics.lifeMonths.toFixed(1)} Months / {metrics.lifeDays.toFixed(0)} Days runtime)
          </p>
        </div>

        {/* Average Current */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Avg Current (I_avg)</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-slate-100 font-mono">
              {metrics.I_avg_mA >= 1 ? metrics.I_avg_mA.toFixed(2) : metrics.I_avg_uA.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-cyan-400 font-mono">
              {metrics.I_avg_mA >= 1 ? 'mA' : 'µA'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Effective load: {metrics.I_avg_battery_mA.toFixed(3)} mA @ {metrics.efficiency * 100}% eff.
          </p>
        </div>

        {/* Peak Current */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">Peak Current (I_peak)</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-slate-100 font-mono">
              {metrics.I_peak_mA.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-orange-400 font-mono">mA</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Max concurrent active load burst
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
              {metrics.mAhPerDay.toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-purple-400 font-mono">mAh/day</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {metrics.mWhPerDay.toFixed(2)} mWh / day
          </p>
        </div>
      </div>

      {/* Warning Alert if High Peak Current on Coin Cell */}
      {isCoinCellWarning && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/40 rounded-xl flex items-start gap-3 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block">Coin Cell High Peak Warning:</strong>
            Peak current ({metrics.I_peak_mA.toFixed(1)} mA) exceeds standard CR2032 continuous pulse limits (~15 mA). High internal resistance may cause brownout reset unless backed by a reservoir capacitor!
          </div>
        </div>
      )}

      {/* Chemistry Comparison Quick Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span>Chemistry Lifetime Comparison</span>
          <span className="text-[10px] font-normal text-slate-400">Same electrical payload</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {BATTERY_CHEMISTRIES.slice(0, 3).map(chem => {
            const tempBatterySpec = {
              ...spec,
              battery: {
                ...spec.battery,
                chemistry: chem.name,
                nominalCapacitymAh: chem.defaultCapacity,
                nominalVoltage: chem.voltage,
                selfDischargePercentPerYear: chem.selfDischargeYr,
                deratingFactor: chem.derating
              }
            };
            const chemMetrics = calculatePowerMetrics(tempBatterySpec);
            const isCurrent = spec.battery.chemistry === chem.name;

            return (
              <div
                key={chem.name}
                className={`p-3 rounded-xl border transition-all ${
                  isCurrent ? 'bg-amber-500/10 border-amber-500/50 text-amber-200' : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-[11px] font-bold text-slate-200 truncate">{chem.name}</div>
                <div className="text-xs font-mono font-bold text-cyan-400 mt-1">
                  {chemMetrics.lifeYears >= 1 ? `${chemMetrics.lifeYears.toFixed(1)} Years` : `${chemMetrics.lifeDays.toFixed(0)} Days`}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{chem.defaultCapacity} mAh @ {chem.voltage}V</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
