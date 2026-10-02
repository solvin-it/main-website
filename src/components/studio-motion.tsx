"use client";

import { useEffect } from "react";

export function StudioMotion() {
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (preference.matches || !window.IntersectionObserver) return;
    const reveal = (element: HTMLElement) => {
      element.classList.add("has-revealed");
      observer.unobserve(element);
    };
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target as HTMLElement); });
    }, { threshold: .12 });
    elements.forEach(element => {
      if (element.getBoundingClientRect().top > innerHeight) {
        element.classList.add("will-reveal");
        observer.observe(element);
      }
    });
    const onFocus = (event: FocusEvent) => {
      const element = (event.target as Element)?.closest<HTMLElement>("[data-reveal]");
      if (element) reveal(element);
    };
    const reduce = () => { if (preference.matches) elements.forEach(reveal); };
    document.addEventListener("focusin", onFocus);
    preference.addEventListener("change", reduce);
    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", onFocus);
      preference.removeEventListener("change", reduce);
      elements.forEach(element => element.classList.remove("will-reveal", "has-revealed"));
    };
  }, []);
  return null;
}
