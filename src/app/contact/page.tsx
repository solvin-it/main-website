import type { Metadata } from "next";
import { CalendarDays, Mail, ShieldCheck } from "lucide-react";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = { title: "Contact", description: "Discuss a practical AI automation workflow with Solvin Solutions." };

export default function ContactPage() {
  const booking = process.env.NEXT_PUBLIC_CALCOM_URL ?? "#contact-form";
  return <><section className="page-hero"><div className="container"><p className="eyebrow">Contact</p><h1 className="display">Bring one workflow. We will start there.</h1><p className="subtitle">Share the recurring work, bottleneck, or automation idea you want to examine. A high-level description is enough.</p></div></section><section className="section"><div className="container split"><div><p className="eyebrow">Choose a path</p><h2 className="title">Start a practical conversation.</h2><div className="contact-options"><a className="card" href={booking} target={booking.startsWith("http") ? "_blank" : undefined} rel="noreferrer"><CalendarDays className="card-icon" /><h3>Book a discovery call</h3><p>Reserve 30 minutes to discuss the workflow and determine a useful next step.</p></a><div className="card"><Mail className="card-icon" /><h3>Send an inquiry</h3><p>Describe the process and where the friction appears. No confidential records are needed.</p></div><div className="privacy-note"><ShieldCheck size={18} /><span>Please do not include passwords, customer records, private documents, or regulated personal data.</span></div></div></div><div id="contact-form"><ContactForm /></div></div></section></>;
}
