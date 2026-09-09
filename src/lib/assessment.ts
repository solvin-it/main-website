import type { AssessmentFacts, AssessmentStage, DiscoveryTopic, ReadinessScore, Recommendation } from "./types";

export type DiscoveryPath = "website_lead_generation" | "application" | "ai_system" | "internal_system" | "undetermined";
export type DiscoveryPlan = { path: DiscoveryPath; nextTopic: DiscoveryTopic | null; readyForBrief: boolean; missingCriticalFacts: DiscoveryTopic[] };

export const stageOrder: AssessmentStage[] = ["opening", "context", "audience", "ideal_client", "offer", "pain_point", "desired_outcome", "success_metric", "workflow_clarity", "current_acquisition", "core_task", "tools_data", "credibility", "source_information", "risk", "summary", "contact", "completed"];

export const questions: Record<AssessmentStage, { message: string; quickReplies?: string[] }> = {
  opening: { message: "What problem would you like help solving?" },
  context: { message: "What does the business do, and where does this problem show up?" },
  audience: { message: "Who most needs the result you are trying to create?" },
  ideal_client: { message: "Who would be the ideal client for this consulting practice?" },
  offer: { message: "What expertise or service would you most like clients to hire you for?" },
  pain_point: { message: "What is the most costly or frustrating part of the problem today?" },
  desired_outcome: { message: "What outcome would make solving this problem worthwhile?" },
  success_metric: { message: "What measurable result would make the effort feel successful?" },
  workflow_clarity: { message: "How is this handled today, from the first step to the final result?" },
  current_acquisition: { message: "How do prospective clients find or contact you today?" },
  core_task: { message: "What is the main task people need to complete with the application?" },
  tools_data: { message: "What existing website, software, content, data, or brand materials should the project work with?" },
  credibility: { message: "What experience, results, or materials can establish trust without revealing confidential work?" },
  source_information: { message: "What information should the AI use, and where does that information live today?" },
  risk: { message: "What timing, approval, privacy, budget, or technical boundary matters most for the first release?", quickReplies: ["There is a target date", "Human approval is important", "Sensitive data is involved", "Budget is still open", "No known constraints", "Not sure yet"] },
  summary: { message: "I have enough context to prepare a starting project brief." },
  contact: { message: "Your project brief is ready." },
  completed: { message: "Your project brief has been sent." },
};

const topicFields: Record<DiscoveryTopic, (keyof AssessmentFacts)[]> = {
  opening: ["projectGoal", "painPoint", "projectType"],
  context: ["businessType", "teamFunction"], audience: ["targetUsers"], ideal_client: ["idealClient"], offer: ["offer"],
  pain_point: ["painPoint"], desired_outcome: ["desiredOutcome", "projectGoal"], success_metric: ["successMetric"],
  workflow_clarity: ["currentSituation"], current_acquisition: ["acquisitionChannels", "currentSituation"], core_task: ["coreTask", "workflowName"],
  tools_data: ["existingAssets", "tools"], credibility: ["credibilityAssets"], source_information: ["sourceInformation", "tools"], risk: ["constraints", "humanApproval", "sensitiveData"],
};

const pathTopics: Record<DiscoveryPath, DiscoveryTopic[]> = {
  website_lead_generation: ["context", "ideal_client", "offer", "current_acquisition", "success_metric", "credibility", "risk"],
  application: ["context", "audience", "core_task", "workflow_clarity", "desired_outcome", "tools_data", "risk"],
  ai_system: ["context", "audience", "core_task", "source_information", "desired_outcome", "risk"],
  internal_system: ["context", "audience", "core_task", "workflow_clarity", "tools_data", "desired_outcome", "risk"],
  undetermined: ["context", "audience", "pain_point", "desired_outcome", "workflow_clarity", "risk"],
};

export function classifyDiscoveryPath(facts: AssessmentFacts): DiscoveryPath {
  const intent = [facts.projectGoal, facts.painPoint, facts.desiredOutcome, facts.offer].filter(Boolean).join(" ").toLowerCase();
  if (facts.projectType === "ai_system") return "ai_system";
  if (facts.projectType === "operational_system") return "internal_system";
  if (["web_application", "mobile_application", "desktop_application"].includes(facts.projectType ?? "")) return "application";
  if (facts.projectType === "website" || /\b(leads?|clients?|prospects?|convert|conversion|consulting|website|marketing)\b/.test(intent)) return "website_lead_generation";
  return "undetermined";
}

function topicCovered(topic: DiscoveryTopic, facts: AssessmentFacts) {
  if (facts.skippedTopics?.includes(topic)) return true;
  return topicFields[topic].some(field => {
    const value = facts[field];
    return Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && value !== "" && value !== "unknown";
  });
}

export function planDiscovery(facts: AssessmentFacts, answerCount: number): DiscoveryPlan {
  const path = classifyDiscoveryPath(facts);
  const missing = pathTopics[path].filter(topic => !topicCovered(topic, facts));
  const minimumAnswers = 3;
  const maximumAnswers = 6;
  const essentialCount = path === "website_lead_generation" ? 5 : path === "undetermined" ? 4 : 5;
  const coveredCount = pathTopics[path].length - missing.length;
  const readyForBrief = answerCount >= maximumAnswers || (answerCount >= minimumAnswers && coveredCount >= essentialCount);
  return { path, nextTopic: readyForBrief ? null : missing[0] ?? null, readyForBrief: readyForBrief || missing.length === 0, missingCriticalFacts: missing.slice(0, 3) };
}

export function isUnknownAnswer(answer: string) {
  return /^\s*(i (?:do not|don't) know|i(?:'m| am) not sure|not sure|unsure|no idea|skip|prefer not to say|none yet|nothing yet)\b/i.test(answer);
}

export function nextStage(stage: AssessmentStage): AssessmentStage {
  return stageOrder[Math.min(stageOrder.indexOf(stage) + 1, stageOrder.length - 1)];
}

export function progressFor(stage: AssessmentStage) {
  if (stage === "contact") return 88;
  if (stage === "completed") return 100;
  if (stage === "summary") return 82;
  const index = stageOrder.indexOf(stage);
  return Math.min(75, Math.max(0, Math.round((index / 14) * 75)));
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
  if (stage === "context") return { businessType: answer.slice(0, 240), targetUsers: answer.slice(0, 300), teamFunction: answer.slice(0, 200), offer: answer.slice(0, 300) };
  if (stage === "audience") return { targetUsers: answer.slice(0, 300) };
  if (stage === "ideal_client") return { idealClient: answer.slice(0, 300), targetUsers: answer.slice(0, 300) };
  if (stage === "offer") return { offer: answer.slice(0, 400) };
  if (stage === "pain_point") return { painPoint: answer.slice(0, 500), desiredOutcome: answer.slice(0, 500), workflowName: answer.slice(0, 180), frequency: /\b(daily|every day)\b/.test(normalized) ? "daily" : /\b(weekly|every week)\b/.test(normalized) ? "weekly" : undefined };
  if (stage === "desired_outcome") return { desiredOutcome: answer.slice(0, 500) };
  if (stage === "success_metric") return { successMetric: answer.slice(0, 300), businessImpact: "medium" };
  if (stage === "current_acquisition") return { acquisitionChannels: answer.split(/,|\band\b/i).map(item => item.trim()).filter(Boolean).slice(0, 8), currentSituation: answer.slice(0, 500) };
  if (stage === "credibility") return { credibilityAssets: answer.split(",").map(item => item.trim()).filter(Boolean).slice(0, 8) };
  if (stage === "core_task") return { coreTask: answer.slice(0, 400), workflowName: answer.slice(0, 180) };
  if (stage === "source_information") return { sourceInformation: answer.split(",").map(item => item.trim()).filter(Boolean).slice(0, 8) };
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
  const category = total < 40 ? "Discovery Needed" : total < 60 ? "Focused First Release" : total < 80 ? "Strong Project Foundation" : "Ready for Solution Design";
  return { workflowClarity, repetition, dataToolReadiness, businessImpact, riskManageability, total, category, rationale: `The project foundation scored ${total}/100 based on clarity, available inputs, expected impact, and manageable risk.` };
}

export function fallbackRecommendation(facts: AssessmentFacts, score: ReadinessScore): Recommendation {
  void score;
  const serviceByType = {
    website: "Website strategy and build", web_application: "Web application design and development", mobile_application: "Mobile application design and development", desktop_application: "Cross-platform application development", ai_system: "AI assistant or intelligent system", operational_system: "Business software design and development", unsure: "Product discovery and solution design",
  } as const;
  const path = classifyDiscoveryPath(facts);
  const service = path === "website_lead_generation" && (!facts.projectType || facts.projectType === "unsure") ? "Website strategy and lead-generation experience" : serviceByType[facts.projectType ?? "unsure"];
  const audience = facts.idealClient ?? facts.targetUsers ?? facts.teamFunction ?? "the intended audience";
  const goal = facts.successMetric ?? facts.desiredOutcome ?? facts.painPoint ?? facts.projectGoal ?? "the outcome described in the conversation";
  return {
    workflowSummary: `${service} for ${audience}`,
    opportunity: `Create a focused first release that helps ${audience} achieve ${goal}.`,
    blocker: facts.constraints ?? "Scope, priority features, and the definition of a successful first release still need confirmation.",
    firstProject: facts.currentSituation ? `Design the core experience around the current situation described: ${facts.currentSituation}` : `Map the core user journey and build the smallest version that proves ${goal}.`,
    recommendedService: service,
    nextAction: "Review this brief together, correct any assumptions, and agree on the smallest valuable first release.",
  };
}
