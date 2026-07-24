import { useState, useEffect, useCallback } from "react";

export type ConsentChoice = "all" | "essential" | null;

const STORAGE_KEY = "welchesfahrrad:cookie-consent:v1";

interface ConsentState {
  choice: ConsentChoice;
  timestamp: number;
  version: number;
}

const CURRENT_VERSION = 1;

function parseStored(raw: string | null): ConsentState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ConsentState;
    if (parsed.version !== CURRENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function useCookieConsent() {
  const [consent, setConsentState] = useState<ConsentChoice>(() => {
    if (typeof window === "undefined") return null;
    const stored = parseStored(localStorage.getItem(STORAGE_KEY));
    return stored?.choice ?? null;
  });

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Delayed show so it doesn't flash on first paint
    const timer = setTimeout(() => {
      const stored = parseStored(localStorage.getItem(STORAGE_KEY));
      if (!stored) setVisible(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const setConsent = useCallback((choice: ConsentChoice) => {
    const state: ConsentState = {
      choice,
      timestamp: Date.now(),
      version: CURRENT_VERSION,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setConsentState(choice);
    setVisible(false);
  }, []);

  const openBanner = useCallback(() => {
    setVisible(true);
  }, []);

  return {
    consent,
    visible,
    setConsent,
    openBanner,
  };
}
