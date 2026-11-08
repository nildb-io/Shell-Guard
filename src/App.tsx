import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CommandInput } from './components/CommandInput';
import { EmptyState } from './components/EmptyState';
import { AnalysisView } from './components/AnalysisView';
import { HistoryView } from './components/HistoryView';
import { LearnView } from './components/LearnView';
import { AboutView } from './components/AboutView';
import { analyzeCommand as analyzeLocally } from './lib/parser';
import { AnalysisResult, ShellType } from './types';
import { SampleCommand } from './data/sampleCommands';
import { ShieldAlert, Terminal, AlertTriangle } from 'lucide-react';

const LOCAL_STORAGE_HISTORY_KEY = 'shellguard_command_history_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'history' | 'learn' | 'about'>('analyzer');
  const [command, setCommand] = useState<string>('');
  const [shell, setShell] = useState<ShellType>('bash');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  // Load history from localStorage on startup
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load command history from localStorage', e);
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (newHistory: AnalysisResult[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.warn('Failed to save history to localStorage', e);
    }
  };

  const handleAnalyze = async (overrideCmd?: string) => {
    const cmdToAnalyze = overrideCmd ?? command;
    if (!cmdToAnalyze.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // 1. Send request to server API route
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmdToAnalyze, shell }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data: AnalysisResult = await response.json();
      setAnalysisResult(data);

      // Add to history (prevent duplicates at top)
      const updatedHistory = [data, ...history.filter((h) => h.id !== data.id)].slice(0, 50);
      saveHistory(updatedHistory);
    } catch (err) {
      console.warn('Backend API request failed, executing client-side static parser:', err);
      // Fallback: Run deterministic static rule engine directly in browser
      const localResult = analyzeLocally(cmdToAnalyze, shell);
      setAnalysisResult(localResult);

      const updatedHistory = [localResult, ...history.filter((h) => h.id !== localResult.id)].slice(0, 50);
      saveHistory(updatedHistory);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setCommand('');
    setAnalysisResult(null);
    setError(null);
  };

  const handleSelectSample = (sample: SampleCommand) => {
    setCommand(sample.command);
    setShell(sample.shell);
    handleAnalyze(sample.command);
  };

  const handleSelectHistoryItem = (item: AnalysisResult) => {
    setCommand(item.rawCommand);
    setShell(item.shell);
    setAnalysisResult(item);
    setActiveTab('analyzer');
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    saveHistory(updated);
  };

  const handleClearAllHistory = () => {
    saveHistory([]);
  };

  const handleTestLearnCommand = (cmd: string) => {
    setCommand(cmd);
    setActiveTab('analyzer');
    handleAnalyze(cmd);
  };

  return (
    <div className="min-h-screen bg-[#11141a] text-gray-100 flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-200">
      <div>
        {/* Navigation Bar */}
        <Header activeTab={activeTab} setActiveTab={setActiveTab} historyCount={history.length} />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* ANALYZER VIEW */}
          {activeTab === 'analyzer' && (
            <div>
              {/* Dashboard Hero Title */}
              <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-4xl font-extrabold font-mono text-gray-100 tracking-tight mb-2">
                  Understand your command before you run it.
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
                  Analyze Bash commands, identify risky operations, inspect execution scope, and discover safer alternatives in a deterministic, secure environment.
                </p>
              </div>

              {/* Command Input Component */}
              <CommandInput
                command={command}
                setCommand={setCommand}
                shell={shell}
                setShell={setShell}
                onAnalyze={() => handleAnalyze()}
                onClear={handleClear}
                isLoading={isLoading}
              />

              {/* Error Alert if any */}
              {error && (
                <div className="neu-flat rounded-2xl p-4 border border-red-500/50 bg-red-950/30 text-red-300 text-xs font-mono mb-6 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Result View or Empty State */}
              {analysisResult ? (
                <AnalysisView result={analysisResult} />
              ) : (
                <EmptyState onSelectSample={handleSelectSample} />
              )}
            </div>
          )}

          {/* HISTORY VIEW */}
          {activeTab === 'history' && (
            <HistoryView
              history={history}
              onSelectHistory={handleSelectHistoryItem}
              onDeleteHistoryItem={handleDeleteHistoryItem}
              onClearAllHistory={handleClearAllHistory}
            />
          )}

          {/* LEARN VIEW */}
          {activeTab === 'learn' && <LearnView onTestCommand={handleTestLearnCommand} />}

          {/* ABOUT VIEW */}
          {activeTab === 'about' && <AboutView />}
        </main>
      </div>

      {/* Footer */}
      <footer className="neu-flat border-t border-gray-800/80 py-6 px-4 text-center font-mono text-xs text-gray-400 bg-[#12151c]/90">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-gray-200">ShellGuard Security Utility</span>
            <span className="text-gray-400">| Static Command Safety Engine</span>
          </div>
          <div className="text-gray-400">
            Commands are analyzed locally and server-side. <strong className="text-emerald-400">Never executed.</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}
