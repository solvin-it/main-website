import { describe, expect, it } from "vitest";
import { createProjectPreview } from "./project-preview";

describe("Public project preview", () => {
  it("starts with no invented project details", () => {
    expect(createProjectPreview({}, 0, "opening")).toEqual({ answerCount: 0, currentFocus: "opening" });
    expect(createProjectPreview({ projectType: "unsure", projectGoal: "Not sure yet" }, 1)).toEqual({ answerCount: 1 });
  });

  it.each([
    ["website", "Website development"],
    ["web_application", "Web application"],
    ["mobile_application", "Mobile application"],
    ["desktop_application", "Desktop application"],
    ["ai_system", "AI agent"],
    ["operational_system", "Business system"],
  ])("keeps the stated %s project type", (projectType, service) => {
    expect(createProjectPreview({ projectType, projectGoal: "Help our clients" }, 2).service).toBe(service);
  });

  it("uses assessment classification for an established website goal", () => {
    expect(createProjectPreview({ projectGoal: "Generate qualified consulting leads" }, 1)).toMatchObject({ service: "Website development" });
    expect(createProjectPreview({ projectGoal: "Make things easier" }, 1).service).toBeUndefined();
  });

  it("exposes only confirmed display facts and ignores all other session data", () => {
    const preview = createProjectPreview({
      projectGoal: " Handle new support requests ",
      targetUsers: "Support team",
      idealClient: "Small business owners",
      desiredOutcome: "Faster responses",
      successMetric: "Resolve 50 requests a day",
      constraints: "A person approves every reply",
      tools: ["Notion", " Email ", "Notion"],
      fullName: "Private person",
      email: "private@example.com",
      transcript: "Do not expose this",
      score: 87,
      serviceRoleKey: "do not expose this either",
      sensitiveData: true,
    }, 3, "risk");
    expect(preview).toEqual({
      goal: "Handle new support requests", audience: "Support team", desiredOutcome: "Faster responses",
      successMetric: "Resolve 50 requests a day", constraints: "A person approves every reply",
      tools: ["Notion", "Email"], answerCount: 3, currentFocus: "risk",
    });
  });

  it("omits sensitive values and embedded contact details before truncation", () => {
    const preview = createProjectPreview({
      projectGoal: `${"Improve operations ".repeat(40)}password: secret123`,
      targetUsers: "Contact owner@example.com",
      idealClient: "Contact +63 917 123 4567",
      desiredOutcome: "Keep API key sk-12345678901234567890",
      successMetric: "credit card 4111 1111 1111 1111",
      constraints: "Use https://owner:secret@internal.example.com",
      tools: ["Notion", "private key xyz", "admin@example.com", "+63 917 123 4567"],
    }, 2);
    expect(preview).toEqual({ answerCount: 2, tools: ["Notion"] });
  });

  it("validates unknown stored fields and bounds strings and tool lists", () => {
    expect(createProjectPreview(null, Number.NaN)).toEqual({ answerCount: 0 });
    expect(createProjectPreview([], -2)).toEqual({ answerCount: 0 });
    expect(createProjectPreview({ projectType: "toString", projectGoal: { text: "Not a fact" }, targetUsers: false, tools: "email" }, 1)).toEqual({ answerCount: 1 });
    const preview = createProjectPreview({ projectGoal: "x".repeat(600), tools: [false, null, ...Array.from({ length: 12 }, (_, i) => `Tool ${i} ${"a".repeat(100)}`)] }, 2.8);
    expect(preview.goal).toHaveLength(400);
    expect(preview.tools).toHaveLength(8);
    expect(preview.tools?.every(tool => tool.length <= 80)).toBe(true);
    expect(preview.answerCount).toBe(2);
  });

  it("omits discovery focus when the conversation reaches the brief", () => {
    expect(createProjectPreview({ targetUsers: "Operations team" }, 6, "contact")).toEqual({ answerCount: 6, audience: "Operations team" });
  });
});
