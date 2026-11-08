import React, { useState } from 'react';
import { BookOpen, ShieldAlert, ArrowRight, Play, CheckCircle, Code2, AlertTriangle } from 'lucide-react';
import { LEARN_TOPICS } from '../data/learnTopics';
import { LearnTopic } from '../types';

interface LearnViewProps {
  onTestCommand: (cmd: string) => void;
}

export const LearnView: React.FC<LearnViewProps> = ({ onTestCommand }) => {
  const [selectedTopic, setSelectedTopic] = useState<LearnTopic | null>(LEARN_TOPICS[0]);

  return (
    <div className="space-y-6 mb-12">
      {/* Page Title Header */}
      <div className="neu-flat rounded-2xl p-6 border border-gray-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl neu-convex text-emerald-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-mono text-gray-100">Linux Command Safety Reference</h2>
            <p className="text-xs text-gray-400">
              Essential security guide covering critical shell patterns, destructive flags, and safety best practices.
            </p>
          </div>
        </div>
      </div>

      {/* Grid Layout: Topics Sidebar + Detailed Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Topic List */}
        <div className="space-y-3">
          {LEARN_TOPICS.map((topic) => {
            const isSelected = selectedTopic?.id === topic.id;

            return (
              <div
                key={topic.id}
                onClick={() => setSelectedTopic(topic)}
                className={`neu-flat rounded-xl p-4 border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500/50 neu-convex bg-emerald-950/10'
                    : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-gray-200">{topic.title}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded neu-inset text-emerald-400 border border-emerald-500/30">
                    {topic.badge}
                  </span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">{topic.summary}</p>
              </div>
            );
          })}
        </div>

        {/* Right Detail Panel */}
        {selectedTopic && (
          <div className="lg:col-span-2 neu-flat rounded-2xl p-6 border border-gray-800 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono text-emerald-400 uppercase font-semibold">{selectedTopic.category}</span>
                <span className="text-xs font-mono text-gray-600">•</span>
                <span className="text-xs font-mono text-gray-400">{selectedTopic.badge}</span>
              </div>
              <h3 className="text-xl font-bold font-mono text-gray-100 mb-3">{selectedTopic.title}</h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed p-4 rounded-xl neu-inset border border-gray-800">
                {selectedTopic.detailedExplanation}
              </p>
            </div>

            {/* Key Risks */}
            <div>
              <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Key Security Vectors
              </h4>
              <ul className="space-y-2">
                {selectedTopic.risks.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-300">
                    <span className="text-amber-500 mt-0.5">▪</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Code Examples & Try in Analyzer Button */}
            <div className="space-y-4 pt-4 border-t border-gray-800">
              {/* Dangerous Example */}
              <div className="p-4 rounded-xl neu-inset border border-red-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-red-400 font-bold">POTENTIALLY HAZARDOUS PATTERN</span>
                  <button
                    onClick={() => onTestCommand(selectedTopic.exampleCommand)}
                    className="neu-btn px-3 py-1 rounded-lg text-xs font-mono text-red-400 hover:text-red-300 border-red-500/30 flex items-center gap-1.5"
                  >
                    <Play className="w-3 h-3 fill-red-400" />
                    <span>Analyze Example</span>
                  </button>
                </div>
                <code className="block font-mono text-xs text-red-300 break-all bg-red-950/40 p-2.5 rounded-lg border border-red-500/20">
                  {selectedTopic.exampleCommand}
                </code>
              </div>

              {/* Safer Example */}
              <div className="p-4 rounded-xl neu-inset border border-emerald-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-emerald-400 font-bold">RECOMMENDED SAFE PATTERN</span>
                  <button
                    onClick={() => onTestCommand(selectedTopic.saferExample)}
                    className="neu-btn px-3 py-1 rounded-lg text-xs font-mono text-emerald-400 hover:text-emerald-300 border-emerald-500/30 flex items-center gap-1.5"
                  >
                    <Play className="w-3 h-3 fill-emerald-400" />
                    <span>Analyze Safer Version</span>
                  </button>
                </div>
                <code className="block font-mono text-xs text-emerald-300 break-all bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/20">
                  {selectedTopic.saferExample}
                </code>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
