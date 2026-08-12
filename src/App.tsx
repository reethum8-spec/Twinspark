import React, { useState } from 'react';
import { ProductSpec } from './types/twinspark';
import { SAMPLE_WIFI_PLANT_MONITOR } from './data/sampleProject';
import { BLANK_PROJECT_SPEC } from './data/blankProject';
import { calculateDeterministicMetrics } from './utils/calculationEngine';
import Header from './components/Header';
import ComponentSelector from './components/ComponentSelector';
import TimelineDiagram from './components/TimelineDiagram';
import DigitalTwinDashboard from './components/DigitalTwinDashboard';
import ThreeDProductLayout from './components/ThreeDProductLayout';
import AIResultExplainer from './components/AIResultExplainer';
import { Sliders, Cpu, Sparkles, Download, Check, Copy, RefreshCw, PlusCircle, Play } from 'lucide-react';

export default function App() {
  const [spec, setSpec] = useState<ProductSpec>(SAMPLE_WIFI_PLANT_MONITOR);
  const [selectedComponentId, setSelectedComponentId] = useState<string | undefined>(undefined);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Real-time deterministic power calculation engine
  const metrics = calculateDeterministicMetrics(spec);

  const handleStartBlank = () => {
    setSpec(JSON.parse(JSON.stringify(BLANK_PROJECT_SPEC)));
  };

  const handleLoadSample = () => {
    setSpec(JSON.parse(JSON.stringify(SAMPLE_WIFI_PLANT_MONITOR)));
  };

  const handleCopyExport = () => {
    navigator.clipboard.writeText(JSON.stringify(spec, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Header Navigation with Starting Options */}
      <Header
        spec={spec}
        onUpdateSpec={setSpec}
        onStartBlank={handleStartBlank}
        onLoadSample={handleLoadSample}
        onExportSpec={() => setIsExportOpen(true)}
      />

      {/* Main Workspace Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Project Header Banner & Option Switcher */}
        <div className="mb-6 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
                Digital Twin Active
              </span>
              <h2 className="text-lg font-extrabold text-slate-100">{spec.name}</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">{spec.description}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleStartBlank}
              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 text-purple-400" />
              <span>Start Blank</span>
            </button>
            <button
              onClick={handleLoadSample}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-emerald-300" />
              <span>Reload Sample</span>
            </button>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Component Review, Custom Creator & Provenance (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  Editable Components & Datasheets
                </h3>
                <span className="text-[10px] text-slate-500">Real-time Recalculation</span>
              </div>

              <ComponentSelector
                spec={spec}
                onUpdateSpec={setSpec}
                selectedComponentId={selectedComponentId}
              />
            </div>
          </div>

          {/* Right Column: Dashboard, Timeline, 3D Layout, Explainer (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Digital Twin Dashboard */}
            <DigitalTwinDashboard spec={spec} metrics={metrics} />

            {/* State Sequence Timeline */}
            <TimelineDiagram spec={spec} onUpdateSpec={setSpec} />

            {/* 3D Block Hardware Layout */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  Interactive 3D Product Layout (Editable Blocks)
                </h3>
                <span className="text-[10px] text-slate-500">Orbit / Zoom / Component Labels</span>
              </div>

              <ThreeDProductLayout
                spec={spec}
                selectedComponentId={selectedComponentId}
                onSelectComponent={(compId) => setSelectedComponentId(compId)}
              />
            </div>

            {/* AI Power Explainer */}
            <AIResultExplainer spec={spec} metrics={metrics} />
          </div>
        </div>
      </main>

      {/* Export Spec JSON Modal */}
      {isExportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Download className="w-4 h-4 text-cyan-400" />
                Export Hardware Digital Twin Spec JSON
              </h3>
              <button onClick={() => setIsExportOpen(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 max-h-80 overflow-y-auto">
              {JSON.stringify(spec, null, 2)}
            </pre>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">Copy spec data into hardware docs or code generation.</span>
              <button
                onClick={handleCopyExport}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
