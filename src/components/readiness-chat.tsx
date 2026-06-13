"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowRight, Bot, Check, LoaderCircle, RotateCcw, Send, ShieldCheck, UserRound } from "lucide-react";
import type { ChatTurn, LeadContact, ReadinessScore, Recommendation } from "@/lib/types";

type Message = { role: "assistant" | "user"; text: string };

export function ReadinessChat() {
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [turn, setTurn] = useState<Partial<ChatTurn>>({});
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ score: ReadinessScore; recommendation: Recommendation } | null>(null);
  const [contactSaved, setContactSaved] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { start(); }, []);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), [messages, result]);

  async function start(reset = false) {
    setBusy(true); setError("");
    if (reset) { localStorage.removeItem("solvin-session"); setMessages([]); setResult(null); setContactSaved(false); }
    try {
      const savedId = reset ? null : localStorage.getItem("solvin-session");
      if (savedId) {
        const restored = await fetch(`/api/chat/sessions/${savedId}`);
        if (restored.ok) {
          const data = await restored.json();
          setSessionId(data.sessionId);
          setTurn(data);
          setMessages([{ role: "assistant", text: `Welcome back. ${data.message}` }]);
          if (data.score && data.recommendation) setResult({ score: data.score, recommendation: data.recommendation });
          return;
        }
        localStorage.removeItem("solvin-session");
      }
      const params = new URLSearchParams(location.search);
      const response = await fetch("/api/chat/sessions", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ entryPage: location.pathname, utm: { source: params.get("utm_source") ?? "", medium: params.get("utm_medium") ?? "", campaign: params.get("utm_campaign") ?? "" } }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSessionId(data.sessionId);
      localStorage.setItem("solvin-session", data.sessionId);
      setTurn(data);
      setMessages([{ role: "assistant", text: data.message }]);
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

  function submitMessage(event: FormEvent) { event.preventDefault(); send(input); }

  async function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const contact = Object.fromEntries(new FormData(event.currentTarget)) as unknown as LeadContact;
    const payload = { ...contact, consentToContact: true };
    try {
      const saved = await fetch(`/api/chat/sessions/${sessionId}/contact`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      if (!saved.ok) throw new Error((await saved.json()).error);
      const completed = await fetch(`/api/chat/sessions/${sessionId}/complete`, { method: "POST" });
      if (!completed.ok) throw new Error((await completed.json()).error);
      setContactSaved(true); setTurn(current => ({ ...current, stage: "completed", progress: 100 }));
      localStorage.removeItem("solvin-session");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Contact details could not be saved."); }
    finally { setBusy(false); }
  }

  return <div className="assessment-shell">
    <div className="assessment-header">
      <div><p className="eyebrow">Solvin Advisor</p><h2>AI Workflow Readiness Check</h2></div>
      <button className="icon-button" onClick={() => start(true)} aria-label="Restart assessment"><RotateCcw size={17} /></button>
    </div>
    <div className="progress-track" aria-label={`${turn.progress ?? 0}% complete`}><span style={{ width: `${turn.progress ?? 0}%` }} /></div>
    <div className="privacy-banner"><ShieldCheck size={18} /><span>Keep descriptions high-level. Do not share passwords, customer records, confidential documents, or sensitive personal data.</span></div>
    <div className="message-list" aria-live="polite" aria-busy={busy}>
      {messages.map((message, index) => <div className={`message-row ${message.role}`} key={`${message.role}-${index}`}><span className="message-avatar">{message.role === "assistant" ? <Bot size={17} /> : <UserRound size={17} />}</span><p>{message.text}</p></div>)}
      {busy && <div className="message-row assistant"><span className="message-avatar"><Bot size={17} /></span><p className="typing"><i /><i /><i /></p></div>}
      <div ref={endRef} />
    </div>
    {error && <p className="chat-error" role="alert">{error}</p>}
    {!result && <div className="composer-wrap">
      {turn.quickReplies && <div className="quick-replies">{turn.quickReplies.map(reply => <button key={reply} onClick={() => send(reply)} disabled={busy}>{reply}</button>)}</div>}
      <form className="composer" onSubmit={submitMessage}><label className="sr-only" htmlFor="chat-input">Your answer</label><textarea id="chat-input" value={input} onChange={event => setInput(event.target.value)} placeholder="Type your answer…" maxLength={1500} rows={2} disabled={busy} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(input); } }} /><button aria-label="Send answer" disabled={!input.trim() || busy}><Send size={18} /></button></form>
    </div>}
    {result && <ResultPanel result={result} contactSaved={contactSaved} busy={busy} onSubmit={submitContact} />}
  </div>;
}

function ResultPanel({ result, contactSaved, busy, onSubmit }: { result: { score: ReadinessScore; recommendation: Recommendation }; contactSaved: boolean; busy: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const booking = process.env.NEXT_PUBLIC_CALCOM_URL ?? "/contact";
  return <div className="result-panel">
    <div className="score-ring"><strong>{result.score.total}</strong><span>/ 100</span></div>
    <div><p className="eyebrow">Initial recommendation</p><h3>{result.score.category}</h3></div>
    <div className="result-grid"><div><span>Workflow</span><p>{result.recommendation.workflowSummary}</p></div><div><span>Opportunity</span><p>{result.recommendation.opportunity}</p></div><div><span>Main consideration</span><p>{result.recommendation.blocker}</p></div><div><span>Suggested first project</span><p>{result.recommendation.firstProject}</p></div></div>
    <div className="recommended-service"><Check size={18} /><span>Recommended service: <strong>{result.recommendation.recommendedService}</strong></span></div>
    {!contactSaved ? <form className="result-contact" onSubmit={onSubmit}><h3>Receive a follow-up on this recommendation</h3><div className="form-grid"><label><span className="label">Name *</span><input className="field" name="fullName" required /></label><label><span className="label">Email *</span><input className="field" name="email" type="email" required /></label><label><span className="label">Company</span><input className="field" name="companyName" /></label><label><span className="label">Role</span><input className="field" name="roleTitle" /></label></div><label className="consent"><input type="checkbox" required /> I agree that Solvin Solutions may contact me about this assessment.</label><button className="btn btn-primary" disabled={busy}>{busy ? <LoaderCircle className="spin" size={17} /> : <>Save recommendation <ArrowRight size={17} /></>}</button></form> : <div className="completion"><Check size={20} /><div><strong>Your recommendation is saved.</strong><p>A follow-up can now be sent using the email provided.</p></div><a className="btn btn-blue" href={booking} target={booking.startsWith("http") ? "_blank" : undefined} rel="noreferrer">Book a discovery call</a></div>}
  </div>;
}
