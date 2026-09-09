import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
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
    expect(screen.getByPlaceholderText("Tell us the problem. We’ll help you solve it.")).toBeTruthy();
  });
});
