"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ArrowRight, ArrowUp, ArrowUpRight, Check, LoaderCircle, RotateCcw, Download, Maximize2, FileText } from "lucide-react";
import { AssistantPresence } from "./assistant-presence";
import { AssistantStudioFrame } from "./assistant-studio-frame";
import { ProjectBlueprint } from "./project-blueprint";
import { formatProjectBrief } from "@/lib/project-brief";
import { formatProjectBriefDocument } from "@/lib/project-brief-document";
import type { ChatTurn, LeadContact, ProjectPreview, ReadinessScore, Recommendation } from "@/lib/types";

type Message = { role: "assistant" | "user"; text: string };
type ContactStep = "offer" | "name" | "email" | "company" | "consent" | "declined" | "complete";

type ReadinessChatProps = {
  surface?: "cinematic" | "standalone" | "studio";
  initialPrompt?: string;
  onConversationStart?: () => void;
  clearEntryPrompt?: boolean;
};

export function ReadinessChat({ surface = "standalone", initialPrompt, onConversationStart, clearEntryPrompt = false }: ReadinessChatProps = {}) {
  const studioId = useId();
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
  const [expanded, setExpanded] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const contactInputRef = useRef<HTMLInputElement>(null);
  const conversationVersionRef = useRef(0);
  const resetToIdle = useCallback((prompt = "") => {
    conversationVersionRef.current += 1;
    localStorage.removeItem("solvin-session");
    setSessionId(""); setMessages([]); setContactMessages([]); setTurn({}); setInput(prompt); setBusy(false); setError(""); setResult(null); setContactSaved(false); setBriefDelivered(false); setContactStep("offer"); setContact({});
    startedRef.current = true;
    requestAnimationFrame(() => composerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (surface !== "studio") return;
    function receivePrompt(event: Event) {
      const detail: unknown = (event as CustomEvent<unknown>).detail;
      if (typeof detail !== "string" || !detail.trim() || detail.length > 1500) return;
      resetToIdle(detail);
    }
    window.addEventListener("solvin-assistant-prompt", receivePrompt);
    return () => window.removeEventListener("solvin-assistant-prompt", receivePrompt);
  }, [surface, resetToIdle]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    if (surface === "cinematic" && !initialPrompt) return;
    const params = new URLSearchParams(location.search);
    if (surface !== "cinematic" && params.get("new") === "1") {
      localStorage.removeItem("solvin-session");
    }
    if (initialPrompt || params.get("prompt")?.trim() || localStorage.getItem("solvin-session")) {
      void start();
    }
    if (surface !== "cinematic" && location.hash === "#assistant-workspace") {
      const frame = requestAnimationFrame(() => document.getElementById("assistant-workspace")?.scrollIntoView({ block: "start" }));
      return () => cancelAnimationFrame(frame);
    }
    // This is intentionally a mount-only bootstrap. Subsequent conversation state
    // changes are handled in place so the composer is never remounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const messageList = endRef.current?.parentElement;
    if (messageList?.scrollTo) messageList.scrollTo({ top: messageList.scrollHeight, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }, [messages, contactMessages, result, contactStep, expanded]);

  async function start(reset = false, directPrompt?: string) {
    const requestVersion = conversationVersionRef.current;
    setBusy(true); setError("");
    const params = new URLSearchParams(location.search);
    const promptToSend = reset ? "" : directPrompt?.trim() || initialPrompt?.trim() || params.get("prompt")?.trim();
    const startFresh = reset || Boolean(promptToSend) || params.get("new") === "1";
    if (startFresh) { localStorage.removeItem("solvin-session"); setSessionId(""); setTurn({}); setMessages([]); setContactMessages([]); setResult(null); setContactSaved(false); setBriefDelivered(false); setContactStep("offer"); setContact({}); }
    if (promptToSend) {
      setInput("");
      setMessages([{ role: "user", text: promptToSend }]);
      onConversationStart?.();
    }
    try {
      const savedId = startFresh ? null : localStorage.getItem("solvin-session");
      if (savedId) {
        const restored = await fetch(`/api/chat/sessions/${savedId}`);
        if (requestVersion !== conversationVersionRef.current) return;
        if (restored.ok) {
          const data = await restored.json();
          if (requestVersion !== conversationVersionRef.current) return;
          setSessionId(data.sessionId);
          setTurn(data);
          setMessages([{ role: "assistant", text: `Your conversation is still here. ${data.message}` }]);
          if (data.score && data.recommendation) setResult({ score: data.score, recommendation: data.recommendation });
          if (data.stage === "completed") { setContactStep("complete"); localStorage.removeItem("solvin-session"); }
          return;
        }
        localStorage.removeItem("solvin-session");
      }
      const response = await fetch("/api/chat/sessions", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ entryPage: location.pathname, utm: { source: params.get("utm_source") ?? "", medium: params.get("utm_medium") ?? "", campaign: params.get("utm_campaign") ?? "" } }),
      });
      const data = await response.json();
      if (requestVersion !== conversationVersionRef.current) return;
      if (!response.ok) throw new Error(data.error || "Unable to start the conversation. Please try again.");
      setSessionId(data.sessionId);
      localStorage.setItem("solvin-session", data.sessionId);
      if (promptToSend) {
        const firstReply = await fetch(`/api/chat/sessions/${data.sessionId}/messages`, {
          method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: promptToSend.slice(0, 1500) }),
        });
        const next = await firstReply.json();
        if (requestVersion !== conversationVersionRef.current) return;
        if (!firstReply.ok) throw new Error(next.error || "The message could not be sent. Please try again.");
        setTurn(next);
        if (next.score && next.recommendation) setResult({ score: next.score, recommendation: next.recommendation });
        setMessages([{ role: "user", text: promptToSend }, { role: "assistant", text: next.message }]);
        if (surface === "standalone" || clearEntryPrompt) history.replaceState(null, "", `${location.pathname}#assistant-workspace`);
      } else {
        setTurn(data);
        setMessages([{ role: "assistant", text: data.message }]);
        if (startFresh && (surface === "standalone" || clearEntryPrompt)) history.replaceState(null, "", `${location.pathname}#assistant-workspace`);
      }
    } catch (cause) {
      if (requestVersion !== conversationVersionRef.current) return;
      if (promptToSend) { setMessages([]); setInput(promptToSend); }
      setError(cause instanceof Error ? cause.message : "Unable to start the conversation.");
    }
    finally { if (requestVersion === conversationVersionRef.current) setBusy(false); }
  }

  async function send(value: string) {
    const message = value.trim();
    if (!message || busy) return;
    if (!sessionId) {
      await start(false, message);
      return;
    }
    const requestVersion = conversationVersionRef.current;
    setBusy(true); setError(""); setInput("");
    setMessages(current => [...current, { role: "user", text: message }]);
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message }) });
      const data = await response.json();
      if (requestVersion !== conversationVersionRef.current) return;
      if (!response.ok) throw new Error(data.error || "The message could not be sent. Please try again.");
      setTurn(data);
      setMessages(current => [...current, { role: "assistant", text: data.message }]);
      if (data.score && data.recommendation) setResult({ score: data.score, recommendation: data.recommendation });
    } catch (cause) {
      if (requestVersion !== conversationVersionRef.current) return;
      setMessages(current => current.at(-1)?.role === "user" ? current.slice(0, -1) : current);
      setInput(message);
      setError(cause instanceof Error ? cause.message : "The message could not be sent.");
    }
    finally { if (requestVersion === conversationVersionRef.current) setBusy(false); }
  }

  async function submitContact(contact: LeadContact) {
    const requestVersion = conversationVersionRef.current;
    setBusy(true); setError("");
    try {
      const saved = await fetch(`/api/chat/sessions/${sessionId}/contact`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(contact) });
      if (requestVersion !== conversationVersionRef.current) return;
      if (!saved.ok) throw new Error((await saved.json()).error);
      const completed = await fetch(`/api/chat/sessions/${sessionId}/complete`, { method: "POST" });
      const completion = await completed.json();
      if (requestVersion !== conversationVersionRef.current) return;
      if (!completed.ok) throw new Error(completion.error);
      const delivered = completion.delivery === "sent";
      setBriefDelivered(delivered);
      setContactSaved(true); setTurn(current => ({ ...current, stage: "completed", progress: 100 }));
      setContactStep("complete");
      setContactMessages(current => [...current, { role: "assistant", text: delivered ? "Thank you. A copy of the brief has been emailed to you and sent to Solvin for review." : "Thank you. Your brief has been saved for Solvin to review. A copy could not be emailed. You can download the brief below." }]);
      localStorage.removeItem("solvin-session");
    } catch (cause) { if (requestVersion === conversationVersionRef.current) setError(cause instanceof Error ? cause.message : "Contact details could not be saved."); }
    finally { if (requestVersion === conversationVersionRef.current) setBusy(false); }
  }

  function chooseContactPath(accepted: boolean) {
    if (!accepted) {
      setContactMessages(current => [...current, { role: "user", text: "Not right now" }, { role: "assistant", text: "No problem. You can download the draft and decide what to do next." }]);
      setContactStep("declined");
      return;
    }
    setContactMessages(current => [...current, { role: "user", text: "Yes, send the brief" }, { role: "assistant", text: "Of course. What should I call you?" }]);
    setContactStep("name");
  }

  async function sendContactAnswer() {
    const answer = input.trim();
    if (busy || !answer || !["name", "email", "company"].includes(contactStep)) return;
    const requestVersion = conversationVersionRef.current;
    setBusy(true); setError(""); setInput("");
    setContactMessages(current => [...current, { role: "user", text: answer }]);
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}/contact/extract`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: answer, requestedField: contactStep, current: contact }),
      });
      const data = await response.json();
      if (requestVersion !== conversationVersionRef.current) return;
      if (!response.ok) throw new Error(data.error || "I could not read those details. Please try again.");
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
      if (requestVersion !== conversationVersionRef.current) return;
      setContactMessages(current => current.at(-1)?.role === "user" ? current.slice(0, -1) : current);
      setInput(answer);
      setError(cause instanceof Error ? cause.message : "I could not read those details. Please try again.");
    } finally {
      if (requestVersion === conversationVersionRef.current) setBusy(false);
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
    if (busy) return;
    if (surface === "cinematic" || surface === "studio") {
      resetToIdle();
      return;
    }
    void start(true);
  }

  const starters = !engaged && <div className="assistant-starters" aria-label="Ideas to start with">{surface !== "studio" && <span>Need a starting point?</span>}{(surface === "studio" ? [
    ["A standout website", "I’d like a standout website that clearly communicates our value, feels memorable, and brings in the right inquiries. Help me shape the experience and first release."],
    ["An AI agent", "I want an AI agent that helps my team get work done. Help me choose a useful first task, the tools it should use, and where human approval is needed."],
    ["A smarter workflow", "My team spends too much time on repetitive tasks. Help me map the workflow and find the most valuable step to automate first."],
  ] : [
    ["A better website", "I’d like a website that better explains my business and brings in the right inquiries."],
    ["An app idea", "I have an idea for an app and want help deciding what the first version should do."],
    ["Less manual work", "My team spends too much time on repetitive tasks. I’d like to find a better way."],
  ]).map(([label, prompt]) => <button key={label} onClick={() => { setInput(prompt); composerRef.current?.focus(); }}>{label}{surface !== "studio" && <ArrowRight size={13} />}</button>)}</div>;

  const chatContent = <div className={`assistant-experience assistant-${surface}${engaged ? " is-engaged" : " is-idle"}${result ? " has-brief" : ""}${contactSaved ? " is-complete" : ""}${expanded ? " is-expanded" : ""}`}>
    <div className="assistant-identity">
      {surface === "studio" ? <AssistantPresence state={error ? "error" : busy ? "working" : result ? "ready" : "idle"} /> : <Image src={surface !== "standalone" ? "/solvin-mark-reverse.svg" : "/solvin-mark.svg"} alt="" width={92} height={92} priority={surface !== "standalone"} />}
      {surface === "studio" ? <div><strong>Solvin Assistant</strong><span>{busy ? "Thinking it through" : result ? "Your brief is ready" : engaged ? "Let’s work through it" : "Ready to explore"}</span></div> : <div><span>The Assistant</span><strong>{result ? "Your starting brief is ready." : engaged ? "Let’s work through it." : "What are you working on?"}</strong></div>}
      {surface === "studio" && !expanded && <button id={`${studioId}-expand`} className="assistant-expand" onClick={() => setExpanded(true)} aria-label="Open assistant studio" title="Open assistant studio"><Maximize2 size={16} /></button>}
      {engaged && <button className="assistant-restart" onClick={restart} disabled={busy} aria-label="Start a new conversation"><RotateCcw size={16} /></button>}
    </div>
    {!engaged && (surface === "studio" ? <div className="assistant-studio-intro">{expanded && <AssistantPresence state="idle" size="hero" />}<h2>{expanded ? "Big ideas start with a conversation." : "Let’s make your idea real."}</h2><p>Tell me your idea. I’ll help you find a clear direction and shape a practical project brief.</p></div> : <p className="assistant-welcome">An idea, a bottleneck, or a question about what’s possible. Start wherever you are.</p>)}
    <div className="assistant-thread" role="log" aria-label="Conversation with Solvin Assistant" aria-live="polite" aria-busy={busy}>
      {messages.map((message, index) => <div className={`assistant-message ${message.role}`} key={`${message.role}-${index}`}><p>{message.text}</p></div>)}
      {result && (expanded ? <div className="assistant-brief-ready"><FileText size={21} /><div><strong>Your idea has a starting blueprint.</strong><p>Your brief is ready to read and download. It’s yours to keep.</p></div><Check size={16} /></div> : <BriefArtifact result={result} preview={turn.projectPreview} designed={surface === "studio"} />)}
      {result && contactStep === "offer" && <div className="assistant-message assistant"><p>Would you like me to send this brief to Solvin for review and follow-up?</p></div>}
      {contactMessages.map((message, index) => <div className={`assistant-message ${message.role}`} key={`contact-${message.role}-${index}`}><p>{message.text}</p></div>)}
      {result && contactStep === "consent" && <div className="assistant-message assistant"><p>Thanks, {contact.fullName}.{contact.companyName ? ` I have this project under ${contact.companyName}.` : ""} May Solvin save this brief and contact you at {contact.email} about the project?</p></div>}
      {busy && <div className="assistant-message assistant"><p className="assistant-thinking"><i /><i /><i />{surface === "studio" ? <span className="assistant-thinking-label">{contactMode ? "Preparing your details" : "Thinking it through"}</span> : <span className="sr-only">The Assistant is responding</span>}</p></div>}
      <div ref={endRef} />
    </div>
    {surface === "studio" && !expanded && engaged && (turn.projectPreview?.answerCount ?? 0) > 0 && <button id={`${studioId}-blueprint`} className="assistant-blueprint-peek" onClick={() => setExpanded(true)}><FileText size={17} /><span><strong>{result ? "Explore your project brief" : "Your blueprint is taking shape"}</strong><small>{turn.projectPreview?.service ?? "See what we’ve understood so far"}</small></span><ArrowUpRight size={17} /></button>}
    {error && <div className="assistant-error" role="alert"><span>{error}</span><button onClick={() => { setError(""); if (contactMode) contactInputRef.current?.focus(); else composerRef.current?.focus(); }}>Edit and resend</button></div>}
    {contactStep !== "complete" && <div className="composer-wrap">
      {!result && turn.quickReplies && <div className="quick-replies">{turn.quickReplies.map(reply => <button key={reply} onClick={() => send(reply)} disabled={busy}>{reply}</button>)}</div>}
      {result && contactStep === "offer" && <div className="quick-replies"><button onClick={() => chooseContactPath(true)}>Yes, send the brief</button><button onClick={() => chooseContactPath(false)}>Not right now</button></div>}
      {result && contactStep === "declined" && <div className="deferred-follow-up"><span>Ready when you are.</span><button onClick={() => chooseContactPath(true)}>Send this brief</button></div>}
      {result && contactStep === "consent" ? <div className="consent-actions"><p>This permits project follow-up. It does not approve a contract or final scope.</p><button className="btn btn-primary" onClick={consentAndSend} disabled={busy}>{busy ? <LoaderCircle className="spin" size={17} /> : <>I agree — send brief <ArrowRight size={17} /></>}</button><button className="text-link" onClick={() => chooseContactPath(false)} disabled={busy}>Not right now</button></div> : !result || contactMode ?
      <form className="composer assistant-composer" onSubmit={event => { event.preventDefault(); if (contactMode) void sendContactAnswer(); else void send(input); }}><label className="sr-only" htmlFor={`chat-input-${surface}`}>Your answer</label>{contactMode ? <input ref={contactInputRef} id={`chat-input-${surface}`} value={input} onChange={event => setInput(event.target.value)} placeholder={contactPlaceholder} type={inputType} autoComplete={contactStep === "name" ? "name" : contactStep === "email" ? "email" : "organization"} disabled={busy} /> : <textarea ref={composerRef} id={`chat-input-${surface}`} value={input} onChange={event => setInput(event.target.value)} placeholder={engaged ? "Type your answer…" : surface === "studio" ? "What would you like to build?" : "Describe your idea or what you’d like to improve…"} maxLength={1500} rows={engaged || surface === "studio" ? 2 : 3} disabled={busy} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send(input); } }} />}<button aria-label={engaged ? "Send answer" : "Start the conversation"} disabled={busy || (contactStep !== "company" && !input.trim())}>{busy ? <LoaderCircle className="spin" size={18} /> : <ArrowUp size={18} />}</button></form> : null}
      {contactStep === "company" && <button className="contact-skip" onClick={skipCompany}>Skip this question</button>}
    </div>}
    {starters}
    {surface === "studio" && !expanded && !engaged && <button id={`${studioId}-invitation`} className="assistant-studio-invitation" onClick={() => setExpanded(true)}><span>Make room for your next big idea</span><ArrowUpRight size={15} /></button>}
    {!engaged && <p className="assistant-footnote">No contact details needed to begin. Share an overview, not private records.</p>}
    {contactSaved && <div className="assistant-completion"><Check size={18} /><div><strong>{briefDelivered ? "Your project brief has been sent." : "Your project brief is saved."}</strong><p>{briefDelivered ? "A copy is in your inbox, and Solvin has received the same brief." : "Solvin can follow up using the details you provided."}</p></div><a href={process.env.NEXT_PUBLIC_CALCOM_URL ?? "/contact"}>Book a discovery call <ArrowRight size={15} /></a></div>}
  </div>;

  return surface === "studio" ? <AssistantStudioFrame expanded={expanded} onClose={() => setExpanded(false)} blueprint={<ProjectBlueprint preview={turn.projectPreview} recommendation={result?.recommendation} busy={busy && !contactMode} />}>{chatContent}</AssistantStudioFrame> : chatContent;
}

function BriefArtifact({ result, preview, designed = false }: { result: { score: ReadinessScore; recommendation: Recommendation }; preview?: ProjectPreview; designed?: boolean }) {
  return <article className="result-panel" aria-label="Generated project brief">
    <div className="brief-intro"><p className="measure-label">Project brief · Draft for review</p><h3>{result.recommendation.workflowSummary}</h3><p>This starting brief was prepared from the details you shared. It is a starting point for discussion, not a final scope or quote.</p></div>
    <div className="result-grid"><div><span>What success looks like</span><p>{result.recommendation.opportunity}</p></div><div><span>Decisions to confirm</span><p>{result.recommendation.blocker}</p></div><div><span>Recommended first release</span><p>{result.recommendation.firstProject}</p></div><div><span>How Solvin can help</span><p>{result.recommendation.recommendedService}</p></div></div>
    <a className="brief-download" download={`solvin-project-brief.${designed ? "html" : "txt"}`} href={designed ? `data:text/html;charset=utf-8,${encodeURIComponent(formatProjectBriefDocument(result.recommendation, preview))}` : `data:text/plain;charset=utf-8,${encodeURIComponent(formatProjectBrief(result.recommendation))}`}><Download size={16} /> Download your brief</a>
    <div className="recommended-service"><Check size={18} /><span>Recommended next step: <strong>{result.recommendation.nextAction}</strong></span></div>
  </article>;
}
