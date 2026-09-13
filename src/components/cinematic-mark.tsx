"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

type CinematicMarkProps = {
  children: ReactNode;
  locked?: boolean;
};

export function CinematicMark({ children, locked = false }: CinematicMarkProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetTimeRef = useRef(0);
  const [phase, setPhase] = useState<"film" | "chat" | "resolved">("film");
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const sequence = video?.closest<HTMLElement>(".cinematic-sequence");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!video || !sequence || reducedMotion.matches || locked) return;

    let frameId = 0;
    const render = () => {
      frameId = 0;
      const rect = sequence.getBoundingClientRect();
      const nextProgress = clamp(-rect.top / Math.max(1, rect.height - window.innerHeight));
      const filmProgress = clamp(nextProgress / 0.68);
      const duration = Number.isFinite(video.duration) ? video.duration : 0;

      if (duration > 0) {
        const nextTime = filmProgress * Math.max(0, duration - 0.04);
        targetTimeRef.current = nextTime;
        if (!video.seeking && Math.abs(video.currentTime - nextTime) > 0.06) {
          video.currentTime = nextTime;
        }
      }

      const nextPhase = nextProgress > 0.74 ? "resolved" : nextProgress > 0.68 ? "chat" : "film";
      setPhase((currentPhase) => currentPhase === nextPhase ? currentPhase : nextPhase);
    };

    const requestRender = () => {
      if (!frameId) frameId = window.requestAnimationFrame(render);
    };

    const handleMetadata = () => {
      requestRender();
    };

    const handleSeeked = () => {
      const nextTime = targetTimeRef.current;
      if (Math.abs(video.currentTime - nextTime) > 0.06) video.currentTime = nextTime;
    };

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) handleMetadata();
    video.addEventListener("loadedmetadata", handleMetadata);
    video.addEventListener("seeked", handleSeeked);
    window.addEventListener("resize", requestRender);
    window.addEventListener("scroll", requestRender, { passive: true });
    document.addEventListener("scroll", requestRender, { passive: true, capture: true });
    requestRender();

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      video.removeEventListener("loadedmetadata", handleMetadata);
      video.removeEventListener("seeked", handleSeeked);
      window.removeEventListener("resize", requestRender);
      window.removeEventListener("scroll", requestRender);
      document.removeEventListener("scroll", requestRender, true);
    };
  }, [locked]);

  return (
    <div className={`cinematic-mark ${phase !== "film" ? "is-chat-ready" : ""} ${phase === "resolved" ? "is-resolved" : ""} ${locked ? "is-conversation" : ""} ${videoFailed ? "is-fallback" : ""}`}>
      <video
        ref={videoRef}
        className="cinematic-video"
        muted
        playsInline
        preload="auto"
        poster="/media/solvin-cinematic-poster.jpg"
        aria-hidden="true"
        onError={() => setVideoFailed(true)}
      >
        <source media="(max-width: 620px)" src="/media/solvin-cinematic-mark-mobile.mp4" type="video/mp4" />
        <source src="/media/solvin-cinematic-mark.mp4" type="video/mp4" />
      </video>
      <div className="cinematic-vignette" aria-hidden="true" />
      <div className="cinematic-chat-reveal">{children}</div>
    </div>
  );
}
