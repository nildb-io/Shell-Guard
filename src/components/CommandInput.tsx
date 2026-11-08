import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Terminal, Keyboard, Sparkles, Loader2 } from 'lucide-react';
import { ShellType } from '../types';

interface CommandInputProps {
  command: string;
  setCommand: (cmd: string) => void;
  shell: ShellType;
  setShell: (shell: ShellType) => void;
  onAnalyze: () => void;
  onClear: () => void;
  isLoading: boolean;
}

export const CommandInput: React.FC<CommandInputProps> = ({
  command,
  setCommand,
  shell,
  setShell,
  onAnalyze,
  onClear,
  isLoading,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (command.trim()) {
        onAnalyze();
      }
    }
  };

  return (
    <div className="neu-flat rounded-2xl p-4 sm:p-6 border border-gray-800/80 mb-8 transition-all">
      {/* Terminal Window Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-gray-800/60">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <span className="text-xs font-mono text-gray-400 font-semibold flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            terminal — bash inspection shell
          </span>
        </div>

        {/* Controls: Shell Switcher & Shortcut hint */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#101319] p-1 rounded-lg neu-inset text-xs font-mono border border-gray-800">
            <span className="text-gray-400 px-2">Shell:</span>
            {(['bash', 'zsh', 'sh'] as ShellType[]).map((s) => (
              <button
                key={s}
                onClick={() => setShell(s)}
                className={`px-2.5 py-0.5 rounded text-xs uppercase font-medium transition-all ${
                  shell === s
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-gray-400 bg-gray-900/60 px-2.5 py-1 rounded-md border border-gray-800">
            <Keyboard className="w-3.5 h-3.5 text-gray-400" />
            <span>Ctrl + Enter</span>
          </div>
        </div>
      </div>

      {/* Terminal Textarea Box */}
      <div className="neu-inset rounded-xl p-4 font-mono text-sm sm:text-base text-emerald-300 relative min-h-[120px] focus-within:ring-1 focus-within:ring-emerald-500/40 transition-all">
        <div className="flex items-start gap-2">
          <span className="text-emerald-500 font-bold select-none whitespace-nowrap pt-0.5">
            user@shellguard:~$
          </span>
          <textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="sudo rm -rf /var/log/*"
            rows={3}
            className="w-full bg-transparent text-gray-100 placeholder-gray-600 focus:outline-none resize-y font-mono leading-relaxed tracking-wide"
            spellCheck={false}
            autoFocus
          />
        </div>

        {/* Char Counter */}
        <div className="absolute bottom-2 right-3 text-[11px] font-mono text-gray-400 select-none">
          {command.length} chars
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-4 mt-4 pt-2">
        <div className="text-xs text-gray-400 hidden sm:block font-mono">
          <span className="text-emerald-400">*</span> Static rule validation + AI model explanation
        </div>

        <div className="flex items-center gap-3 ml-auto w-full sm:w-auto">
          {command.trim() && (
            <button
              onClick={onClear}
              className="neu-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-gray-400 hover:text-gray-200 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}

          <button
            onClick={onAnalyze}
            disabled={!command.trim() || isLoading}
            className={`neu-btn flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all ${
              !command.trim() || isLoading
                ? 'opacity-50 cursor-not-allowed text-gray-500'
                : 'text-emerald-400 hover:text-emerald-300 border-emerald-500/30'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Analyzing Command...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                <span>Analyze Command</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
