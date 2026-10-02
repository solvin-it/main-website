"use client";

import { useEffect, useRef } from "react";
import "./assistant-presence.css";

type AssistantPresenceProps = {
  state: "idle" | "working" | "ready" | "error";
  size?: "compact" | "hero";
};

export function AssistantPresence({ state, size = "compact" }: AssistantPresenceProps) {
  const presenceRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const presence = presenceRef.current;
    if (!presence) return;

    let inView = false;
    const updateMotion = () => {
      presence.dataset.motion = inView && !document.hidden ? "running" : "paused";
    };
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(entries => {
      inView = entries.some(entry => entry.isIntersecting);
      updateMotion();
    });

    if (observer) observer.observe(presence);
    else {
      inView = true;
      updateMotion();
    }
    document.addEventListener("visibilitychange", updateMotion);

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", updateMotion);
    };
  }, []);

  return (
    <figure
      ref={presenceRef}
      className={`assistant-presence assistant-presence--${size}`}
      data-state={state}
      aria-hidden="true"
    >
      <i className="assistant-presence-aura" />
      <i className="assistant-presence-orbit assistant-presence-orbit--back" />
      <i className="assistant-presence-glass">
        <i className="assistant-presence-reflection" />
        <svg className="assistant-presence-mark" viewBox="0 0 96 96" fill="none" focusable="false">
          <path d="M25 48a20 20 0 1 1 12-3.96" stroke="currentColor" strokeWidth="7" strokeLinecap="square" />
          <path d="M59 44.04A20 20 0 1 1 71 48" stroke="currentColor" strokeWidth="7" strokeLinecap="square" />
          <path d="M41 28h14" stroke="currentColor" strokeWidth="7" />
          <path d="m29 58 14 9v12l-14 9V58ZM67 58l-14 9v12l14 9V58Z" fill="currentColor" />
          <rect x="44" y="67" width="8" height="12" rx="2" fill="currentColor" />
        </svg>
      </i>
      <i className="assistant-presence-orbit assistant-presence-orbit--front" />
    </figure>
  );
}
