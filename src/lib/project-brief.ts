import type { Recommendation } from "./types";

export function formatProjectBrief(brief: Recommendation): string {
  return [
    "SOLVIN — PROJECT BRIEF", "Draft for discussion; not a final scope or quote.",
    brief.workflowSummary,
    "WHAT SUCCESS LOOKS LIKE", brief.opportunity,
    "DECISIONS TO CONFIRM", brief.blocker,
    "A USEFUL FIRST RELEASE", brief.firstProject,
    "HOW SOLVIN CAN HELP", brief.recommendedService,
    "NEXT STEP", brief.nextAction,
  ].join("\n\n");
}
