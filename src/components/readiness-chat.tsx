"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUp, Check, LoaderCircle, RotateCcw } from "lucide-react";
import type { ChatTurn, LeadContact, ReadinessScore, Recommendation } from "@/lib/types";

type Message = { role: "assistant" | "user"; text: string };
type ContactStep = "offer" | "name" | "email" | "company" | "consent" | "declined" | "complete";

type ReadinessChatProps = {
  surface?: "cinematic" | "standalone";
  initialPrompt?: string;
  onConversationStart?: () => void;
};

export function ReadinessChat({ surface = "standalone", initialPrompt, onConversationStart }: ReadinessChatProps = {}) {
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
    if (surface === "cinematic" && !initialPrompt) return;
    const params = new URLSearchParams(location.search);
    if (surface === "standalone" && params.get("new") === "1") {
      localStorage.removeItem("solvin-session");
    } else if (initialPrompt || localStorage.getItem("solvin-session")) {
      void start();
    }
    if (surface === "standalone" && location.hash === "#assistant-workspace") {
      const frame = requestAnimationFrame(() => document.getElementById("assistant-workspace")?.scrollIntoView({ block: "start" }));
      return () => cancelAnimationFrame(frame);
    }
    // This is intentionally a mount-only bootstrap. Subsequent conversation state
    // changes are handled in place so the composer is never remounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const messageList = endRef.current?.parentElement;
    if (messageList?.scrollTo) messageList.scrollTo({ top: messageList.scrollHeight, behavior: "smooth" });
  }, [messages, contactMessages, result, contactStep]);

  async function start(reset = false, directPrompt?: string) {
    setBusy(true); setError("");
    const params = new URLSearchParams(location.search);
    const promptToSend = reset ? "" : directPrompt?.trim() || initialPrompt?.trim() || params.get("prompt")?.trim();
    const startFresh = reset || Boolean(promptToSend) || params.get("new") === "1";
    if (startFresh) { localStorage.removeItem("solvin-session"); setMessages([]); setContactMessages([]); setResult(null); setContactSaved(false); setBriefDelivered(false); setContactStep("offer"); setContact({}); }
    if (promptToSend) {
      setInput("");
      setMessages([{ role: "user", text: promptToSend }]);
      onConversationStart?.();
    }
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
      if (promptToSend) {
        const firstReply = await fetch(`/api/chat/sessions/${data.sessionId}/messages`, {
          method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: promptToSend.slice(0, 1500) }),
        });
        const next = await firstReply.json();
        if (!firstReply.ok) throw new Error(next.error);
        setTurn(next);
        setMessages([{ role: "user", text: promptToSend }, { role: "assistant", text: next.message }]);
        if (surface === "standalone") history.replaceState(null, "", `${location.pathname}#assistant-workspace`);
      } else {
        setTurn(data);
        setMessages([{ role: "assistant", text: data.message }]);
        if (startFresh && surface === "standalone") history.replaceState(null, "", `${location.pathname}#assistant-workspace`);
      }
    } catch (cause) {
      if (promptToSend) { setMessages([]); setInput(promptToSend); }
      setError(cause instanceof Error ? cause.message : "Unable to start the conversation.");
    }
    finally { setBusy(false); }
  }

  async function send(value: string) {
    const message = value.trim();
    if (!message || busy) return;
    if (!sessionId) {
      await start(false, message);
      return;
    }
    setBusy(true); setError(""); setInput("");
    setMessages(current => [...current, { role: "user", text: message }]);
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setTurn(data);
      setMessages(current => [...current, { role: "assistant", text: data.message }]);
      if (data.score && data.recommendation) setResult({ score: data.score, recommendation: data.recommendation });
    } catch (cause) {
      setMessages(current => current.at(-1)?.role === "user" ? current.slice(0, -1) : current);
      setInput(message);
      setError(cause instanceof Error ? cause.message : "The message could not be sent.");
    }
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

  const engaged = messages.length > 0 || busy || Boolean(result);

  function restart() {
    if (surface === "cinematic") {
      localStorage.removeItem("solvin-session");
      setSessionId(""); setMessages([]); setContactMessages([]); setTurn({}); setInput(""); setBusy(false); setError(""); setResult(null); setContactSaved(false); setBriefDelivered(false); setContactStep("offer"); setContact({});
      startedRef.current = true;
      return;
    }
    void start(true);
  }

  return <div className={`assistant-experience assistant-${surface}${engaged ? " is-engaged" : " is-idle"}${result ? " has-brief" : ""}${contactSaved ? " is-complete" : ""}`}>
    <div className="assistant-identity">
      <Image src="/solvin-mark-reverse.svg" alt="" width={92} height={92} priority={surface === "cinematic"} />
      <div><span>The Assistant</span><strong>{engaged ? "Let’s work through it." : "What do you want solved?"}</strong></div>
      {engaged && <button className="assistant-restart" onClick={restart} aria-label="Start a new conversation"><RotateCcw size={16} /></button>}
    </div>
    <div className="assistant-thread" aria-live="polite" aria-busy={busy}>
      {messages.map((message, index) => <div className={`assistant-message ${message.role}`} key={`${message.role}-${index}`}><p>{message.text}</p></div>)}
      {result && <BriefArtifact result={result} />}
      {result && contactStep === "offer" && <div className="assistant-message assistant"><p>Would you like me to send this brief to Solvin for review and follow-up?</p></div>}
      {contactMessages.map((message, index) => <div className={`assistant-message ${message.role}`} key={`contact-${message.role}-${index}`}><p>{message.text}</p></div>)}
      {result && contactStep === "consent" && <div className="assistant-message assistant"><p>Thanks, {contact.fullName}.{contact.companyName ? ` I have this project under ${contact.companyName}.` : ""} May Solvin save this brief and contact you at {contact.email} about the project?</p></div>}
      {busy && <div className="assistant-message assistant"><p className="assistant-thinking"><i /><i /><i /><span className="sr-only">The Assistant is responding</span></p></div>}
      <div ref={endRef} />
    </div>
    {error && <div className="assistant-error" role="alert"><span>{error}</span><button onClick={() => setError("")}>Edit and resend</button></div>}
    {contactStep !== "complete" && <div className="composer-wrap">
      {!result && turn.quickReplies && <div className="quick-replies">{turn.quickReplies.map(reply => <button key={reply} onClick={() => send(reply)} disabled={busy}>{reply}</button>)}</div>}
      {result && contactStep === "offer" && <div className="quick-replies"><button onClick={() => chooseContactPath(true)}>Yes, send the brief</button><button onClick={() => chooseContactPath(false)}>Not right now</button></div>}
      {result && contactStep === "declined" && <div className="deferred-follow-up"><span>Ready when you are.</span><button onClick={() => chooseContactPath(true)}>Send this brief</button></div>}
      {result && contactStep === "consent" ? <div className="consent-actions"><p>This permits project follow-up. It does not approve a contract or final scope.</p><button className="btn btn-primary" onClick={consentAndSend} disabled={busy}>{busy ? <LoaderCircle className="spin" size={17} /> : <>I agree — send brief <ArrowRight size={17} /></>}</button><button className="text-link" onClick={() => chooseContactPath(false)} disabled={busy}>Not right now</button></div> : !result || contactMode ?
      <form className="composer assistant-composer" onSubmit={event => { event.preventDefault(); if (contactMode) void sendContactAnswer(); else void send(input); }}><label className="sr-only" htmlFor={`chat-input-${surface}`}>Your answer</label>{contactMode ? <input id={`chat-input-${surface}`} value={input} onChange={event => setInput(event.target.value)} placeholder={contactPlaceholder} type={inputType} autoComplete={contactStep === "name" ? "name" : contactStep === "email" ? "email" : "organization"} disabled={busy} /> : <textarea id={`chat-input-${surface}`} value={input} onChange={event => setInput(event.target.value)} placeholder={engaged ? "Type your answer…" : "Tell us the problem. We’ll help you solve it."} maxLength={1500} rows={engaged ? 2 : 3} disabled={busy} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(input); } }} />}<button aria-label={engaged ? "Send answer" : "Start the conversation"} disabled={busy || (contactStep !== "company" && !input.trim())}>{busy ? <LoaderCircle className="spin" size={18} /> : <ArrowUp size={18} />}</button></form> : null}
      {contactStep === "company" && <button className="contact-skip" onClick={skipCompany}>Skip this question</button>}
    </div>}
    {contactSaved && <div className="assistant-completion"><Check size={18} /><div><strong>{briefDelivered ? "Your project brief has been sent." : "Your project brief is saved."}</strong><p>{briefDelivered ? "A copy is in your inbox, and Solvin has received the same brief." : "Solvin can follow up using the details you provided."}</p></div><a href={process.env.NEXT_PUBLIC_CALCOM_URL ?? "/contact"}>Book a discovery call <ArrowRight size={15} /></a></div>}
  </div>;
}

function BriefArtifact({ result }: { result: { score: ReadinessScore; recommendation: Recommendation } }) {
  return <article className="result-panel" aria-label="Generated project brief">
    <div className="brief-intro"><p className="measure-label">Project brief · Draft for review</p><h3>{result.recommendation.workflowSummary}</h3><p>This starting brief was prepared from the details you shared. Review it and correct anything that does not reflect your situation.</p></div>
    <div className="result-grid"><div><span>What success looks like</span><p>{result.recommendation.opportunity}</p></div><div><span>Decisions to confirm</span><p>{result.recommendation.blocker}</p></div><div><span>Recommended first release</span><p>{result.recommendation.firstProject}</p></div><div><span>How Solvin can help</span><p>{result.recommendation.recommendedService}</p></div></div>
    <div className="recommended-service"><Check size={18} /><span>Recommended next step: <strong>{result.recommendation.recommendedService}</strong></span></div>
  </article>;
}
