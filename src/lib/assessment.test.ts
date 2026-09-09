import { describe, expect, it } from "vitest";
import { classifyDiscoveryPath, containsSensitiveData, extractFallback, isUnknownAnswer, nextStage, planDiscovery, progressFor, scoreAssessment } from "./assessment";

describe("assessment flow", () => {
  it("advances through controlled stages", () => {
    expect(nextStage("opening")).toBe("context");
    expect(nextStage("risk")).toBe("summary");
    expect(nextStage("completed")).toBe("completed");
    expect(progressFor("completed")).toBe(100);
  });

  it("detects likely secrets and financial records", () => {
    expect(containsSensitiveData("my API key is sk-exampleexampleexample")).toBe(true);
    expect(containsSensitiveData("weekly reporting from email")).toBe(false);
  });

  it("extracts deterministic fallback values", () => {
    expect(extractFallback("workflow_clarity", "Mostly the same")).toMatchObject({ processConsistency: "mostly_same", currentSituation: "Mostly the same" });
    expect(extractFallback("risk", "Sometimes")).toMatchObject({ humanApproval: "sometimes", constraints: "Sometimes" });
  });
});

describe("readiness scoring", () => {
  it("classifies a mature recurring workflow as AI ready", () => {
    const result = scoreAssessment({
      processConsistency: "mostly_same", frequency: "daily", dataShape: "structured",
      businessImpact: "high", humanApproval: "always", painPoint: "Recurring reports",
    });
    expect(result.total).toBeGreaterThanOrEqual(80);
    expect(result.category).toBe("Ready for Solution Design");
  });

  it("keeps unclear workflows in a lower readiness tier", () => {
    const result = scoreAssessment({ processConsistency: "changes_often", dataShape: "unknown", sensitiveData: true });
    expect(result.total).toBeLessThan(60);
  });
});

describe("contextual discovery planning", () => {
  it("routes a consulting lead-generation conversation toward the ideal client", () => {
    const first = { projectType: "unsure" as const, projectGoal: "Generate leads for my consulting business" };
    expect(classifyDiscoveryPath(first)).toBe("website_lead_generation");
    expect(planDiscovery(first, 1).nextTopic).toBe("context");

    const second = { ...first, businessType: "Solo fintech consulting practice", offer: "Philippine fintech compliance guidance" };
    expect(planDiscovery(second, 2).nextTopic).toBe("ideal_client");
  });

  it("skips facts supplied together and completes a grounded lead path within five answers", () => {
    const plan = planDiscovery({
      projectGoal: "Generate qualified leads", businessType: "Fintech consulting", offer: "Philippine market entry guidance",
      idealClient: "Foreign fintech firms entering the Philippines", acquisitionChannels: ["Referrals", "LinkedIn"],
      successMetric: "Three to five qualified calls each month",
    }, 5);
    expect(plan.readyForBrief).toBe(true);
    expect(plan.nextTopic).toBeNull();
  });

  it("treats explicit uncertainty as an answer that can be skipped", () => {
    expect(isUnknownAnswer("I'm not sure yet")).toBe(true);
    const plan = planDiscovery({ businessType: "Consulting", skippedTopics: ["audience"] }, 2);
    expect(plan.nextTopic).not.toBe("audience");
  });

  it.each([
    [{ projectType: "web_application" as const }, "application"],
    [{ projectType: "mobile_application" as const }, "application"],
    [{ projectType: "ai_system" as const }, "ai_system"],
    [{ projectType: "operational_system" as const }, "internal_system"],
    [{ projectGoal: "We are unsure what to build" }, "undetermined"],
  ])("classifies supported discovery paths", (facts, expected) => {
    expect(classifyDiscoveryPath(facts)).toBe(expected);
  });

  it("finishes every path after the six-answer ceiling", () => {
    for (const facts of [
      { projectType: "website" as const },
      { projectType: "web_application" as const },
      { projectType: "ai_system" as const },
      { projectType: "operational_system" as const },
      {},
    ]) {
      expect(planDiscovery(facts, 6).readyForBrief).toBe(true);
    }
  });
});
