import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = { title: "Let’s Talk", description: "Bring your idea or business problem to Solvin. Start a project inquiry, explore it with the Assistant, or arrange a discovery call." };

export default function ContactPage() {
  const booking = process.env.NEXT_PUBLIC_CALCOM_URL;
  return <>
    <section className="page-hero"><div className="container page-hero-grid"><div><p className="eyebrow">A good place to begin</p><h1 className="display">An idea. A question.<br /><span className="muted">Let’s work through it.</span></h1></div><div className="page-hero-aside"><p className="subtitle">You don’t need a polished brief. Tell me what you’re thinking about, what could work better, or what you’d like to build.</p></div></div></section>
    <section className="section"><div className="container contact-layout"><div className="contact-intro"><p className="eyebrow">Direct to Jose</p><h2 className="title">Every good build starts<br />with a conversation.</h2><p className="subtitle">Share a little context using the form. I’ll review your inquiry and follow up at the email you provide.</p><Link className="contact-assistant-link" href="/readiness?new=1#assistant-workspace">Need help shaping the idea? Try the Assistant <ArrowUpRight size={20} /></Link>{booking && <a className="booking-link" href={booking} target="_blank" rel="noreferrer"><span>Book a discovery call</span><ArrowUpRight size={20} /></a>}<div className="privacy-note"><ShieldCheck size={18} /><span>A high-level description is enough. Please leave out passwords, private customer records, and sensitive documents.</span></div></div><div id="project-form"><ContactForm /></div></div></section>
  </>;
}
