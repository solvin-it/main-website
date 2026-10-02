import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { ReadinessChat } from "./readiness-chat";

vi.mock("next/image", () => ({ default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => {
  const imageProps = { ...props };
  delete imageProps.priority;
  return React.createElement("img", imageProps);
} }));

const sessionTurn = {
  sessionId: "session-1",
  stage: "opening",
  progress: 0,
  message: "What are you hoping to create or improve?",
};

const replyTurn = {
  sessionId: "session-1",
  stage: "context",
  progress: 17,
  message: "That sounds worth solving. Tell me briefly about the business and who should use what we build.",
};

function mockConversation() {
  return vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => sessionTurn })
    .mockResolvedValueOnce({ ok: true, json: async () => replyTurn });
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  history.replaceState(null, "", "/");
  vi.unstubAllGlobals();
});

describe("cinematic Assistant", () => {
  it("keeps the composer mounted and starts with the visitor message", async () => {
    const fetchMock = mockConversation();
    vi.stubGlobal("fetch", fetchMock);
    const started = vi.fn();
    render(<ReadinessChat surface="cinematic" onConversationStart={started} />);

    const composer = screen.getByRole("textbox", { name: "Your answer" });
    fireEvent.change(composer, { target: { value: "We need a clearer website." } });
    fireEvent.click(screen.getByRole("button", { name: "Start the conversation" }));

    await waitFor(() => expect(screen.getByText(replyTurn.message)).toBeTruthy());
    expect(screen.getByRole("textbox", { name: "Your answer" })).toBe(composer);
    expect(screen.getByText("We need a clearer website.")).toBeTruthy();
    expect(screen.queryByText(sessionTurn.message)).toBeNull();
    expect(started).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(location.pathname).toBe("/");
  });

  it("submits once with Enter", async () => {
    const fetchMock = mockConversation();
    vi.stubGlobal("fetch", fetchMock);
    render(<ReadinessChat surface="cinematic" />);

    const composer = screen.getByRole("textbox", { name: "Your answer" });
    fireEvent.change(composer, { target: { value: "We need an internal application." } });
    fireEvent.keyDown(composer, { key: "Enter", code: "Enter" });

    await waitFor(() => expect(screen.getByText(replyTurn.message)).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("standalone Assistant", () => {
  it("waits for the visitor before creating a new session", async () => {
    history.replaceState(null, "", "/readiness?new=1#assistant-workspace");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<ReadinessChat surface="standalone" />);

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.queryByText("What problem would you like help solving?")).toBeNull();
    expect(screen.getByPlaceholderText("Describe your idea or what you’d like to improve…")).toBeTruthy();
  });
});

describe("workflow example handoff", () => {
  it("starts a fresh conversation with the URL example even when new=1 is present", async () => {
    const prompt = "We need to find answers across our internal documents with source references.";
    history.replaceState(null, "", `/readiness?new=1&prompt=${encodeURIComponent(prompt)}#assistant-workspace`);
    localStorage.setItem("solvin-session", "previous-session");
    const fetchMock = mockConversation();
    vi.stubGlobal("fetch", fetchMock);
    try {
      render(<ReadinessChat surface="standalone" />);
      await waitFor(() => expect(screen.getByText(replyTurn.message)).toBeTruthy());
      expect(screen.getByText(prompt)).toBeTruthy();
      expect(fetchMock.mock.calls[0][0]).toBe("/api/chat/sessions");
      expect(JSON.parse(fetchMock.mock.calls[1][1].body).message).toBe(prompt);
      expect(localStorage.getItem("solvin-session")).toBe("session-1");
      expect(location.search).toBe("");
    } finally {
      history.replaceState(null, "", "/");
    }
  });
});

describe("native Assistant experience", () => {
  it("lets the visitor edit a starter before sending it", () => {
    history.replaceState(null, "", "/");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<ReadinessChat />);
    fireEvent.click(screen.getByRole("button", { name: "An app idea" }));
    expect((screen.getByRole("textbox", { name: "Your answer" }) as HTMLTextAreaElement).value).toContain("first version");
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Your answer" }));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not send Enter while composing an international-language character", () => {
    history.replaceState(null, "", "/");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<ReadinessChat />);
    const composer = screen.getByRole("textbox", { name: "Your answer" });
    fireEvent.change(composer, { target: { value: "A new idea" } });
    fireEvent.keyDown(composer, { key: "Enter", isComposing: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows and exports a brief returned on the first response, without requiring contact details", async () => {
    history.replaceState(null, "", "/");
    const recommendation = { workflowSummary: "Repair intake", opportunity: "Track each request", blocker: "Confirm tools", firstProject: "Shared queue", recommendedService: "Business software", nextAction: "Review the intake process with Jose" };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: true, json: async () => sessionTurn }).mockResolvedValueOnce({ ok: true, json: async () => ({ ...replyTurn, stage: "contact", score: {}, recommendation }) }));
    render(<ReadinessChat />);
    fireEvent.change(screen.getByRole("textbox", { name: "Your answer" }), { target: { value: "A detailed project request" } });
    fireEvent.click(screen.getByRole("button", { name: "Start the conversation" }));
    await waitFor(() => expect(screen.getByRole("article", { name: "Generated project brief" })).toBeTruthy());
    const download = screen.getByRole("link", { name: "Download your brief" });
    expect(decodeURIComponent(download.getAttribute("href")!)).toContain(recommendation.nextAction);
    expect(download.getAttribute("download")).toBe("solvin-project-brief.txt");
    expect(screen.getByText(recommendation.nextAction)).toBeTruthy();
    expect(screen.queryByRole("textbox")).toBeNull();
  });
});

describe("studio Assistant", () => {
  it("receives an editable contextual prompt without starting a conversation", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<ReadinessChat surface="studio" />);
    const composer = screen.getByRole("textbox", { name: "Your answer" }) as HTMLTextAreaElement;
    fireEvent.change(composer, { target: { value: "An earlier draft" } });
    localStorage.setItem("solvin-session", "previous-session");
    const prompt = "Help me design a knowledge agent for my service team.";
    fireEvent(window, new CustomEvent("solvin-assistant-prompt", { detail: prompt }));

    expect(composer.value).toBe(prompt);
    await waitFor(() => expect(document.activeElement).toBe(composer));
    expect(localStorage.getItem("solvin-session")).toBeNull();
    expect(screen.getByRole("heading", { name: "Let’s make your idea real." })).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("ignores invalid contextual prompts", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<ReadinessChat surface="studio" />);
    const composer = screen.getByRole("textbox", { name: "Your answer" }) as HTMLTextAreaElement;
    fireEvent.change(composer, { target: { value: "Keep my draft" } });
    for (const detail of [null, 42, "", "   ", "x".repeat(1501)]) {
      fireEvent(window, new CustomEvent("solvin-assistant-prompt", { detail }));
    }

    expect(composer.value).toBe("Keep my draft");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps a contextual draft when an earlier conversation finishes later", async () => {
    const replyResponse = { ok: true, json: async () => replyTurn };
    let resolveReply: ((value: typeof replyResponse) => void) | undefined;
    const pendingReply = new Promise<typeof replyResponse>(resolve => { resolveReply = resolve; });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => sessionTurn })
      .mockReturnValueOnce(pendingReply);
    vi.stubGlobal("fetch", fetchMock);
    render(<ReadinessChat surface="studio" />);
    const composer = screen.getByRole("textbox", { name: "Your answer" }) as HTMLTextAreaElement;
    fireEvent.change(composer, { target: { value: "Our earlier website idea" } });
    fireEvent.click(screen.getByRole("button", { name: "Start the conversation" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const prompt = "Help me streamline our client intake workflow.";
    fireEvent(window, new CustomEvent("solvin-assistant-prompt", { detail: prompt }));
    await act(async () => { resolveReply?.(replyResponse); });

    expect(composer.value).toBe(prompt);
    expect(composer.disabled).toBe(false);
    expect(screen.getByRole("heading", { name: "Let’s make your idea real." })).toBeTruthy();
    expect(screen.queryByText(replyTurn.message)).toBeNull();
    expect(localStorage.getItem("solvin-session")).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("helps visitors draft an agent request without sending it", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<ReadinessChat surface="studio" />);

    expect(screen.getByRole("heading", { name: "Let’s make your idea real." })).toBeTruthy();
    expect(screen.getByText("Ready to explore")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "An AI agent" }));
    const composer = screen.getByRole("textbox", { name: "Your answer" }) as HTMLTextAreaElement;
    expect(composer.placeholder).toBe("What would you like to build?");
    expect(composer.value).toContain("human approval");
    expect(document.activeElement).toBe(composer);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("recovers a saved conversation on the homepage", async () => {
    localStorage.setItem("solvin-session", "saved-session");
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => replyTurn });
    vi.stubGlobal("fetch", fetchMock);
    render(<ReadinessChat surface="studio" />);

    await waitFor(() => expect(screen.getByText(`Your conversation is still here. ${replyTurn.message}`)).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/chat/sessions/saved-session");
    expect(screen.getByRole("log", { name: "Conversation with Solvin Assistant" })).toBeTruthy();
  });

  it("retains the first message after a provider error and retries in the existing session", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => sessionTurn })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: "Please try again in a moment." }) })
      .mockResolvedValueOnce({ ok: true, json: async () => replyTurn });
    vi.stubGlobal("fetch", fetchMock);
    render(<ReadinessChat surface="studio" />);
    const composer = screen.getByRole("textbox", { name: "Your answer" }) as HTMLTextAreaElement;
    fireEvent.change(composer, { target: { value: "Build an agent for our service team." } });
    fireEvent.click(screen.getByRole("button", { name: "Start the conversation" }));

    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    expect(composer.value).toBe("Build an agent for our service team.");
    fireEvent.click(screen.getByRole("button", { name: "Edit and resend" }));
    expect(document.activeElement).toBe(composer);
    fireEvent.keyDown(composer, { key: "Enter" });

    await waitFor(() => expect(screen.getByText(replyTurn.message)).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[2][0]).toBe("/api/chat/sessions/session-1/messages");
    expect(screen.getAllByText("Build an agent for our service team.")).toHaveLength(1);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("returns to the idle studio on restart without creating a session", async () => {
    const fetchMock = mockConversation();
    vi.stubGlobal("fetch", fetchMock);
    render(<ReadinessChat surface="studio" />);
    fireEvent.change(screen.getByRole("textbox", { name: "Your answer" }), { target: { value: "A new website" } });
    fireEvent.click(screen.getByRole("button", { name: "Start the conversation" }));
    await waitFor(() => expect(screen.getByText(replyTurn.message)).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: "Start a new conversation" }));

    expect(screen.getByRole("heading", { name: "Let’s make your idea real." })).toBeTruthy();
    expect(screen.queryByText(replyTurn.message)).toBeNull();
    expect(localStorage.getItem("solvin-session")).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("preserves homepage navigation while the first reply is being prepared", async () => {
    const replyResponse = { ok: true, json: async () => replyTurn };
    let resolveReply: ((value: typeof replyResponse) => void) | undefined;
    const pendingReply = new Promise<typeof replyResponse>(resolve => { resolveReply = resolve; });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => sessionTurn })
      .mockReturnValueOnce(pendingReply);
    vi.stubGlobal("fetch", fetchMock);
    render(<ReadinessChat surface="studio" />);
    fireEvent.change(screen.getByRole("textbox", { name: "Your answer" }), { target: { value: "A standout website" } });
    fireEvent.click(screen.getByRole("button", { name: "Start the conversation" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    history.replaceState(null, "", "/#experience");
    resolveReply?.(replyResponse);

    await waitFor(() => expect(screen.getByText(replyTurn.message)).toBeTruthy());
    expect(location.hash).toBe("#experience");
    fireEvent.click(screen.getByRole("button", { name: "Start a new conversation" }));
    expect(location.hash).toBe("#experience");
  });

  it("recovers a failed contact answer and waits for explicit consent before sending the brief", async () => {
    const recommendation = { workflowSummary: "Service team agent", opportunity: "Faster answers", blocker: "Confirm source documents", firstProject: "Knowledge assistant", recommendedService: "AI agents", nextAction: "Review the first release" };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => sessionTurn })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...replyTurn, stage: "contact", score: {}, recommendation }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: "Please try your name again." }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ details: { fullName: "Alex" } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ details: { email: "alex@example.com" } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ delivery: "sent" }) });
    vi.stubGlobal("fetch", fetchMock);
    render(<ReadinessChat surface="studio" />);
    fireEvent.change(screen.getByRole("textbox", { name: "Your answer" }), { target: { value: "An agent for our service team" } });
    fireEvent.click(screen.getByRole("button", { name: "Start the conversation" }));
    await waitFor(() => expect(screen.getByRole("article", { name: "Generated project brief" })).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: "Yes, send the brief" }));
    const nameInput = screen.getByRole("textbox", { name: "Your answer" }) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Alex" } });
    fireEvent.click(screen.getByRole("button", { name: "Send answer" }));
    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    expect(nameInput.value).toBe("Alex");
    fireEvent.click(screen.getByRole("button", { name: "Edit and resend" }));
    expect(document.activeElement).toBe(nameInput);
    fireEvent.click(screen.getByRole("button", { name: "Send answer" }));
    await waitFor(() => expect(nameInput.type).toBe("email"));
    expect(screen.getAllByText("Alex")).toHaveLength(1);
    fireEvent.change(nameInput, { target: { value: "alex@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Send answer" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Skip this question" })).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: "Skip this question" }));
    expect(screen.getByText(/May Solvin save this brief and contact you at alex@example.com/)).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(5);
    fireEvent.click(screen.getByRole("button", { name: "I agree — send brief" }));
    await waitFor(() => expect(screen.getByText("Your project brief has been sent.")).toBeTruthy());
    expect(JSON.parse(fetchMock.mock.calls[5][1].body)).toEqual({ fullName: "Alex", email: "alex@example.com", consentToContact: true });
    expect(fetchMock.mock.calls[6][0]).toBe("/api/chat/sessions/session-1/complete");
  });
});

describe("immersive Assistant studio", () => {
  const originalShowModal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "showModal");
  const originalClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "close");

  beforeAll(() => {
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value(this: HTMLDialogElement) { this.setAttribute("open", ""); } });
    Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value(this: HTMLDialogElement) { this.removeAttribute("open"); } });
  });
  afterAll(() => {
    if (originalShowModal) Object.defineProperty(HTMLDialogElement.prototype, "showModal", originalShowModal);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
    if (originalClose) Object.defineProperty(HTMLDialogElement.prototype, "close", originalClose);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
  });

  it("preserves the editable idea when opening and closing the studio without sending it", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<ReadinessChat surface="studio" />);
    fireEvent.click(screen.getByRole("button", { name: "An AI agent" }));
    const draft = (screen.getByRole("textbox", { name: "Your answer" }) as HTMLTextAreaElement).value;
    const launcher = screen.getByRole("button", { name: "Open assistant studio" });
    launcher.focus();
    fireEvent.click(launcher);
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect((screen.getByRole("textbox", { name: "Your answer" }) as HTMLTextAreaElement).value).toBe(draft);
    fireEvent.click(screen.getByRole("button", { name: "Close assistant studio" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect((screen.getByRole("textbox", { name: "Your answer" }) as HTMLTextAreaElement).value).toBe(draft);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("receives a pending reply in the studio and keeps the same conversation and confirmed blueprint on reopen", async () => {
    const preview = { answerCount: 1, goal: "Draft project briefs from inquiries", service: "AI agent", tools: ["Notion"] };
    const replyResponse = { ok: true, json: async () => ({ ...replyTurn, projectPreview: preview }) };
    let resolveReply: ((value: typeof replyResponse) => void) | undefined;
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => sessionTurn }).mockReturnValueOnce(new Promise<typeof replyResponse>(resolve => { resolveReply = resolve; }));
    vi.stubGlobal("fetch", fetchMock);
    render(<ReadinessChat surface="studio" />);
    fireEvent.change(screen.getByRole("textbox", { name: "Your answer" }), { target: { value: "An agent for our design studio" } });
    fireEvent.click(screen.getByRole("button", { name: "Start the conversation" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    fireEvent.click(screen.getByRole("button", { name: "Open assistant studio" }));
    await act(async () => { resolveReply?.(replyResponse); });
    expect(screen.getByText(preview.goal)).toBeTruthy();
    expect(screen.getByText("Notion")).toBeTruthy();
    expect(screen.getByText(replyTurn.message)).toBeTruthy();
    fireEvent.change(screen.getByRole("textbox", { name: "Your answer" }), { target: { value: "Our next answer, still a draft" } });
    fireEvent.click(screen.getByRole("button", { name: "Close assistant studio" }));
    fireEvent.click(screen.getByRole("button", { name: /Your blueprint is taking shape/ }));
    expect(screen.getByText(preview.goal)).toBeTruthy();
    expect(screen.getAllByText("An agent for our design studio")).toHaveLength(1);
    expect((screen.getByRole("textbox", { name: "Your answer" }) as HTMLTextAreaElement).value).toBe("Our next answer, still a draft");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("turns the blueprint into a downloadable brief without requiring follow-up consent", async () => {
    const recommendation = { workflowSummary: "An inquiry assistant", opportunity: "Less time preparing briefs", blocker: "Confirm the source fields", firstProject: "Draft briefs with human review", recommendedService: "AI agent development", nextAction: "Review the first workflow with Jose" };
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => sessionTurn }).mockResolvedValueOnce({ ok: true, json: async () => ({ ...replyTurn, stage: "contact", score: {}, recommendation, projectPreview: { answerCount: 5, service: "AI agent" } }) });
    vi.stubGlobal("fetch", fetchMock);
    render(<ReadinessChat surface="studio" />);
    fireEvent.click(screen.getByRole("button", { name: "Open assistant studio" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Your answer" }), { target: { value: "Here is our full inquiry workflow" } });
    fireEvent.click(screen.getByRole("button", { name: "Start the conversation" }));
    await waitFor(() => expect(screen.getByRole("article", { name: "Your project brief" })).toBeTruthy());
    const download = screen.getByRole("link", { name: "Download your project brief" });
    expect(decodeURIComponent(download.getAttribute("href")!)).toContain(recommendation.firstProject);
    expect(screen.getByText("Your idea has a starting blueprint.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Not right now" }));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("article", { name: "Your project brief" })).toBeTruthy();
  });

  it("clears a dedicated entry prompt after sending it so reload can recover the session", async () => {
    history.replaceState(null, "", "/readiness?new=1&prompt=An%20agent%20idea#assistant-workspace");
    vi.stubGlobal("fetch", mockConversation());
    render(<ReadinessChat surface="studio" clearEntryPrompt />);
    await waitFor(() => expect(screen.getByText(replyTurn.message)).toBeTruthy());
    expect(location.search).toBe("");
    expect(localStorage.getItem("solvin-session")).toBe("session-1");
  });
});
