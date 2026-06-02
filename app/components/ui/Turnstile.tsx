"use client";

import { useEffect, useRef, useState } from "react";

interface TurnstileInstance {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
    }
  ) => string;
  remove: (widgetId: string) => void;
}

interface CustomWindow extends Window {
  turnstile?: TurnstileInstance;
}

interface TurnstileProps {
  siteKey: string;
  onSuccess: (token: string) => void;
  onExpire?: () => void;
}

export function Turnstile({ siteKey, onSuccess, onExpire }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  
  // Initialize state based on whether the Turnstile script has already been loaded on window
  const [scriptLoaded, setScriptLoaded] = useState(() => {
    if (typeof window !== "undefined") {
      return !!(window as unknown as CustomWindow).turnstile;
    }
    return false;
  });

  const onSuccessRef = useRef(onSuccess);
  const onExpireRef = useRef(onExpire);

  // Sync callbacks to refs to avoid re-rendering Turnstile on reference changes
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onExpireRef.current = onExpire;
  }, [onSuccess, onExpire]);

  // Poll for window.turnstile presence if it wasn't loaded at initialization
  useEffect(() => {
    if (scriptLoaded) return;

    const win = window as unknown as CustomWindow;
    const interval = setInterval(() => {
      if (win.turnstile) {
        setScriptLoaded(true);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [scriptLoaded]);

  useEffect(() => {
    const win = window as unknown as CustomWindow;
    const currentContainer = containerRef.current;

    // Render Turnstile when script is loaded and container is ready
    if (scriptLoaded && win.turnstile && currentContainer) {
      // Clear previous widget if any
      if (widgetIdRef.current) {
        try {
          if (document.body.contains(currentContainer)) {
            win.turnstile.remove(widgetIdRef.current);
          }
        } catch {
          // Catch and ignore Turnstile removal errors
        }
        widgetIdRef.current = null;
      }

      try {
        widgetIdRef.current = win.turnstile.render(currentContainer, {
          sitekey: siteKey,
          callback: (token) => onSuccessRef.current(token),
          "expired-callback": () => onExpireRef.current?.(),
        });
      } catch (error) {
        console.error("Turnstile render error:", error);
      }
    }

    return () => {
      const win = window as unknown as CustomWindow;
      // Cleanup widget on unmount (only if container is still in DOM)
      if (
        widgetIdRef.current &&
        win.turnstile &&
        currentContainer &&
        document.body.contains(currentContainer)
      ) {
        try {
          win.turnstile.remove(widgetIdRef.current);
        } catch {
          // Catch and ignore Turnstile removal errors
        }
        widgetIdRef.current = null;
      }
    };
  }, [scriptLoaded, siteKey]);

  return (
    /* Use turnstile-container instead of cf-turnstile to prevent script auto-scanning */
    <div ref={containerRef} className="turnstile-container my-4 flex justify-center" />
  );
}
