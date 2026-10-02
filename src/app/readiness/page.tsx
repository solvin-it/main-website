import type { Metadata } from "next";
import { ReadinessChat } from "@/components/readiness-chat";
import Link from "next/link";

export const metadata: Metadata = { title: "The Assistant", description: "Talk through a difficult or repetitive part of your business and receive a clear project brief." };

export default function ReadinessPage() {
  return <>
    <section className="assistant-page assistant-page-studio"><div className="container"><div className="assistant-page-intro"><p className="eyebrow">The Solvin Assistant</p><h1>Your next idea,<br />a little more real.</h1><p>A conversation that becomes a blueprint.<br />Start with an idea, or the thing that isn’t working.</p></div><div className="assistant-workspace" id="assistant-workspace"><ReadinessChat surface="studio" clearEntryPrompt /></div><p className="assistant-bottom-note">Keep it high level—leave out passwords and private customer data.<br />Prefer a direct conversation? <Link href="/contact">Write to Jose.</Link></p></div></section>
  </>;
}
