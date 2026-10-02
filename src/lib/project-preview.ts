import { classifyDiscoveryPath, containsSensitiveData, isUnknownAnswer, stageOrder } from "./assessment";
import type { AssessmentFacts, AssessmentStage, DiscoveryTopic, ProjectPreview } from "./types";

const serviceLabels = {
  website: "Website development",
  web_application: "Web application",
  mobile_application: "Mobile application",
  desktop_application: "Desktop application",
  ai_system: "AI agent",
  operational_system: "Business system",
} satisfies Record<Exclude<NonNullable<AssessmentFacts["projectType"]>, "unsure">, string>;

function previewText(value: unknown, maximumLength = 400): string | undefined {
  if (typeof value !== "string") return;
  const text = value.trim().replace(/\s+/g, " ");
  if (!text || isUnknownAnswer(text) || /^(unknown|null|undefined|not provided|n\/a)$/i.test(text)) return;
  // Inspect the complete value before truncating: a secret or contact detail may
  // occur beyond the portion that would otherwise be shown in the live brief.
  if (containsSensitiveData(text)
    || /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text)
    || /(?:\+?\d[\s().-]*){10,}/.test(text)
    || /https?:\/\/[^\s/]+:[^\s@]+@/i.test(text)) return;
  return text.slice(0, maximumLength);
}

function previewTools(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return;
  const tools = [...new Set(value.map(tool => previewText(tool, 80)).filter((tool): tool is string => Boolean(tool)))].slice(0, 8);
  return tools.length ? tools : undefined;
}

/** A deliberately small public view of confirmed facts, never the session record. */
export function createProjectPreview(facts: unknown, answerCount: number, stage?: AssessmentStage): ProjectPreview {
  const source: Record<string, unknown> = facts !== null && typeof facts === "object" && !Array.isArray(facts)
    ? facts as Record<string, unknown> : {};
  const projectType = typeof source.projectType === "string" && Object.hasOwn(serviceLabels, source.projectType)
    ? source.projectType as keyof typeof serviceLabels : undefined;
  const goal = previewText(source.projectGoal);
  const audience = previewText(source.targetUsers, 300) ?? previewText(source.idealClient, 300);
  const desiredOutcome = previewText(source.desiredOutcome);
  const successMetric = previewText(source.successMetric, 300);
  const constraints = previewText(source.constraints);
  const tools = previewTools(source.tools);
  const path = classifyDiscoveryPath({
    projectType,
    projectGoal: goal,
    desiredOutcome,
    painPoint: previewText(source.painPoint),
    offer: previewText(source.offer),
  });
  const service = projectType ? serviceLabels[projectType]
    : path === "website_lead_generation" ? serviceLabels.website : undefined;
  const currentFocus = stage && stageOrder.includes(stage) && !["summary", "contact", "completed"].includes(stage)
    ? stage as DiscoveryTopic : undefined;

  return {
    answerCount: Number.isFinite(answerCount) ? Math.max(0, Math.floor(answerCount)) : 0,
    ...(projectType ? { projectType } : {}),
    ...(service ? { service } : {}),
    ...(goal ? { goal } : {}),
    ...(audience ? { audience } : {}),
    ...(desiredOutcome ? { desiredOutcome } : {}),
    ...(successMetric ? { successMetric } : {}),
    ...(constraints ? { constraints } : {}),
    ...(tools ? { tools } : {}),
    ...(currentFocus ? { currentFocus } : {}),
  };
}
