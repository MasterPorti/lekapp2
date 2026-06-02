"use client";

import Script from "next/script";
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
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Check if Turnstile is already loaded when the component mounts
  useEffect(() => {
    const win = window as unknown as CustomWindow;
    if (typeof window !== "undefined" && win.turnstile) {
      const timer = setTimeout(() => setScriptLoaded(true), 0);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const win = window as unknown as CustomWindow;
    // Render Turnstile when script is loaded and container is ready
    if (scriptLoaded && typeof window !== "undefined" && win.turnstile && containerRef.current) {
      // Clear previous widget if any
      if (widgetIdRef.current) {
        try {
          if (document.body.contains(containerRef.current)) {
            win.turnstile.remove(widgetIdRef.current);
          }
        } catch (e) {}
        widgetIdRef.current = null;
      }

      try {
        widgetIdRef.current = win.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: onSuccess,
          "expired-callback": onExpire,
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
        typeof window !== "undefined" &&
        win.turnstile &&
        containerRef.current &&
        document.body.contains(containerRef.current)
      ) {
        try {
          win.turnstile.remove(widgetIdRef.current);
        } catch (e) {}
        widgetIdRef.current = null;
      }
    };
  }, [scriptLoaded, siteKey, onSuccess, onExpire]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
        onLoad={() => setScriptLoaded(true)}
      />
      {/* Use turnstile-container instead of cf-turnstile to prevent script auto-scanning */}
      <div ref={containerRef} className="turnstile-container my-4 flex justify-center" />
    </>
  );
}
