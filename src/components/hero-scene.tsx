"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { SceneMotion } from "@/components/glasses-scene";

const GlassesScene = dynamic(() => import("@/components/glasses-scene"), { ssr: false });

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

type Drag = {
  pointerId: number;
  startX: number;
  startY: number;
  lastX: number;
  intent: "pending" | "rotate";
};

function notifyScene() {
  window.dispatchEvent(new Event("solvin-scene-change"));
}

export function HeroScene() {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const motion = useRef<SceneMotion>({ x: 0, active: true, pointerX: 0, pointerY: 0 });
  const drag = useRef<Drag | null>(null);
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => { setFailed(true); setReady(false); }, []);

  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReady(false);
      if (preference.matches) { setEnabled(false); return; }
      try {
        const context = document.createElement("canvas").getContext("webgl2");
        setEnabled(Boolean(context));
        context?.getExtension("WEBGL_lose_context")?.loseContext();
      } catch {
        setEnabled(false);
      }
    };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled || !container.current) return;
    let visible = true;
    const update = () => {
      motion.current.active = visible && !document.hidden;
      if (motion.current.active) notifyScene();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    update();
    observer.observe(container.current);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [enabled]);

  return <div className={`hero-object${ready && enabled && !failed ? " is-ready" : ""}`} ref={container} aria-hidden="true">
    <div className="hero-object-fallback"><Image src="/solvin-mark.svg" alt="" width={420} height={420} priority /></div>
    {enabled && !failed && <div className="hero-canvas"
      onPointerDown={event => {
        if (!ready || event.button !== 0 || event.isPrimary === false) { drag.current = null; return; }
        drag.current = {
          pointerId: event.pointerId, startX: event.clientX, startY: event.clientY,
          lastX: event.clientX, intent: event.pointerType === "touch" ? "pending" : "rotate",
        };
        // Touch chooses its axis before capture so vertical gestures remain page scrolling.
        if (event.pointerType !== "touch") event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={event => {
        if (!ready || !motion.current.active) return;
        const currentDrag = drag.current;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (currentDrag && currentDrag.pointerId === event.pointerId) {
          if (currentDrag.intent === "pending") {
            const dx = event.clientX - currentDrag.startX;
            const dy = event.clientY - currentDrag.startY;
            if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
            if (Math.abs(dy) >= Math.abs(dx)) { drag.current = null; return; }
            currentDrag.intent = "rotate";
            event.currentTarget.setPointerCapture(event.pointerId);
          }
          motion.current.x += (event.clientX - currentDrag.lastX) / Math.max(bounds.width, 1) * Math.PI * 1.5;
          currentDrag.lastX = event.clientX;
          motion.current.pointerX = 0;
          motion.current.pointerY = 0;
          notifyScene();
          return;
        }
        if (event.pointerType === "touch" || event.buttons) return;
        motion.current.pointerX = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / Math.max(bounds.width, 1) * 2 - 1));
        motion.current.pointerY = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / Math.max(bounds.height, 1) * 2 - 1));
        notifyScene();
      }}
      onPointerUp={event => {
        if (drag.current?.pointerId === event.pointerId) drag.current = null;
        if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => { drag.current = null; }}
      onLostPointerCapture={() => { drag.current = null; }}
      onPointerLeave={() => {
        motion.current.pointerX = 0;
        motion.current.pointerY = 0;
        notifyScene();
      }}
    ><SceneBoundary onFailure={onFailure}><GlassesScene motion={motion} onReady={onReady} onFailure={onFailure} /></SceneBoundary></div>}
  </div>;
}
