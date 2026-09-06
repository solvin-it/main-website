import type { AssessmentFacts, AssessmentStage, ReadinessScore, Recommendation } from "./types";

export const stageOrder: AssessmentStage[] = [
  "opening", "context", "pain_point", "workflow_clarity", "tools_data", "risk", "summary", "contact", "completed",
];

export const questions: Record<AssessmentStage, { message: string; quickReplies?: string[] }> = {
  opening: { message: "What are you hoping to create or improve?", quickReplies: ["A website", "A web application", "A mobile or desktop app", "An AI assistant", "An internal business system", "I am not sure yet"] },
  context: { message: "Tell me briefly about the business and who should use what we build." },
  pain_point: { message: "What should this make easier, faster, or possible for those people?" },
  workflow_clarity: { message: "How do they handle this today—or, for a new idea, what should the ideal experience look like?" },
  tools_data: { message: "What already exists that we should work with: a current website, brand materials, software, content, data, or other tools?" },
  risk: { message: "Are there any timing, approval, privacy, budget, or technical constraints we should account for?", quickReplies: ["There is a target date", "Human approval is important", "Sensitive data is involved", "Budget is still open", "No known constraints", "Not sure yet"] },
  summary: { message: "I have enough context to prepare a starting project brief." },
  contact: { message: "Your project brief is ready." },
  completed: { message: "Your project brief has been sent." },
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
  if (stage === "opening") {
    const projectType = /\bwebsite\b/.test(normalized) ? "website" : /\bweb app|web application|portal|platform\b/.test(normalized) ? "web_application" : /\bmobile|ios|android\b/.test(normalized) ? "mobile_application" : /\bdesktop\b/.test(normalized) ? "desktop_application" : /\bai|assistant|agent|chatbot\b/.test(normalized) ? "ai_system" : /\binternal|operation|workflow|business system\b/.test(normalized) ? "operational_system" : "unsure";
    return { projectType, projectGoal: answer.slice(0, 500) };
  }
  if (stage === "context") return { businessType: answer.slice(0, 240), targetUsers: answer.slice(0, 300), teamFunction: answer.slice(0, 200) };
  if (stage === "pain_point") return { painPoint: answer.slice(0, 500), desiredOutcome: answer.slice(0, 500), workflowName: answer.slice(0, 180), frequency: /\b(daily|every day)\b/.test(normalized) ? "daily" : /\b(weekly|every week)\b/.test(normalized) ? "weekly" : undefined };
  if (stage === "workflow_clarity") {
    const processConsistency = normalized.includes("mostly") ? "mostly_same" : normalized.includes("sometimes") ? "sometimes_changes" : normalized.includes("lot") || normalized.includes("often") ? "changes_often" : "unknown";
    return { processConsistency, currentSituation: answer.slice(0, 600) };
  }
  if (stage === "tools_data") {
    const tools = ["email", "spreadsheet", "google drive", "notion", "crm", "slack", "teams"].filter(tool => normalized.includes(tool));
    const dataShape = normalized.includes("unstructured") || /\b(email|pdf|document|message)\b/.test(normalized) ? (/\b(row|spreadsheet|structured)\b/.test(normalized) ? "mixed" : "unstructured") : /\b(row|spreadsheet|structured)\b/.test(normalized) ? "structured" : "unknown";
    return { tools, existingAssets: answer.split(",").map(item => item.trim()).filter(Boolean).slice(0, 8), dataShape };
  }
  if (stage === "risk") {
    const humanApproval = normalized.includes("always") || normalized.startsWith("yes") ? "always" : normalized.includes("sometimes") ? "sometimes" : normalized.includes("not necessary") ? "not_needed" : "unknown";
    return { humanApproval, sensitiveData: normalized.includes("sensitive"), constraints: answer.slice(0, 500) };
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
  const serviceByType = {
    website: "Website strategy and build", web_application: "Web application design and development", mobile_application: "Mobile application design and development", desktop_application: "Cross-platform application development", ai_system: "AI assistant or intelligent system", operational_system: "Business software design and development", unsure: "Product discovery and solution design",
  } as const;
  const service = serviceByType[facts.projectType ?? "unsure"];
  const audience = facts.targetUsers ?? facts.teamFunction ?? "the people who will use it";
  const goal = facts.desiredOutcome ?? facts.painPoint ?? facts.projectGoal ?? "the outcome you described";
  return {
    workflowSummary: `${service} for ${audience}`,
    opportunity: `Create a focused first release that helps ${audience} achieve ${goal}.`,
    blocker: facts.constraints ?? "Scope, priority features, and the definition of a successful first release still need confirmation.",
    firstProject: facts.currentSituation ? `Design the core experience around the current situation described: ${facts.currentSituation}` : `Map the core user journey and build the smallest version that proves ${goal}.`,
    recommendedService: service,
    nextAction: "Review this brief together, correct any assumptions, and agree on the smallest valuable first release.",
  };
}
