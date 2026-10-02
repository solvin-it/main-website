import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HeroScene } from "./hero-scene";
import type { SceneMotion } from "./glasses-scene";

const scene = vi.hoisted(() => ({
  motion: null as { current: SceneMotion } | null,
  onFailure: null as (() => void) | null,
  intersection: null as ((entries: IntersectionObserverEntry[]) => void) | null,
}));
vi.mock("next/dynamic", () => ({ default: () => function MockScene({ motion, onReady, onFailure }: {
  motion: { current: SceneMotion }; onReady: () => void; onFailure: () => void;
}) {
  scene.motion = motion;
  scene.onFailure = onFailure;
  React.useEffect(() => onReady(), [onReady]);
  return <div data-testid="three-scene" />;
} }));
vi.mock("next/image", () => ({ default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => {
  const imageProps = { ...props };
  delete imageProps.priority;
  return React.createElement("img", imageProps);
} }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); scene.motion = null; scene.onFailure = null; scene.intersection = null; });

function motionPreference(reduced: boolean) {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: reduced, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
}

function renderInteractiveScene() {
  motionPreference(false);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ getExtension: () => null } as unknown as WebGL2RenderingContext);
  vi.spyOn(document, "hidden", "get").mockReturnValue(false);
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: (entries: IntersectionObserverEntry[]) => void) { scene.intersection = callback; }
    observe() {}
    disconnect() {}
  });
  vi.stubGlobal("PointerEvent", class extends MouseEvent {
    pointerId: number;
    pointerType: string;
    isPrimary: boolean;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 1;
      this.pointerType = init.pointerType ?? "mouse";
      this.isPrimary = init.isPrimary ?? true;
    }
  });
  const result = render(<HeroScene />);
  const surface = result.container.querySelector<HTMLDivElement>(".hero-canvas")!;
  surface.setPointerCapture = vi.fn();
  surface.hasPointerCapture = vi.fn(() => true);
  surface.releasePointerCapture = vi.fn();
  vi.spyOn(surface, "getBoundingClientRect").mockReturnValue({ left: 0, top: 0, width: 400, height: 400 } as DOMRect);
  return { ...result, surface };
}

describe("3D progressive enhancement", () => {
  it("uses the static brand mark without initializing a GPU context for reduced motion", () => {
    motionPreference(true);
    const context = vi.spyOn(HTMLCanvasElement.prototype, "getContext");
    const { container } = render(<HeroScene />);
    expect(context).not.toHaveBeenCalled();
    expect(screen.queryByTestId("three-scene")).toBeNull();
    expect(container.querySelector('img[src="/solvin-mark.svg"]')).toBeTruthy();
  });

  it.each(["unavailable", "throws"])("retains the static identity when WebGL %s", failure => {
    motionPreference(false);
    const context = vi.spyOn(HTMLCanvasElement.prototype, "getContext");
    if (failure === "throws") context.mockImplementation(() => { throw new Error("GPU unavailable"); });
    else context.mockReturnValue(null);
    const { container } = render(<HeroScene />);
    expect(screen.queryByTestId("three-scene")).toBeNull();
    expect(container.querySelector(".hero-object.is-ready")).toBeNull();
    expect(container.querySelector('img[src="/solvin-mark.svg"]')).toBeTruthy();
  });

  it("restores the fallback if an initialized scene loses its context", () => {
    const { container } = renderInteractiveScene();
    expect(container.querySelector(".is-ready")).toBeTruthy();
    React.act(() => scene.onFailure!());
    expect(screen.queryByTestId("three-scene")).toBeNull();
    expect(container.querySelector(".is-ready")).toBeNull();
    expect(container.querySelector('img[src="/solvin-mark.svg"]')).toBeTruthy();
  });
});

describe("quiet sculpture interaction", () => {
  it("has no controls, visible labels or extra keyboard focus stop, and preserves wheel scrolling", () => {
    const { container, surface } = renderInteractiveScene();
    expect(container.querySelector("button, a, [tabindex]")).toBeNull();
    expect(container.textContent).toBe("");
    const wheel = new WheelEvent("wheel", { deltaY: 180, bubbles: true, cancelable: true });
    fireEvent(surface, wheel);
    expect(wheel.defaultPrevented).toBe(false);
    fireEvent.pointerDown(surface, { clientX: 100, clientY: 100, button: 0 });
    fireEvent.pointerUp(surface);
    expect(document.activeElement).not.toBe(surface);
    expect(scene.motion!.current.x).toBe(0);
  });

  it("follows a hovering pointer and settles to neutral when it leaves", () => {
    const { surface } = renderInteractiveScene();
    fireEvent.pointerMove(surface, { clientX: 400, clientY: 0 });
    expect(scene.motion!.current.pointerX).toBe(1);
    expect(scene.motion!.current.pointerY).toBe(-1);
    fireEvent.pointerLeave(surface);
    expect(scene.motion!.current.pointerX).toBe(0);
    expect(scene.motion!.current.pointerY).toBe(0);
  });

  it("rotates horizontally by dragging while leaving vertical movement out of the rotation", () => {
    const { surface } = renderInteractiveScene();
    fireEvent.pointerDown(surface, { clientX: 0, clientY: 0, button: 0 });
    fireEvent.pointerMove(surface, { clientX: 400, clientY: 200 });
    fireEvent.pointerUp(surface);
    expect(scene.motion!.current.x).toBeCloseTo(Math.PI * 1.5);
    fireEvent.pointerLeave(surface);
    expect(scene.motion!.current.x).toBeCloseTo(Math.PI * 1.5);
  });

  it("leaves vertical touch gestures uncaptured for native page scrolling", () => {
    const { surface } = renderInteractiveScene();
    fireEvent.pointerDown(surface, { pointerType: "touch", clientX: 100, clientY: 100, button: 0 });
    const move = new PointerEvent("pointermove", { pointerType: "touch", clientX: 103, clientY: 160, bubbles: true, cancelable: true });
    fireEvent(surface, move);
    expect(surface.setPointerCapture).not.toHaveBeenCalled();
    expect(move.defaultPrevented).toBe(false);
    expect(scene.motion!.current.x).toBe(0);
    expect(scene.motion!.current.pointerX).toBe(0);
  });

  it("waits for horizontal touch intent before capturing, and releases canceled drags", () => {
    const { surface } = renderInteractiveScene();
    fireEvent.pointerDown(surface, { pointerType: "touch", clientX: 100, clientY: 100, button: 0 });
    fireEvent.pointerMove(surface, { pointerType: "touch", clientX: 104, clientY: 101 });
    expect(surface.setPointerCapture).not.toHaveBeenCalled();
    fireEvent.pointerMove(surface, { pointerType: "touch", clientX: 160, clientY: 103 });
    expect(surface.setPointerCapture).toHaveBeenCalledWith(1);
    expect(scene.motion!.current.x).toBeGreaterThan(0);
    const rotation = scene.motion!.current.x;
    fireEvent.pointerCancel(surface, { pointerType: "touch" });
    fireEvent.pointerMove(surface, { pointerType: "touch", clientX: 300, clientY: 103 });
    expect(scene.motion!.current.x).toBe(rotation);
  });

  it("pauses pointer updates offscreen and resumes on return", () => {
    const { surface } = renderInteractiveScene();
    React.act(() => scene.intersection!([{ isIntersecting: false } as IntersectionObserverEntry]));
    fireEvent.pointerMove(surface, { clientX: 400, clientY: 0 });
    expect(scene.motion!.current.active).toBe(false);
    expect(scene.motion!.current.pointerX).toBe(0);
    React.act(() => scene.intersection!([{ isIntersecting: true } as IntersectionObserverEntry]));
    fireEvent.pointerMove(surface, { clientX: 400, clientY: 0 });
    expect(scene.motion!.current.active).toBe(true);
    expect(scene.motion!.current.pointerX).toBe(1);
  });

  it("pauses a visible scene when the browser tab is hidden and wakes it on return", () => {
    renderInteractiveScene();
    const hidden = vi.spyOn(document, "hidden", "get");
    const changes = vi.fn();
    window.addEventListener("solvin-scene-change", changes);
    try {
      hidden.mockReturnValue(true);
      fireEvent(document, new Event("visibilitychange"));
      expect(scene.motion!.current.active).toBe(false);
      expect(changes).not.toHaveBeenCalled();
      hidden.mockReturnValue(false);
      fireEvent(document, new Event("visibilitychange"));
      expect(scene.motion!.current.active).toBe(true);
      expect(changes).toHaveBeenCalledOnce();
    } finally {
      window.removeEventListener("solvin-scene-change", changes);
    }
  });
});
