"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, FileText, Layers3, Send, Sparkles } from "lucide-react";
import { AssistantLink } from "@/components/assistant-link";

type Capability = "website" | "agent";
type Palette = "sage" | "iris" | "sunrise";

const palettes: Record<Palette, { name: string; accent: string; light: string; deep: string }> = {
  sage: { name: "Sage", accent: "#c4dbb1", light: "#e8eee0", deep: "#3c5642" },
  iris: { name: "Iris", accent: "#b8b6ed", light: "#e9e8f6", deep: "#4e4776" },
  sunrise: { name: "Sunrise", accent: "#edc39d", light: "#f4eadc", deep: "#825b3c" },
};

const sampleSteps = ["Request received", "Context found", "Draft prepared", "Ready for your review"];

const assistantPrompts: Record<Capability, string> = {
  website: "I want a distinctive website that feels as considered and interactive as the Solvin site. Help me explore the experience, content, and features for my business.",
  agent: "I want an agent that finds relevant context, prepares useful drafts, and asks for human review before taking action. Help me explore a workflow for my business.",
};

export function CapabilityPlayground() {
  const [capability, setCapability] = useState<Capability>("website");
  const [palette, setPalette] = useState<Palette>("sage");
  const [samplePhase, setSamplePhase] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const running = samplePhase > 0 && samplePhase < 4;
  const colors = palettes[palette];
  const previewStyle = {
    "--playground-accent": colors.accent,
    "--playground-light": colors.light,
    "--playground-deep": colors.deep,
  } as CSSProperties;

  useEffect(() => {
    if (capability !== "agent" || samplePhase === 0 || samplePhase === 4) return;
    const timer = window.setTimeout(() => setSamplePhase((phase) => phase + 1), samplePhase === 2 ? 1150 : 850);
    return () => window.clearTimeout(timer);
  }, [capability, samplePhase]);

  function selectCapability(next: Capability) {
    if (next === capability) return;
    setCapability(next);
    setSamplePhase(0);
  }

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? 1 : index === 0 ? 1 : 0;
    selectCapability(next === 0 ? "website" : "agent");
    tabs.current[next]?.focus();
  }

  return (
    <div className="playground">
      <div className="playground-controls">
        <div className="playground-tabs" role="tablist" aria-label="Explore our capabilities">
          {(["website", "agent"] as const).map((item, index) => (
            <button
              key={item}
              ref={(node) => { tabs.current[index] = node; }}
              id={`playground-${item}-tab`}
              role="tab"
              aria-selected={capability === item}
              aria-controls={`playground-${item}-panel`}
              tabIndex={capability === item ? 0 : -1}
              onClick={() => selectCapability(item)}
              onKeyDown={(event) => handleTabKey(event, index)}
            >
              {item === "website" ? <Layers3 size={17} /> : <Sparkles size={17} />}
              {item === "website" ? "Website development" : "Agent development"}
            </button>
          ))}
        </div>
        <span className="playground-intro">Explore the possibilities <ArrowDown size={14} /></span>
      </div>

      {capability === "website" ? (
        <div className="playground-panel" role="tabpanel" id="playground-website-panel" aria-labelledby="playground-website-tab" tabIndex={0}>
          <div className="playground-website-stage" style={previewStyle} data-palette={palette}>
            <div className="playground-browser">
              <div className="playground-browser-bar" aria-hidden="true">
                <span className="playground-browser-dots"><i /><i /><i /></span>
                <span>Your next possibility</span>
                <ArrowUpRight size={12} />
              </div>
              <div className="playground-mini-site">
                <div className="playground-mini-nav"><span className="playground-mini-brand"><i /> solvin</span><span>Ideas made real. <ArrowUpRight size={13} /></span></div>
                <div className="playground-mini-hero">
                  <div className="playground-mini-copy"><span>A fresh perspective</span><h3>Your next<br /><em>chapter.</em></h3><p>A little imagination.<br />A completely different experience.</p><span className="playground-mini-action">Make it happen <ArrowUpRight size={17} /></span></div>
                  <div className="playground-sculpture" aria-hidden="true"><div className="playground-sculpture-shadow" /><div className="playground-sculpture-ring playground-sculpture-ring-back" /><div className="playground-sculpture-ball" /><div className="playground-sculpture-ring playground-sculpture-ring-front" /><div className="playground-sculpture-pearl" /><span className="playground-sculpture-spark playground-sculpture-spark-one" /><span className="playground-sculpture-spark playground-sculpture-spark-two" /></div>
                </div>
                <div className="playground-mini-bottom"><span>Good design feels different.</span><span>Built around you <ArrowRight size={12} /></span></div>
              </div>
            </div>
            <div className="playground-palette" role="group" aria-label="Change the sample website palette">
              <span>Make it yours</span>
              {(Object.keys(palettes) as Palette[]).map((item) => (
                <button
                  key={item}
                  className="playground-swatch"
                  style={{ "--swatch": palettes[item].accent } as CSSProperties}
                  aria-label={`${palettes[item].name} palette`}
                  aria-pressed={palette === item}
                  onClick={() => setPalette(item)}
                >{palette === item && <Check size={15} />}<span>{palettes[item].name}</span></button>
              ))}
            </div>
          </div>
          <div className="playground-description">
            <div><span className="playground-description-kicker">Designed to be felt.</span><h3>A website with a point of view.</h3><p>From the first impression to the smallest interaction. Distinctive design, thoughtful motion, and a clear path to what matters.</p></div>
            <AssistantLink prompt={assistantPrompts.website}>Explore this with the assistant <ArrowUpRight size={18} /></AssistantLink>
          </div>
        </div>
      ) : (
        <div className="playground-panel" role="tabpanel" id="playground-agent-panel" aria-labelledby="playground-agent-tab" tabIndex={0}>
          <div className="playground-agent-stage">
            <div className="playground-agent-request"><span className="playground-sample-label"><span /> A sample workflow</span><h3>The right context.<br /><span>The next move.</span></h3><p>“Draft a warm welcome for Alex.<br />Their kickoff is Monday.”</p><button className="playground-run" disabled={running} onClick={() => setSamplePhase(1)}>{samplePhase === 4 ? "Run again" : running ? "Preparing your sample" : "Run a sample"}{running ? <span className="playground-run-loader" aria-hidden="true" /> : <ArrowRight size={17} />}</button><span className="playground-simulation-note">Local simulation. Nothing is sent.</span></div>
            <div className={`playground-agent-workflow${samplePhase === 4 ? " playground-agent-complete" : ""}`}>
              <div className="playground-agent-orbit" aria-hidden="true"><div /><span /><Sparkles size={27} strokeWidth={1.3} /></div>
              <ol className="playground-agent-steps" aria-label="Sample workflow progress">
                {sampleSteps.map((step, index) => <li key={step} className={samplePhase > index ? "playground-step-complete" : ""} aria-current={samplePhase === index + 1 ? "step" : undefined}><span className="playground-step-marker">{samplePhase > index ? <Check size={12} /> : <span />}</span><span>{step}</span>{index === 3 && <span className="playground-review-tag">You decide</span>}</li>)}
              </ol>
              <div className="playground-agent-result" aria-live="polite" aria-atomic="true">
                {samplePhase === 0 ? <div className="playground-result-idle"><FileText size={18} /><p>A useful draft.<br /><span>A person in control.</span></p></div> : samplePhase < 4 ? <><span className="playground-result-label"><Sparkles size={13} />{sampleSteps[samplePhase - 1]}</span><p>{samplePhase === 1 ? "Understanding the welcome request…" : samplePhase === 2 ? "Using the sample welcome guide and Monday kickoff note…" : "Putting the details into a warm, concise message…"}</p></> : <><span className="playground-result-label"><FileText size={13} />Sample draft</span><p>Hi Alex, welcome aboard! We’re looking forward to your kickoff on Monday. We’ll walk through your goals, map the next steps, and make sure you feel at home.</p><div className="playground-review"><Check size={14} /><span>Ready for your review</span><Send size={13} /></div></>}
              </div>
            </div>
          </div>
          <div className="playground-description">
            <div><span className="playground-description-kicker">Built to be useful.</span><h3>An agent with a purpose.</h3><p>Bring scattered information together, turn it into useful work, and keep the important decisions with your team.</p></div>
            <AssistantLink prompt={assistantPrompts.agent}>Explore this with the assistant <ArrowUpRight size={18} /></AssistantLink>
          </div>
        </div>
      )}
    </div>
  );
}
