import React from 'react';
import { Shield, Lock, Terminal, Cpu, CheckCircle2, AlertCircle, FileCode } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 mb-12">
      {/* Header */}
      <div className="neu-flat rounded-2xl p-8 border border-gray-800 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl neu-convex flex items-center justify-center text-emerald-400 border border-emerald-500/20">
          <Shield className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold font-mono text-gray-100 mb-2">About ShellGuard</h2>
        <p className="text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
          ShellGuard is a specialized Linux & Bash command safety analyzer built for developers, system administrators, and security professionals.
        </p>
      </div>

      {/* Primary Security Guarantee Card */}
      <div className="neu-flat rounded-2xl p-6 border border-emerald-500/40 bg-emerald-950/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl neu-convex shrink-0 text-emerald-400">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-mono font-bold text-emerald-400 mb-1">
              Zero Execution Security Guarantee
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
              ShellGuard operates exclusively as a static analysis and educational tool. User-submitted commands are parsed entirely in memory and analyzed against deterministic rule matrices and AI models. <strong className="text-emerald-300">Commands are NEVER executed, invoked in a shell, or sent to a command runner.</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="neu-flat rounded-2xl p-6 border border-gray-800 space-y-3">
          <div className="p-2.5 rounded-xl neu-convex w-fit text-emerald-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-mono font-bold text-gray-200 uppercase">Deterministic Rule Engine</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Parses Bash syntax trees, pipelines, redirects, flags, paths, and elevated privilege wrappers (`sudo`, `su`). Detects dangerous patterns like recursive deletions (`rm -rf`), disk wipes (`dd`, `mkfs`), raw device overrides, and remote script piping (`curl | bash`).
          </p>
        </div>

        <div className="neu-flat rounded-2xl p-6 border border-gray-800 space-y-3">
          <div className="p-2.5 rounded-xl neu-convex w-fit text-emerald-400">
            <Terminal className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-mono font-bold text-gray-200 uppercase">Gemini AI Enrichment Layer</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Analyzes context and complex flag combinations to generate plain English explanations, evaluate command scope, and construct optimized, low-risk safer alternative commands.
          </p>
        </div>
      </div>

      {/* Best Practices */}
      <div className="neu-flat rounded-2xl p-6 border border-gray-800">
        <h3 className="text-sm font-mono font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Terminal Security Best Practices
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-gray-300">
          <div className="p-3.5 rounded-xl neu-inset border border-gray-800/80">
            <span className="text-emerald-400 font-bold block mb-1">1. Always Inspect Remote Scripts</span>
            Download scripts to a local file (`curl -o script.sh`) and review code before executing with `bash`.
          </div>

          <div className="p-3.5 rounded-xl neu-inset border border-gray-800/80">
            <span className="text-emerald-400 font-bold block mb-1">2. Dry-Run Wildcard Expansions</span>
            Test glob patterns with `ls` or `echo *` prior to running destructive commands like `rm`.
          </div>

          <div className="p-3.5 rounded-xl neu-inset border border-gray-800/80">
            <span className="text-emerald-400 font-bold block mb-1">3. Avoid Unnecessary `sudo`</span>
            Only elevate privileges when specifically writing to system paths or managing daemons.
          </div>

          <div className="p-3.5 rounded-xl neu-inset border border-gray-800/80">
            <span className="text-emerald-400 font-bold block mb-1">4. Use Least-Privilege Permissions</span>
            Prefer standard `755` for directories and `644` for files over permissive `777`.
          </div>
        </div>
      </div>
    </div>
  );
};
