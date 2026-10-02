import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CapabilityPlayground } from "./capability-playground";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("capability playground", () => {
  it("supports keyboard tab navigation and carries the selected capability into the assistant", () => {
    render(<CapabilityPlayground />);
    const websiteTab = screen.getByRole("tab", { name: "Website development" });
    websiteTab.focus();
    fireEvent.keyDown(websiteTab, { key: "ArrowRight" });
    const agentTab = screen.getByRole("tab", { name: "Agent development" });
    expect(agentTab.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(agentTab);
    const link = screen.getByRole("link", { name: "Explore this with the assistant" });
    expect(link.getAttribute("href")).toBe("#assistant-workspace");
    const receivePrompt = vi.fn();
    window.addEventListener("solvin-assistant-prompt", receivePrompt);
    fireEvent.click(link);
    expect(receivePrompt).toHaveBeenCalledOnce();
    expect((receivePrompt.mock.calls[0][0] as CustomEvent<string>).detail).toContain("human review");
    window.removeEventListener("solvin-assistant-prompt", receivePrompt);
  });

  it("runs an explicitly local sample that stops at human review", () => {
    vi.useFakeTimers();
    render(<CapabilityPlayground />);
    fireEvent.click(screen.getByRole("tab", { name: "Agent development" }));
    fireEvent.click(screen.getByRole("button", { name: "Run a sample" }));
    expect(screen.getByText("Local simulation. Nothing is sent.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Preparing your sample" }).hasAttribute("disabled")).toBe(true);
    act(() => vi.advanceTimersByTime(850));
    expect(screen.getByText("Using the sample welcome guide and Monday kickoff note…")).toBeTruthy();
    act(() => vi.advanceTimersByTime(1150));
    act(() => vi.advanceTimersByTime(850));
    expect(screen.getByText("Sample draft")).toBeTruthy();
    expect(screen.getByText(/Hi Alex, welcome aboard!/)).toBeTruthy();
    expect(screen.getAllByText("Ready for your review")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Run again" }).hasAttribute("disabled")).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("cancels a running sample when leaving the agent tab or unmounting", () => {
    vi.useFakeTimers();
    const clearTimer = vi.spyOn(window, "clearTimeout");
    const { unmount } = render(<CapabilityPlayground />);
    fireEvent.click(screen.getByRole("tab", { name: "Agent development" }));
    fireEvent.click(screen.getByRole("button", { name: "Run a sample" }));
    const beforeSwitch = clearTimer.mock.calls.length;
    fireEvent.click(screen.getByRole("tab", { name: "Website development" }));
    expect(clearTimer.mock.calls.length).toBeGreaterThan(beforeSwitch);
    act(() => vi.advanceTimersByTime(5000));
    fireEvent.click(screen.getByRole("tab", { name: "Agent development" }));
    expect(screen.getByRole("button", { name: "Run a sample" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Run a sample" }));
    const beforeUnmount = clearTimer.mock.calls.length;
    unmount();
    expect(clearTimer.mock.calls.length).toBeGreaterThan(beforeUnmount);
  });
});
