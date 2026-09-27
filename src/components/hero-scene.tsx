"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Minus, MoveUpRight, Plus, RotateCcw } from "lucide-react";
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
  const [status, setStatus] = useState<"explore" | "falling" | "landed">("explore");
  const [zoom, setZoom] = useState(1);
  const surface = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; zoom: number } | null>(null);
  const pinched = useRef(false);
  const landedCount = useRef(0);
  const container = useRef<HTMLDivElement>(null);
  const motion = useRef<SceneMotion>({ x: 0, y: 0, active: true, dropped: false, resetId: 0, zoom: 1, pointerX: 0, pointerY: 0 });
  const drag = useRef<{ x: number; y: number; pointerId: number; distance: number } | null>(null);
  const notify = () => window.dispatchEvent(new Event("solvin-scene-change"));
  const reset = () => {
    motion.current.x = 0; motion.current.y = 0;
    motion.current.dropped = false; motion.current.resetId++;
    drag.current = null;
    pointers.current.clear(); pinch.current = null; pinched.current = false;
    motion.current.pointerX = 0; motion.current.pointerY = 0;
    motion.current.zoom = 1; setZoom(1);
    landedCount.current = 0;
    setStatus("explore");
    notify();
  };
  const drop = () => {
    if (motion.current.dropped) return;
    motion.current.dropped = true;
    drag.current = null;
    setStatus("falling");
    notify();
  };
  const changeZoom = useCallback((value: number) => {
    const next = Math.min(1.65, Math.max(1, value));
    motion.current.zoom = next;
    setZoom(next);
    window.dispatchEvent(new Event("solvin-scene-change"));
  }, []);
  const onLanded = useCallback(() => {
    landedCount.current++;
    if (landedCount.current === 2) setStatus("landed");
  }, []);
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

  useEffect(() => {
    const element = surface.current;
    if (!enabled || !ready || !element) return;
    const follow = (event: PointerEvent) => {
      if (event.pointerType === "touch" || event.buttons || motion.current.dropped || !motion.current.active) return;
      const bounds = element.getBoundingClientRect();
      motion.current.pointerX = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      motion.current.pointerY = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
      window.dispatchEvent(new Event("solvin-scene-change"));
    };
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      const pixels = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1);
      changeZoom(motion.current.zoom * Math.exp(-pixels * 0.0015));
    };
    window.addEventListener("pointermove", follow);
    element.addEventListener("wheel", wheel, { passive: false });
    return () => {
      window.removeEventListener("pointermove", follow);
      element.removeEventListener("wheel", wheel);
    };
  }, [enabled, ready, changeZoom]);

  return <div className={`hero-object${ready && enabled && !failed ? " is-ready" : ""}`} ref={container}>
    <div className="object-orbit" aria-hidden="true" />
    <div className="object-caption object-caption-top"><span>A fresh perspective. A personal touch.</span><MoveUpRight size={16} /></div>
    <div className="hero-object-fallback" aria-hidden="true"><Image src="/solvin-mark.svg" alt="" width={420} height={420} priority /><span>A clearer perspective.</span></div>
    {enabled && !failed && <div className="hero-canvas" ref={surface}
      role="group" tabIndex={0} aria-label="Interactive 3D glasses and bowtie" aria-describedby="glasses-instructions"
      onKeyDown={event => {
        if (event.key === "Home") { event.preventDefault(); reset(); return; }
        if (event.key === " " || event.key === "Enter") { event.preventDefault(); drop(); return; }
        if (["+", "=", "-", "_"].includes(event.key)) {
          event.preventDefault(); changeZoom(motion.current.zoom + (["-", "_"].includes(event.key) ? -0.1 : 0.1)); return;
        }
        if (motion.current.dropped) return;
        const step = event.shiftKey ? Math.PI / 4 : Math.PI / 12;
        if (event.key === "ArrowLeft") motion.current.x -= step;
        else if (event.key === "ArrowRight") motion.current.x += step;
        else if (event.key === "ArrowUp") motion.current.y -= step;
        else if (event.key === "ArrowDown") motion.current.y += step;
        else return;
        event.preventDefault();
        notify();
      }}
      onPointerDown={event => {
        if (event.button !== 0) return;
        pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.focus({ preventScroll: true });
        if (pointers.current.size === 2) {
          const [a, b] = [...pointers.current.values()];
          pinch.current = { distance: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), zoom: motion.current.zoom };
          pinched.current = true; drag.current = null;
        } else if (pointers.current.size === 1) {
          pinched.current = false;
          drag.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId, distance: 0 };
        }
      }}
      onPointerMove={event => {
        if (!pointers.current.has(event.pointerId)) return;
        pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (pointers.current.size >= 2 && pinch.current) {
          const [a, b] = [...pointers.current.values()];
          changeZoom(pinch.current.zoom * Math.hypot(a.x - b.x, a.y - b.y) / pinch.current.distance);
          return;
        }
        if (!drag.current || pinched.current || motion.current.dropped) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        const dx = event.clientX - drag.current.x;
        const dy = event.clientY - drag.current.y;
        motion.current.x += dx / Math.max(bounds.width, 1) * Math.PI * 2;
        motion.current.y += dy / Math.max(bounds.height, 1) * Math.PI * 2;
        drag.current.distance += Math.hypot(dx, dy);
        drag.current.x = event.clientX; drag.current.y = event.clientY;
        notify();
      }}
      onPointerUp={event => {
        const clicked = !pinched.current && drag.current?.pointerId === event.pointerId && drag.current.distance < 8;
        pointers.current.delete(event.pointerId);
        drag.current = null;
        if (pointers.current.size < 2) pinch.current = null;
        if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        if (clicked) drop();
      }}
      onPointerCancel={event => {
        pointers.current.delete(event.pointerId); drag.current = null; pinch.current = null; pinched.current = true;
      }}
      onLostPointerCapture={event => {
        pointers.current.delete(event.pointerId); drag.current = null;
        if (pointers.current.size < 2) pinch.current = null;
      }}
    ><SceneBoundary onFailure={onFailure}><GlassesScene motion={motion} onReady={onReady} onFailure={onFailure} onLanded={onLanded} /></SceneBoundary></div>}
    <p className="sr-only" id="glasses-instructions">Move the mouse to guide the glasses and bowtie. Click or tap to drop them. Drag to rotate freely. Scroll over the scene or pinch with two fingers to zoom. Arrow keys rotate, Shift increases the step, Enter or Space drops, plus and minus zoom, and Home resets.</p>
    <div className="object-controls">
      <p className="object-note" role="status">{!ready || !enabled || failed ? "The Solvin perspective" : {
        explore: "Move to guide · click to drop",
        falling: "And… gravity takes over.",
        landed: "Back on solid ground. Reset to explore again.",
      }[status]}</p>
      {ready && enabled && !failed && <div className="object-view-buttons">
        <button onClick={() => changeZoom(zoom - 0.15)} disabled={zoom <= 1} aria-label="Zoom out"><Minus size={14} /></button>
        <span className="object-zoom-value" aria-label={`Zoom ${Math.round(zoom * 100)} percent`}>{Math.round(zoom * 100)}%</span>
        <button onClick={() => changeZoom(zoom + 0.15)} disabled={zoom >= 1.65} aria-label="Zoom in"><Plus size={14} /></button>
        <button onClick={reset} aria-label="Reset glasses and bowtie"><RotateCcw size={14} /><span>Reset</span></button>
      </div>}
      {ready && enabled && !failed && <span className="object-gesture-hint">Drag to rotate · scroll or pinch to zoom</span>}
      <a className="object-assistant-link" href="#assistant-workspace">Bring your idea into focus <MoveUpRight size={13} /></a>
    </div>
  </div>;
}
