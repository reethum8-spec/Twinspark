import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Cpu, Radio, BatteryCharging, Clock, Gauge, Sparkles } from 'lucide-react';
import { BATTERY_CHEMISTRIES, WIRELESS_PROTOCOLS, PRESETS } from '../data/presets';
import { calculatePowerMetrics } from '../utils/calculator';

export default function PromptWizard({ spec, onUpdateSpec, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [tempSpec, setTempSpec] = useState(JSON.parse(JSON.stringify(spec)));

  const metrics = calculatePowerMetrics(tempSpec);

  const steps = [
    { id: 1, name: 'Controller', icon: Cpu },
    { id: 2, name: 'Sensors', icon: Gauge },
    { id: 3, name: 'Wireless', icon: Radio },
    { id: 4, name: 'Battery', icon: BatteryCharging },
    { id: 5, name: 'Schedule', icon: Clock },
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onUpdateSpec(tempSpec);
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-slate-100">Interactive Product Architecture Wizard</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Answer key questions to optimize your battery-powered device specs.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="px-6 py-3 bg-slate-950/30 border-b border-slate-800/60 flex items-center justify-between">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = currentStep === s.id;
            const isCompleted = currentStep > s.id;
            return (
              <div key={s.id} className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentStep(s.id)}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  isActive ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20' : isCompleted ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-slate-800 text-slate-500'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`hidden sm:inline text-xs font-medium ${isActive ? 'text-amber-300 font-bold' : isCompleted ? 'text-slate-300' : 'text-slate-500'}`}>
                  {s.name}
                </span>
                {idx < steps.length - 1 && <div className="w-4 sm:w-8 h-0.5 bg-slate-800 hidden sm:block" />}
              </div>
            );
          })}
        </div>

        {/* Wizard Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: CONTROLLER */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                <Cpu className="w-4 h-4" /> 1. Select & Configure Microcontroller (MCU)
              </h3>
              <p className="text-xs text-slate-400">What processor runs your firmware? MCU active current dominates active state draw.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">MCU Model / Name</label>
                  <input
                    type="text"
                    value={tempSpec.controller.name}
                    onChange={(e) => setTempSpec({ ...tempSpec, controller: { ...tempSpec.controller, name: e.target.value } })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Operating Voltage (V)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempSpec.controller.voltage}
                    onChange={(e) => setTempSpec({ ...tempSpec, controller: { ...tempSpec.controller, voltage: parseFloat(e.target.value) || 3.3 } })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Active Current (mA)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempSpec.controller.activeCurrentmA}
                    onChange={(e) => setTempSpec({ ...tempSpec, controller: { ...tempSpec.controller, activeCurrentmA: parseFloat(e.target.value) || 0 } })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Sleep Current (µA)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempSpec.controller.sleepCurrentuA}
                    onChange={(e) => setTempSpec({ ...tempSpec, controller: { ...tempSpec.controller, sleepCurrentuA: parseFloat(e.target.value) || 0 } })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SENSORS */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                <Gauge className="w-4 h-4" /> 2. Connected Sensors & Peripherals
              </h3>
              <p className="text-xs text-slate-400">Configure active current draw and sample window times for each sensor.</p>

              <div className="space-y-3">
                {tempSpec.sensors.map((s, idx) => (
                  <div key={s.id || idx} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      value={s.name}
                      onChange={(e) => {
                        const newSensors = [...tempSpec.sensors];
                        newSensors[idx].name = e.target.value;
                        setTempSpec({ ...tempSpec, sensors: newSensors });
                      }}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 flex-1 min-w-[140px]"
                    />
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400">Act:</span>
                      <input
                        type="number"
                        step="0.1"
                        value={s.activeCurrentmA}
                        onChange={(e) => {
                          const newSensors = [...tempSpec.sensors];
                          newSensors[idx].activeCurrentmA = parseFloat(e.target.value) || 0;
                          setTempSpec({ ...tempSpec, sensors: newSensors });
                        }}
                        className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono"
                      />
                      <span className="text-[11px] text-slate-400">mA</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400">Time:</span>
                      <input
                        type="number"
                        step="0.05"
                        value={s.activeTimeSec}
                        onChange={(e) => {
                          const newSensors = [...tempSpec.sensors];
                          newSensors[idx].activeTimeSec = parseFloat(e.target.value) || 0;
                          setTempSpec({ ...tempSpec, sensors: newSensors });
                        }}
                        className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono"
                      />
                      <span className="text-[11px] text-slate-400">s</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: WIRELESS */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                <Radio className="w-4 h-4" /> 3. Wireless Protocol & Transmission
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {WIRELESS_PROTOCOLS.map(proto => (
                  <div
                    key={proto.name}
                    onClick={() => {
                      setTempSpec({
                        ...tempSpec,
                        wireless: {
                          ...tempSpec.wireless,
                          protocol: proto.name,
                          txCurrentmA: proto.txCurrent,
                          rxCurrentmA: proto.rxCurrent,
                          sleepCurrentuA: proto.sleepCurrent,
                          txTimeSec: proto.txTime
                        }
                      });
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      tempSpec.wireless.protocol === proto.name
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-200">{proto.name}</div>
                    <div className="text-[11px] mt-1 text-slate-400">{proto.description}</div>
                    <div className="text-[10px] font-mono text-cyan-400 mt-2">
                      TX Peak: {proto.txCurrent} mA | Burst: {proto.txTime}s
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: BATTERY */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                <BatteryCharging className="w-4 h-4" /> 4. Battery Chemistry & Power Converter
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BATTERY_CHEMISTRIES.map(b => (
                  <div
                    key={b.name}
                    onClick={() => {
                      setTempSpec({
                        ...tempSpec,
                        battery: {
                          ...tempSpec.battery,
                          chemistry: b.name,
                          nominalCapacitymAh: b.defaultCapacity,
                          nominalVoltage: b.voltage,
                          selfDischargePercentPerYear: b.selfDischargeYr,
                          deratingFactor: b.derating
                        }
                      });
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      tempSpec.battery.chemistry === b.name
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-200">{b.name}</div>
                    <div className="text-[11px] mt-1 text-slate-400">{b.description}</div>
                    <div className="text-[10px] font-mono text-amber-400 mt-2">
                      {b.defaultCapacity} mAh @ {b.voltage}V
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: SCHEDULE */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                <Clock className="w-4 h-4" /> 5. Activity Schedule & Repetition Period
              </h3>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Total Cycle Repetition Interval (Seconds)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={tempSpec.schedule.cyclePeriodSec}
                    onChange={(e) => {
                      const val = Math.max(0.1, parseFloat(e.target.value) || 1);
                      setTempSpec({
                        ...tempSpec,
                        schedule: { cyclePeriodSec: val },
                        wireless: { ...tempSpec.wireless, txIntervalSec: val }
                      });
                    }}
                    className="w-32 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-amber-400 font-mono font-bold"
                  />
                  <span className="text-xs text-slate-400">
                    = {(tempSpec.schedule.cyclePeriodSec / 60).toFixed(1)} mins (or {(tempSpec.schedule.cyclePeriodSec / 3600).toFixed(2)} hours)
                  </span>
                </div>
              </div>

              {/* Quick interval presets */}
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  { label: '5s (Fast)', sec: 5 },
                  { label: '1 min', sec: 60 },
                  { label: '15 mins', sec: 900 },
                  { label: '30 mins', sec: 1800 },
                  { label: '1 Hour', sec: 3600 },
                  { label: '6 Hours', sec: 21600 }
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setTempSpec({
                        ...tempSpec,
                        schedule: { cyclePeriodSec: item.sec },
                        wireless: { ...tempSpec.wireless, txIntervalSec: item.sec }
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live Calculation Preview Banner */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between px-6">
          <div className="text-xs text-slate-400 flex items-center gap-4">
            <span>Average: <strong className="text-cyan-400 font-mono">{metrics.I_avg_uA.toFixed(1)} µA</strong></span>
            <span>Peak: <strong className="text-amber-400 font-mono">{metrics.I_peak_mA.toFixed(1)} mA</strong></span>
          </div>
          <div className="text-xs font-bold text-emerald-400 font-mono">
            Est. Life: {metrics.lifeYears >= 1 ? `${metrics.lifeYears.toFixed(1)} Years` : `${metrics.lifeDays.toFixed(0)} Days`}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <span>{currentStep === steps.length ? 'Apply Architecture' : 'Next Step'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
