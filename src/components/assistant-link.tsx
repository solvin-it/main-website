"use client";

import type { ReactNode } from "react";

export function AssistantLink({ prompt, children, className }: { prompt: string; children: ReactNode; className?: string }) {
  return <a className={className} href="#assistant-workspace" onClick={event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    window.dispatchEvent(new CustomEvent("solvin-assistant-prompt", { detail: prompt }));
  }}>{children}</a>;
}
