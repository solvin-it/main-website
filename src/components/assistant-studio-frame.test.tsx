import React, { useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { AssistantStudioFrame } from "./assistant-studio-frame";

const originalShowModal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "showModal");
const originalClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "close");

beforeAll(() => {
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value(this: HTMLDialogElement) { this.setAttribute("open", ""); },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value(this: HTMLDialogElement) { this.removeAttribute("open"); },
  });
});

beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })));
});

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

afterAll(() => {
  if (originalShowModal) Object.defineProperty(HTMLDialogElement.prototype, "showModal", originalShowModal);
  else Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
  if (originalClose) Object.defineProperty(HTMLDialogElement.prototype, "close", originalClose);
  else Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
});

function StatefulConversation() {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState("");
  return (
    <AssistantStudioFrame expanded={expanded} onClose={() => setExpanded(false)} blueprint={<button type="button">Review blueprint</button>}>
      <div>
        <button id="studio-trigger" type="button" onClick={() => setExpanded(true)}>Open assistant studio</button>
        <label>Your answer<textarea value={draft} onChange={event => setDraft(event.target.value)} /></label>
      </div>
    </AssistantStudioFrame>
  );
}

describe("assistant studio frame", () => {
  it("keeps the compact conversation inline and the blueprint out of view", () => {
    const { container } = render(<StatefulConversation />);
    expect(container.contains(screen.getByRole("textbox", { name: "Your answer" }))).toBe(true);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByRole("button", { name: "Review blueprint" })).toBeNull();
  });

  it("opens a native modal, focuses the composer, and restores a remounted launcher after closing", () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, "showModal");
    const close = vi.spyOn(HTMLDialogElement.prototype, "close");
    document.body.style.overflow = "auto";
    const { container } = render(<StatefulConversation />);
    fireEvent.change(screen.getByRole("textbox", { name: "Your answer" }), { target: { value: "Build something memorable." } });
    const originalLauncher = screen.getByRole("button", { name: "Open assistant studio" });
    originalLauncher.focus();
    fireEvent.click(originalLauncher);

    const dialog = screen.getByRole("dialog", { name: "Your idea. A clearer direction." });
    expect(showModal).toHaveBeenCalledOnce();
    expect(container.contains(dialog)).toBe(false);
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Your answer" }));

    fireEvent.click(screen.getByRole("button", { name: "Close assistant studio" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(close).toHaveBeenCalledOnce();
    expect(document.body.style.overflow).toBe("auto");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Open assistant studio" }));
    expect((screen.getByRole("textbox", { name: "Your answer" }) as HTMLTextAreaElement).value).toBe("Build something memorable.");
  });

  it("handles native Escape cancellation and restores scrolling on unmount", () => {
    const onClose = vi.fn();
    document.body.style.overflow = "scroll";
    const { unmount } = render(
      <AssistantStudioFrame expanded onClose={onClose} blueprint={<p>Project direction</p>}>
        <p>Conversation</p>
      </AssistantStudioFrame>,
    );
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Close assistant studio" }));
    const cancellation = new Event("cancel", { cancelable: true });
    fireEvent(screen.getByRole("dialog"), cancellation);
    expect(cancellation.defaultPrevented).toBe(true);
    expect(onClose).toHaveBeenCalledOnce();
    unmount();
    expect(document.body.style.overflow).toBe("scroll");
  });

  it("uses keyboard tabs and makes the inactive mobile pane inert", () => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    render(
      <AssistantStudioFrame expanded onClose={vi.fn()} blueprint={<button type="button">Review blueprint</button>}>
        <label>Your answer<textarea /></label>
      </AssistantStudioFrame>,
    );
    const conversationTab = screen.getByRole("tab", { name: "Conversation" });
    const blueprintTab = screen.getByRole("tab", { name: "Blueprint" });
    const blueprintPanel = document.getElementById(blueprintTab.getAttribute("aria-controls")!);
    const conversationPanel = document.getElementById(conversationTab.getAttribute("aria-controls")!);
    expect(blueprintPanel?.hasAttribute("inert")).toBe(true);
    expect(screen.queryByRole("button", { name: "Review blueprint" })).toBeNull();

    conversationTab.focus();
    fireEvent.keyDown(conversationTab, { key: "ArrowRight" });
    expect(blueprintTab.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(blueprintTab);
    expect(conversationPanel?.hasAttribute("inert")).toBe(true);
    expect(blueprintPanel?.hasAttribute("inert")).toBe(false);
    expect(screen.queryByRole("textbox", { name: "Your answer" })).toBeNull();
    expect(screen.getByRole("button", { name: "Review blueprint" })).toBeTruthy();

    fireEvent.keyDown(blueprintTab, { key: "Home" });
    expect(document.activeElement).toBe(conversationTab);
    fireEvent.keyDown(conversationTab, { key: "End" });
    expect(document.activeElement).toBe(blueprintTab);
    fireEvent.keyDown(blueprintTab, { key: "ArrowRight" });
    expect(document.activeElement).toBe(conversationTab);
  });

  it("keeps both panes accessible on desktop and moves focus out of an inert pane after resizing", () => {
    let mobile = false;
    const subscribers = new Set<() => void>();
    vi.stubGlobal("matchMedia", vi.fn(() => ({
      get matches() { return mobile; },
      addEventListener: (_event: string, callback: () => void) => subscribers.add(callback),
      removeEventListener: (_event: string, callback: () => void) => subscribers.delete(callback),
    })));
    const { unmount } = render(
      <AssistantStudioFrame expanded onClose={vi.fn()} blueprint={<button type="button">Review blueprint</button>}>
        <label>Your answer<textarea /></label>
      </AssistantStudioFrame>,
    );
    const review = screen.getByRole("button", { name: "Review blueprint" });
    expect(screen.getByRole("textbox", { name: "Your answer" })).toBeTruthy();
    review.focus();
    act(() => {
      mobile = true;
      subscribers.forEach(callback => callback());
    });
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Conversation" }));
    expect(review.closest("section")?.hasAttribute("inert")).toBe(true);
    unmount();
    expect(subscribers.size).toBe(0);
  });
});
