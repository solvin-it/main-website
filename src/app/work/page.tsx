import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AssistantInterface } from "@/components/marketing";

export const metadata: Metadata = { title: "Work", description: "Owned products and demonstrations designed and built by Solvin." };

export default function WorkPage() {
  return <>
    <section className="page-hero"><div className="container page-hero-grid"><div><p className="measure-label">Products and demonstrations</p><h1 className="display">See the work working.</h1></div><div className="page-hero-aside"><p className="subtitle">A direct look at the interfaces, decisions, and systems Solvin has built. Every project is labeled honestly; no invented clients or outcomes.</p></div></div></section>
    <section className="section"><div className="container work-case">
      <div className="case-intro"><p className="measure-label">This website · Working demonstration</p><h2 className="title">A business problem becomes a clear project brief.</h2><p className="subtitle">The Assistant demonstrates how structured conversation, language models, deterministic application logic, and responsible lead handling can operate as one system.</p></div>
      <AssistantInterface />
      <div className="case-details">
        <article><span>Problem</span><h3>AI interest often arrives before workflow clarity.</h3><p>Operators need a useful way to examine repetition, tools, data, value, and risk before committing to an implementation.</p></article>
        <article><span>Product</span><h3>A focused, guided conversation.</h3><p>The interface asks one primary question per turn, recovers sessions, warns against sensitive data, and produces a reviewable project brief.</p></article>
        <article><span>System</span><h3>AI assists; application logic decides.</h3><p>GPT-5.6 Luna extracts facts and writes concise project-brief language. A state machine controls progression, application code enforces consent, and Supabase remains the system of record.</p></article>
        <article><span>Current outcome</span><h3>A functioning internal product.</h3><p>The full assessment and lead flow are implemented and prepared for production credentials. No external client outcome is claimed.</p></article>
      </div>
      <div className="case-stack"><p className="eyebrow">System stack</p><div><span>Next.js</span><span>TypeScript</span><span>OpenAI</span><span>Supabase</span><span>n8n</span><span>Resend</span><span>Cal.com</span></div></div>
      <div className="button-row"><Link className="btn btn-primary" href="/readiness?new=1#assistant-workspace">Try the product <ArrowRight size={17} /></Link><Link className="btn btn-secondary" href="/contact">Discuss a similar system</Link></div>
    </div></section>
  </>;
}
