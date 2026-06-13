export type AssessmentStage =
  | "opening" | "context" | "pain_point" | "workflow_clarity"
  | "tools_data" | "risk" | "summary" | "contact" | "completed";

export type ReadinessCategory =
  | "Process First" | "Simple Automation Ready"
  | "AI-Assisted Workflow Ready" | "AI Agent or Knowledge System Candidate";

export interface AssessmentFacts {
  businessType?: string;
  teamFunction?: string;
  workflowName?: string;
  frequency?: string;
  tools?: string[];
  dataShape?: "structured" | "unstructured" | "mixed" | "unknown";
  processConsistency?: "mostly_same" | "sometimes_changes" | "changes_often" | "unknown";
  businessImpact?: "low" | "medium" | "high" | "unknown";
  humanApproval?: "always" | "sometimes" | "not_needed" | "unknown";
  sensitiveData?: boolean;
  painPoint?: string;
}

export interface ReadinessScore {
  workflowClarity: number;
  repetition: number;
  dataToolReadiness: number;
  businessImpact: number;
  riskManageability: number;
  total: number;
  category: ReadinessCategory;
  rationale: string;
}

export interface Recommendation {
  workflowSummary: string;
  opportunity: string;
  blocker: string;
  firstProject: string;
  recommendedService: string;
  nextAction: string;
}

export interface LeadContact {
  fullName: string;
  email: string;
  companyName?: string;
  roleTitle?: string;
  consentToContact: boolean;
}

export interface ChatTurn {
  sessionId: string;
  message: string;
  stage: AssessmentStage;
  progress: number;
  quickReplies?: string[];
  completed?: boolean;
  score?: ReadinessScore;
  recommendation?: Recommendation;
}
