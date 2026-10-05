"use client";

import { useSyncExternalStore } from "react";

function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function isDarkTheme() {
  return document.documentElement.dataset.theme === "dark";
}

export function useDarkTheme() {
  return useSyncExternalStore(subscribeTheme, isDarkTheme, () => false);
}
