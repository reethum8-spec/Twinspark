import React, { useState } from 'react';
import { Zap, Sparkles, Sliders, Download, BookOpen, Layers } from 'lucide-react';
import { PRESETS } from '../data/presets';
import { parseProductDescription } from '../utils/aiParser';

export default function Header({ spec, onUpdateSpec, onOpenWizard, onExportSpec }) {
  const [promptText, setPromptText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePresetSelect = (presetId) => {
    const found = PRESETS.find(p => p.id === presetId);
    if (found) {
      onUpdateSpec(JSON.parse(JSON.stringify(found)));
    }
  };

  const handleGenerateFromPrompt = (e) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    setIsGenerating(true);
    setTimeout(() => {
      const generatedSpec = parseProductDescription(promptText);
      onUpdateSpec(generatedSpec);
      setIsGenerating(false);
    }, 400);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => onUpdateSpec(PRESETS[0])}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-cyan-400 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-400 fill-amber-400/30 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-200 via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  TwinSpark
                </h1>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-md uppercase tracking-wider">
                  v2.0 3D
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Battery Electronics Architect & 3D Twin</p>
            </div>
          </div>

          {/* Quick Setup Wizard Launch Button for Mobile */}
          <button
            onClick={onOpenWizard}
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-semibold flex items-center gap-1.5"
          >
            <Sliders className="w-4 h-4" />
            <span>Wizard</span>
          </button>
        </div>

        {/* AI Natural Language Architecture Generator Bar */}
        <form onSubmit={handleGenerateFromPrompt} className="w-full md:flex-1 max-w-xl">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Describe your product e.g., 'Soil moisture sensor with LoRa & 18650 battery'..."
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/70 focus:border-cyan-500 rounded-xl py-2 pl-3.5 pr-28 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
            />
            <button
              type="submit"
              disabled={isGenerating}
              className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Sparking...' : 'Architect'}</span>
            </button>
          </div>
        </form>

        {/* Preset Selector & Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <select
            value={spec.id || ''}
            onChange={(e) => handlePresetSelect(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 font-medium"
          >
            <option value="" disabled>Load Hardware Preset...</option>
            {PRESETS.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <button
            onClick={onOpenWizard}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Interactive Guided Setup Wizard"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Guided Wizard</span>
          </button>

          <button
            onClick={onExportSpec}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Export Architecture Spec JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>
    </header>
  );
}
