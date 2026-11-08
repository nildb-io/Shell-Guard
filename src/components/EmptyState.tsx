import React from 'react';
import { Terminal, ShieldAlert, Sparkles, Code2, ArrowRight } from 'lucide-react';
import { SAMPLE_COMMANDS, SampleCommand } from '../data/sampleCommands';

interface EmptyStateProps {
  onSelectSample: (sample: SampleCommand) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectSample }) => {
  return (
    <div className="neu-flat rounded-2xl p-8 sm:p-12 text-center border border-gray-800/80 mb-8">
      {/* Icon Graphic */}
      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl neu-convex flex items-center justify-center text-emerald-400 border border-emerald-500/20">
        <Terminal className="w-8 h-8 text-emerald-400" />
      </div>

      <h2 className="text-xl sm:text-2xl font-bold font-mono text-gray-100 mb-2">
        Ready to analyze.
      </h2>
      <p className="text-sm text-gray-400 max-w-lg mx-auto mb-8 leading-relaxed">
        Paste a Bash command above to inspect its behavior, privilege requirements, scope, and risk level before execution.
      </p>

      {/* Quick Example Command Badges */}
      <div className="max-w-3xl mx-auto">
        <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-4 flex items-center justify-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Or try a sample command below to inspect analysis:</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {SAMPLE_COMMANDS.map((sample) => {
            let badgeStyle = 'text-emerald-400 hover:border-emerald-500/40';
            if (sample.category === 'Warning') badgeStyle = 'text-amber-400 hover:border-amber-500/40';
            if (sample.category === 'Dangerous') badgeStyle = 'text-red-400 hover:border-red-500/40';

            return (
              <button
                key={sample.id}
                onClick={() => onSelectSample(sample)}
                className={`neu-btn px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 group ${badgeStyle}`}
              >
                <span>{sample.label}</span>
                <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Security Guarantee banner */}
      <div className="mt-10 pt-6 border-t border-gray-800/60 max-w-xl mx-auto flex items-center justify-center gap-2 text-xs text-gray-400 font-mono">
        <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>ShellGuard analyzes command structures statically. Commands are NEVER executed.</span>
      </div>
    </div>
  );
};
