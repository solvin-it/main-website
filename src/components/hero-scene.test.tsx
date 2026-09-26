import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HeroScene } from "./hero-scene";
import type { SceneMotion } from "./glasses-scene";

const scene = vi.hoisted(() => ({ motion: null as { current: SceneMotion } | null }));
vi.mock("next/dynamic", () => ({ default: () => function MockScene({ motion, onReady }: { motion: { current: SceneMotion }; onReady: () => void }) {
  scene.motion = motion;
  React.useEffect(() => onReady(), [onReady]);
  return <div data-testid="three-scene" />;
} }));
vi.mock("next/image", () => ({ default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => {
  const imageProps = { ...props };
  delete imageProps.priority;
  return React.createElement("img", imageProps);
} }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function motionPreference(reduced: boolean) {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: reduced, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
}

describe("3D progressive enhancement", () => {
  it("does not initialize a GPU context or load the 3D scene for reduced motion", () => {
    motionPreference(true);
    const context = vi.spyOn(HTMLCanvasElement.prototype, "getContext");
    render(<HeroScene />);
    expect(context).not.toHaveBeenCalled();
    expect(screen.queryByTestId("three-scene")).toBeNull();
    expect(screen.getByText("The Solvin perspective")).toBeTruthy();
  });

  it("retains the static identity when WebGL is unavailable", () => {
    motionPreference(false);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    render(<HeroScene />);
    expect(screen.queryByTestId("three-scene")).toBeNull();
    expect(screen.queryByRole("button", { name: "View glasses from the front" })).toBeNull();
    expect(screen.getByText("A clearer perspective.")).toBeTruthy();
  });
});

describe("glasses interaction", () => {
  function renderInteractiveScene() {
    motionPreference(false);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ getExtension: () => null } as unknown as WebGL2RenderingContext);
    vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} });
    render(<HeroScene />);
    return screen.getByRole("group", { name: "Interactive 3D glasses" });
  }

  it("rotates beyond a full turn on both axes and preserves the angle when the pointer leaves", () => {
    const control = renderInteractiveScene();
    for (let index = 0; index < 10; index++) {
      fireEvent.keyDown(control, { key: "ArrowRight", shiftKey: true });
      fireEvent.keyDown(control, { key: "ArrowDown", shiftKey: true });
    }
    expect(scene.motion!.current.x).toBeGreaterThan(Math.PI * 2);
    expect(scene.motion!.current.y).toBeGreaterThan(Math.PI * 2);
    const rotation = { ...scene.motion!.current };
    fireEvent.pointerLeave(control);
    expect(scene.motion!.current).toEqual(rotation);
    fireEvent.keyDown(control, { key: "Home" });
    expect(scene.motion!.current.x).toBe(0);
    expect(scene.motion!.current.y).toBe(0);
  });

  it("accumulates full drag turns and resets explicitly", () => {
    vi.stubGlobal("PointerEvent", class extends MouseEvent {
      pointerId = 1;
      isPrimary = true;
    });
    const control = renderInteractiveScene();
    control.setPointerCapture = vi.fn();
    control.releasePointerCapture = vi.fn();
    vi.spyOn(control, "getBoundingClientRect").mockReturnValue({ width: 400, height: 400 } as DOMRect);
    for (let index = 0; index < 2; index++) {
      fireEvent.pointerDown(control, { clientX: 0, clientY: 0, button: 0 });
      fireEvent.pointerMove(control, { clientX: 400, clientY: 200 });
      fireEvent.pointerUp(control);
    }
    expect(scene.motion!.current.x).toBeCloseTo(Math.PI * 4);
    expect(scene.motion!.current.y).toBeCloseTo(Math.PI * 2);
    fireEvent.click(screen.getByRole("button", { name: "Reset glasses rotation" }));
    expect(scene.motion!.current.x).toBe(0);
    expect(scene.motion!.current.y).toBe(0);
  });
});
