"use client";

import { useState } from "react";
import { CinematicMark } from "@/components/cinematic-mark";
import { ReadinessChat } from "@/components/readiness-chat";

export function CinematicAssistantHero() {
  const [conversationStarted, setConversationStarted] = useState(false);

  return (
    <CinematicMark locked={conversationStarted}>
      <ReadinessChat surface="cinematic" onConversationStart={() => setConversationStarted(true)} />
    </CinematicMark>
  );
}
