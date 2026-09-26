import { describe, expect, it } from "vitest";
import { answerServiceQuestion } from "./assistant-service-questions";

describe("service questions", () => {
  it.each([
    ["How much do you charge?", "quote"],
    ["How long does a website take?", "can’t promise"],
    ["What can Solvin build?", "websites"],
    ["Who will work on my project?", "Jose"],
    ["Are you an AI?", "Contact details are optional"],
  ])("answers %s without inventing commercial terms", (question, expected) => {
    expect(answerServiceQuestion(question)).toContain(expected);
  });

  it.each([
    "We need a website that helps people understand our prices.",
    "Can you build a website for my repair shop with a booking form?",
    "What we need is an app for our warehouse.",
  ])("keeps project context in discovery: %s", message => {
    expect(answerServiceQuestion(message)).toBeNull();
  });
});
