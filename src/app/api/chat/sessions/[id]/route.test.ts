import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getSession: vi.fn() }));
vi.mock("@/lib/store", () => ({ getSession: mocks.getSession }));
import { GET } from "./route";

beforeEach(() => { vi.clearAllMocks(); });

describe("Resuming assistant discovery", () => {
  it("reconstructs the preview from stored facts without exposing contact or transcript data", async () => {
    mocks.getSession.mockResolvedValue({
      id: "saved-session", stage: "desired_outcome", answerCount: 3,
      facts: { projectType: "ai_system", projectGoal: "Draft support replies", targetUsers: "Support team", tools: ["CRM"], constraints: "API key sk-12345678901234567890" },
      lead: { fullName: "Private owner", email: "owner@example.com" }, transcript: "Private transcript",
    });
    const response = await GET(new Request("http://localhost/api/chat/sessions/saved-session"), { params: Promise.resolve({ id: "saved-session" }) });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ sessionId: "saved-session", stage: "desired_outcome", message: "What outcome would make solving this problem worthwhile?" });
    expect(body.projectPreview).toEqual({
      projectType: "ai_system", service: "AI agent", goal: "Draft support replies", audience: "Support team",
      tools: ["CRM"], answerCount: 3, currentFocus: "desired_outcome",
    });
    expect(JSON.stringify(body)).not.toContain("Private");
    expect(JSON.stringify(body)).not.toContain("sk-");
  });

  it("preserves the prepared brief on resume while adding confirmed preview context", async () => {
    const recommendation = { recommendedService: "Web application development", opportunity: "A shared customer portal" };
    mocks.getSession.mockResolvedValue({ id: "saved-session", stage: "contact", answerCount: 6, facts: { projectType: "web_application", desiredOutcome: "Customers see request status" }, recommendation });
    const response = await GET(new Request("http://localhost/api/chat/sessions/saved-session"), { params: Promise.resolve({ id: "saved-session" }) });
    const body = await response.json();
    expect(body.recommendation).toEqual(recommendation);
    expect(body.projectPreview).toEqual({ answerCount: 6, projectType: "web_application", service: "Web application", desiredOutcome: "Customers see request status" });
  });

  it("preserves the missing session response", async () => {
    mocks.getSession.mockResolvedValue(null);
    const response = await GET(new Request("http://localhost/api/chat/sessions/missing"), { params: Promise.resolve({ id: "missing" }) });
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Session not found." });
  });
});
