import type { Metadata } from "next";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = { title: "Start a Project", description: "Discuss an AI-native product, internal tool, agent, or intelligent workflow system with Solvin." };

export default function ContactPage() {
  const booking = process.env.NEXT_PUBLIC_CALCOM_URL ?? "#project-form";
  return <>
    <section className="page-hero"><div className="container page-hero-grid"><div><p className="eyebrow">Start a project</p><h1 className="display">Bring the problem. We’ll shape what is worth building.</h1></div><div className="page-hero-aside"><p className="subtitle">Share a product idea, recurring operational problem, or existing system that needs to work better. A high-level description is enough.</p></div></div></section>
    <section className="section"><div className="container contact-layout"><div className="contact-intro"><p className="eyebrow">Choose a path</p><h2 className="title">Begin with context.</h2><p className="subtitle">Use the form for a considered reply, or schedule a 30-minute discovery conversation directly.</p><a className="booking-link" href={booking} target={booking.startsWith("http") ? "_blank" : undefined} rel="noreferrer"><span>Book a discovery call</span><ArrowUpRight size={20} /></a><div className="privacy-note"><ShieldCheck size={18} /><span>Do not include passwords, customer records, private documents, or regulated personal data.</span></div></div><div id="project-form"><ContactForm /></div></div></section>
  </>;
}
