import React from 'react';
import { Terminal, Shield, History, BookOpen, Info, CheckCircle2, Cpu } from 'lucide-react';

interface HeaderProps {
  activeTab: 'analyzer' | 'history' | 'learn' | 'about';
  setActiveTab: (tab: 'analyzer' | 'history' | 'learn' | 'about') => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, historyCount }) => {
  return (
    <header className="neu-flat sticky top-0 z-50 px-4 py-3 border-b border-gray-800/80 bg-[#141820]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('analyzer')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl neu-convex flex items-center justify-center text-emerald-400 group-hover:text-emerald-300 transition-colors">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-wide text-gray-100 font-mono">ShellGuard</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded neu-inset text-emerald-400 font-semibold border border-emerald-500/20">
                v1.2 Security
              </span>
            </div>
            <p className="text-xs text-gray-400">Linux & Bash Command Safety Analyzer</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 bg-[#101319] p-1.5 rounded-xl neu-inset border border-gray-800/60">
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'analyzer'
                ? 'neu-convex text-emerald-400 border border-emerald-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Analyzer</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all relative ${
              activeTab === 'history'
                ? 'neu-convex text-emerald-400 border border-emerald-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
            }`}
          >
            <History className="w-4 h-4" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('learn')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'learn'
                ? 'neu-convex text-emerald-400 border border-emerald-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Learn</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'about'
                ? 'neu-convex text-emerald-400 border border-emerald-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>About</span>
          </button>
        </nav>

        {/* Engine Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl neu-inset text-xs font-mono text-gray-300 border border-gray-800">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-gray-300">Rule Engine + AI Active</span>
        </div>
      </div>
    </header>
  );
};
