import React, { useState } from 'react';
import { Cpu, Radio, BatteryCharging, Clock, Gauge, Plus, Trash2, Sliders, ChevronDown, ChevronUp, Box } from 'lucide-react';
import { BATTERY_CHEMISTRIES, WIRELESS_PROTOCOLS } from '../data/presets';

export default function ElectricalEditor({ spec, onUpdateSpec, selectedComponentId }) {
  const [openSections, setOpenSections] = useState({
    controller: true,
    sensors: true,
    wireless: true,
    battery: true,
    schedule: true,
    enclosure: false
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleControllerChange = (field, value) => {
    onUpdateSpec({
      ...spec,
      controller: { ...spec.controller, [field]: value }
    });
  };

  const handleSensorChange = (index, field, value) => {
    const updatedSensors = [...spec.sensors];
    updatedSensors[index] = { ...updatedSensors[index], [field]: value };
    onUpdateSpec({ ...spec, sensors: updatedSensors });
  };

  const handleAddSensor = () => {
    const newSensor = {
      id: `sensor-${Date.now()}`,
      name: `Custom Sensor ${spec.sensors.length + 1}`,
      activeCurrentmA: 5.0,
      idleCurrentuA: 0.1,
      activeTimeSec: 0.1
    };
    onUpdateSpec({ ...spec, sensors: [...spec.sensors, newSensor] });
  };

  const handleRemoveSensor = (index) => {
    const updatedSensors = spec.sensors.filter((_, idx) => idx !== index);
    onUpdateSpec({ ...spec, sensors: updatedSensors });
  };

  const handleWirelessChange = (field, value) => {
    onUpdateSpec({
      ...spec,
      wireless: { ...spec.wireless, [field]: value }
    });
  };

  const handleBatteryChange = (field, value) => {
    onUpdateSpec({
      ...spec,
      battery: { ...spec.battery, [field]: value }
    });
  };

  const handleScheduleChange = (value) => {
    const val = Math.max(0.1, parseFloat(value) || 1);
    onUpdateSpec({
      ...spec,
      schedule: { cyclePeriodSec: val }
    });
  };

  const handleEnclosureChange = (field, value) => {
    onUpdateSpec({
      ...spec,
      enclosure3D: { ...spec.enclosure3D, [field]: value }
    });
  };

  return (
    <div className="space-y-4">
      {/* SECTION 1: CONTROLLER */}
      <div className={`bg-slate-900 border rounded-2xl transition-all ${
        selectedComponentId === 'mcu' ? 'border-amber-500 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/20' : 'border-slate-800'
      }`}>
        <button
          onClick={() => toggleSection('controller')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-850/50 rounded-2xl"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Controller (MCU)</h3>
              <p className="text-[11px] text-slate-400">{spec.controller.name}</p>
            </div>
          </div>
          {openSections.controller ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.controller && (
          <div className="p-4 pt-0 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="col-span-full">
              <label className="text-[11px] font-medium text-slate-400 block mb-1">MCU Part Name</label>
              <input
                type="text"
                value={spec.controller.name}
                onChange={(e) => handleControllerChange('name', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Active Current (mA)</label>
              <input
                type="number"
                step="0.1"
                value={spec.controller.activeCurrentmA}
                onChange={(e) => handleControllerChange('activeCurrentmA', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-amber-400 font-mono font-semibold"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Sleep Current (µA)</label>
              <input
                type="number"
                step="0.1"
                value={spec.controller.sleepCurrentuA}
                onChange={(e) => handleControllerChange('sleepCurrentuA', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-cyan-400 font-mono font-semibold"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Active Window (Seconds)</label>
              <input
                type="number"
                step="0.05"
                value={spec.controller.activeTimeSec}
                onChange={(e) => handleControllerChange('activeTimeSec', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Operating Voltage (V)</label>
              <input
                type="number"
                step="0.1"
                value={spec.controller.voltage}
                onChange={(e) => handleControllerChange('voltage', parseFloat(e.target.value) || 3.3)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: SENSORS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => toggleSection('sensors')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-850/50 rounded-2xl"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Sensors ({spec.sensors.length})</h3>
              <p className="text-[11px] text-slate-400">Attached peripherals & transducers</p>
            </div>
          </div>
          {openSections.sensors ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.sensors && (
          <div className="p-4 pt-0 border-t border-slate-800/60 space-y-3">
            {spec.sensors.map((s, idx) => (
              <div key={s.id || idx} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={s.name}
                    onChange={(e) => handleSensorChange(idx, 'name', e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none border-b border-transparent focus:border-cyan-500"
                  />
                  <button onClick={() => handleRemoveSensor(idx)} className="text-slate-500 hover:text-red-400 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Active (mA)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={s.activeCurrentmA}
                      onChange={(e) => handleSensorChange(idx, 'activeCurrentmA', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-amber-400 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Idle (µA)</span>
                    <input
                      type="number"
                      step="0.01"
                      value={s.idleCurrentuA}
                      onChange={(e) => handleSensorChange(idx, 'idleCurrentuA', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-cyan-400 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Time (s)</span>
                    <input
                      type="number"
                      step="0.05"
                      value={s.activeTimeSec}
                      onChange={(e) => handleSensorChange(idx, 'activeTimeSec', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={handleAddSensor}
              className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-dashed border-slate-700 text-xs font-semibold text-cyan-400 flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Sensor Module</span>
            </button>
          </div>
        )}
      </div>

      {/* SECTION 3: WIRELESS */}
      <div className={`bg-slate-900 border rounded-2xl transition-all ${
        selectedComponentId === 'lora' || selectedComponentId === 'nbiot' ? 'border-cyan-500 shadow-lg shadow-cyan-500/10 ring-2 ring-cyan-500/20' : 'border-slate-800'
      }`}>
        <button
          onClick={() => toggleSection('wireless')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-850/50 rounded-2xl"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Wireless Connection</h3>
              <p className="text-[11px] text-slate-400">{spec.wireless.protocol}</p>
            </div>
          </div>
          {openSections.wireless ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.wireless && (
          <div className="p-4 pt-0 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="col-span-full">
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Wireless Protocol</label>
              <select
                value={spec.wireless.protocol}
                onChange={(e) => handleWirelessChange('protocol', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200"
              >
                {WIRELESS_PROTOCOLS.map(p => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">TX Peak Current (mA)</label>
              <input
                type="number"
                step="0.5"
                value={spec.wireless.txCurrentmA}
                onChange={(e) => handleWirelessChange('txCurrentmA', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-amber-400 font-mono font-semibold"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">TX Packet Time (s)</label>
              <input
                type="number"
                step="0.01"
                value={spec.wireless.txTimeSec}
                onChange={(e) => handleWirelessChange('txTimeSec', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">RX Current (mA)</label>
              <input
                type="number"
                step="0.1"
                value={spec.wireless.rxCurrentmA}
                onChange={(e) => handleWirelessChange('rxCurrentmA', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-cyan-400 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Radio Sleep (µA)</label>
              <input
                type="number"
                step="0.1"
                value={spec.wireless.sleepCurrentuA}
                onChange={(e) => handleWirelessChange('sleepCurrentuA', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: BATTERY */}
      <div className={`bg-slate-900 border rounded-2xl transition-all ${
        selectedComponentId === 'battery' ? 'border-amber-500 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/20' : 'border-slate-800'
      }`}>
        <button
          onClick={() => toggleSection('battery')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-850/50 rounded-2xl"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BatteryCharging className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Battery & Power Converter</h3>
              <p className="text-[11px] text-slate-400">{spec.battery.chemistry} ({spec.battery.nominalCapacitymAh} mAh)</p>
            </div>
          </div>
          {openSections.battery ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.battery && (
          <div className="p-4 pt-0 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="col-span-full">
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Battery Chemistry</label>
              <select
                value={spec.battery.chemistry}
                onChange={(e) => {
                  const b = BATTERY_CHEMISTRIES.find(chem => chem.name === e.target.value);
                  if (b) {
                    onUpdateSpec({
                      ...spec,
                      battery: {
                        ...spec.battery,
                        chemistry: b.name,
                        nominalCapacitymAh: b.defaultCapacity,
                        nominalVoltage: b.voltage,
                        selfDischargePercentPerYear: b.selfDischargeYr,
                        deratingFactor: b.derating
                      }
                    });
                  }
                }}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200"
              >
                {BATTERY_CHEMISTRIES.map(b => (
                  <option key={b.name} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Capacity (mAh)</label>
              <input
                type="number"
                step="10"
                value={spec.battery.nominalCapacitymAh}
                onChange={(e) => handleBatteryChange('nominalCapacitymAh', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-amber-400 font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Nominal Voltage (V)</label>
              <input
                type="number"
                step="0.1"
                value={spec.battery.nominalVoltage}
                onChange={(e) => handleBatteryChange('nominalVoltage', parseFloat(e.target.value) || 3.7)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Self-Discharge (% / Year)</label>
              <input
                type="number"
                step="0.5"
                value={spec.battery.selfDischargePercentPerYear}
                onChange={(e) => handleBatteryChange('selfDischargePercentPerYear', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Converter Efficiency (0.1 - 1.0)</label>
              <input
                type="number"
                step="0.01"
                min="0.5"
                max="1.0"
                value={spec.battery.powerEfficiency}
                onChange={(e) => handleBatteryChange('powerEfficiency', parseFloat(e.target.value) || 0.90)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-emerald-400 font-mono font-semibold"
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5: SCHEDULE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => toggleSection('schedule')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-850/50 rounded-2xl"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Activity Schedule</h3>
              <p className="text-[11px] text-slate-400">Repetition window: {spec.schedule.cyclePeriodSec} seconds</p>
            </div>
          </div>
          {openSections.schedule ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.schedule && (
          <div className="p-4 pt-0 border-t border-slate-800/60 space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-medium text-slate-400">Cycle Interval Period (Seconds)</label>
                <span className="text-xs font-mono font-bold text-amber-400">{spec.schedule.cyclePeriodSec} s</span>
              </div>
              <input
                type="range"
                min="1"
                max="7200"
                step="1"
                value={spec.schedule.cyclePeriodSec}
                onChange={(e) => handleScheduleChange(e.target.value)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { label: '5s', sec: 5 },
                { label: '10s', sec: 10 },
                { label: '1 min', sec: 60 },
                { label: '5 mins', sec: 300 },
                { label: '15 mins', sec: 900 },
                { label: '1 Hour', sec: 3600 }
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => handleScheduleChange(item.sec)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    spec.schedule.cyclePeriodSec === item.sec
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 6: 3D ENCLOSURE DIMENSIONS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => toggleSection('enclosure')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-850/50 rounded-2xl"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">3D Enclosure Dimensions</h3>
              <p className="text-[11px] text-slate-400">{spec.enclosure3D?.lengthMm || 80} × {spec.enclosure3D?.widthMm || 50} × {spec.enclosure3D?.heightMm || 25} mm</p>
            </div>
          </div>
          {openSections.enclosure ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.enclosure && (
          <div className="p-4 pt-0 border-t border-slate-800/60 grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Length (mm)</label>
              <input
                type="number"
                value={spec.enclosure3D?.lengthMm || 80}
                onChange={(e) => handleEnclosureChange('lengthMm', parseFloat(e.target.value) || 50)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Width (mm)</label>
              <input
                type="number"
                value={spec.enclosure3D?.widthMm || 50}
                onChange={(e) => handleEnclosureChange('widthMm', parseFloat(e.target.value) || 30)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Height (mm)</label>
              <input
                type="number"
                value={spec.enclosure3D?.heightMm || 25}
                onChange={(e) => handleEnclosureChange('heightMm', parseFloat(e.target.value) || 15)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
