"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

type CinematicMarkProps = {
  children: ReactNode;
  locked?: boolean;
};

export function CinematicMark({ children, locked = false }: CinematicMarkProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const sequence = video?.closest<HTMLElement>(".cinematic-sequence");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!video || !sequence || reducedMotion.matches) return;

    let frameId = 0;
    let duration = 0;

    const render = () => {
      frameId = 0;
      const rect = sequence.getBoundingClientRect();
      const nextProgress = clamp(-rect.top / Math.max(1, rect.height - window.innerHeight));
      const filmProgress = clamp(nextProgress / 0.68);

      if (duration > 0) {
        const nextTime = filmProgress * Math.max(0, duration - 0.04);
        if (Math.abs(video.currentTime - nextTime) > 0.025) video.currentTime = nextTime;
      }

      setProgress(Math.round(nextProgress * 100));
    };

    const requestRender = () => {
      if (!frameId) frameId = window.requestAnimationFrame(render);
    };

    const handleMetadata = () => {
      duration = video.duration;
      requestRender();
    };

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) handleMetadata();
    video.addEventListener("loadedmetadata", handleMetadata);
    window.addEventListener("resize", requestRender);
    window.addEventListener("scroll", requestRender, { passive: true });
    requestRender();

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      video.removeEventListener("loadedmetadata", handleMetadata);
      window.removeEventListener("resize", requestRender);
      window.removeEventListener("scroll", requestRender);
    };
  }, []);

  return (
    <div className={`cinematic-mark ${progress > 68 ? "is-chat-ready" : ""} ${progress > 74 ? "is-resolved" : ""} ${locked ? "is-conversation" : ""} ${videoFailed ? "is-fallback" : ""}`}>
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
        <source src="/media/solvin-cinematic-mark.mp4" type="video/mp4" />
      </video>
      <div className="cinematic-vignette" aria-hidden="true" />
      <div className="cinematic-chat-reveal">{children}</div>
    </div>
  );
}
