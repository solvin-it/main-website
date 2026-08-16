"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
    setState(response.ok ? "sent" : "error");
    if (response.ok) event.currentTarget.reset();
  }
  return <form className="contact-form inquiry-form" onSubmit={submit}>
    <div><p className="eyebrow">Project inquiry</p><h2>Tell us what you are trying to improve or create.</h2></div>
    <div className="form-grid"><label><span className="label">Name *</span><input className="field" name="name" required minLength={2} /></label><label><span className="label">Email *</span><input className="field" name="email" type="email" required /></label></div>
    <label><span className="label">Company</span><input className="field" name="company" /></label>
    <label><span className="label">What are you looking to build or improve? *</span><textarea className="field" name="message" required minLength={20} placeholder="Describe the product idea, recurring work, current tools, and what a useful outcome would look like." /></label>
    <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <button className="btn btn-primary" disabled={state === "sending"}>{state === "sending" ? <LoaderCircle className="spin" size={17} /> : <>Send inquiry <ArrowRight size={17} /></>}</button>
    <div aria-live="polite">{state === "sent" && <p className="status">Your inquiry was received. Solvin will follow up using the email provided.</p>}{state === "error" && <p className="status">The inquiry could not be sent. Please try again.</p>}</div>
  </form>;
}
