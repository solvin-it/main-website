import type { Metadata } from "next";
import { ReadinessChat } from "@/components/readiness-chat";

export const metadata: Metadata = { title: "Readiness Advisor", description: "Use Solvin's guided assessment to examine workflow clarity, data, tools, value, and risk before building." };

export default function ReadinessPage() {
  return <>
    <section className="page-hero"><div className="container page-hero-grid"><div><p className="eyebrow">Internal product / Readiness Advisor</p><h1 className="display">Find the system worth building first.</h1></div><div className="page-hero-aside"><p className="subtitle">Describe one recurring workflow. The advisor examines its clarity, repetition, data readiness, impact, and review needs, then prepares a practical starting recommendation.</p></div></div></section>
    <section className="section section-tone"><div className="container"><ReadinessChat /></div></section>
  </>;
}
