import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FinalCta } from "@/components/marketing";

export const metadata: Metadata = { title: "About", description: "A systems-minded approach to practical AI automation and implementation." };

export default function AboutPage() {
  return <>
    <section className="page-hero"><div className="container"><p className="eyebrow">About Solvin Solutions</p><h1 className="display">Built by a systems thinker for businesses that need practical AI.</h1><p className="subtitle">A consulting and implementation practice created to help businesses approach AI with clarity instead of hype.</p></div></section>
    <section className="section"><div className="container split"><div><h2 className="title">Business context and technical execution belong together.</h2></div><div className="prose"><p>Solvin Solutions is led by Jose Fernando A. Gonzales, a technical solutions professional with experience across business analysis, FinTech systems, API integration, workflow design, cloud-native platforms, process improvement, and applied AI.</p><p>That background shapes the way Solvin works: understand the process, define the system, build carefully, and improve based on real use.</p><p>The goal is not to automate everything. It is to identify the right workflows, implement useful assistance, and keep people in control of important decisions.</p></div></div></section>
    <section className="section" style={{ background: "var(--surface-2)" }}><div className="container"><p className="eyebrow">Core strengths</p><div className="credential-list"><div className="credential"><h3>Business analysis</h3><p className="muted">Turning operational problems into clear requirements and workable systems.</p></div><div className="credential"><h3>Solution design</h3><p className="muted">Connecting data, APIs, approvals, interfaces, and failure handling.</p></div><div className="credential"><h3>Applied AI</h3><p className="muted">Using language models, retrieval, and automation where they fit the work.</p></div><div className="credential"><h3>Implementation</h3><p className="muted">Building prototypes and production-minded workflows with documentation.</p></div></div><div className="button-row"><Link className="btn btn-primary" href="/contact">Discuss a workflow <ArrowRight size={17} /></Link></div></div></section>
    <FinalCta />
  </>;
}
