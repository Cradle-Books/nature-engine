"use client";
import { useEffect } from "react";
export type Appearance = { theme: "light" | "dark" | "system"; size: "small" | "medium" | "large" };
const key = "cradle.appearance";
export function readAppearance(): Appearance {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "{}");
    return { theme: ["light", "dark", "system"].includes(value?.theme) ? value.theme : "light", size: ["small", "medium", "large"].includes(value?.size) ? value.size : "medium" };
  } catch { return { theme: "light", size: "medium" }; }
}
function apply(value: Appearance) {
  document.documentElement.dataset.theme = value.theme === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : value.theme;
  document.documentElement.dataset.readingSize = value.size;
}
export function saveAppearance(value: Appearance) {
  localStorage.setItem(key, JSON.stringify(value));
  apply(value); window.dispatchEvent(new Event("cradle:appearance"));
}
export function AppearanceEffects() {
  useEffect(() => {
    const sync = () => apply(readAppearance()); const media = window.matchMedia("(prefers-color-scheme: dark)");
    sync(); media.addEventListener("change", sync); window.addEventListener("storage", sync); window.addEventListener("cradle:appearance", sync);
    return () => { media.removeEventListener("change", sync); window.removeEventListener("storage", sync); window.removeEventListener("cradle:appearance", sync); };
  }, []);
  return null;
}
