import React, { useState, useRef } from 'react';
import { Zap, Sparkles, Upload, X, Play, PlusCircle, Image as ImageIcon } from 'lucide-react';

interface LandingScreenProps {
  onGenerateDesign: (prompt: string, imageDataUrl?: string) => void;
  onLoadSample: () => void;
  onStartBlank: () => void;
}

export default function LandingScreen({ onGenerateDesign, onLoadSample, onStartBlank }: LandingScreenProps) {
  const [prompt, setPrompt] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onGenerateDesign(prompt.trim(), imagePreview || undefined);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col items-center justify-center px-4 py-12 selection:bg-cyan-500 selection:text-slate-950">
      {/* Ambient glow effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl space-y-8">
        {/* Logo & Title */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 justify-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-emerald-400 p-0.5 shadow-xl shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Zap className="w-7 h-7 text-cyan-400 fill-cyan-400/30" />
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-slate-100 to-emerald-400 bg-clip-text text-transparent">
                TwinSpark
              </h1>
              <p className="text-xs text-slate-400 font-medium">AI Electronics Power & 3D Twin Architect</p>
            </div>
          </div>
        </div>

        {/* Main Heading */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 leading-tight">
            Describe the electronic product<br />you want to create.
          </h2>
          <p className="text-sm text-slate-400 mt-3 max-w-lg mx-auto">
            TwinSpark will estimate power consumption, battery life, and generate an interactive 3D layout for your design.
          </p>
        </div>

        {/* Prompt Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-2xl backdrop-blur-md">
            {/* Textarea */}
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Example: "I want to build a battery-powered GPS tracker that transmits location via BLE every 5 minutes, with a small OLED status screen and a vibration motor alert."`}
              rows={4}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 resize-none transition-all"
            />

            {/* Image Upload Area */}
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="ref-image-upload"
              />

              {!imagePreview ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-dashed border-slate-700 text-xs text-slate-400 hover:text-slate-200 transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Attach reference image (optional)</span>
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-700 shadow-lg">
                    <img src={imagePreview} alt="Reference" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-0.5 right-0.5 p-0.5 bg-slate-900/90 rounded-full text-slate-300 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-xs text-slate-400">Reference image attached</span>
                </div>
              )}
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="submit"
            disabled={!prompt.trim()}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 text-sm font-extrabold flex items-center justify-center gap-2.5 shadow-xl shadow-cyan-500/20 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-cyan-500 disabled:hover:to-emerald-400"
          >
            <Sparkles className="w-5 h-5" />
            <span>Generate Design</span>
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Alternative Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={onLoadSample}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Play className="w-4 h-4 fill-emerald-300" />
            <span>Try sample: Portable Smart Device</span>
          </button>

          <button
            onClick={onStartBlank}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-sm font-bold flex items-center justify-center gap-2 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-purple-400" />
            <span>Start Blank</span>
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-slate-500 leading-relaxed">
          TwinSpark uses deterministic calculations. All starter values are estimates — verify against datasheets.
        </p>
      </div>
    </div>
  );
}
