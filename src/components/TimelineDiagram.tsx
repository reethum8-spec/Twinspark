import React from 'react';
import { ArrowRight, Clock, Zap, Moon, Sun, Radio, Gauge, Monitor, Plus, Trash2 } from 'lucide-react';
import { ProductSpec, OperatingState } from '../types/twinspark';

interface TimelineDiagramProps {
  spec: ProductSpec;
  onUpdateSpec: (spec: ProductSpec) => void;
}

export default function TimelineDiagram({ spec, onUpdateSpec }: TimelineDiagramProps) {
  const getStateIcon = (name: string) => {
    switch (name) {
      case 'Sleep': return Moon;
      case 'Wake': return Sun;
      case 'Read Sensor': return Gauge;
      case 'Display / Output': return Monitor;
      case 'Transmit': return Radio;
      default: return Clock;
    }
  };

  const getStateColor = (name: string) => {
    switch (name) {
      case 'Sleep': return 'border-slate-700 bg-slate-900/60 text-slate-400';
      case 'Wake': return 'border-amber-500/50 bg-amber-500/10 text-amber-300';
      case 'Read Sensor': return 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300';
      case 'Display / Output': return 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300';
      case 'Transmit': return 'border-purple-500/50 bg-purple-500/10 text-purple-300';
      default: return 'border-blue-500/50 bg-blue-500/10 text-blue-300';
    }
  };

  const handleDurationChange = (index: number, newSec: number) => {
    const updatedStates = [...spec.states];
    updatedStates[index] = { ...updatedStates[index], durationSec: Math.max(0.01, newSec) };
    
    // Recalculate total cycle period
    const totalSec = updatedStates.reduce((sum, st) => sum + st.durationSec, 0);

    onUpdateSpec({
      ...spec,
      states: updatedStates,
      cyclePeriodSec: totalSec
    });
  };

  const handleAddState = () => {
    const newState: OperatingState = {
      id: `state-${Date.now()}`,
      name: 'Custom',
      durationSec: 1.0,
      activeComponentIds: spec.controller ? [spec.controller.id] : [],
      description: 'Custom active state step.'
    };
    const updated = [...spec.states, newState];
    const totalSec = updated.reduce((sum, st) => sum + st.durationSec, 0);
    onUpdateSpec({ ...spec, states: updated, cyclePeriodSec: totalSec });
  };

  const handleRemoveState = (index: number) => {
    if (spec.states.length <= 1) return;
    const updated = spec.states.filter((_, i) => i !== index);
    const totalSec = updated.reduce((sum, st) => sum + st.durationSec, 0);
    onUpdateSpec({ ...spec, states: updated, cyclePeriodSec: totalSec });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Operating State Timeline Sequence
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Total Cycle Period: <strong className="text-amber-400 font-mono">{spec.cyclePeriodSec.toFixed(1)} s</strong> ({(spec.cyclePeriodSec / 60).toFixed(1)} mins)
          </p>
        </div>

        <button
          onClick={handleAddState}
          className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-cyan-400 flex items-center gap-1.5 w-fit"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add State Step</span>
        </button>
      </div>

      {/* Horizontal State Flow Cards */}
      <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1">
        {spec.states.map((st, idx) => {
          const Icon = getStateIcon(st.name);
          const styleClass = getStateColor(st.name);

          return (
            <React.Fragment key={st.id || idx}>
              <div className={`shrink-0 w-48 p-3.5 rounded-2xl border ${styleClass} space-y-2 shadow-lg flex flex-col justify-between`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-bold truncate">{st.name}</span>
                  </div>
                  {spec.states.length > 1 && (
                    <button
                      onClick={() => handleRemoveState(idx)}
                      className="text-slate-500 hover:text-red-400 p-0.5"
                      title="Remove State"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                  {st.description}
                </p>

                {/* Duration Input */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold text-slate-400">Duration:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step={st.durationSec >= 10 ? '5' : '0.1'}
                      value={st.durationSec}
                      onChange={(e) => handleDurationChange(idx, parseFloat(e.target.value) || 0.1)}
                      className="w-16 bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-0.5 text-xs text-amber-300 font-mono font-bold text-right"
                    />
                    <span className="text-[10px] text-slate-400 font-mono">s</span>
                  </div>
                </div>
              </div>

              {/* Connecting Flow Arrow */}
              {idx < spec.states.length - 1 && (
                <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0 opacity-60" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
