import {
  AnalysisResult,
  AffectedScope,
  CommandToken,
  DiffChunk,
  RiskFactor,
  RiskLevel,
  SaferAlternative,
  ShellType,
  TechnicalDetails,
} from '../types';

/**
 * Static Command Safety Analysis Engine for ShellGuard
 * Operates deterministically on client or server without executing shell code.
 */

export function analyzeCommand(rawCommand: string, shell: ShellType = 'bash'): AnalysisResult {
  const trimmed = rawCommand.trim();
  const id = 'analysis_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

  if (!trimmed) {
    return createEmptyAnalysisResult(id, shell);
  }

  // Detect component keywords
  const hasSudo = /\bsudo\b/i.test(trimmed);
  const hasSu = /\bsu\b/i.test(trimmed) && !/\bsub\b/i.test(trimmed);
  const hasRootPrivilege = hasSudo || hasSu;

  const hasRm = /\brm\b/i.test(trimmed);
  const hasRecursive = /(^|\s)-[a-zA-Z]*r[a-zA-Z]*/i.test(trimmed) || /(^|\s)--recursive\b/i.test(trimmed);
  const hasForce = /(^|\s)-[a-zA-Z]*f[a-zA-Z]*/i.test(trimmed) || /(^|\s)--force\b/i.test(trimmed);
  const hasWildcard = /[*?{}\[\]]/.test(trimmed);

  const hasPipeToShell = /(curl|wget)\b.*\|\s*(sudo\s+)?(bash|sh|zsh|python|perl)\b/i.test(trimmed);
  const hasDd = /\bdd\b/i.test(trimmed);
  const hasMkfs = /\bmkfs(\.[a-z0-9]+)?\b/i.test(trimmed);
  const hasFdisk = /\b(fdisk|parted|gdisk)\b/i.test(trimmed);
  const hasDevDevice = /\/dev\/(sd[a-z][0-9]?|nvme[0-9]n[0-9]|hd[a-z]|zero|null|random|urandom)\b/i.test(trimmed);

  const hasChmod = /\bchmod\b/i.test(trimmed);
  const hasChown = /\bchown\b/i.test(trimmed);
  const has777 = /\b777\b/i.test(trimmed) || /a\+rwx\b/i.test(trimmed);

  const hasRebootShutdown = /\b(reboot|shutdown|poweroff|init 0|init 6)\b/i.test(trimmed);
  const hasSystemctl = /\bsystemctl\b/i.test(trimmed);
  const hasKill = /\b(kill|killall|pkill)\b/i.test(trimmed);

  const hasForkBomb = /:\(\)\s*\{\s*:\|:&\s*\}s*;/i.test(trimmed) || /:\(\)\{:\|\:&\}::/i.test(trimmed);

  const hasRedirectOverwrite = />\s*(\/|\w)/i.test(trimmed) && !/>>/i.test(trimmed);
  const hasCommandSub = /\$\(.*\)|\`.*\`/i.test(trimmed);
  const hasNetwork = /\b(curl|wget|nc|netcat|nmap|ssh|scp|rsync|ftp|tftp)\b/i.test(trimmed);

  const isRootTarget = /\s+(\/|\/\*|\/~|\/\.\*|~|\$HOME|\${HOME})(\s+|$)/i.test(trimmed);
  const isSystemPathTarget = /\s+\/(var|etc|usr|bin|sbin|boot|lib|lib64|opt|sys|proc|dev)(\/|\*|\s+|$)/i.test(trimmed);

  // Initialize scoring
  let score = 0;
  const rulesTriggered: string[] = [];
  const riskFactors: RiskFactor[] = [];

  // 1. Fork bomb check
  if (hasForkBomb) {
    score += 100;
    rulesTriggered.push('RULE_FORK_BOMB');
    riskFactors.push({
      id: 'rf_forkbomb',
      title: 'Fork Bomb Denial-of-Service',
      level: 'CRITICAL',
      category: 'Resource Exhaustion',
      description: 'Recursively spawns endless background processes to paralyze system CPU and process table.',
    });
  }

  // 2. Destructive rm operations
  if (hasRm) {
    if (isRootTarget && (hasRecursive || hasWildcard)) {
      score += 95;
      rulesTriggered.push('RULE_RM_ROOT_DESTRUCTION');
      riskFactors.push({
        id: 'rf_rm_root',
        title: 'Root/Home Recursive Deletion',
        level: 'CRITICAL',
        category: 'Filesystem Destruction',
        description: 'Attempts recursive deletion targeting system root (/) or user home directory, causing permanent data loss.',
      });
    } else if (isSystemPathTarget && (hasRecursive || hasForce)) {
      score += 85;
      rulesTriggered.push('RULE_RM_SYSTEM_PATH');
      riskFactors.push({
        id: 'rf_rm_sys',
        title: 'Critical System Directory Removal',
        level: 'HIGH',
        category: 'System Damage',
        description: `Targeting essential operating system path (${trimmed.match(/\/(var|etc|usr|bin|boot|opt)[^\s]*/)?.[0] || 'system dir'}).`,
      });
    } else if (hasRecursive && hasForce) {
      score += 65;
      rulesTriggered.push('RULE_RM_RECURSIVE_FORCE');
      riskFactors.push({
        id: 'rf_rm_rf',
        title: 'Forced Recursive Deletion',
        level: 'HIGH',
        category: 'Destructive Operation',
        description: 'Uses -r (recursive) and -f (force) flags to erase entire directory trees without asking confirmation.',
      });
    } else if (hasRecursive) {
      score += 45;
      rulesTriggered.push('RULE_RM_RECURSIVE');
      riskFactors.push({
        id: 'rf_rm_r',
        title: 'Recursive Directory Removal',
        level: 'MEDIUM',
        category: 'Destructive Operation',
        description: 'Deletes directories and all contained files recursively.',
      });
    } else {
      score += 15;
      rulesTriggered.push('RULE_RM_FILE');
      riskFactors.push({
        id: 'rf_rm',
        title: 'File Removal',
        level: 'LOW',
        category: 'File Operation',
        description: 'Permanently removes target files without trash/recycle bin recovery.',
      });
    }
  }

  // 3. Remote script execution (curl | bash)
  if (hasPipeToShell) {
    score += 90;
    rulesTriggered.push('RULE_CURL_PIPE_SHELL');
    riskFactors.push({
      id: 'rf_curl_shell',
      title: 'Piping Remote Web Content to Shell',
      level: 'CRITICAL',
      category: 'Remote Code Execution',
      description: 'Executes unverified code downloaded from the web directly in a shell session without preliminary inspection.',
    });
  }

  // 4. Raw Device / Disk Operations
  if (hasDd && hasDevDevice) {
    score += 95;
    rulesTriggered.push('RULE_DD_RAW_DEVICE');
    riskFactors.push({
      id: 'rf_dd_dev',
      title: 'Raw Block Device Overwrite',
      level: 'CRITICAL',
      category: 'Storage Destruction',
      description: 'Direct byte-for-byte block write to a physical storage device, destroying partition tables or filesystems.',
    });
  }

  if (hasMkfs) {
    score += 90;
    rulesTriggered.push('RULE_MKFS_FORMAT');
    riskFactors.push({
      id: 'rf_mkfs',
      title: 'Filesystem Formatting',
      level: 'CRITICAL',
      category: 'Storage Destruction',
      description: 'Constructs a new filesystem on the specified device, erasing existing partition data.',
    });
  }

  // 5. Elevated Privileges
  if (hasRootPrivilege) {
    score += 25;
    rulesTriggered.push('RULE_ELEVATED_SUDO');
    riskFactors.push({
      id: 'rf_sudo',
      title: 'Superuser / Elevated Privileges',
      level: hasRm || hasDd || hasMkfs || has777 ? 'HIGH' : 'MEDIUM',
      category: 'Privilege Escalation',
      description: 'Executes command with full root administrative capabilities, bypassing normal file protection constraints.',
    });
  }

  // 6. Dangerous Permission / Ownership Changes
  if (hasChmod && has777) {
    score += 70;
    rulesTriggered.push('RULE_CHMOD_777');
    riskFactors.push({
      id: 'rf_chmod777',
      title: 'Insecure Global Permissions (777)',
      level: 'HIGH',
      category: 'Security Degradation',
      description: 'Grants read, write, and execute permissions to all users on the machine (World Writable).',
    });
  } else if (hasChmod && hasRecursive) {
    score += 40;
    rulesTriggered.push('RULE_CHMOD_RECURSIVE');
    riskFactors.push({
      id: 'rf_chmod_r',
      title: 'Recursive Permission Modification',
      level: 'MEDIUM',
      category: 'Permissions',
      description: 'Modifies file permissions recursively across an entire directory subtree.',
    });
  }

  if (hasChown && hasRecursive) {
    score += 45;
    rulesTriggered.push('RULE_CHOWN_RECURSIVE');
    riskFactors.push({
      id: 'rf_chown_r',
      title: 'Recursive Ownership Modification',
      level: 'MEDIUM',
      category: 'Permissions',
      description: 'Changes file/group ownership recursively across subdirectories.',
    });
  }

  // 7. System Shutdown / Reboot / Services
  if (hasRebootShutdown) {
    score += 75;
    rulesTriggered.push('RULE_SYSTEM_SHUTDOWN');
    riskFactors.push({
      id: 'rf_shutdown',
      title: 'System Power State Change',
      level: 'HIGH',
      category: 'System Availability',
      description: 'Initiates immediate system halt or restart, terminating all active background services and user sessions.',
    });
  }

  if (hasSystemctl) {
    score += 20;
    rulesTriggered.push('RULE_SYSTEMCTL');
    riskFactors.push({
      id: 'rf_systemctl',
      title: 'System Daemon Control',
      level: 'LOW',
      category: 'System Services',
      description: 'Interacts with systemd service unit manager to start, stop, or reload system services.',
    });
  }

  // 8. Wildcard expansion
  if (hasWildcard && !hasForkBomb) {
    score += 15;
    rulesTriggered.push('RULE_WILDCARD_EXPANSION');
    riskFactors.push({
      id: 'rf_wildcard',
      title: 'Glob / Wildcard Pattern Match',
      level: hasRm ? 'HIGH' : 'LOW',
      category: 'Scope Expansion',
      description: 'Uses shell glob characters (*, ?, []) which expand to match multiple files or hidden system dotfiles unpredictably.',
    });
  }

  // 9. Redirect overwrite
  if (hasRedirectOverwrite) {
    score += 20;
    rulesTriggered.push('RULE_FILE_OVERWRITE');
    riskFactors.push({
      id: 'rf_redirect',
      title: 'File Truncation / Overwrite',
      level: 'MEDIUM',
      category: 'Data Mutation',
      description: 'Uses standard output redirection operator (>) which immediately truncates and overwrites destination file content.',
    });
  }

  // Cap score at 100
  score = Math.min(100, score);

  // Compute Risk Level
  let riskLevel: RiskLevel = 'SAFE';
  if (score >= 85) riskLevel = 'CRITICAL';
  else if (score >= 60) riskLevel = 'HIGH';
  else if (score >= 35) riskLevel = 'MEDIUM';
  else if (score >= 15) riskLevel = 'LOW';
  else riskLevel = 'SAFE';

  // Generate Summary Headline
  const summaryHeadline = generateSummaryHeadline(trimmed, riskLevel, rulesTriggered);

  // Generate Plain English Explanation
  const plainEnglishExplanation = generatePlainEnglishExplanation(trimmed, riskLevel, hasSudo, hasRm, hasRecursive, hasForce, hasPipeToShell, hasChmod, has777, hasDd);

  // Token Breakdown
  const commandBreakdown = tokenizeCommand(trimmed);

  // Affected Scope
  const affectedScope = extractAffectedScope(trimmed, hasSudo, hasNetwork, isRootTarget, isSystemPathTarget);

  // Safer Alternative
  const saferAlternative = generateSaferAlternative(trimmed, hasRm, hasRecursive, hasForce, hasPipeToShell, hasChmod, has777, hasChown, isRootTarget);

  // Execution Checklist
  const executionChecklist = generateExecutionChecklist(trimmed, hasSudo, hasRm, hasRecursive, hasWildcard, hasPipeToShell);

  // Extract detected metadata
  const detectedCommands = extractCommandsFromTokens(commandBreakdown);
  const flags = extractFlagsFromTokens(commandBreakdown);
  const paths = extractPathsFromTokens(commandBreakdown);
  const operators = extractOperatorsFromTokens(commandBreakdown);

  const technicalDetails: TechnicalDetails = {
    shell,
    detectedCommands,
    flags,
    paths,
    operators,
    rulesTriggered,
    confidence: 96,
    aiEnhanced: false,
  };

  return {
    id,
    timestamp: Date.now(),
    rawCommand,
    shell,
    riskLevel,
    riskScore: score,
    summaryHeadline,
    plainEnglishExplanation,
    commandBreakdown,
    riskFactors,
    affectedScope,
    saferAlternative,
    executionChecklist,
    technicalDetails,
  };
}

function createEmptyAnalysisResult(id: string, shell: ShellType): AnalysisResult {
  return {
    id,
    timestamp: Date.now(),
    rawCommand: '',
    shell,
    riskLevel: 'SAFE',
    riskScore: 0,
    summaryHeadline: 'Ready to analyze command',
    plainEnglishExplanation: 'Enter or paste a Linux/Bash command in the terminal above to run safety checks.',
    commandBreakdown: [],
    riskFactors: [],
    affectedScope: {
      locations: ['None'],
      privileges: 'Standard User',
      reversibility: 'N/A',
      systemImpact: 'None',
      networkAccess: false,
    },
    saferAlternative: null,
    executionChecklist: [],
    technicalDetails: {
      shell,
      detectedCommands: [],
      flags: [],
      paths: [],
      operators: [],
      rulesTriggered: [],
      confidence: 100,
      aiEnhanced: false,
    },
  };
}

function generateSummaryHeadline(cmd: string, level: RiskLevel, rules: string[]): string {
  if (rules.includes('RULE_FORK_BOMB')) return 'Critical Fork Bomb Denial-of-Service Attack';
  if (rules.includes('RULE_RM_ROOT_DESTRUCTION')) return 'Catastrophic Recursive Destruction of Root or Home Directory';
  if (rules.includes('RULE_DD_RAW_DEVICE')) return 'Raw Storage Disk Overwrite / Partition Table Destruction';
  if (rules.includes('RULE_CURL_PIPE_SHELL')) return 'Unverified Remote Script Direct Execution';
  if (rules.includes('RULE_MKFS_FORMAT')) return 'Storage Volume Formatting & Partition Erasure';
  if (rules.includes('RULE_RM_SYSTEM_PATH')) return 'High-Risk Deletion Targeting Operating System Directories';
  if (rules.includes('RULE_CHMOD_777')) return 'Insecure Global Permission Granting (World-Writable)';
  if (rules.includes('RULE_RM_RECURSIVE_FORCE')) return 'Forced Recursive File Removal Without Confirmation';
  if (rules.includes('RULE_SYSTEM_SHUTDOWN')) return 'System Shutdown / Reboot Command';

  switch (level) {
    case 'CRITICAL':
      return 'Potentially System-Disruptive or Destructive Command';
    case 'HIGH':
      return 'High Risk Command with Elevated Privileges or Mass Mutations';
    case 'MEDIUM':
      return 'Moderate Impact Command requiring Careful Path Verification';
    case 'LOW':
      return 'Low Risk Standard System Utility Execution';
    case 'SAFE':
    default:
      return 'Safe Non-Destructive Command';
  }
}

function generatePlainEnglishExplanation(
  cmd: string,
  level: RiskLevel,
  hasSudo: boolean,
  hasRm: boolean,
  hasRecursive: boolean,
  hasForce: boolean,
  hasPipeToShell: boolean,
  hasChmod: boolean,
  has777: boolean,
  hasDd: boolean
): string {
  const parts: string[] = [];

  if (hasSudo) {
    parts.push('This command requests root administrative privileges using `sudo`. It will execute with unconstrained system permissions.');
  }

  if (hasPipeToShell) {
    parts.push('It downloads script content over HTTP/HTTPS from a remote URL and immediately pipes the output straight into a shell execution engine without giving you an opportunity to inspect the code first.');
  } else if (hasRm) {
    if (hasRecursive && hasForce) {
      parts.push('It forcefully and recursively deletes target files and directories without prompting for user confirmation (`-f`) or moving files to a trash bin.');
    } else if (hasRecursive) {
      parts.push('It removes directories and all their contents recursively.');
    } else {
      parts.push('It deletes specified target files permanently from the filesystem.');
    }
  } else if (hasDd) {
    parts.push('It invokes `dd` to copy low-level data directly to or from raw block storage devices. Incorrect device paths can wipe out hard drives instantly.');
  } else if (hasChmod) {
    if (has777) {
      parts.push('It changes file mode permissions to `777`, allowing every local user and service account full read, write, and execute rights.');
    } else {
      parts.push('It alters security access mode permissions on the specified file or folder targets.');
    }
  } else {
    parts.push(`This command executes \`${cmd.split(' ')[0]}\` in your active shell session.`);
  }

  if (level === 'SAFE') {
    parts.push('No destructive mutations or system risks were identified in static analysis.');
  }

  return parts.join(' ');
}

function tokenizeCommand(cmd: string): CommandToken[] {
  const tokens: CommandToken[] = [];
  const parts = cmd.trim().split(/\s+/);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (part === 'sudo' || part === 'su' || part === 'doas') {
      tokens.push({
        token: part,
        type: 'privilege',
        description: 'Superuser / Administrative privilege wrapper',
        riskNote: 'Bypasses standard user access restrictions',
      });
    } else if (part.startsWith('-')) {
      let flagDesc = 'Command modifier flag';
      let riskNote: string | undefined = undefined;

      if (part.includes('r') || part.includes('R') || part === '--recursive') {
        flagDesc = 'Recursive operation flag';
        riskNote = 'Applies operation across all nested subdirectories';
      } else if (part.includes('f') || part === '--force') {
        flagDesc = 'Force flag';
        riskNote = 'Suppresses interactive warnings and confirmations';
      } else if (part.includes('y') || part === '--yes') {
        flagDesc = 'Auto-yes confirmation flag';
      } else if (part === '-lah' || part === '-la' || part === '-l') {
        flagDesc = 'Detailed list format flags (long format, show hidden)';
      }

      tokens.push({
        token: part,
        type: 'flag',
        description: flagDesc,
        riskNote,
      });
    } else if (['|', '&&', '||', ';', '>', '>>', '<', '2>', '2>&1'].includes(part)) {
      tokens.push({
        token: part,
        type: 'operator',
        description: part === '|' ? 'Pipeline redirect' : part === '&&' ? 'Logical AND operator' : 'Shell control operator',
      });
    } else if (part.startsWith('$')) {
      tokens.push({
        token: part,
        type: 'variable',
        description: 'Environment or shell variable expansion',
      });
    } else if (part.startsWith('/') || part.startsWith('./') || part.startsWith('../') || part.startsWith('~') || part.includes('*')) {
      let riskNote: string | undefined = undefined;
      if (part === '/' || part === '/*' || part === '~') {
        riskNote = 'Targets entire root filesystem or home directory!';
      } else if (part.includes('*')) {
        riskNote = 'Wildcard expands to all matching files in path';
      }

      tokens.push({
        token: part,
        type: 'path',
        description: 'Target directory or file path operand',
        riskNote,
      });
    } else if (i === 0 || (i > 0 && ['|', '&&', '||', ';', 'sudo'].includes(parts[i - 1]))) {
      tokens.push({
        token: part,
        type: 'command',
        description: `Executable Linux utility (\`${part}\`)`,
      });
    } else {
      tokens.push({
        token: part,
        type: 'argument',
        description: 'Command positional parameter',
      });
    }
  }

  return tokens;
}

function extractAffectedScope(
  cmd: string,
  hasSudo: boolean,
  hasNetwork: boolean,
  isRootTarget: boolean,
  isSystemPathTarget: boolean
): AffectedScope {
  const locations: string[] = [];

  // Find paths in command
  const matches = cmd.match(/(\/|\.\/|~\/)[^\s]*/g);
  if (matches && matches.length > 0) {
    matches.forEach((m) => {
      if (!locations.includes(m)) locations.push(m);
    });
  } else {
    locations.push('Current Working Directory (`./`)');
  }

  if (isRootTarget) {
    locations.unshift('Entire System Root (`/`)');
  }

  return {
    locations,
    privileges: hasSudo ? 'Root / Administrator (`uid 0`)' : 'Current User (`non-privileged`)',
    reversibility: cmd.includes('rm') || cmd.includes('dd') || cmd.includes('mkfs') ? 'Irreversible (Direct filesystem/block deletion)' : 'Reversible / State-changing',
    systemImpact: isRootTarget || isSystemPathTarget ? 'High (Affects critical operating system components)' : 'Local (Scoped to specified path/process)',
    networkAccess: hasNetwork,
  };
}

function generateSaferAlternative(
  cmd: string,
  hasRm: boolean,
  hasRecursive: boolean,
  hasForce: boolean,
  hasPipeToShell: boolean,
  hasChmod: boolean,
  has777: boolean,
  hasChown: boolean,
  isRootTarget: boolean
): SaferAlternative | null {
  if (hasPipeToShell) {
    const urlMatch = cmd.match(/https?:\/\/[^\s|]+/);
    const url = urlMatch ? urlMatch[0] : 'https://example.com/script.sh';
    const saferCmd = `curl -sSL ${url} -o install.sh && cat install.sh && bash install.sh`;
    return {
      command: saferCmd,
      explanation: 'Saves the script to a local file (`install.sh`) first so you can inspect its code with `cat` before explicitly running it with `bash`.',
      diff: createDiff(cmd, saferCmd),
    };
  }

  if (hasRm && isRootTarget) {
    const saferCmd = `ls -la /var/log/`;
    return {
      command: saferCmd,
      explanation: 'Replaces dangerous destructive root deletion with a non-destructive directory listing so you can verify files first.',
      diff: createDiff(cmd, saferCmd),
    };
  }

  if (hasRm && (hasRecursive || hasForce)) {
    let saferCmd = cmd;
    if (cmd.includes('/var/log/*')) {
      saferCmd = 'sudo find /var/log -type f -name "*.log" -delete';
    } else if (cmd.includes('rm -rf')) {
      saferCmd = cmd.replace('rm -rf', 'rm -i');
    } else {
      saferCmd = cmd.replace('-f', '-i');
    }

    return {
      command: saferCmd,
      explanation: 'Uses targeted file search matching (`find`) or interactive mode (`-i`) to ask confirmation before deleting each item.',
      diff: createDiff(cmd, saferCmd),
    };
  }

  if (hasChmod && has777) {
    const saferCmd = cmd.replace('777', '755');
    return {
      command: saferCmd,
      explanation: 'Replaces global world-writable `777` with secure `755` (owner read/write/execute, group & public read/execute only).',
      diff: createDiff(cmd, saferCmd),
    };
  }

  if (cmd.includes('chmod -R') || cmd.includes('chown -R')) {
    const saferCmd = `ls -ld ./target && ${cmd}`;
    return {
      command: saferCmd,
      explanation: 'Inspects directory permissions before applying recursive modifications across subfolders.',
      diff: createDiff(cmd, saferCmd),
    };
  }

  return null;
}

function createDiff(original: string, safer: string): DiffChunk[] {
  return [
    { type: 'removed', text: original },
    { type: 'added', text: safer },
  ];
}

function generateExecutionChecklist(
  cmd: string,
  hasSudo: boolean,
  hasRm: boolean,
  hasRecursive: boolean,
  hasWildcard: boolean,
  hasPipeToShell: boolean
): string[] {
  const checklist: string[] = [];

  checklist.push('Verify exact target path and current working directory (`pwd`).');

  if (hasSudo) {
    checklist.push('Confirm whether superuser (`sudo`) privileges are genuinely required for this task.');
  }

  if (hasRm || hasRecursive) {
    checklist.push('Check if important files have a recent backup or git commit baseline.');
    checklist.push('Run `ls` on the target path first to double check matching file names.');
  }

  if (hasWildcard) {
    checklist.push('Test wildcard pattern match safely by echoing: `echo ' + (cmd.match(/\S*\*+\S*/)?.[0] || '*') + '`');
  }

  if (hasPipeToShell) {
    checklist.push('Download and inspect the remote script in an editor prior to execution.');
  }

  return checklist;
}

function extractCommandsFromTokens(tokens: CommandToken[]): string[] {
  return tokens.filter((t) => t.type === 'command').map((t) => t.token);
}

function extractFlagsFromTokens(tokens: CommandToken[]): string[] {
  return tokens.filter((t) => t.type === 'flag').map((t) => t.token);
}

function extractPathsFromTokens(tokens: CommandToken[]): string[] {
  return tokens.filter((t) => t.type === 'path').map((t) => t.token);
}

function extractOperatorsFromTokens(tokens: CommandToken[]): string[] {
  return tokens.filter((t) => t.type === 'operator').map((t) => t.token);
}
