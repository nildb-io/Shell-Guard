export type RiskLevel = 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ShellType = 'bash' | 'zsh' | 'sh';

export interface CommandToken {
  token: string;
  type: 'command' | 'flag' | 'path' | 'operator' | 'variable' | 'subshell' | 'argument' | 'privilege';
  description: string;
  riskNote?: string;
}

export interface RiskFactor {
  id: string;
  title: string;
  level: RiskLevel;
  description: string;
  category: string;
}

export interface AffectedScope {
  locations: string[];
  privileges: string;
  reversibility: string;
  systemImpact: string;
  networkAccess: boolean;
}

export interface DiffChunk {
  type: 'removed' | 'added' | 'unchanged';
  text: string;
}

export interface SaferAlternative {
  command: string;
  explanation: string;
  diff: DiffChunk[];
}

export interface TechnicalDetails {
  shell: ShellType;
  detectedCommands: string[];
  flags: string[];
  paths: string[];
  operators: string[];
  rulesTriggered: string[];
  confidence: number; // 0 - 100
  aiEnhanced?: boolean;
}

export interface AnalysisResult {
  id: string;
  timestamp: number;
  rawCommand: string;
  shell: ShellType;
  riskLevel: RiskLevel;
  riskScore: number; // 0 - 100
  summaryHeadline: string;
  plainEnglishExplanation: string;
  commandBreakdown: CommandToken[];
  riskFactors: RiskFactor[];
  affectedScope: AffectedScope;
  saferAlternative: SaferAlternative | null;
  executionChecklist: string[];
  technicalDetails: TechnicalDetails;
}

export interface LearnTopic {
  id: string;
  title: string;
  category: string;
  badge: string;
  summary: string;
  risks: string[];
  exampleCommand: string;
  saferExample: string;
  detailedExplanation: string;
}
