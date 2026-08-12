import React, { useState } from 'react';
import { Cpu, Gauge, Monitor, Radio, BatteryCharging, Plus, Trash2, ShieldCheck, AlertCircle, Box, Eye, EyeOff, Edit3, Sparkles } from 'lucide-react';
import { ProductSpec, ComponentItem, ValueConfidence, ComponentCategory } from '../types/twinspark';
import { COMPONENT_DATABASE } from '../data/componentDatabase';

interface ComponentSelectorProps {
  spec: ProductSpec;
  onUpdateSpec: (spec: ProductSpec) => void;
  selectedComponentId?: string;
}

export default function ComponentSelector({ spec, onUpdateSpec, selectedComponentId }: ComponentSelectorProps) {
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'electrical' | '3d-transforms'>('electrical');

  const [newCustomComp, setNewCustomComp] = useState<Partial<ComponentItem>>({
    name: 'Custom Sensor / Peripheral',
    category: 'sensor',
    activeCurrentmA: 5.0,
    peakCurrentmA: 10.0,
    sleepCurrentuA: 1.0,
    voltage: 3.3,
    confidence: 'custom-spec',
    sourceNote: 'User-specified custom component values'
  });

  const getConfidenceBadge = (confidence: ValueConfidence) => {
    switch (confidence) {
      case 'verified-datasheet':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Verified Datasheet</span>;
      case 'lab-measured':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Lab Measured</span>;
      case 'custom-spec':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center gap-1"><Edit3 className="w-3 h-3" /> Custom Spec</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Starter Estimate — verify against datasheet</span>;
    }
  };

  const handleUpdateComponent = (compKey: keyof ProductSpec, updatedComp: ComponentItem) => {
    onUpdateSpec({
      ...spec,
      [compKey]: updatedComp
    });
  };

  const handleUpdateSensor = (index: number, updatedSensor: ComponentItem) => {
    const updatedSensors = [...spec.sensors];
    updatedSensors[index] = updatedSensor;
    onUpdateSpec({ ...spec, sensors: updatedSensors });
  };

  const handleRemoveSensor = (index: number) => {
    const updatedSensors = spec.sensors.filter((_, i) => i !== index);
    onUpdateSpec({ ...spec, sensors: updatedSensors });
  };

  const handleAddSensorFromDB = (dbKey: string) => {
    const dbComp = COMPONENT_DATABASE[dbKey];
    if (!dbComp) return;
    const newSensor: ComponentItem = JSON.parse(JSON.stringify(dbComp));
    newSensor.id = `sensor-${Date.now()}`;
    onUpdateSpec({ ...spec, sensors: [...spec.sensors, newSensor] });
  };

  const handleAddCustomComponentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created: ComponentItem = {
      id: `custom-${Date.now()}`,
      name: newCustomComp.name || 'Custom Component',
      category: newCustomComp.category || 'custom',
      activeCurrentmA: parseFloat(String(newCustomComp.activeCurrentmA)) || 0,
      peakCurrentmA: parseFloat(String(newCustomComp.peakCurrentmA)) || 0,
      sleepCurrentuA: parseFloat(String(newCustomComp.sleepCurrentuA)) || 0,
      voltage: parseFloat(String(newCustomComp.voltage)) || 3.3,
      description: newCustomComp.description || 'User added component',
      confidence: newCustomComp.confidence || 'custom-spec',
      sourceNote: newCustomComp.sourceNote || 'User specified',
      transform3D: { x: 0, y: 3, z: 0, length: 10, width: 10, height: 3, color: '#38bdf8' }
    };

    onUpdateSpec({
      ...spec,
      customComponents: [...(spec.customComponents || []), created]
    });
    setShowAddCustomModal(false);
  };

  const handleRemoveCustomComp = (id: string) => {
    onUpdateSpec({
      ...spec,
      customComponents: (spec.customComponents || []).filter(c => c.id !== id)
    });
  };

  return (
    <div className="space-y-4">
      {/* Datasheet Disclaimer Notice */}
      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-200 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold block">Datasheet Verification Notice:</strong>
          Starter component values are initial estimates only. Always verify active and sleep currents against manufacturer datasheets for your target hardware revision.
        </div>
      </div>

      {/* Editor View Tab Toggle (Electrical vs 3D Block Transforms) */}
      <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('electrical')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'electrical' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Electrical Specs & Provenance
        </button>
        <button
          onClick={() => setActiveTab('3d-transforms')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === '3d-transforms' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          3D Layout & Block Transforms
        </button>
      </div>

      {/* TAB 1: ELECTRICAL SPECS */}
      {activeTab === 'electrical' && (
        <div className="space-y-4">
          {/* CONTROLLER CARD */}
          {spec.controller ? (
            <div className={`bg-slate-900 border rounded-2xl p-4 space-y-3 transition-all ${
              selectedComponentId === spec.controller.id ? 'border-amber-500 shadow-lg ring-2 ring-amber-500/20' : 'border-slate-800'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">Controller / Board</span>
                </div>
                <button
                  onClick={() => onUpdateSpec({ ...spec, controller: undefined })}
                  className="text-xs text-slate-500 hover:text-red-400"
                >
                  Remove Controller
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={spec.controller.name}
                    onChange={(e) => handleUpdateComponent('controller', { ...spec.controller!, name: e.target.value })}
                    className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none border-b border-transparent focus:border-cyan-400"
                  />
                  {getConfidenceBadge(spec.controller.confidence)}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Active Current (mA)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={spec.controller.activeCurrentmA}
                      onChange={(e) => handleUpdateComponent('controller', { ...spec.controller!, activeCurrentmA: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-amber-400 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Deep Sleep (µA)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={spec.controller.sleepCurrentuA}
                      onChange={(e) => handleUpdateComponent('controller', { ...spec.controller!, sleepCurrentuA: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-cyan-400 font-mono font-bold"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-400 block mb-1">Wi-Fi / Peak Transmit (mA)</label>
                    <input
                      type="number"
                      step="1"
                      value={spec.controller.peakCurrentmA}
                      onChange={(e) => handleUpdateComponent('controller', { ...spec.controller!, peakCurrentmA: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-orange-400 font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Confidence Level & Datasheet Source</label>
                  <select
                    value={spec.controller.confidence}
                    onChange={(e) => handleUpdateComponent('controller', { ...spec.controller!, confidence: e.target.value as ValueConfidence })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-200"
                  >
                    <option value="starter-estimate">Starter Estimate (Verify against datasheet)</option>
                    <option value="verified-datasheet">Verified Datasheet</option>
                    <option value="lab-measured">Lab Measured</option>
                    <option value="custom-spec">Custom Spec</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-900 border border-dashed border-slate-800 rounded-2xl flex items-center justify-between">
              <span className="text-xs text-slate-400">No Controller Fitted</span>
              <button
                onClick={() => handleUpdateComponent('controller', JSON.parse(JSON.stringify(COMPONENT_DATABASE['esp32'])))}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/30"
              >
                + Add ESP32 Controller
              </button>
            </div>
          )}

          {/* SENSORS CARD */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Gauge className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">Sensors ({spec.sensors.length})</span>
              </div>
            </div>

            {spec.sensors.map((s, idx) => (
              <div key={s.id || idx} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={s.name}
                    onChange={(e) => handleUpdateSensor(idx, { ...s, name: e.target.value })}
                    className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none focus:border-b focus:border-cyan-400"
                  />
                  <div className="flex items-center gap-2">
                    {getConfidenceBadge(s.confidence)}
                    <button onClick={() => handleRemoveSensor(idx)} className="text-slate-500 hover:text-red-400 p-0.5">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Active (mA)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={s.activeCurrentmA}
                      onChange={(e) => handleUpdateSensor(idx, { ...s, activeCurrentmA: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-amber-400 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Sleep (µA)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={s.sleepCurrentuA}
                      onChange={(e) => handleUpdateSensor(idx, { ...s, sleepCurrentuA: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-cyan-400 font-mono"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => handleAddSensorFromDB('dht22')}
                className="py-1.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-dashed border-slate-700 text-[11px] font-semibold text-cyan-400 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add DHT22
              </button>
              <button
                onClick={() => handleAddSensorFromDB('bme280')}
                className="py-1.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-dashed border-slate-700 text-[11px] font-semibold text-cyan-400 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add BME280
              </button>
            </div>
          </div>

          {/* CUSTOM COMPONENTS LIST */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">Custom Components</span>
              <button
                onClick={() => setShowAddCustomModal(true)}
                className="px-3 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Custom Component
              </button>
            </div>

            {(spec.customComponents || []).map(cc => (
              <div key={cc.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">{cc.name}</div>
                  <div className="text-[10px] font-mono text-cyan-400">Act: {cc.activeCurrentmA}mA | Sleep: {cc.sleepCurrentuA}µA</div>
                </div>
                <button onClick={() => handleRemoveCustomComp(cc.id)} className="text-slate-500 hover:text-red-400 p-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* BATTERY & REGULATOR SPECS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <BatteryCharging className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">Battery & Converter Specs</span>
              </div>
            </div>

            {spec.battery && (
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Nominal Capacity (mAh)</label>
                  <input
                    type="number"
                    step="50"
                    value={spec.battery.capacitymAh || 2000}
                    onChange={(e) => handleUpdateComponent('battery', { ...spec.battery!, capacitymAh: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-amber-400 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Usable Capacity (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    step="5"
                    value={spec.usableCapacityPercent}
                    onChange={(e) => onUpdateSpec({ ...spec, usableCapacityPercent: Math.max(10, Math.min(100, parseFloat(e.target.value) || 85)) })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-emerald-400 font-mono font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] text-slate-400">Regulator Efficiency (%)</label>
                    <span className="text-xs font-mono font-bold text-cyan-400">{spec.regulatorEfficiencyPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="1"
                    value={spec.regulatorEfficiencyPercent}
                    onChange={(e) => onUpdateSpec({ ...spec, regulatorEfficiencyPercent: parseFloat(e.target.value) || 90 })}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: 3D BLOCK TRANSFORMS EDITING */}
      {activeTab === '3d-transforms' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Box className="w-4 h-4 text-cyan-400" />
              Enclosure 3D Dimensions
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block">Length (mm)</span>
                <input
                  type="number"
                  value={spec.enclosure3D.lengthMm}
                  onChange={(e) => onUpdateSpec({ ...spec, enclosure3D: { ...spec.enclosure3D, lengthMm: parseFloat(e.target.value) || 50 } })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Width (mm)</span>
                <input
                  type="number"
                  value={spec.enclosure3D.widthMm}
                  onChange={(e) => onUpdateSpec({ ...spec, enclosure3D: { ...spec.enclosure3D, widthMm: parseFloat(e.target.value) || 30 } })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Height (mm)</span>
                <input
                  type="number"
                  value={spec.enclosure3D.heightMm}
                  onChange={(e) => onUpdateSpec({ ...spec, enclosure3D: { ...spec.enclosure3D, heightMm: parseFloat(e.target.value) || 15 } })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM COMPONENT CREATOR MODAL */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <form onSubmit={handleAddCustomComponentSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-100">Add Custom Component</h3>
              <button type="button" onClick={() => setShowAddCustomModal(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Component Name</label>
                <input
                  type="text"
                  required
                  value={newCustomComp.name || ''}
                  onChange={(e) => setNewCustomComp({ ...newCustomComp, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Active mA</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newCustomComp.activeCurrentmA}
                    onChange={(e) => setNewCustomComp({ ...newCustomComp, activeCurrentmA: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-amber-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Sleep µA</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newCustomComp.sleepCurrentuA}
                    onChange={(e) => setNewCustomComp({ ...newCustomComp, sleepCurrentuA: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-cyan-400 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowAddCustomModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 font-semibold">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-cyan-500 text-xs text-slate-950 font-bold">Add Component</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
