import { useEffect, useState } from "react";

export type Settings = {
  childName: string;
  hiddenApps: string[];
  sound: boolean;
  bubbleSpeed: "lugn" | "normal" | "snabb";
  memoryPairs: 3 | 4 | 6;
  useLocation: boolean;
};

export const DEFAULTS: Settings = {
  childName: "Wera",
  hiddenApps: ["Böcker", "Lyssna", "Favoriter"],
  sound: true,
  bubbleSpeed: "normal",
  memoryPairs: 3,
  useLocation: true,
};

const KEY = "kidsos-settings-v1";

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    /* ingen lagring, använd standard */
  }
  return DEFAULTS;
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
    } catch {
      /* ignorera */
    }
  }, [settings]);

  const update = (patch: Partial<Settings>) =>
    setSettings((s) => ({ ...s, ...patch }));

  return [settings, update] as const;
}