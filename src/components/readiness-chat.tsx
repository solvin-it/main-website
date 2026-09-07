"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Bot, Check, LoaderCircle, RotateCcw, Send, ShieldCheck, UserRound } from "lucide-react";
import type { ChatTurn, LeadContact, ReadinessScore, Recommendation } from "@/lib/types";

type Message = { role: "assistant" | "user"; text: string };
type ContactStep = "offer" | "name" | "email" | "company" | "consent" | "declined" | "complete";

export function ReadinessChat() {
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [contactMessages, setContactMessages] = useState<Message[]>([]);
  const [turn, setTurn] = useState<Partial<ChatTurn>>({});
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ score: ReadinessScore; recommendation: Recommendation } | null>(null);
  const [contactSaved, setContactSaved] = useState(false);
  const [briefDelivered, setBriefDelivered] = useState(false);
  const [contactStep, setContactStep] = useState<ContactStep>("offer");
  const [contact, setContact] = useState<Partial<LeadContact>>({});
  const endRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void start();
    if (location.hash === "#assistant-workspace") {
      const frame = requestAnimationFrame(() => document.getElementById("assistant-workspace")?.scrollIntoView({ block: "start" }));
      return () => cancelAnimationFrame(frame);
    }
  }, []);
  useEffect(() => {
    const messageList = endRef.current?.parentElement;
    messageList?.scrollTo({ top: messageList.scrollHeight, behavior: "smooth" });
  }, [messages, contactMessages, result, contactStep]);

  async function start(reset = false) {
    setBusy(true); setError("");
    const params = new URLSearchParams(location.search);
    const startFresh = reset || params.get("new") === "1";
    if (startFresh) { localStorage.removeItem("solvin-session"); setMessages([]); setContactMessages([]); setResult(null); setContactSaved(false); setBriefDelivered(false); setContactStep("offer"); setContact({}); }
    try {
      const savedId = startFresh ? null : localStorage.getItem("solvin-session");
      if (savedId) {
        const restored = await fetch(`/api/chat/sessions/${savedId}`);
        if (restored.ok) {
          const data = await restored.json();
          setSessionId(data.sessionId);
          setTurn(data);
          setMessages([{ role: "assistant", text: `Your conversation is still here. ${data.message}` }]);
          if (data.score && data.recommendation) setResult({ score: data.score, recommendation: data.recommendation });
          return;
        }
        localStorage.removeItem("solvin-session");
      }
      const response = await fetch("/api/chat/sessions", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ entryPage: location.pathname, utm: { source: params.get("utm_source") ?? "", medium: params.get("utm_medium") ?? "", campaign: params.get("utm_campaign") ?? "" } }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSessionId(data.sessionId);
      localStorage.setItem("solvin-session", data.sessionId);
      const initialPrompt = reset ? "" : params.get("prompt")?.trim();
      if (initialPrompt) {
        const firstReply = await fetch(`/api/chat/sessions/${data.sessionId}/messages`, {
          method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: initialPrompt.slice(0, 1500) }),
        });
        const next = await firstReply.json();
        if (!firstReply.ok) throw new Error(next.error);
        setTurn(next);
        setMessages([{ role: "assistant", text: data.message }, { role: "user", text: initialPrompt }, { role: "assistant", text: next.message }]);
        history.replaceState(null, "", `${location.pathname}#assistant-workspace`);
      } else {
        setTurn(data);
        setMessages([{ role: "assistant", text: data.message }]);
        if (startFresh) history.replaceState(null, "", `${location.pathname}#assistant-workspace`);
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to start the check."); }
    finally { setBusy(false); }
  }

  async function send(value: string) {
    const message = value.trim();
    if (!message || busy || !sessionId) return;
    setBusy(true); setError(""); setInput("");
    setMessages(current => [...current, { role: "user", text: message }]);
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setTurn(data);
      setMessages(current => [...current, { role: "assistant", text: data.message }]);
      if (data.score && data.recommendation) setResult({ score: data.score, recommendation: data.recommendation });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The message could not be sent."); }
    finally { setBusy(false); }
  }

  async function submitContact(contact: LeadContact) {
    setBusy(true); setError("");
    try {
      const saved = await fetch(`/api/chat/sessions/${sessionId}/contact`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(contact) });
      if (!saved.ok) throw new Error((await saved.json()).error);
      const completed = await fetch(`/api/chat/sessions/${sessionId}/complete`, { method: "POST" });
      const completion = await completed.json();
      if (!completed.ok) throw new Error(completion.error);
      const delivered = completion.delivery === "sent";
      setBriefDelivered(delivered);
      setContactSaved(true); setTurn(current => ({ ...current, stage: "completed", progress: 100 }));
      setContactStep("complete");
      setContactMessages(current => [...current, { role: "assistant", text: delivered ? "Thank you. A copy of the brief has been emailed to you and sent to Solvin for review." : "Thank you. Your brief has been saved for Solvin to review. Email delivery is not configured in this environment." }]);
      localStorage.removeItem("solvin-session");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Contact details could not be saved."); }
    finally { setBusy(false); }
  }

  function chooseContactPath(accepted: boolean) {
    if (!accepted) {
      setContactMessages(current => [...current, { role: "user", text: "Not right now" }, { role: "assistant", text: "No problem. Your draft will remain here for you to review." }]);
      setContactStep("declined");
      return;
    }
    setContactMessages(current => [...current, { role: "user", text: "Yes, send the brief" }, { role: "assistant", text: "Of course. What should I call you?" }]);
    setContactStep("name");
  }

  async function sendContactAnswer() {
    const answer = input.trim();
    if (busy || !answer || !["name", "email", "company"].includes(contactStep)) return;
    setBusy(true); setError(""); setInput("");
    setContactMessages(current => [...current, { role: "user", text: answer }]);
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}/contact/extract`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: answer, requestedField: contactStep, current: contact }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const nextContact = { ...contact, ...data.details };
      setContact(nextContact);
      if (!nextContact.fullName) {
        setContactMessages(current => [...current, { role: "assistant", text: "Thanks. What should I call you?" }]);
        setContactStep("name");
      } else if (!nextContact.email) {
        setContactMessages(current => [...current, { role: "assistant", text: "What email address should Solvin use to send the brief and follow up?" }]);
        setContactStep("email");
      } else if (!nextContact.companyName) {
        setContactMessages(current => [...current, { role: "assistant", text: "What company or organization is this for? You can skip this question." }]);
        setContactStep("company");
      } else {
        setContactStep("consent");
      }
    } catch (cause) {
      setInput(answer);
      setError(cause instanceof Error ? cause.message : "I could not read those details. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function skipCompany() {
    setContactMessages(current => [...current, { role: "user", text: "Skip this question" }]);
    setInput(""); setContactStep("consent");
  }

  async function consentAndSend() {
    if (!contact.fullName || !contact.email) return;
    setContactMessages(current => [...current, { role: "user", text: "I agree — send the brief" }]);
    await submitContact({ fullName: contact.fullName!, email: contact.email!, companyName: contact.companyName, consentToContact: true });
  }

  const contactMode = Boolean(result) && contactStep !== "offer" && contactStep !== "declined" && contactStep !== "complete";
  const inputType = contactStep === "email" ? "email" : "text";
  const contactPlaceholder = contactStep === "company" ? "Company name (optional)" : "Type your answer…";

  return <div className="assessment-shell">
    <div className="assessment-header">
      <div><p className="measure-label">A conversation, not a questionnaire</p><h2>The Assistant</h2></div>
      <button className="icon-button" onClick={() => start(true)} aria-label="Restart assessment"><RotateCcw size={17} /></button>
    </div>
    <div className="progress-track" aria-label={`${turn.progress ?? 0}% complete`}><span style={{ transform: `scaleX(${(turn.progress ?? 0) / 100})` }} /></div>
    <div className="privacy-banner"><ShieldCheck size={18} /><span>Keep descriptions high-level. Do not share passwords, customer records, confidential documents, or sensitive personal data.</span></div>
    <div className="message-list" aria-live="polite" aria-busy={busy}>
      {messages.map((message, index) => <div className={`message-row ${message.role}`} key={`${message.role}-${index}`}><span className="message-avatar">{message.role === "assistant" ? <Bot size={17} /> : <UserRound size={17} />}</span><p>{message.text}</p></div>)}
      {result && <BriefArtifact result={result} />}
      {result && contactStep === "offer" && <div className="message-row assistant"><span className="message-avatar"><Bot size={17} /></span><p>Would you like me to send this brief to Solvin for review and follow-up?</p></div>}
      {contactMessages.map((message, index) => <div className={`message-row ${message.role}`} key={`contact-${message.role}-${index}`}><span className="message-avatar">{message.role === "assistant" ? <Bot size={17} /> : <UserRound size={17} />}</span><p>{message.text}</p></div>)}
      {result && contactStep === "consent" && <div className="message-row assistant"><span className="message-avatar"><Bot size={17} /></span><p>Thanks, {contact.fullName}.{contact.companyName ? ` I have this project under ${contact.companyName}.` : ""} May Solvin save this brief and contact you at {contact.email} about the project?</p></div>}
      {busy && <div className="message-row assistant"><span className="message-avatar"><Bot size={17} /></span><p className="typing"><i /><i /><i /></p></div>}
      <div ref={endRef} />
    </div>
    {error && <p className="chat-error" role="alert">{error}</p>}
    {contactSaved && <div className="completion"><Check size={20} /><div><strong>{briefDelivered ? "Your project brief has been sent." : "Your project brief is saved."}</strong><p>{briefDelivered ? "A copy is in your inbox, and Solvin has received the same brief for review." : "Solvin can follow up using the contact details provided."}</p></div><a className="btn btn-blue" href={process.env.NEXT_PUBLIC_CALCOM_URL ?? "/contact"}>Book a discovery call</a></div>}
    {contactStep !== "complete" && <div className="composer-wrap">
      {!result && turn.quickReplies && <div className="quick-replies">{turn.quickReplies.map(reply => <button key={reply} onClick={() => send(reply)} disabled={busy}>{reply}</button>)}</div>}
      {result && contactStep === "offer" && <div className="quick-replies"><button onClick={() => chooseContactPath(true)}>Yes, send the brief</button><button onClick={() => chooseContactPath(false)}>Not right now</button></div>}
      {result && contactStep === "declined" && <div className="deferred-follow-up"><span>Ready when you are.</span><button onClick={() => chooseContactPath(true)}>Send this brief</button></div>}
      {result && contactStep === "consent" ? <div className="consent-actions"><p>This permits project follow-up. It does not approve a contract or final scope.</p><button className="btn btn-primary" onClick={consentAndSend} disabled={busy}>{busy ? <LoaderCircle className="spin" size={17} /> : <>I agree — send brief <ArrowRight size={17} /></>}</button><button className="text-link" onClick={() => chooseContactPath(false)} disabled={busy}>Not right now</button></div> : !result || contactMode ?
      <form className="composer" onSubmit={event => { event.preventDefault(); if (contactMode) void sendContactAnswer(); else void send(input); }}><label className="sr-only" htmlFor="chat-input">Your answer</label>{contactMode ? <input id="chat-input" value={input} onChange={event => setInput(event.target.value)} placeholder={contactPlaceholder} type={inputType} autoComplete={contactStep === "name" ? "name" : contactStep === "email" ? "email" : "organization"} disabled={busy} /> : <textarea id="chat-input" value={input} onChange={event => setInput(event.target.value)} placeholder="Type your answer…" maxLength={1500} rows={2} disabled={busy} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(input); } }} />}<button aria-label="Send answer" disabled={busy || (contactStep !== "company" && !input.trim())}><Send size={18} /></button></form> : null}
      {contactStep === "company" && <button className="contact-skip" onClick={skipCompany}>Skip this question</button>}
    </div>}
  </div>;
}

function BriefArtifact({ result }: { result: { score: ReadinessScore; recommendation: Recommendation } }) {
  return <article className="result-panel" aria-label="Generated project brief">
    <div className="brief-intro"><p className="measure-label">Project brief · Draft for review</p><h3>{result.recommendation.workflowSummary}</h3><p>This starting brief was prepared from the details you shared. Review it and correct anything that does not reflect your situation.</p></div>
    <div className="result-grid"><div><span>What success looks like</span><p>{result.recommendation.opportunity}</p></div><div><span>Decisions to confirm</span><p>{result.recommendation.blocker}</p></div><div><span>Recommended first release</span><p>{result.recommendation.firstProject}</p></div><div><span>How Solvin can help</span><p>{result.recommendation.recommendedService}</p></div></div>
    <div className="recommended-service"><Check size={18} /><span>Recommended next step: <strong>{result.recommendation.recommendedService}</strong></span></div>
  </article>;
}
