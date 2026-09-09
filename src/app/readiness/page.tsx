import type { Metadata } from "next";
import { ReadinessChat } from "@/components/readiness-chat";

export const metadata: Metadata = { title: "The Assistant", description: "Talk through a difficult or repetitive part of your business and receive a clear project brief." };

export default function ReadinessPage() {
  return <>
    <section className="assistant-page"><div className="container assistant-workspace" id="assistant-workspace"><ReadinessChat surface="standalone" /></div></section>
  </>;
}
