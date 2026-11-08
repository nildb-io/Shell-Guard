import React, { useState } from 'react';
import { History, Search, Trash2, ExternalLink, Copy, Check, Filter, AlertTriangle, ShieldCheck } from 'lucide-react';
import { AnalysisResult, RiskLevel } from '../types';

interface HistoryViewProps {
  history: AnalysisResult[];
  onSelectHistory: (item: AnalysisResult) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearAllHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectHistory,
  onDeleteHistoryItem,
  onClearAllHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCommand = (cmd: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cmd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.rawCommand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summaryHeadline.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedRiskFilter === 'ALL') return matchesSearch;
    return matchesSearch && item.riskLevel === selectedRiskFilter;
  });

  const getBadgeStyle = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-950 text-red-300 border-red-500/40';
      case 'HIGH':
        return 'bg-orange-950 text-orange-300 border-orange-500/40';
      case 'MEDIUM':
        return 'bg-amber-950 text-amber-300 border-amber-500/40';
      case 'LOW':
        return 'bg-blue-950 text-blue-300 border-blue-500/40';
      case 'SAFE':
      default:
        return 'bg-emerald-950 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="space-y-6 mb-12">
      {/* Header & Controls */}
      <div className="neu-flat rounded-2xl p-6 border border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold font-mono text-gray-100 flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-400" />
              Command Inspection History
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Previously analyzed shell commands saved locally in browser storage.
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={onClearAllHistory}
              className="neu-btn px-4 py-2 rounded-xl text-xs font-mono font-medium text-red-400 hover:text-red-300 border-red-500/30 flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 neu-inset rounded-xl border border-gray-800 flex items-center px-3 focus-within:ring-1 focus-within:ring-emerald-500/40">
            <Search className="w-4 h-4 text-gray-500 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search history by command or keyword..."
              className="w-full bg-transparent p-2.5 text-xs font-mono text-gray-200 placeholder-gray-500 focus:outline-none"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'SAFE'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedRiskFilter(lvl)}
                className={`px-3 py-2 rounded-xl text-xs font-mono font-medium border transition-all ${
                  selectedRiskFilter === lvl
                    ? 'neu-convex text-emerald-400 border-emerald-500/40 font-bold'
                    : 'text-gray-400 border-gray-800 hover:text-gray-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="neu-flat rounded-2xl p-8 text-center border border-gray-800">
          <History className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <h3 className="text-sm font-mono font-bold text-gray-300 mb-1">No matching history entries</h3>
          <p className="text-xs text-gray-500">
            {history.length === 0 ? 'Analyze commands to build up your history log.' : 'Try adjusting your search query or filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectHistory(item)}
              className="neu-flat rounded-2xl p-4 sm:p-5 border border-gray-800 hover:border-emerald-500/30 transition-all cursor-pointer group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold uppercase ${getBadgeStyle(item.riskLevel)}`}>
                    {item.riskLevel}
                  </span>
                  <span className="text-xs font-mono text-gray-400 uppercase">{item.shell}</span>
                  <span className="text-xs font-mono text-gray-600">•</span>
                  <span className="text-xs font-mono text-gray-400">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleCopyCommand(item.rawCommand, item.id, e)}
                    className="neu-btn p-1.5 rounded-lg text-gray-400 hover:text-gray-200 text-xs flex items-center gap-1"
                    title="Copy Command"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteHistoryItem(item.id);
                    }}
                    className="neu-btn p-1.5 rounded-lg text-gray-400 hover:text-red-400 text-xs"
                    title="Delete Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="neu-btn p-1.5 rounded-lg text-emerald-400 group-hover:bg-emerald-950/40">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Command Text */}
              <div className="neu-inset p-3 rounded-xl font-mono text-xs text-emerald-300 break-all mb-2 border border-gray-800/80">
                user@shellguard:~$ {item.rawCommand}
              </div>

              {/* Headline */}
              <p className="text-xs text-gray-300 font-sans">{item.summaryHeadline}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
