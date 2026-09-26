// Narrow, first-party answers. These are questions about the service, not
// project facts, and must not advance discovery or invent commercial terms.
export function answerServiceQuestion(message: string): string | null {
  const text = message.trim().toLowerCase();
  if (text.length > 180 || !/^(how|what|who|can|do|does|is|are|will)\b/.test(text)) return null;
  if (/^(how much (do you charge|does (it|a website|an app|a project) cost)|what (are your (rates|prices)|is (the|your) (price|cost|budget)))[? .]*$/.test(text)) {
    return "Pricing depends on the scope. I can help shape a brief; Jose can then review the work and discuss a quote. There’s no commitment to start a conversation.";
  }
  if (/^(how long (does (it|a project|a website|an app) take|will (it|a project) take)|what is (the|your) (timeline|turnaround))[? .]*$/.test(text)) {
    return "Timing depends on the scope, available materials, and review process. Jose confirms a schedule after discussing the project; I can’t promise a delivery date here.";
  }
  if (/^(what (do you (do|build|offer)|can (you|solvin) (do|build)|services do you offer)|can you (build|make) (websites|apps|ai assistants))[? .]*$/.test(text)) {
    return "Solvin designs and builds websites, web and mobile applications, AI assistants, and internal business software. I can help you decide on a useful first version.";
  }
  if (/^(who (will (build|work on) (it|the project|my project)|is (jose|behind solvin))|will i work (directly )?with jose)[? .]*$/.test(text)) {
    return "You work directly with Jose, Solvin’s founder, on the design and engineering. I help prepare the starting brief; Jose reviews the scope and next steps with you.";
  }
  if (/^(are you (an? (ai|bot|human)|jose)|is this (an? )?(ai|bot)|how does (this|the assistant) work)[? .]*$/.test(text)) {
    return "I’m Solvin’s AI Assistant. I ask a few focused questions and turn your answers into a draft brief you can download. Contact details are optional, and sharing the brief for follow-up requires your permission.";
  }
  return null;
}
