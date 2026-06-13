import { describe, expect, it } from "vitest";
import { containsSensitiveData, extractFallback, nextStage, progressFor, scoreAssessment } from "./assessment";

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
    expect(extractFallback("workflow_clarity", "Mostly the same")).toEqual({ processConsistency: "mostly_same" });
    expect(extractFallback("risk", "Sometimes")).toEqual({ humanApproval: "sometimes" });
  });
});

describe("readiness scoring", () => {
  it("classifies a mature recurring workflow as AI ready", () => {
    const result = scoreAssessment({
      processConsistency: "mostly_same", frequency: "daily", dataShape: "structured",
      businessImpact: "high", humanApproval: "always", painPoint: "Recurring reports",
    });
    expect(result.total).toBeGreaterThanOrEqual(80);
    expect(result.category).toBe("AI Agent or Knowledge System Candidate");
  });

  it("keeps unclear workflows in a lower readiness tier", () => {
    const result = scoreAssessment({ processConsistency: "changes_often", dataShape: "unknown", sensitiveData: true });
    expect(result.total).toBeLessThan(60);
  });
});
