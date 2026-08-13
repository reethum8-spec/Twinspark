import React, { useState, useMemo } from 'react';
import { Cpu, Gauge, Monitor, Radio, BatteryCharging, Plus, Trash2, ShieldCheck, AlertCircle, Box, Eye, EyeOff, Edit3, Sparkles, Zap, Volume2, ChevronDown, ChevronUp, Palette, RotateCw, Move, Maximize2, Search, ExternalLink, Filter, Layers, BookmarkPlus, HelpCircle } from 'lucide-react';
import { ProductSpec, ComponentItem, ValueConfidence, ComponentCategory, ComponentTransform3D } from '../types/twinspark';
import { queryPartsLibrary, saveCustomComponent, deleteCustomComponent, getStoredCustomComponents } from '../services/partsLibrary';

interface ComponentSelectorProps {
  spec: ProductSpec;
  onUpdateSpec: (spec: ProductSpec) => void;
  selectedComponentId?: string;
  onSelectComponent?: (id: string) => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function getConfidenceBadge(confidence: ValueConfidence) {
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
}

function getCategoryIcon(cat: ComponentCategory) {
  switch (cat) {
    case 'controller': return Cpu;
    case 'sensor': return Gauge;
    case 'display': return Monitor;
    case 'wireless': return Radio;
    case 'output': return Volume2;
    case 'battery': return BatteryCharging;
    case 'regulator': return Zap;
    default: return Box;
  }
}

function getCategoryColor(cat: ComponentCategory) {
  switch (cat) {
    case 'controller': return { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' };
    case 'sensor': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' };
    case 'display': return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' };
    case 'wireless': return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' };
    case 'output': return { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' };
    case 'battery': return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' };
    case 'regulator': return { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' };
    default: return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' };
  }
}

// ─── Component Card for Electrical Specs ──────────────────────────────────

interface ComponentCardProps {
  comp: ComponentItem;
  isSelected: boolean;
  onUpdate: (updated: ComponentItem) => void;
  onRemove: () => void;
  showPeakLabel?: string;
}

function ComponentCard({ comp, isSelected, onUpdate, onRemove, showPeakLabel }: ComponentCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`p-3.5 bg-slate-950/80 border rounded-2xl space-y-2.5 transition-all ${
      isSelected ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-lg' : 'border-slate-800 hover:border-slate-700'
    }`}>
      <div className="flex items-center justify-between gap-2">
        <input
          type="text"
          value={comp.name}
          onChange={(e) => onUpdate({ ...comp, name: e.target.value })}
          className="bg-transparent text-xs font-bold text-slate-100 focus:outline-none border-b border-transparent focus:border-cyan-400 flex-1 min-w-0"
        />
        <div className="flex items-center gap-1.5 shrink-0">
          {getConfidenceBadge(comp.confidence)}
          <button onClick={() => setExpanded(!expanded)} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-900">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button onClick={onRemove} className="text-slate-500 hover:text-red-400 p-1 rounded-lg hover:bg-slate-900" title="Remove component">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Electrical Parameters Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <span className="text-[10px] text-slate-400 block font-medium">Active (mA)</span>
          <input
            type="number" step="0.1" value={comp.activeCurrentmA}
            onChange={(e) => onUpdate({ ...comp, activeCurrentmA: parseFloat(e.target.value) || 0 })}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-amber-400 font-mono font-bold"
          />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block font-medium">Sleep ({'\u00B5'}A)</span>
          <input
            type="number" step="0.1" value={comp.sleepCurrentuA}
            onChange={(e) => onUpdate({ ...comp, sleepCurrentuA: parseFloat(e.target.value) || 0 })}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-cyan-400 font-mono font-bold"
          />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block font-medium">{showPeakLabel || 'Peak (mA)'}</span>
          <input
            type="number" step="1" value={comp.peakCurrentmA}
            onChange={(e) => onUpdate({ ...comp, peakCurrentmA: parseFloat(e.target.value) || 0 })}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-orange-400 font-mono font-bold"
          />
        </div>
      </div>

      {/* Expanded Datasheet & Voltage Range Details */}
      {expanded && (
        <div className="space-y-2.5 pt-2.5 border-t border-slate-800/80 animate-fade-in">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 block">Nominal V</span>
              <input
                type="number" step="0.1" value={comp.voltage}
                onChange={(e) => onUpdate({ ...comp, voltage: parseFloat(e.target.value) || 3.3 })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-xs text-slate-200 font-mono"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Min V</span>
              <input
                type="number" step="0.1" value={comp.minVoltage ?? comp.voltage}
                onChange={(e) => onUpdate({ ...comp, minVoltage: parseFloat(e.target.value) || comp.voltage })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-xs text-slate-300 font-mono"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Max V</span>
              <input
                type="number" step="0.1" value={comp.maxVoltage ?? comp.voltage}
                onChange={(e) => onUpdate({ ...comp, maxVoltage: parseFloat(e.target.value) || comp.voltage })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-xs text-slate-300 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Verification Status & Provenance</label>
            <select
              value={comp.confidence}
              onChange={(e) => onUpdate({ ...comp, confidence: e.target.value as ValueConfidence })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200"
            >
              <option value="starter-estimate">Starter Estimate — verify against datasheet</option>
              <option value="verified-datasheet">Verified Datasheet</option>
              <option value="lab-measured">Lab Measured</option>
              <option value="custom-spec">Custom Spec</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Datasheet Source URL / Reference</label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="https://datasheet-link.com/spec.pdf"
                value={comp.sourceUrl || ''}
                onChange={(e) => onUpdate({ ...comp, sourceUrl: e.target.value })}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-300 font-mono"
              />
              {comp.sourceUrl && (
                <a
                  href={comp.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30"
                  title="Open Datasheet URL"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {comp.sourceNote && (
            <p className="text-[10px] text-slate-400 italic bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">
              {comp.sourceNote}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Category Section Wrapper ─────────────────────────────────────────────

interface CategorySectionProps {
  title: string;
  category: ComponentCategory;
  children: React.ReactNode;
  count?: number;
  onOpenCatalog: () => void;
  onOpenCustomModal: () => void;
}

function CategorySection({ title, category, children, count, onOpenCatalog, onOpenCustomModal }: CategorySectionProps) {
  const Icon = getCategoryIcon(category);
  const color = getCategoryColor(category);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-xl ${color.bg} ${color.text} border ${color.border}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            {title}{count !== undefined ? ` (${count})` : ''}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenCatalog}
            className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 text-cyan-400 border border-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-all"
            title="Browse parts library"
          >
            <Search className="w-3 h-3" /> Browse Library
          </button>
          <button
            onClick={onOpenCustomModal}
            className="px-2.5 py-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-semibold flex items-center gap-1 transition-all"
            title="Add custom part"
          >
            <Plus className="w-3 h-3" /> Add Custom
          </button>
        </div>
      </div>

      {children}
    </div>
  );
}

// ─── Empty Slot Guidance Card ─────────────────────────────────────────────

interface EmptySlotGuidanceProps {
  categoryLabel: string;
  category: ComponentCategory;
  guidanceText: string;
  onBrowseLibrary: () => void;
  onAddCustom: () => void;
}

function EmptySlotGuidance({ categoryLabel, category, guidanceText, onBrowseLibrary, onAddCustom }: EmptySlotGuidanceProps) {
  const Icon = getCategoryIcon(category);
  const color = getCategoryColor(category);

  return (
    <div className="p-4 bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl space-y-3 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl ${color.bg} ${color.text} border ${color.border} shrink-0 hidden sm:block`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h5 className="text-xs font-bold text-slate-200">No {categoryLabel} Selected</h5>
          <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">{guidanceText}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onBrowseLibrary}
          className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold flex items-center gap-1 transition-all"
        >
          <Search className="w-3.5 h-3.5" /> Catalog
        </button>
        <button
          onClick={onAddCustom}
          className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Custom Part
        </button>
      </div>
    </div>
  );
}

// ─── 3D Transform Editor for Selected Component ──────────────────────────

interface Transform3DEditorProps {
  comp: ComponentItem;
  onUpdate: (updated: ComponentItem) => void;
}

function Transform3DEditor({ comp, onUpdate }: Transform3DEditorProps) {
  const tf = comp.transform3D || { x: 0, y: 3, z: 0, length: 12, width: 12, height: 3, color: '#0284c7' };

  const updateTransform = (patch: Partial<ComponentTransform3D>) => {
    onUpdate({ ...comp, transform3D: { ...tf, ...patch } });
  };

  return (
    <div className="p-3.5 bg-slate-950/80 border border-cyan-500/30 rounded-2xl space-y-3.5 shadow-xl">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
          <Box className="w-4 h-4 text-cyan-400" />
          Editing 3D Block: {comp.name}
        </span>
        <button
          onClick={() => updateTransform({ hidden: !tf.hidden })}
          className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 border transition-all ${
            tf.hidden ? 'text-red-400 border-red-500/30 bg-red-500/10' : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
          }`}
        >
          {tf.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span className="text-[10px] font-semibold">{tf.hidden ? 'Hidden' : 'Visible'}</span>
        </button>
      </div>

      {/* Position */}
      <div>
        <div className="flex items-center gap-1 mb-1">
          <Move className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Position (X, Y, Z mm)</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['x', 'y', 'z'] as const).map(axis => (
            <div key={axis}>
              <span className="text-[10px] text-slate-400 block">{axis.toUpperCase()}</span>
              <input
                type="number" step="1"
                value={tf[axis] ?? 0}
                onChange={(e) => updateTransform({ [axis]: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-xs text-slate-200 font-mono"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Rotation */}
      <div>
        <div className="flex items-center gap-1 mb-1">
          <RotateCw className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Rotation (Degrees)</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['rotX', 'rotY', 'rotZ'] as const).map(axis => (
            <div key={axis}>
              <span className="text-[10px] text-slate-400 block">{axis.replace('rot', 'Rot ')}</span>
              <input
                type="number" step="5"
                value={tf[axis] ?? 0}
                onChange={(e) => updateTransform({ [axis]: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-xs text-slate-200 font-mono"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Size / Scale */}
      <div>
        <div className="flex items-center gap-1 mb-1">
          <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Dimensions (mm)</span>
        </div>
        {tf.shape === 'sphere' ? (
          <div>
            <span className="text-[10px] text-slate-400 block">Radius</span>
            <input
              type="number" step="0.5"
              value={tf.radius ?? 2.5}
              onChange={(e) => updateTransform({ radius: parseFloat(e.target.value) || 2.5 })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-xs text-slate-200 font-mono"
            />
          </div>
        ) : tf.shape === 'cylinder' || tf.shape === 'disc' ? (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 block">Radius</span>
              <input
                type="number" step="0.5"
                value={tf.radius ?? 9}
                onChange={(e) => updateTransform({ radius: parseFloat(e.target.value) || 9 })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-xs text-slate-200 font-mono"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Height</span>
              <input
                type="number" step="0.5"
                value={tf.height ?? 3}
                onChange={(e) => updateTransform({ height: parseFloat(e.target.value) || 3 })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-xs text-slate-200 font-mono"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {(['length', 'width', 'height'] as const).map(dim => (
              <div key={dim}>
                <span className="text-[10px] text-slate-400 block capitalize">{dim}</span>
                <input
                  type="number" step="0.5"
                  value={tf[dim] ?? 12}
                  onChange={(e) => updateTransform({ [dim]: parseFloat(e.target.value) || 1 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-xs text-slate-200 font-mono"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Color Picker */}
      <div>
        <div className="flex items-center gap-1 mb-1">
          <Palette className="w-3.5 h-3.5 text-pink-400" />
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">3D Block Color</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={tf.color || '#0284c7'}
            onChange={(e) => updateTransform({ color: e.target.value })}
            className="w-8 h-8 rounded-xl border border-slate-700 cursor-pointer bg-transparent"
          />
          <input
            type="text"
            value={tf.color || '#0284c7'}
            onChange={(e) => updateTransform({ color: e.target.value })}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Export Component ────────────────────────────────────────────────

export default function ComponentSelector({ spec, onUpdateSpec, selectedComponentId, onSelectComponent }: ComponentSelectorProps) {
  const [activeTab, setActiveTab] = useState<'electrical' | '3d-transforms'>('electrical');
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);

  // Catalog Browser State
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState<ComponentCategory | 'all' | 'custom'>('all');
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
  const [catalogTargetSlot, setCatalogTargetSlot] = useState<ComponentCategory | null>(null);

  // 3D Tab State
  const [selected3DCompId, setSelected3DCompId] = useState<string | null>(null);

  // Custom Part Form State
  const [newCustomPart, setNewCustomPart] = useState<Partial<ComponentItem>>({
    name: 'Custom Parts Spec',
    category: 'sensor',
    activeCurrentmA: 5.0,
    peakCurrentmA: 10.0,
    sleepCurrentuA: 1.0,
    voltage: 3.3,
    minVoltage: 3.0,
    maxVoltage: 3.6,
    confidence: 'custom-spec',
    sourceNote: 'User specified datasheet values',
    sourceUrl: ''
  });

  // Query catalog using architecture service
  const catalogResults = useMemo(() => {
    return queryPartsLibrary({
      category: catalogCategoryFilter,
      searchQuery: catalogSearchQuery
    });
  }, [catalogCategoryFilter, catalogSearchQuery, showCatalogModal]);

  // ─── Spec Update Helpers ─────────────────────────────────────────

  const updateSingleSlot = (key: 'controller' | 'display' | 'wireless' | 'battery' | 'regulator', comp: ComponentItem | undefined) => {
    onUpdateSpec({ ...spec, [key]: comp });
  };

  const updateArraySlot = (key: 'sensors' | 'outputs', index: number, comp: ComponentItem) => {
    const arr = [...(spec[key] as ComponentItem[])];
    arr[index] = comp;
    onUpdateSpec({ ...spec, [key]: arr });
  };

  const removeArraySlot = (key: 'sensors' | 'outputs', index: number) => {
    const arr = (spec[key] as ComponentItem[]).filter((_, i) => i !== index);
    onUpdateSpec({ ...spec, [key]: arr });
  };

  const handleAddComponentToDesign = (comp: ComponentItem) => {
    const clone: ComponentItem = JSON.parse(JSON.stringify(comp));
    clone.id = `${clone.category}-${Date.now()}`;

    const cat = clone.category;
    if (cat === 'sensor') {
      onUpdateSpec({ ...spec, sensors: [...spec.sensors, clone] });
    } else if (cat === 'output') {
      onUpdateSpec({ ...spec, outputs: [...spec.outputs, clone] });
    } else if (cat === 'controller') {
      onUpdateSpec({ ...spec, controller: clone });
    } else if (cat === 'display') {
      onUpdateSpec({ ...spec, display: clone });
    } else if (cat === 'wireless') {
      onUpdateSpec({ ...spec, wireless: clone });
    } else if (cat === 'battery') {
      onUpdateSpec({ ...spec, battery: clone });
    } else if (cat === 'regulator') {
      onUpdateSpec({ ...spec, regulator: clone });
    } else {
      onUpdateSpec({ ...spec, customComponents: [...(spec.customComponents || []), clone] });
    }

    setShowCatalogModal(false);
  };

  const handleSaveCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created: ComponentItem = {
      id: `custom-${Date.now()}`,
      name: newCustomPart.name || 'Custom Component',
      category: (newCustomPart.category as ComponentCategory) || 'custom',
      activeCurrentmA: parseFloat(String(newCustomPart.activeCurrentmA)) || 0,
      peakCurrentmA: parseFloat(String(newCustomPart.peakCurrentmA)) || 0,
      sleepCurrentuA: parseFloat(String(newCustomPart.sleepCurrentuA)) || 0,
      voltage: parseFloat(String(newCustomPart.voltage)) || 3.3,
      minVoltage: parseFloat(String(newCustomPart.minVoltage)) || 3.0,
      maxVoltage: parseFloat(String(newCustomPart.maxVoltage)) || 3.6,
      capacitymAh: newCustomPart.category === 'battery' ? parseFloat(String(newCustomPart.capacitymAh)) || 2000 : undefined,
      maxContinuousDischargemA: newCustomPart.category === 'battery' ? parseFloat(String(newCustomPart.maxContinuousDischargemA)) || 2000 : undefined,
      efficiencyPercent: newCustomPart.category === 'regulator' ? parseFloat(String(newCustomPart.efficiencyPercent)) || 90 : undefined,
      description: newCustomPart.description || 'User added custom component',
      confidence: newCustomCompConfidence(newCustomPart.sourceUrl),
      sourceNote: newCustomPart.sourceNote || 'User specified datasheet values',
      sourceUrl: newCustomPart.sourceUrl || '',
      isCustom: true,
      transform3D: { x: 0, y: 3, z: 0, length: 12, width: 12, height: 3, color: '#38bdf8' }
    };

    // Save into LocalStorage via partsLibrary service
    saveCustomComponent(created);

    // Also add immediately to active design
    handleAddComponentToDesign(created);
    setShowAddCustomModal(false);
  };

  function newCustomCompConfidence(url?: string): ValueConfidence {
    if (url && url.trim().length > 0) return 'verified-datasheet';
    return 'custom-spec';
  }

  const openCatalogForCategory = (category: ComponentCategory) => {
    setCatalogCategoryFilter(category);
    setCatalogTargetSlot(category);
    setCatalogSearchQuery('');
    setShowCatalogModal(true);
  };

  // Gather placed components for 3D tab
  const allPlacedComponents: { comp: ComponentItem; slotKey: string; index?: number }[] = [
    ...(spec.controller ? [{ comp: spec.controller, slotKey: 'controller' }] : []),
    ...spec.sensors.map((s, i) => ({ comp: s, slotKey: 'sensors', index: i })),
    ...(spec.display ? [{ comp: spec.display, slotKey: 'display' }] : []),
    ...(spec.wireless && spec.wireless.id !== spec.controller?.id ? [{ comp: spec.wireless, slotKey: 'wireless' }] : []),
    ...spec.outputs.map((o, i) => ({ comp: o, slotKey: 'outputs', index: i })),
    ...(spec.battery ? [{ comp: spec.battery, slotKey: 'battery' }] : []),
    ...(spec.customComponents || []).map((c, i) => ({ comp: c, slotKey: 'customComponents', index: i })),
  ];

  const selected3DComp = allPlacedComponents.find(p => p.comp.id === selected3DCompId);

  const handle3DCompUpdate = (entry: { slotKey: string; index?: number }, updated: ComponentItem) => {
    if (entry.slotKey === 'sensors' || entry.slotKey === 'outputs') {
      updateArraySlot(entry.slotKey as 'sensors' | 'outputs', entry.index!, updated);
    } else if (entry.slotKey === 'customComponents') {
      const customs = [...(spec.customComponents || [])];
      customs[entry.index!] = updated;
      onUpdateSpec({ ...spec, customComponents: customs });
    } else {
      updateSingleSlot(entry.slotKey as 'controller' | 'display' | 'wireless' | 'battery' | 'regulator', updated);
    }
  };

  return (
    <div className="space-y-4">
      {/* Datasheet Disclaimer & Global Catalog Trigger */}
      <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-slate-300">
            <strong className="font-bold block text-slate-100">Parts Library & Datasheet Verification:</strong>
            All component values are starter estimates. Verify active & sleep currents against manufacturer datasheets.
          </div>
        </div>

        <button
          onClick={() => { setCatalogCategoryFilter('all'); setShowCatalogModal(true); }}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md shrink-0 active:scale-95 transition-all"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Parts Library</span>
        </button>
      </div>

      {/* Editor View Tab Toggle */}
      <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab('electrical')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'electrical' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Electrical Specs & Provenance
        </button>
        <button
          onClick={() => setActiveTab('3d-transforms')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === '3d-transforms' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          3D Layout & Transforms
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          TAB 1: ELECTRICAL SPECS
         ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'electrical' && (
        <div className="space-y-4">

          {/* ── CONTROLLER ──────────────────────────────────────────── */}
          {spec.controller ? (
            <CategorySection
              title="Controller / Board"
              category="controller"
              onOpenCatalog={() => openCatalogForCategory('controller')}
              onOpenCustomModal={() => { setNewCustomPart({ category: 'controller', name: 'Custom Controller Board' }); setShowAddCustomModal(true); }}
            >
              <ComponentCard
                comp={spec.controller}
                isSelected={selectedComponentId === spec.controller.id}
                onUpdate={(u) => updateSingleSlot('controller', u)}
                onRemove={() => updateSingleSlot('controller', undefined)}
                showPeakLabel="Peak / TX (mA)"
              />
            </CategorySection>
          ) : (
            <EmptySlotGuidance
              categoryLabel="Controller / Microcontroller Board"
              category="controller"
              guidanceText="Add a microcontroller (ESP32, Arduino, RP2040, STM32) to compute active and sleep processing current."
              onBrowseLibrary={() => openCatalogForCategory('controller')}
              onAddCustom={() => { setNewCustomPart({ category: 'controller', name: 'Custom Controller Board' }); setShowAddCustomModal(true); }}
            />
          )}

          {/* ── SENSORS ─────────────────────────────────────────────── */}
          <CategorySection
            title="Sensors"
            category="sensor"
            count={spec.sensors.length}
            onOpenCatalog={() => openCatalogForCategory('sensor')}
            onOpenCustomModal={() => { setNewCustomPart({ category: 'sensor', name: 'Custom Sensor Module' }); setShowAddCustomModal(true); }}
          >
            {spec.sensors.map((s, idx) => (
              <ComponentCard
                key={s.id || idx}
                comp={s}
                isSelected={selectedComponentId === s.id}
                onUpdate={(u) => updateArraySlot('sensors', idx, u)}
                onRemove={() => removeArraySlot('sensors', idx)}
              />
            ))}
            {spec.sensors.length === 0 && (
              <p className="text-xs text-slate-500 italic py-1">No sensors added yet. Browse the catalog or add a custom sensor.</p>
            )}
          </CategorySection>

          {/* ── DISPLAY ─────────────────────────────────────────────── */}
          {spec.display ? (
            <CategorySection
              title="Display"
              category="display"
              onOpenCatalog={() => openCatalogForCategory('display')}
              onOpenCustomModal={() => { setNewCustomPart({ category: 'display', name: 'Custom Display Module' }); setShowAddCustomModal(true); }}
            >
              <ComponentCard
                comp={spec.display}
                isSelected={selectedComponentId === spec.display.id}
                onUpdate={(u) => updateSingleSlot('display', u)}
                onRemove={() => updateSingleSlot('display', undefined)}
              />
            </CategorySection>
          ) : (
            <EmptySlotGuidance
              categoryLabel="Display Module"
              category="display"
              guidanceText="Add an OLED, LCD, TFT, or E-Ink display module to model visual output power draw."
              onBrowseLibrary={() => openCatalogForCategory('display')}
              onAddCustom={() => { setNewCustomPart({ category: 'display', name: 'Custom Display Module' }); setShowAddCustomModal(true); }}
            />
          )}

          {/* ── WIRELESS ────────────────────────────────────────────── */}
          {spec.wireless ? (
            <CategorySection
              title="Wireless Module"
              category="wireless"
              onOpenCatalog={() => openCatalogForCategory('wireless')}
              onOpenCustomModal={() => { setNewCustomPart({ category: 'wireless', name: 'Custom Wireless Transceiver' }); setShowAddCustomModal(true); }}
            >
              {spec.wireless.id === spec.controller?.id ? (
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs text-slate-400 flex items-center justify-between">
                  <span>Using built-in radio on <strong className="text-cyan-300">{spec.controller?.name}</strong></span>
                  <button
                    onClick={() => updateSingleSlot('wireless', undefined)}
                    className="text-red-400 hover:text-red-300 text-xs font-semibold underline"
                  >Separate Wireless Module</button>
                </div>
              ) : (
                <ComponentCard
                  comp={spec.wireless}
                  isSelected={selectedComponentId === spec.wireless.id}
                  onUpdate={(u) => updateSingleSlot('wireless', u)}
                  onRemove={() => updateSingleSlot('wireless', undefined)}
                />
              )}
            </CategorySection>
          ) : (
            <EmptySlotGuidance
              categoryLabel="Wireless Communication Module"
              category="wireless"
              guidanceText="Add a Wi-Fi, BLE, LoRa, 4G Cellular, or NFC radio module to account for transmit power bursts."
              onBrowseLibrary={() => openCatalogForCategory('wireless')}
              onAddCustom={() => { setNewCustomPart({ category: 'wireless', name: 'Custom Wireless Transceiver' }); setShowAddCustomModal(true); }}
            />
          )}

          {/* ── OUTPUTS (LEDs, Buzzers, Motors, Relays, Speakers) ────── */}
          <CategorySection
            title="Outputs & Actuators"
            category="output"
            count={spec.outputs.length}
            onOpenCatalog={() => openCatalogForCategory('output')}
            onOpenCustomModal={() => { setNewCustomPart({ category: 'output', name: 'Custom Output Device' }); setShowAddCustomModal(true); }}
          >
            {spec.outputs.map((o, idx) => (
              <ComponentCard
                key={o.id || idx}
                comp={o}
                isSelected={selectedComponentId === o.id}
                onUpdate={(u) => updateArraySlot('outputs', idx, u)}
                onRemove={() => removeArraySlot('outputs', idx)}
              />
            ))}
            {spec.outputs.length === 0 && (
              <p className="text-xs text-slate-500 italic py-1">No outputs/actuators added. Add LEDs, buzzers, motors, or relays.</p>
            )}
          </CategorySection>

          {/* ── BATTERY ─────────────────────────────────────────────── */}
          {spec.battery ? (
            <CategorySection
              title="Battery & Power Source"
              category="battery"
              onOpenCatalog={() => openCatalogForCategory('battery')}
              onOpenCustomModal={() => { setNewCustomPart({ category: 'battery', name: 'Custom Battery Cell' }); setShowAddCustomModal(true); }}
            >
              <div className={`p-3.5 bg-slate-950/80 border rounded-2xl space-y-2.5 transition-all ${
                selectedComponentId === spec.battery.id ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-lg' : 'border-slate-800'
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text" value={spec.battery.name}
                    onChange={(e) => updateSingleSlot('battery', { ...spec.battery!, name: e.target.value })}
                    className="bg-transparent text-xs font-bold text-slate-100 focus:outline-none border-b border-transparent focus:border-cyan-400 flex-1 min-w-0"
                  />
                  <div className="flex items-center gap-1.5 shrink-0">
                    {getConfidenceBadge(spec.battery.confidence)}
                    <button onClick={() => updateSingleSlot('battery', undefined)} className="text-slate-500 hover:text-red-400 p-1 rounded-lg hover:bg-slate-900">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Nominal Voltage (V)</label>
                    <input type="number" step="0.1" value={spec.battery.voltage}
                      onChange={(e) => updateSingleSlot('battery', { ...spec.battery!, voltage: parseFloat(e.target.value) || 3.7 })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Capacity (mAh)</label>
                    <input type="number" step="50" value={spec.battery.capacitymAh || 2000}
                      onChange={(e) => updateSingleSlot('battery', { ...spec.battery!, capacitymAh: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-amber-400 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Usable Capacity (%)</label>
                    <input type="number" min="10" max="100" step="5" value={spec.usableCapacityPercent}
                      onChange={(e) => onUpdateSpec({ ...spec, usableCapacityPercent: Math.max(10, Math.min(100, parseFloat(e.target.value) || 85)) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-emerald-400 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Max Discharge (mA)</label>
                    <input type="number" step="100" value={spec.battery.maxContinuousDischargemA || 2000}
                      onChange={(e) => updateSingleSlot('battery', { ...spec.battery!, maxContinuousDischargemA: parseFloat(e.target.value) || 2000 })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-orange-400 font-mono"
                    />
                  </div>
                </div>
              </div>
            </CategorySection>
          ) : (
            <EmptySlotGuidance
              categoryLabel="Battery / Power Source"
              category="battery"
              guidanceText="Add a battery (Li-Ion, LiPo, Coin Cell, AA pack) to estimate device runtime in hours and days."
              onBrowseLibrary={() => openCatalogForCategory('battery')}
              onAddCustom={() => { setNewCustomPart({ category: 'battery', name: 'Custom Battery Cell' }); setShowAddCustomModal(true); }}
            />
          )}

          {/* ── VOLTAGE REGULATOR ───────────────────────────────────── */}
          {spec.regulator ? (
            <CategorySection
              title="Voltage Regulator"
              category="regulator"
              onOpenCatalog={() => openCatalogForCategory('regulator')}
              onOpenCustomModal={() => { setNewCustomPart({ category: 'regulator', name: 'Custom Regulator Circuit' }); setShowAddCustomModal(true); }}
            >
              <div className={`p-3.5 bg-slate-950/80 border rounded-2xl space-y-2.5 ${
                selectedComponentId === spec.regulator.id ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-lg' : 'border-slate-800'
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text" value={spec.regulator.name}
                    onChange={(e) => updateSingleSlot('regulator', { ...spec.regulator!, name: e.target.value })}
                    className="bg-transparent text-xs font-bold text-slate-100 focus:outline-none border-b border-transparent focus:border-cyan-400 flex-1 min-w-0"
                  />
                  <div className="flex items-center gap-1.5 shrink-0">
                    {getConfidenceBadge(spec.regulator.confidence)}
                    <button onClick={() => updateSingleSlot('regulator', undefined)} className="text-slate-500 hover:text-red-400 p-1 rounded-lg hover:bg-slate-900">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Output Voltage (V)</label>
                    <input type="number" step="0.1" value={spec.regulator.voltage}
                      onChange={(e) => updateSingleSlot('regulator', { ...spec.regulator!, voltage: parseFloat(e.target.value) || 3.3 })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Quiescent ({'\u00B5'}A)</label>
                    <input type="number" step="0.1" value={spec.regulator.sleepCurrentuA}
                      onChange={(e) => updateSingleSlot('regulator', { ...spec.regulator!, sleepCurrentuA: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-cyan-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] text-slate-400">Regulator Efficiency (%)</label>
                    <span className="text-xs font-mono font-bold text-cyan-400">{spec.regulatorEfficiencyPercent}%</span>
                  </div>
                  <input type="range" min="50" max="100" step="1" value={spec.regulatorEfficiencyPercent}
                    onChange={(e) => onUpdateSpec({ ...spec, regulatorEfficiencyPercent: parseFloat(e.target.value) || 90 })}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
              </div>
            </CategorySection>
          ) : (
            <EmptySlotGuidance
              categoryLabel="Voltage Regulator / Power Rail"
              category="regulator"
              guidanceText="Add a DC-DC Buck/Boost converter or LDO to factor efficiency losses into average current."
              onBrowseLibrary={() => openCatalogForCategory('regulator')}
              onAddCustom={() => { setNewCustomPart({ category: 'regulator', name: 'Custom Regulator Circuit' }); setShowAddCustomModal(true); }}
            />
          )}

          {/* ── CUSTOM COMPONENTS ───────────────────────────────────── */}
          {(spec.customComponents || []).length > 0 && (
            <CategorySection
              title="Custom Components"
              category="custom"
              count={spec.customComponents?.length}
              onOpenCatalog={() => openCatalogForCategory('custom')}
              onOpenCustomModal={() => { setNewCustomPart({ category: 'custom', name: 'Custom Peripheral' }); setShowAddCustomModal(true); }}
            >
              {(spec.customComponents || []).map((cc, idx) => (
                <ComponentCard
                  key={cc.id}
                  comp={cc}
                  isSelected={selectedComponentId === cc.id}
                  onUpdate={(u) => {
                    const customs = [...(spec.customComponents || [])];
                    customs[idx] = u;
                    onUpdateSpec({ ...spec, customComponents: customs });
                  }}
                  onRemove={() => {
                    const customs = (spec.customComponents || []).filter(c => c.id !== cc.id);
                    onUpdateSpec({ ...spec, customComponents: customs });
                  }}
                />
              ))}
            </CategorySection>
          )}

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          TAB 2: 3D LAYOUT & PER-COMPONENT TRANSFORMS
         ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === '3d-transforms' && (
        <div className="space-y-4">
          {/* Enclosure Dimensions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Box className="w-4 h-4 text-cyan-400" />
              Enclosure 3D Dimensions & Box Shape
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block">Length (mm)</span>
                <input type="number" value={spec.enclosure3D.lengthMm}
                  onChange={(e) => onUpdateSpec({ ...spec, enclosure3D: { ...spec.enclosure3D, lengthMm: parseFloat(e.target.value) || 50 } })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200 font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Width (mm)</span>
                <input type="number" value={spec.enclosure3D.widthMm}
                  onChange={(e) => onUpdateSpec({ ...spec, enclosure3D: { ...spec.enclosure3D, widthMm: parseFloat(e.target.value) || 30 } })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200 font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Height (mm)</span>
                <input type="number" value={spec.enclosure3D.heightMm}
                  onChange={(e) => onUpdateSpec({ ...spec, enclosure3D: { ...spec.enclosure3D, heightMm: parseFloat(e.target.value) || 15 } })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => onUpdateSpec({ ...spec, enclosure3D: { ...spec.enclosure3D, hidden: !spec.enclosure3D.hidden } })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  spec.enclosure3D.hidden
                    ? 'text-red-400 border-red-500/30 bg-red-500/10'
                    : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                }`}
              >
                {spec.enclosure3D.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {spec.enclosure3D.hidden ? 'Enclosure Hidden' : 'Enclosure Visible'}
              </button>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={spec.enclosure3D.color || '#0f172a'}
                  onChange={(e) => onUpdateSpec({ ...spec, enclosure3D: { ...spec.enclosure3D, color: e.target.value } })}
                  className="w-7 h-7 rounded-lg border border-slate-700 cursor-pointer bg-transparent"
                />
                <span className="text-[11px] text-slate-400">Enclosure Color</span>
              </div>
            </div>
          </div>

          {/* Placed Components List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Placed 3D Blocks ({allPlacedComponents.length})
            </h4>
            <p className="text-[10px] text-slate-400">Click a placed block to edit position, rotation, scale, color, and visibility in real-time.</p>

            {allPlacedComponents.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No components placed yet. Add components in the Electrical tab.</p>
            ) : (
              <div className="space-y-1.5">
                {allPlacedComponents.map(entry => {
                  const Icon = getCategoryIcon(entry.comp.category);
                  const color = getCategoryColor(entry.comp.category);
                  const isSelected = selected3DCompId === entry.comp.id;

                  return (
                    <button
                      key={entry.comp.id}
                      onClick={() => {
                        setSelected3DCompId(isSelected ? null : entry.comp.id);
                        onSelectComponent?.(entry.comp.id);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl flex items-center gap-2.5 transition-all ${
                        isSelected
                          ? 'bg-cyan-500/10 border border-cyan-500/40 ring-1 ring-cyan-500/20 shadow-md'
                          : 'bg-slate-950/70 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${color.bg} ${color.text}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-slate-200 block truncate">{entry.comp.name}</span>
                        <span className="text-[10px] text-slate-400 capitalize">{entry.comp.category}</span>
                      </div>
                      {entry.comp.transform3D?.hidden && (
                        <EyeOff className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Component Transform Editor */}
          {selected3DComp && (
            <Transform3DEditor
              comp={selected3DComp.comp}
              onUpdate={(updated) => handle3DCompUpdate(selected3DComp, updated)}
            />
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          PARTS LIBRARY CATALOG BROWSER MODAL
         ═══════════════════════════════════════════════════════════════════ */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full h-[640px] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-100">TwinSpark Scalable Parts Catalog</h3>
                  <p className="text-[11px] text-slate-400">Search controllers, sensors, wireless radios, displays, outputs, and power parts.</p>
                </div>
              </div>
              <button
                onClick={() => setShowCatalogModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-900"
              >
                ✕
              </button>
            </div>

            {/* Search & Category Filter Controls */}
            <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-900/60">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by part name, chip model (e.g. ESP32, BME280, LoRa), or keywords..."
                  value={catalogSearchQuery}
                  onChange={(e) => setCatalogSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 focus:border-cyan-400 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {(['all', 'controller', 'sensor', 'wireless', 'display', 'output', 'battery', 'regulator', 'custom'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCatalogCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                      catalogCategoryFilter === cat
                        ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Grid Results */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {catalogResults.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <HelpCircle className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">No parts found matching "{catalogSearchQuery}".</p>
                  <button
                    onClick={() => {
                      setShowCatalogModal(false);
                      setNewCustomPart({ name: catalogSearchQuery || 'Custom Component' });
                      setShowAddCustomModal(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold"
                  >
                    + Create Custom Part with Datasheet Values
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {catalogResults.map(item => {
                    const Icon = getCategoryIcon(item.category);
                    const color = getCategoryColor(item.category);

                    return (
                      <div
                        key={item.id}
                        className="p-3.5 bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 rounded-2xl space-y-2 flex flex-col justify-between transition-all group"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${color.bg} ${color.text} border ${color.border} flex items-center gap-1`}>
                              <Icon className="w-3 h-3" /> {item.category}
                            </span>
                            {getConfidenceBadge(item.confidence)}
                          </div>

                          <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                            {item.name}
                          </h4>

                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>

                          <div className="flex items-center gap-3 text-[10px] font-mono pt-1 text-slate-400">
                            <span className="text-amber-400 font-bold">Act: {item.activeCurrentmA} mA</span>
                            <span className="text-cyan-400">Sleep: {item.sleepCurrentuA} µA</span>
                            <span className="text-slate-300">V: {item.voltage}V</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-2">
                          {item.sourceUrl ? (
                            <a
                              href={item.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                            >
                              Datasheet <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">Starter estimate</span>
                          )}

                          <button
                            onClick={() => handleAddComponentToDesign(item)}
                            className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold flex items-center gap-1 shadow-md transition-all active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add to Design
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">{catalogResults.length} components available</span>
              <button
                onClick={() => {
                  setShowCatalogModal(false);
                  setShowAddCustomModal(true);
                }}
                className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Custom Component
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          CUSTOM COMPONENT CREATOR MODAL WITH LOCALSTORAGE PERSISTENCE
         ═══════════════════════════════════════════════════════════════════ */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <form onSubmit={handleSaveCustomSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <BookmarkPlus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-100">Add Custom Datasheet Component</h3>
              </div>
              <button type="button" onClick={() => setShowAddCustomModal(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Component / Chip Name</label>
                <input type="text" required placeholder="e.g. MAX30102 Pulse Oximeter" value={newCustomPart.name || ''}
                  onChange={(e) => setNewCustomPart({ ...newCustomPart, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Category</label>
                  <select value={newCustomPart.category || 'sensor'}
                    onChange={(e) => setNewCustomPart({ ...newCustomPart, category: e.target.value as ComponentCategory })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="controller">Controller</option>
                    <option value="sensor">Sensor</option>
                    <option value="display">Display</option>
                    <option value="wireless">Wireless</option>
                    <option value="output">Output</option>
                    <option value="battery">Battery</option>
                    <option value="regulator">Regulator</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Nominal Voltage (V)</label>
                  <input type="number" step="0.1" value={newCustomPart.voltage}
                    onChange={(e) => setNewCustomPart({ ...newCustomPart, voltage: parseFloat(e.target.value) || 3.3 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              {/* Electrical Parameters */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Active mA</label>
                  <input type="number" step="0.1" value={newCustomPart.activeCurrentmA}
                    onChange={(e) => setNewCustomPart({ ...newCustomPart, activeCurrentmA: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-amber-400 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Sleep ({'\u00B5'}A)</label>
                  <input type="number" step="0.1" value={newCustomPart.sleepCurrentuA}
                    onChange={(e) => setNewCustomPart({ ...newCustomPart, sleepCurrentuA: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-cyan-400 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Peak mA</label>
                  <input type="number" step="1" value={newCustomPart.peakCurrentmA}
                    onChange={(e) => setNewCustomPart({ ...newCustomPart, peakCurrentmA: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-orange-400 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Category specific fields */}
              {newCustomPart.category === 'battery' && (
                <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div>
                    <label className="text-slate-300 block mb-1">Battery Capacity (mAh)</label>
                    <input type="number" step="50" value={newCustomPart.capacitymAh || 2000}
                      onChange={(e) => setNewCustomPart({ ...newCustomPart, capacitymAh: parseFloat(e.target.value) || 2000 })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-amber-400 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Max Discharge (mA)</label>
                    <input type="number" step="100" value={newCustomPart.maxContinuousDischargemA || 2000}
                      onChange={(e) => setNewCustomPart({ ...newCustomPart, maxContinuousDischargemA: parseFloat(e.target.value) || 2000 })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-orange-400 font-mono"
                    />
                  </div>
                </div>
              )}

              {newCustomPart.category === 'regulator' && (
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <label className="text-slate-300 block mb-1">Efficiency (%)</label>
                  <input type="number" min="50" max="100" step="1" value={newCustomPart.efficiencyPercent || 90}
                    onChange={(e) => setNewCustomPart({ ...newCustomPart, efficiencyPercent: parseFloat(e.target.value) || 90 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-cyan-400 font-mono font-bold"
                  />
                </div>
              )}

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Datasheet Source URL (Optional)</label>
                <input type="text" placeholder="https://manufacturer.com/datasheet.pdf" value={newCustomPart.sourceUrl || ''}
                  onChange={(e) => setNewCustomPart({ ...newCustomPart, sourceUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Notes & Description</label>
                <textarea rows={2} placeholder="Datasheet specs or lab notes..." value={newCustomPart.description || ''}
                  onChange={(e) => setNewCustomPart({ ...newCustomPart, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">Custom parts are saved in LocalStorage for reuse.</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setShowAddCustomModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-purple-500 text-xs text-slate-950 font-extrabold flex items-center gap-1 shadow-md">
                  <BookmarkPlus className="w-3.5 h-3.5" /> Save Part
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
