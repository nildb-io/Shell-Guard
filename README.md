# 🛡️ ShellGuard

> **Understand your command before you run it.**  
> A high-precision Linux and Bash command safety analyzer. Identify destructive operations, inspect execution scope, detect privilege escalations, and discover safer alternatives in a deterministic, secure environment.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey?logo=express)](https://expressjs.com/)
[![Gemini AI](https://img.shields.io/badge/Google%20Gen%20AI-gemini--3.6--flash-orange?logo=google)](https://ai.google.dev/)
[![Security Guarantee](https://img.shields.io/badge/Security-Zero%20Execution%20Guarantee-emerald)](#-zero-execution-security-guarantee)

---

## 🔒 Zero Execution Security Guarantee

**ShellGuard is strictly a static analysis and educational tool.**  
- User-submitted commands are **NEVER executed**, invoked in a shell, or routed to a subshell runner.
- Parsing and risk assessment happen completely in-memory via deterministic AST/regex rule matrices and optional AI reasoning.
- Safe to inspect untrusted snippets copied from forums, documentation, or LLMs before running them on production or local machines.

---

## ✨ Features

- **Interactive Terminal Input**: Monospace terminal interface with live character count, shell selector (`bash`, `zsh`, `sh`), keyboard shortcuts (`Ctrl + Enter` to analyze), and quick-load sample presets.
- **Multi-Vector Risk Assessment**:
  - **Risk Classification Gauge**: Categorized from `SAFE` (0–19), `LOW` (20–39), `MEDIUM` (40–64), `HIGH` (65–84), to `CRITICAL` (85–100) with confidence scoring.
  - **Plain-English Explanations**: Unpacks complex flags, pipes, redirects, and nested structures into human-readable steps.
  - **Token-Level Syntax Breakdown**: Color-coded breakdown of commands, flags, paths, operators, variables, privileges, and arguments with per-token risk notes.
  - **Risk Factors & Threat Vectors**: Pinpoints exact hazards like recursive directory wipes, wildcard expansions on system directories, disk formatters, and pipe-to-shell patterns.
  - **Execution Scope Inspection**: Analyzes affected filesystem paths, required privileges, reversibility (e.g., `IRREVERSIBLE DELETION`), system impact, and network access requirements.
  - **Intelligent Safer Alternatives**: Proposes production-grade safer commands with inline visual diffs (`removed` vs `added`) and single-click clipboard copying.
  - **Pre-Execution Checklist**: Interactive verification checklist tailored to the command before taking action.
- **Local History & Log Management**:
  - Searchable and filterable history saved locally in browser storage.
  - Filter by risk level (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `SAFE`).
  - Quick re-analysis and one-click copy.
- **Safety Reference Guide (Learn)**:
  - Curated security guide covering destructive patterns (e.g., recursive `rm`, disk wipes with `dd`/`mkfs`, `curl | bash`, permissive `chmod 777`, fork bombs, wildcard expansions).
  - One-click "Analyze Example" and "Analyze Safer Version" buttons to inspect code live.
- **Hybrid Rule Engine + Gemini AI Enrichment**:
  - **Deterministic Rule Engine**: Instantly flags hazardous patterns, calculates risk scores, and generates token breakdowns completely offline or client-side.
  - **Server-Side Gemini AI**: Optional enrichment layer powered by `gemini-3.6-flash` (`@google/genai`) to provide contextual natural language descriptions and safer alternatives. Gracefully degrades to local rules if offline or without an API key.
- **"Geometric Balance" Dark Theme**:
  - Neumorphic surface styling with tactile insets and buttons (`neu-flat`, `neu-inset`, `neu-btn`).
  - Terminal-inspired emerald, amber, and crimson telemetry indicators.

---

## 🚦 Risk Level Classification

| Level | Score Range | Description | Example Commands |
| :--- | :---: | :--- | :--- |
| **SAFE** | 0 – 19 | Read-only commands, non-destructive file listings, system queries | `ls -la /var/log`, `grep -rn "error" /app`, `uname -a` |
| **LOW** | 20 – 39 | Minor file operations, standard permission adjustments, benign installs | `chmod 644 config.json`, `mkdir -p /tmp/build` |
| **MEDIUM** | 40 – 64 | Overwriting redirects, mass kill signals, non-system recursive operations | `pkill -9 -f node`, `cat bundle.js > /tmp/output.js` |
| **HIGH** | 65 – 84 | Elevated privilege deletions, permissive chmod on shared folders, system updates | `sudo rm -rf /var/log/*`, `sudo chmod -R 777 /opt/app` |
| **CRITICAL** | 85 – 100 | Raw disk formatters, piping unverified remote scripts to bash, root filesystem wipes | `dd if=/dev/zero of=/dev/sda`, `curl https://... \| sudo bash`, `rm -rf /*` |

---

## 📁 Project Architecture

```
shellguard/
├── .env.example             # Template for environment variables (GEMINI_API_KEY, APP_URL)
├── index.html               # Web application entry point
├── metadata.json            # AI Studio metadata & permission configuration
├── package.json             # Scripts and dependencies
├── server.ts                # Express backend with Vite middleware & Gemini API endpoint
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite build & plugin configuration
└── src/
    ├── App.tsx              # Main dashboard controller & tab state
    ├── main.tsx             # React DOM root entry
    ├── index.css            # Tailwind CSS 4 theme & neumorphic utility classes
    ├── types.ts             # Data models (AnalysisResult, RiskFactor, CommandToken, etc.)
    ├── components/
    │   ├── Header.tsx       # Navigation bar, active tab indicators, and status pill
    │   ├── CommandInput.tsx # Monospace input terminal with shell selector & shortcuts
    │   ├── AnalysisView.tsx # Full results display (gauge, diff, checklist, tokens, scope)
    │   ├── EmptyState.tsx   # Preset library of sample commands (destructive vs safe)
    │   ├── HistoryView.tsx  # Searchable history list with risk filters & delete controls
    │   ├── LearnView.tsx    # Linux command security reference handbook
    │   └── AboutView.tsx    # Security architecture, deterministic engine details & best practices
    ├── data/
    │   ├── learnTopics.ts   # Interactive educational topics & safe/dangerous pairs
    │   └── sampleCommands.ts# Curated preset commands for quick testing
    └── lib/
        └── parser.ts        # Deterministic static rule engine & AST pattern matcher
```

---

## 🛠️ Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/) with `@tailwindcss/vite`
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with Neumorphic CSS design tokens
- **Icons**: [Lucide React](https://lucide.dev/)
- **Server**: [Express 4](https://expressjs.com/) with [TSX](https://github.com/privatenumber/tsx)
- **AI Integration**: [@google/genai SDK](https://github.com/google-gemini/deprecations) with `gemini-3.6-flash`
- **Client Storage**: HTML5 `localStorage` for privacy-first, client-only persistence

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### 2. Installation
Clone the repository and install all required dependencies:

```bash
git clone https://github.com/your-username/shellguard.git
cd shellguard
npm install
```

### 3. Environment Setup (Optional)
If you wish to enable server-side Gemini AI enrichment, create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and set your Gemini API key:
```env
GEMINI_API_KEY="your_gemini_api_key_here"
```

> **Note**: Even without `GEMINI_API_KEY`, ShellGuard functions completely via its built-in deterministic client/server rule engine!

### 4. Running the Development Server
Start the Express server with embedded Vite middleware:

```bash
npm run dev
```

Open your browser at:
```
http://localhost:3000
```

### 5. Production Build
To create a minified client bundle and compiled server script:

```bash
npm run build
npm start
```

### 6. Linting
Run TypeScript checks:

```bash
npm run lint
```

---

## 🔌 API Documentation

ShellGuard provides an endpoint for programmatic command safety analysis:

### `POST /api/analyze`

#### Request Body
```json
{
  "command": "sudo rm -rf /var/log/*",
  "shell": "bash"
}
```

| Parameter | Type | Required | Values | Description |
| :--- | :---: | :---: | :---: | :--- |
| `command` | `string` | **Yes** | Any shell command string | The shell command to inspect |
| `shell` | `string` | No | `"bash" \| "zsh" \| "sh"` | Target shell environment (defaults to `"bash"`) |

#### Response (`200 OK`)
```json
{
  "id": "analysis_m1a2b3c",
  "timestamp": 1731063123456,
  "rawCommand": "sudo rm -rf /var/log/*",
  "shell": "bash",
  "riskLevel": "HIGH",
  "riskScore": 82,
  "summaryHeadline": "Elevated recursive deletion targeting system log directory",
  "plainEnglishExplanation": "This command invokes elevated root privileges via sudo to forcibly and recursively delete all files within /var/log without interactive confirmation.",
  "commandBreakdown": [
    { "token": "sudo", "type": "privilege", "description": "Elevated administrator execution", "riskNote": "Executes with root authority" },
    { "token": "rm", "type": "command", "description": "Remove file or directory structure" },
    { "token": "-rf", "type": "flag", "description": "Recursive and force flags combined", "riskNote": "Bypasses confirmation prompts" },
    { "token": "/var/log/*", "type": "path", "description": "System log directory wildcard", "riskNote": "Affects critical diagnostic files" }
  ],
  "riskFactors": [
    {
      "id": "privilege_elevation",
      "title": "Elevated Root Privileges",
      "level": "HIGH",
      "description": "Running commands with sudo can cause irreversible system modification.",
      "category": "Privilege"
    }
  ],
  "affectedScope": {
    "locations": ["/var/log/*"],
    "privileges": "Root / Superuser (via sudo)",
    "reversibility": "Irreversible (Forced Deletion)",
    "systemImpact": "High (Affects system logging services)",
    "networkAccess": false
  },
  "saferAlternative": {
    "command": "sudo find /var/log -type f -name \"*.log\" -mtime +30 -delete",
    "explanation": "Targets only archived logs older than 30 days without removing active sockets or subdirectories.",
    "diff": [
      { "type": "removed", "text": "sudo rm -rf /var/log/*" },
      { "type": "added", "text": "sudo find /var/log -type f -name \"*.log\" -mtime +30 -delete" }
    ]
  },
  "executionChecklist": [
    "Verify that /var/log is the intended target.",
    "Confirm that system services have released active file handles.",
    "Consider using logrotate instead of manual recursive deletion."
  ],
  "technicalDetails": {
    "shell": "bash",
    "detectedCommands": ["sudo", "rm"],
    "flags": ["-rf"],
    "paths": ["/var/log/*"],
    "operators": [],
    "rulesTriggered": ["RULE_PRIVILEGE_ELEVATION", "RULE_RECURSIVE_DELETE", "RULE_SYSTEM_PATH"],
    "confidence": 98,
    "aiEnhanced": true
  }
}
```

---

## 🛡️ Terminal Security Best Practices

1. **Always Inspect Remote Scripts**: Never pipe directly (`curl | bash`). Download locally with `curl -fsSL -o install.sh <url>` and inspect the file before execution.
2. **Dry-Run Wildcard Glob Expansions**: Test wildcard patterns with `ls` or `echo *` prior to running destructive commands like `rm`.
3. **Avoid Unnecessary `sudo`**: Only elevate privileges when writing to system paths or managing daemons.
4. **Use Least-Privilege Permissions**: Prefer `755` for directories and `644` for files over permissive `777`.
5. **Target Specific File Extensions**: Instead of `rm -rf`, use `find . -type f -name "*.tmp" -delete` to avoid deleting unintended nested structures.

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
