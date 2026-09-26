"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { MoveUpRight, RotateCcw } from "lucide-react";
import type { SceneMotion } from "@/components/glasses-scene";

const GlassesScene = dynamic(() => import("@/components/glasses-scene"), { ssr: false });

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function HeroScene() {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [view, setView] = useState<"perspective" | "front">("perspective");
  const container = useRef<HTMLDivElement>(null);
  const motion = useRef<SceneMotion>({ x: 0, y: 0, active: true });
  const drag = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const notify = () => window.dispatchEvent(new Event("solvin-scene-change"));
  const reset = (nextView: "perspective" | "front") => {
    motion.current.x = 0; motion.current.y = 0;
    setView(nextView);
    notify();
  };
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => { setFailed(true); setReady(false); }, []);

  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      if (preference.matches) { setEnabled(false); return; }
      const context = document.createElement("canvas").getContext("webgl2");
      const supportsWebGL = Boolean(context);
      context?.getExtension("WEBGL_lose_context")?.loseContext();
      setEnabled(supportsWebGL);
    };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled || !container.current) return;
    const notify = () => window.dispatchEvent(new Event("solvin-scene-change"));
    const observer = new IntersectionObserver(([entry]) => {
      motion.current.active = entry.isIntersecting && !document.hidden;
      if (motion.current.active) notify();
    });
    observer.observe(container.current);
    const visibility = () => {
      const rect = container.current?.getBoundingClientRect();
      motion.current.active = !document.hidden && Boolean(rect && rect.bottom > 0 && rect.top < innerHeight);
      if (motion.current.active) notify();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [enabled]);

  return <div className={`hero-object${ready && enabled && !failed ? " is-ready" : ""}`} ref={container}>
    <div className="object-orbit" aria-hidden="true" />
    <div className="object-caption object-caption-top"><span>Perspective changes everything.</span><MoveUpRight size={16} /></div>
    <div className="hero-object-fallback" aria-hidden="true"><Image src="/solvin-mark.svg" alt="" width={420} height={420} priority /><span>A clearer perspective.</span></div>
    {enabled && !failed && <div className="hero-canvas"
      role="group" tabIndex={0} aria-label="Interactive 3D glasses" aria-describedby="glasses-instructions"
      onKeyDown={event => {
        const step = event.shiftKey ? Math.PI / 4 : Math.PI / 12;
        if (event.key === "ArrowLeft") motion.current.x -= step;
        else if (event.key === "ArrowRight") motion.current.x += step;
        else if (event.key === "ArrowUp") motion.current.y -= step;
        else if (event.key === "ArrowDown") motion.current.y += step;
        else if (event.key === "Home") reset("perspective");
        else return;
        event.preventDefault();
        notify();
      }}
      onPointerDown={event => {
        if (!event.isPrimary || event.button !== 0) return;
        drag.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.focus({ preventScroll: true });
      }}
      onPointerMove={event => {
        if (!drag.current || drag.current.pointerId !== event.pointerId) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        motion.current.x += (event.clientX - drag.current.x) / Math.max(bounds.width, 1) * Math.PI * 2;
        motion.current.y += (event.clientY - drag.current.y) / Math.max(bounds.height, 1) * Math.PI * 2;
        drag.current.x = event.clientX; drag.current.y = event.clientY;
        notify();
      }}
      onPointerUp={event => {
        if (drag.current?.pointerId !== event.pointerId) return;
        drag.current = null;
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => { drag.current = null; }}
      onLostPointerCapture={() => { drag.current = null; }}
    ><SceneBoundary onFailure={onFailure}><GlassesScene motion={motion} view={view} onReady={onReady} onFailure={onFailure} /></SceneBoundary></div>}
    <p className="sr-only" id="glasses-instructions">Drag in any direction to rotate a full 360 degrees. Use arrow keys to rotate, Shift for larger steps, and Home to reset.</p>
    <div className="object-controls">
      <span className="object-note">{ready && enabled && !failed ? "Drag to rotate · 360°" : "The Solvin perspective"}</span>
      {ready && enabled && !failed && <div className="object-view-buttons"><button onClick={() => reset("front")}>Front view</button><button onClick={() => reset("perspective")} aria-label="Reset glasses rotation"><RotateCcw size={14} /><span>Reset</span></button></div>}
    </div>
  </div>;
}
