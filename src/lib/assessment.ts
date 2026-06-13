import type { AssessmentFacts, AssessmentStage, ReadinessScore, Recommendation } from "./types";

export const stageOrder: AssessmentStage[] = [
  "opening", "context", "pain_point", "workflow_clarity", "tools_data", "risk", "summary", "contact", "completed",
];

export const questions: Record<AssessmentStage, { message: string; quickReplies?: string[] }> = {
  opening: { message: "What kind of business or team are you looking to improve?" },
  context: { message: "What kind of work does that team handle most often?", quickReplies: ["Operations", "Sales", "Admin", "Customer support", "Reporting", "Content"] },
  pain_point: { message: "What is one recurring task that takes more time than it should?" },
  workflow_clarity: { message: "Is that process mostly the same each time, or does it change depending on the situation?", quickReplies: ["Mostly the same", "Changes sometimes", "Changes a lot", "Not sure"] },
  tools_data: { message: "Where does this work happen now, and are the inputs structured like spreadsheet rows or unstructured like emails and documents?" },
  risk: { message: "Would the output need human review before anything is sent, approved, posted, or recorded?", quickReplies: ["Yes, always", "Sometimes", "Not necessary", "Not sure"] },
  summary: { message: "I have enough context to prepare your initial recommendation." },
  contact: { message: "Your recommendation is ready. Add your contact details if you would like Solvin Solutions to follow up." },
  completed: { message: "Your readiness check is complete." },
};

export function nextStage(stage: AssessmentStage): AssessmentStage {
  return stageOrder[Math.min(stageOrder.indexOf(stage) + 1, stageOrder.length - 1)];
}

export function progressFor(stage: AssessmentStage) {
  return Math.round((stageOrder.indexOf(stage) / (stageOrder.length - 1)) * 100);
}

export function containsSensitiveData(value: string) {
  return /\b(password|passcode|api[_ -]?key|secret[_ -]?key|credit card|cvv|social security|private key)\b/i.test(value)
    || /sk-[a-zA-Z0-9_-]{16,}/.test(value)
    || /\b(?:\d[ -]*?){13,19}\b/.test(value);
}

export function extractFallback(stage: AssessmentStage, answer: string): Partial<AssessmentFacts> {
  const normalized = answer.toLowerCase();
  if (stage === "opening") return { businessType: answer.slice(0, 200) };
  if (stage === "context") return { teamFunction: answer.slice(0, 200) };
  if (stage === "pain_point") return { painPoint: answer.slice(0, 500), workflowName: answer.slice(0, 180), frequency: /\b(daily|every day)\b/.test(normalized) ? "daily" : /\b(weekly|every week)\b/.test(normalized) ? "weekly" : "recurring" };
  if (stage === "workflow_clarity") {
    const processConsistency = normalized.includes("mostly") ? "mostly_same" : normalized.includes("sometimes") ? "sometimes_changes" : normalized.includes("lot") || normalized.includes("often") ? "changes_often" : "unknown";
    return { processConsistency };
  }
  if (stage === "tools_data") {
    const tools = ["email", "spreadsheet", "google drive", "notion", "crm", "slack", "teams"].filter(tool => normalized.includes(tool));
    const dataShape = normalized.includes("unstructured") || /\b(email|pdf|document|message)\b/.test(normalized) ? (/\b(row|spreadsheet|structured)\b/.test(normalized) ? "mixed" : "unstructured") : /\b(row|spreadsheet|structured)\b/.test(normalized) ? "structured" : "unknown";
    return { tools, dataShape };
  }
  if (stage === "risk") {
    const humanApproval = normalized.includes("always") || normalized.startsWith("yes") ? "always" : normalized.includes("sometimes") ? "sometimes" : normalized.includes("not necessary") ? "not_needed" : "unknown";
    return { humanApproval };
  }
  return {};
}

export function scoreAssessment(facts: AssessmentFacts): ReadinessScore {
  const workflowClarity = facts.processConsistency === "mostly_same" ? 100 : facts.processConsistency === "sometimes_changes" ? 70 : facts.processConsistency === "changes_often" ? 30 : 40;
  const repetition = facts.frequency === "daily" ? 100 : facts.frequency === "weekly" ? 85 : facts.frequency ? 65 : 40;
  const dataToolReadiness = facts.dataShape === "structured" ? 100 : facts.dataShape === "mixed" ? 75 : facts.dataShape === "unstructured" ? 60 : 40;
  const businessImpact = facts.businessImpact === "high" ? 100 : facts.businessImpact === "low" ? 45 : facts.painPoint ? 75 : 50;
  const riskManageability = facts.sensitiveData ? 35 : facts.humanApproval === "always" || facts.humanApproval === "sometimes" ? 85 : facts.humanApproval === "not_needed" ? 75 : 55;
  const total = Math.round(workflowClarity * .25 + repetition * .2 + dataToolReadiness * .2 + businessImpact * .2 + riskManageability * .15);
  const category = total < 40 ? "Process First" : total < 60 ? "Simple Automation Ready" : total < 80 ? "AI-Assisted Workflow Ready" : "AI Agent or Knowledge System Candidate";
  return { workflowClarity, repetition, dataToolReadiness, businessImpact, riskManageability, total, category, rationale: `The workflow scored ${total}/100 based on clarity, repetition, data readiness, impact, and manageable risk.` };
}

export function fallbackRecommendation(facts: AssessmentFacts, score: ReadinessScore): Recommendation {
  const service = score.total < 40 ? "Workflow Automation Audit" : score.total < 60 ? "Workflow Automation Audit" : score.total < 80 ? "AI Workflow Prototype" : "AI Agent and Knowledge System";
  return {
    workflowSummary: facts.painPoint ?? facts.workflowName ?? "The recurring workflow you described",
    opportunity: score.total >= 60 ? "Use AI to prepare, classify, summarize, or route the work while retaining review." : "Clarify and automate the repeatable steps before adding more advanced AI.",
    blocker: facts.processConsistency === "changes_often" ? "The process changes often and should be mapped before implementation." : facts.dataShape === "unknown" ? "The source data and integration path need clarification." : "Approval rules and exception handling should be confirmed.",
    firstProject: score.total >= 80 ? "A focused knowledge assistant or tool-using workflow with human oversight." : score.total >= 60 ? "A prototype that prepares the output and routes it for review." : "A workflow map and lightweight automation of the most repeatable steps.",
    recommendedService: service,
    nextAction: "Book a 30-minute discovery call to map the workflow and validate the implementation approach.",
  };
}
