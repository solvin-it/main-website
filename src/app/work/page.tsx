import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductInterface } from "@/components/marketing";

export const metadata: Metadata = { title: "Work", description: "Internal products and intelligent systems designed and built by Solvin." };

export default function WorkPage() {
  return <>
    <section className="page-hero"><div className="container page-hero-grid"><div><p className="eyebrow">Work / Internal products</p><h1 className="display">Proof lives in the product.</h1></div><div className="page-hero-aside"><p className="subtitle">A direct look at the interfaces, decisions, and systems Solvin has built. No invented clients or performance claims.</p></div></div></section>
    <section className="section"><div className="container work-case">
      <div className="case-intro"><p className="eyebrow">01 / Readiness Advisor</p><h2 className="title">Operational context into a practical build recommendation.</h2><p className="subtitle">An internal product that demonstrates how structured conversation, language models, deterministic application logic, and responsible lead handling can operate as one system.</p></div>
      <ProductInterface />
      <div className="case-details">
        <article><span>Problem</span><h3>AI interest often arrives before workflow clarity.</h3><p>Operators need a useful way to examine repetition, tools, data, value, and risk before committing to an implementation.</p></article>
        <article><span>Product</span><h3>A controlled, guided assessment.</h3><p>The interface asks one primary question per turn, recovers sessions, warns against sensitive data, and produces an understandable recommendation.</p></article>
        <article><span>System</span><h3>AI assists; application logic decides.</h3><p>Claude extracts facts and writes concise language. A state machine controls progression, application code calculates scores, and Supabase remains the system of record.</p></article>
        <article><span>Current outcome</span><h3>A functioning internal product.</h3><p>The full assessment and lead flow are implemented and prepared for production credentials. No external client outcome is claimed.</p></article>
      </div>
      <div className="case-stack"><p className="eyebrow">System stack</p><div><span>Next.js</span><span>TypeScript</span><span>Claude</span><span>Supabase</span><span>n8n</span><span>Resend</span><span>Cal.com</span></div></div>
      <div className="button-row"><Link className="btn btn-primary" href="/readiness">Try the product <ArrowRight size={17} /></Link><Link className="btn btn-secondary" href="/contact">Discuss a similar system</Link></div>
    </div></section>
  </>;
}
