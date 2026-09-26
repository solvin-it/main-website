import type { Metadata } from "next";
import { ReadinessChat } from "@/components/readiness-chat";
import Link from "next/link";

export const metadata: Metadata = { title: "The Assistant", description: "Talk through a difficult or repetitive part of your business and receive a clear project brief." };

export default function ReadinessPage() {
  return <>
    <section className="assistant-page assistant-page-native"><div className="container"><div className="assistant-page-intro"><h1 className="eyebrow">The Solvin Assistant</h1><p>A few focused questions. A useful project brief.<br />Start with the idea, or the thing that isn’t working.</p></div><div className="assistant-workspace assistant-native" id="assistant-workspace"><ReadinessChat surface="standalone" /></div><p className="assistant-bottom-note">Keep it high level—leave out passwords and private customer data.<br />Prefer a direct conversation? <Link href="/contact">Write to Jose.</Link></p></div></section>
  </>;
}
