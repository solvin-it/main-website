import { describe, expect, it } from "vitest";
import { extractContactDetailsFallback } from "./contact-details";

describe("extractContactDetails", () => {
  it("extracts name, email, and company from one conversational answer", () => {
    expect(extractContactDetailsFallback(
      "Morgan. Email is at morgan@example.com. I am affiliated with Northstar Golf",
      "name",
    )).toEqual({
      fullName: "Morgan",
      email: "morgan@example.com",
      companyName: "Northstar Golf",
    });
  });

  it("uses a plain answer for the field being requested", () => {
    expect(extractContactDetailsFallback("Morgan Lee", "name")).toEqual({ fullName: "Morgan Lee" });
    expect(extractContactDetailsFallback("Northstar Golf", "company")).toEqual({ companyName: "Northstar Golf" });
  });
});
