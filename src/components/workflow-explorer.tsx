"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Files, Inbox, Layers3, Mail, MessageSquare, Search, Workflow } from "lucide-react";

const examples = [
  { label: "Requests get lost", icon: Inbox, input: ["Email", "Team chat", "Website"], title: "Every request. Accounted for.", text: "Bring incoming requests into one shared queue, with a clear owner and a next step.", system: "Connected intake", output: ["New request captured", "Owner assigned", "Follow-up scheduled"], prompt: "Customer requests arrive through email, chat, and our website. Some get missed. I want to explore a shared intake and follow-up system." },
  { label: "Knowledge is scattered", icon: Search, input: ["Documents", "Team notes", "Internal tools"], title: "The answer, without the search.", text: "Connect useful knowledge so your team can find answers and trace them back to the source.", system: "Knowledge assistant", output: ["Sources connected", "Relevant answer found", "References included"], prompt: "Our team spends too much time searching through documents, notes, and internal tools. I want to explore a knowledge assistant with source references." },
  { label: "Work keeps repeating", icon: Workflow, input: ["Spreadsheets", "Manual updates", "Approvals"], title: "Less repetition. More momentum.", text: "Connect routine steps, bring exceptions to the right person, and keep people in control.", system: "Guided workflow", output: ["Routine step automated", "Exception flagged", "Human review requested"], prompt: "My team repeats manual updates across spreadsheets and tools. I want to explore a workflow that automates routine steps and keeps approvals with people." },
] as const;

export function WorkflowExplorer() {
  const [selected, setSelected] = useState(0);
  const example = examples[selected];
  return <div className="workflow-explorer">
    <div className="workflow-options" aria-label="Choose a business problem">
      {examples.map((item, index) => <button key={item.label} aria-pressed={selected === index} onClick={() => setSelected(index)}><item.icon size={17} /><span>{item.label}</span><ArrowUpRight size={15} /></button>)}
    </div>
    <div className="workflow-stage" aria-live="polite" aria-atomic="true">
      <div className="workflow-diagram" key={selected}>
        <div className="workflow-inputs">{example.input.map((label, index) => { const Icon = [Mail, MessageSquare, Files][index]; return <div key={label}><Icon size={17} /><span>{label}</span></div>; })}</div>
        <div className="workflow-connector" aria-hidden="true"><span /><ArrowRight size={18} /></div>
        <div className="workflow-engine"><Layers3 size={35} strokeWidth={1.3} /><span>{example.system}</span><small>Designed around your work</small></div>
        <div className="workflow-connector" aria-hidden="true"><span /><ArrowRight size={18} /></div>
        <div className="workflow-outputs">{example.output.map(label => <div key={label}><Check size={15} /><span>{label}</span></div>)}</div>
      </div>
      <div className="workflow-result"><div><span className="eyebrow">An illustrative solution</span><h3>{example.title}</h3><p>{example.text}</p></div><Link className="text-link" href={`/readiness?new=1&prompt=${encodeURIComponent(example.prompt)}#assistant-workspace`}>Explore this for my business <ArrowUpRight size={17} /></Link></div>
    </div>
  </div>;
}
