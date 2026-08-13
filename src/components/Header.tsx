import React, { useState, useEffect } from 'react';
import { Zap, Sparkles, Sliders, Download, Play, PlusCircle, Save, Folder, Trash2, Edit3, Layers } from 'lucide-react';
import { ProductSpec, SavedProjectVersion } from '../types/twinspark';
import { SAMPLE_PORTABLE_SMART_DEVICE } from '../data/sampleProject';
import { BLANK_PROJECT_SPEC } from '../data/blankProject';
import { getSavedVersions, saveProjectVersion, deleteProjectVersion } from '../services/projectStorage';

interface HeaderProps {
  spec: ProductSpec;
  onUpdateSpec: (spec: ProductSpec) => void;
  onStartBlank: () => void;
  onLoadSample: () => void;
  onExportSpec: () => void;
}

export default function Header({ spec, onUpdateSpec, onStartBlank, onLoadSample, onExportSpec }: HeaderProps) {
  const [promptInput, setPromptInput] = useState('');
  const [savedVersions, setSavedVersions] = useState<SavedProjectVersion[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showVersionsDropdown, setShowVersionsDropdown] = useState(false);

  useEffect(() => {
    setSavedVersions(getSavedVersions());
  }, []);

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    
    const customSpec: ProductSpec = JSON.parse(JSON.stringify(SAMPLE_PORTABLE_SMART_DEVICE));
    customSpec.id = `custom-${Date.now()}`;
    customSpec.name = `✨ Custom: ${promptInput.slice(0, 32)}...`;
    customSpec.description = `Generated digital twin spec for "${promptInput}"`;
    customSpec.userPrompt = promptInput;

    onUpdateSpec(customSpec);
    setPromptInput('');
  };

  const handleSaveCurrentVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveName.trim()) return;
    const updated = saveProjectVersion(saveName, spec);
    setSavedVersions(updated);
    setShowSaveModal(false);
    setSaveName('');
  };

  const handleDeleteVersion = (versionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteProjectVersion(versionId);
    setSavedVersions(updated);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Branding Logo */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={onLoadSample}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/30 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-slate-100 to-emerald-400 bg-clip-text text-transparent">
                  TwinSpark
                </h1>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-md uppercase tracking-wider">
                  v2.5 Dynamic
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">AI Electronics Power & 3D Twin Architect</p>
            </div>
          </div>
        </div>

        {/* Prompt Input */}
        <form onSubmit={handlePromptSubmit} className="w-full md:flex-1 max-w-lg">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Describe your product idea (e.g. 'Battery-powered GPS tracker with BLE')..."
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 focus:border-cyan-400 rounded-xl py-2 pl-3.5 pr-28 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Architect</span>
            </button>
          </div>
        </form>

        {/* Action Controls & Two Starting Options */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          {/* STARTING OPTION 1: START BLANK */}
          <button
            onClick={onStartBlank}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Start with an empty custom project"
          >
            <PlusCircle className="w-4 h-4 text-purple-400" />
            <span>Start Blank</span>
          </button>

          {/* STARTING OPTION 2: TRY SAMPLE */}
          <button
            onClick={onLoadSample}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
            title="Load default Portable Smart Device sample template"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Try sample: Portable Smart Device</span>
          </button>

          {/* SAVE VERSION BUTTON */}
          <button
            onClick={() => { setSaveName(spec.name); setShowSaveModal(true); }}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Save current project version"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save Version</span>
          </button>

          {/* SAVED VERSIONS DROPDOWN */}
          {savedVersions.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowVersionsDropdown(!showVersionsDropdown)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400 text-xs font-semibold flex items-center gap-1.5"
              >
                <Folder className="w-3.5 h-3.5" />
                <span>Versions ({savedVersions.length})</span>
              </button>

              {showVersionsDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Saved Project Versions</div>
                  {savedVersions.map(v => (
                    <div
                      key={v.id}
                      onClick={() => { onUpdateSpec(v.spec); setShowVersionsDropdown(false); }}
                      className="p-2 rounded-xl hover:bg-slate-800 cursor-pointer flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-400">{v.name}</div>
                        <div className="text-[10px] text-slate-500">{v.timestamp}</div>
                      </div>
                      <button onClick={(e) => handleDeleteVersion(v.id, e)} className="text-slate-500 hover:text-red-400 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={onExportSpec}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Export Spec JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* SAVE VERSION MODAL */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <form onSubmit={handleSaveCurrentVersion} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Save className="w-4 h-4 text-amber-400" />
              Save Project Version
            </h3>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Version Label / Name</label>
              <input
                type="text"
                required
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowSaveModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 font-semibold">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-amber-500 text-xs text-slate-950 font-bold">Save Version</button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
