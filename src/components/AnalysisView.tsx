import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Terminal,
  Cpu,
  CornerDownRight,
  Sparkles,
  Layers,
  FileCheck2,
  Lock,
  Globe,
  HardDrive,
  Info,
} from 'lucide-react';
import { AnalysisResult, RiskLevel } from '../types';

interface AnalysisViewProps {
  result: AnalysisResult;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ result }) => {
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedSafer, setCopiedSafer] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const handleCopyOriginal = () => {
    navigator.clipboard.writeText(result.rawCommand);
    setCopiedOriginal(true);
    setTimeout(() => setCopiedOriginal(false), 2000);
  };

  const handleCopySafer = () => {
    if (result.saferAlternative) {
      navigator.clipboard.writeText(result.saferAlternative.command);
      setCopiedSafer(true);
      setTimeout(() => setCopiedSafer(false), 2000);
    }
  };

  const toggleCheck = (index: number) => {
    setCheckedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Styling based on Risk Level
  const getRiskStyle = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-950/40',
          border: 'border-red-500/50',
          text: 'text-red-400',
          badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
          icon: <AlertOctagon className="w-7 h-7 text-red-500" />,
          label: 'CRITICAL RISK',
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-950/40',
          border: 'border-orange-500/50',
          text: 'text-orange-400',
          badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          icon: <AlertTriangle className="w-7 h-7 text-orange-500" />,
          label: 'HIGH RISK',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-950/40',
          border: 'border-amber-500/50',
          text: 'text-amber-400',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: <AlertTriangle className="w-7 h-7 text-amber-500" />,
          label: 'MEDIUM RISK',
        };
      case 'LOW':
        return {
          bg: 'bg-blue-950/30',
          border: 'border-blue-500/40',
          text: 'text-blue-400',
          badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          icon: <Info className="w-7 h-7 text-blue-400" />,
          label: 'LOW RISK',
        };
      case 'SAFE':
      default:
        return {
          bg: 'bg-emerald-950/30',
          border: 'border-emerald-500/40',
          text: 'text-emerald-400',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: <CheckCircle2 className="w-7 h-7 text-emerald-400" />,
          label: 'SAFE COMMAND',
        };
    }
  };

  const riskStyle = getRiskStyle(result.riskLevel);

  return (
    <div className="space-y-6 mb-12">
      {/* 1. TOP RISK LEVEL HEADER BANNER */}
      <div
        className={`neu-flat rounded-2xl p-6 border ${riskStyle.border} ${riskStyle.bg} transition-all relative overflow-hidden`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl neu-convex shrink-0">{riskStyle.icon}</div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span
                  className={`px-3 py-0.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider border ${riskStyle.badgeBg}`}
                >
                  {riskStyle.label}
                </span>
                <span className="text-xs font-mono text-gray-400">
                  Risk Score: <strong className={riskStyle.text}>{result.riskScore}/100</strong>
                </span>
                {result.technicalDetails.aiEnhanced && (
                  <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    AI Enhanced
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-100 font-mono leading-tight">
                {result.summaryHeadline}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-gray-400 bg-[#101319]/80 px-3 py-2 rounded-xl neu-inset border border-gray-800">
            <span>Shell:</span>
            <span className="text-emerald-400 font-bold uppercase">{result.shell}</span>
            <span className="mx-1 text-gray-600">|</span>
            <span>Confidence:</span>
            <span className="text-gray-200 font-semibold">{result.technicalDetails.confidence}%</span>
          </div>
        </div>
      </div>

      {/* 2. COMMAND BREAKDOWN CARD */}
      <div className="neu-flat rounded-2xl p-6 border border-gray-800">
        <h3 className="text-sm font-mono font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          Command Breakdown & Syntax Inspection
        </h3>

        <div className="flex flex-wrap items-center gap-2 p-4 rounded-xl neu-inset font-mono text-sm leading-relaxed">
          {result.commandBreakdown.map((token, idx) => {
            let tokenColor = 'bg-gray-800/80 text-gray-200 border-gray-700';
            if (token.type === 'privilege') tokenColor = 'bg-red-950/80 text-red-300 border-red-500/40 font-bold';
            if (token.type === 'command') tokenColor = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 font-semibold';
            if (token.type === 'flag') tokenColor = 'bg-amber-950/80 text-amber-300 border-amber-500/40';
            if (token.type === 'path') tokenColor = 'bg-blue-950/80 text-blue-300 border-blue-500/40';
            if (token.type === 'operator') tokenColor = 'bg-purple-950/80 text-purple-300 border-purple-500/40';

            return (
              <div key={idx} className="group relative inline-block">
                <span
                  className={`px-2.5 py-1 rounded-lg border text-xs sm:text-sm font-mono transition-all cursor-help ${tokenColor}`}
                >
                  {token.token}
                </span>

                {/* Popover / Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 rounded-xl neu-flat text-xs text-gray-200 font-sans shadow-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20 border border-gray-700">
                  <div className="font-mono font-bold text-emerald-400 text-[11px] uppercase mb-1">
                    {token.type}
                  </div>
                  <div>{token.description}</div>
                  {token.riskNote && (
                    <div className="mt-1.5 pt-1.5 border-t border-gray-800 text-amber-400 font-mono text-[11px]">
                      ⚠ {token.riskNote}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. WHAT WILL HAPPEN & SCOPE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WHAT WILL HAPPEN? */}
        <div className="neu-flat rounded-2xl p-6 border border-gray-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-mono font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400" />
              What Will Happen?
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed font-sans bg-[#13171f] p-4 rounded-xl neu-inset border border-gray-800/80">
              {result.plainEnglishExplanation}
            </p>
          </div>
        </div>

        {/* SCOPE ANALYSIS */}
        <div className="neu-flat rounded-2xl p-6 border border-gray-800">
          <h3 className="text-sm font-mono font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Command Execution Scope
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg neu-inset border border-gray-800">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" /> Privileges Required:
              </span>
              <span className="text-gray-200 font-semibold">{result.affectedScope.privileges}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg neu-inset border border-gray-800">
              <span className="text-gray-400 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" /> Affected Locations:
              </span>
              <span className="text-gray-200 font-semibold truncate max-w-[200px]">
                {result.affectedScope.locations.join(', ')}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg neu-inset border border-gray-800">
              <span className="text-gray-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" /> Reversibility:
              </span>
              <span className="text-amber-400 font-semibold">{result.affectedScope.reversibility}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg neu-inset border border-gray-800">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" /> Network Access:
              </span>
              <span className={result.affectedScope.networkAccess ? 'text-amber-400' : 'text-gray-400'}>
                {result.affectedScope.networkAccess ? 'Yes (Remote Request)' : 'No (Local Execution)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. DETECTED RISK FACTORS */}
      {result.riskFactors.length > 0 && (
        <div className="neu-flat rounded-2xl p-6 border border-gray-800">
          <h3 className="text-sm font-mono font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Detected Risk Vectors ({result.riskFactors.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.riskFactors.map((rf) => {
              let badgeColor = 'bg-blue-950 text-blue-300 border-blue-500/30';
              if (rf.level === 'CRITICAL') badgeColor = 'bg-red-950 text-red-300 border-red-500/30';
              if (rf.level === 'HIGH') badgeColor = 'bg-orange-950 text-orange-300 border-orange-500/30';
              if (rf.level === 'MEDIUM') badgeColor = 'bg-amber-950 text-amber-300 border-amber-500/30';

              return (
                <div
                  key={rf.id}
                  className="p-3.5 rounded-xl neu-inset border border-gray-800/80 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono font-bold text-xs text-gray-200">{rf.title}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${badgeColor}`}>
                      {rf.level}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{rf.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. SAFER ALTERNATIVE & COMMAND DIFF COMPARISON */}
      {result.saferAlternative && (
        <div className="neu-flat rounded-2xl p-6 border border-emerald-500/30 bg-emerald-950/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              Recommended Safer Alternative
            </h3>
            <span className="text-xs text-emerald-400/80 font-mono bg-emerald-950 px-2.5 py-1 rounded-md border border-emerald-500/30">
              Low Risk Optimization
            </span>
          </div>

          <p className="text-xs sm:text-sm text-gray-300 mb-4 leading-relaxed">
            {result.saferAlternative.explanation}
          </p>

          {/* TWO-PANEL COMPARISON */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Original */}
            <div className="neu-inset p-4 rounded-xl border border-red-500/30 relative">
              <div className="flex items-center justify-between text-xs font-mono text-red-400 font-bold mb-2">
                <span>ORIGINAL COMMAND</span>
                <button
                  onClick={handleCopyOriginal}
                  className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-200 neu-btn px-2 py-1 rounded"
                >
                  {copiedOriginal ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedOriginal ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <code className="block font-mono text-xs sm:text-sm text-red-300 break-all bg-red-950/40 p-2.5 rounded-lg border border-red-500/20">
                {result.rawCommand}
              </code>
            </div>

            {/* Safer */}
            <div className="neu-inset p-4 rounded-xl border border-emerald-500/30 relative">
              <div className="flex items-center justify-between text-xs font-mono text-emerald-400 font-bold mb-2">
                <span>SAFER ALTERNATIVE</span>
                <button
                  onClick={handleCopySafer}
                  className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 neu-btn px-2 py-1 rounded border-emerald-500/30"
                >
                  {copiedSafer ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSafer ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <code className="block font-mono text-xs sm:text-sm text-emerald-300 break-all bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/20">
                {result.saferAlternative.command}
              </code>
            </div>
          </div>
        </div>
      )}

      {/* 6. EXECUTION SAFETY CHECKLIST */}
      {result.executionChecklist.length > 0 && (
        <div className="neu-flat rounded-2xl p-6 border border-gray-800">
          <h3 className="text-sm font-mono font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            Pre-Execution Safety Checklist
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Verify each safety condition before copying or executing this command in your terminal.
          </p>

          <div className="space-y-2">
            {result.executionChecklist.map((item, idx) => (
              <label
                key={idx}
                onClick={() => toggleCheck(idx)}
                className={`flex items-start gap-3 p-3 rounded-xl neu-inset border transition-all cursor-pointer select-none ${
                  checkedItems[idx]
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                    : 'border-gray-800/80 text-gray-300 hover:border-gray-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-all ${
                    checkedItems[idx]
                      ? 'bg-emerald-500 border-emerald-500 text-black'
                      : 'border-gray-600 bg-gray-900'
                  }`}
                >
                  {checkedItems[idx] && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="text-xs font-mono leading-relaxed">{item}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 7. COLLAPSIBLE TECHNICAL DETAILS */}
      <div className="neu-flat rounded-2xl border border-gray-800 overflow-hidden">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full p-4 flex items-center justify-between text-xs font-mono text-gray-400 hover:text-gray-200 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>TECHNICAL METADATA & RULE DIAGNOSTICS</span>
          </div>
          {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTechnicalDetails && (
          <div className="p-6 pt-0 border-t border-gray-800/60 font-mono text-xs space-y-3 text-gray-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              <div>
                <span className="text-gray-500 block mb-1">Detected Commands:</span>
                <span className="text-emerald-400 font-semibold">
                  {result.technicalDetails.detectedCommands.join(', ') || 'None'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Flags Detected:</span>
                <span className="text-amber-400 font-semibold">
                  {result.technicalDetails.flags.join(', ') || 'None'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Target Paths:</span>
                <span className="text-blue-400 font-semibold">
                  {result.technicalDetails.paths.join(', ') || 'None'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Triggered Rules:</span>
                <span className="text-red-400 font-semibold">
                  {result.technicalDetails.rulesTriggered.join(', ') || 'None'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-800 text-gray-500 text-[11px] flex items-center justify-between">
              <span>Analysis Engine ID: static-rule-v1.2</span>
              <span>Timestamp: {new Date(result.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
