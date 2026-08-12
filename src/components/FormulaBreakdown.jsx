import React, { useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { BookOpen, ChevronDown, ChevronUp, Calculator, Sparkles, CheckCircle2 } from 'lucide-react';
import { generateFormulaSteps } from '../utils/calculator';

function LatexMath({ tex, displayMode = false }) {
  try {
    const html = katex.renderToString(tex, {
      displayMode,
      throwOnError: false
    });
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  } catch (err) {
    return <code className="font-mono text-amber-400">{tex}</code>;
  }
}

export default function FormulaBreakdown({ spec, metrics }) {
  const steps = generateFormulaSteps(spec, metrics);
  const [expandedStep, setExpandedStep] = useState('step-1');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Transparent Electrical Formulas & Calculations</h3>
            <p className="text-xs text-slate-400">Step-by-step mathematical breakdown with live dynamic variable substitutions.</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-time Math Engine</span>
        </div>
      </div>

      {/* Accordion / List of Formula Steps */}
      <div className="space-y-3">
        {steps.map(step => {
          const isOpen = expandedStep === step.id;
          return (
            <div
              key={step.id}
              className={`border rounded-xl transition-all overflow-hidden ${
                isOpen ? 'bg-slate-950/80 border-amber-500/40 shadow-lg' : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header Button */}
              <button
                onClick={() => setExpandedStep(isOpen ? null : step.id)}
                className="w-full p-3.5 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className={`w-4 h-4 ${isOpen ? 'text-amber-400' : 'text-slate-600'}`} />
                  <span className="text-xs font-bold text-slate-200">{step.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    {step.numericalResult}
                  </span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {/* Step Content Body */}
              {isOpen && (
                <div className="p-4 pt-0 border-t border-slate-800/60 space-y-3">
                  <p className="text-xs text-slate-400 leading-relaxed">{step.explanation}</p>

                  {/* General Mathematical Formula */}
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-center overflow-x-auto text-amber-200">
                    <LatexMath tex={step.formulaLaTeX} displayMode={true} />
                  </div>

                  {/* Live Dynamic Substitution */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block">Live Numerical Substitution:</span>
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-cyan-500/20 text-xs font-mono text-cyan-200 overflow-x-auto">
                      <LatexMath tex={step.substitution} displayMode={true} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
