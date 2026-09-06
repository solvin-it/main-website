import type { Metadata } from "next";
import { ReadinessChat } from "@/components/readiness-chat";

export const metadata: Metadata = { title: "The Assistant", description: "Talk through a difficult or repetitive part of your business and receive a clear project brief." };

export default function ReadinessPage() {
  return <>
    <section className="page-hero"><div className="container page-hero-grid"><div><p className="measure-label">The Assistant</p><h1 className="display">What feels harder than it should?</h1></div><div className="page-hero-aside"><p className="subtitle">Describe one recurring problem in plain language. The Assistant will ask a few focused questions and prepare a project brief you can review.</p></div></div></section>
    <section className="section section-tone"><div className="container assistant-workspace" id="assistant-workspace"><ReadinessChat /></div></section>
  </>;
}
