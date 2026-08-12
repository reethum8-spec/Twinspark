import React, { useState } from 'react';
import { PRESETS } from './data/presets';
import { calculatePowerMetrics } from './utils/calculator';
import Header from './components/Header';
import PromptWizard from './components/PromptWizard';
import ElectricalEditor from './components/ElectricalEditor';
import ResultsSummary from './components/ResultsSummary';
import ThreeDViewport from './components/ThreeDViewport';
import EnergyChart from './components/EnergyChart';
import FormulaBreakdown from './components/FormulaBreakdown';
import { Sliders, Cpu, Sparkles, Download, Check, Copy } from 'lucide-react';

export default function App() {
  const [spec, setSpec] = useState(PRESETS[0]);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const metrics = calculatePowerMetrics(spec);

  const handleCopyExport = () => {
    navigator.clipboard.writeText(JSON.stringify(spec, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation Header */}
      <Header
        spec={spec}
        onUpdateSpec={setSpec}
        onOpenWizard={() => setIsWizardOpen(true)}
        onExportSpec={() => setIsExportOpen(true)}
      />

      {/* Main Workspace Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Preset Description & Title Header Banner */}
        <div className="mb-6 bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
                {spec.category || 'Custom Architecture'}
              </span>
              <h2 className="text-lg font-bold text-slate-100">{spec.name}</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">{spec.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsWizardOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Modify via Wizard</span>
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Electrical Parameter Specs Editor (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Live Electrical Spec Editor
              </h3>
              <span className="text-[10px] text-slate-500">Real-time recalculation</span>
            </div>

            <ElectricalEditor
              spec={spec}
              onUpdateSpec={setSpec}
              selectedComponentId={selectedComponentId}
            />
          </div>

          {/* Right Column: 3D Twin, Key Metrics, Energy Charts & Formulas (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Key Metrics Dashboard Summary */}
            <ResultsSummary spec={spec} metrics={metrics} />

            {/* 3D Hardware Layout Viewport */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  Interactive 3D Hardware Twin & Enclosure Layout
                </h3>
                <span className="text-[10px] text-slate-500">Drag to orbit / Scroll to zoom</span>
              </div>

              <ThreeDViewport
                spec={spec}
                selectedComponentId={selectedComponentId}
                onSelectComponent={(compId) => setSelectedComponentId(compId)}
              />
            </div>

            {/* Subsystem Energy Shares & Discharge Trajectory Chart */}
            <EnergyChart metrics={metrics} />

            {/* Step-by-Step Transparent Formulas Card */}
            <FormulaBreakdown spec={spec} metrics={metrics} />
          </div>
        </div>
      </main>

      {/* Guided Questionnaire Modal */}
      {isWizardOpen && (
        <PromptWizard
          spec={spec}
          onUpdateSpec={setSpec}
          onClose={() => setIsWizardOpen(false)}
        />
      )}

      {/* Export Spec JSON Modal */}
      {isExportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Download className="w-4 h-4 text-cyan-400" />
                Export Architecture Specification JSON
              </h3>
              <button onClick={() => setIsExportOpen(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 max-h-80 overflow-y-auto">
              {JSON.stringify(spec, null, 2)}
            </pre>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">Copy or save spec into your hardware documentation.</span>
              <button
                onClick={handleCopyExport}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy JSON'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
