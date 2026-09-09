export type DiscoveryTopic =
  | "opening" | "context" | "audience" | "ideal_client" | "offer"
  | "pain_point" | "desired_outcome" | "success_metric"
  | "workflow_clarity" | "current_acquisition" | "core_task"
  | "tools_data" | "credibility" | "source_information" | "risk";

export type AssessmentStage = DiscoveryTopic | "summary" | "contact" | "completed";

export type ReadinessCategory =
  | "Discovery Needed" | "Focused First Release"
  | "Strong Project Foundation" | "Ready for Solution Design";

export interface AssessmentFacts {
  projectType?: "website" | "web_application" | "mobile_application" | "desktop_application" | "ai_system" | "operational_system" | "unsure";
  businessType?: string;
  teamFunction?: string;
  projectGoal?: string;
  targetUsers?: string;
  currentSituation?: string;
  desiredOutcome?: string;
  existingAssets?: string[];
  constraints?: string;
  workflowName?: string;
  frequency?: string;
  tools?: string[];
  dataShape?: "structured" | "unstructured" | "mixed" | "unknown";
  processConsistency?: "mostly_same" | "sometimes_changes" | "changes_often" | "unknown";
  businessImpact?: "low" | "medium" | "high" | "unknown";
  humanApproval?: "always" | "sometimes" | "not_needed" | "unknown";
  sensitiveData?: boolean;
  painPoint?: string;
  idealClient?: string;
  offer?: string;
  acquisitionChannels?: string[];
  credibilityAssets?: string[];
  successMetric?: string;
  coreTask?: string;
  sourceInformation?: string[];
  skippedTopics?: DiscoveryTopic[];
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
