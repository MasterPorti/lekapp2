"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

interface TurnstileProps {
  siteKey: string;
  onSuccess: (token: string) => void;
  onExpire?: () => void;
}

export function Turnstile({ siteKey, onSuccess, onExpire }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Render Turnstile when script is loaded and container is ready
    if (scriptLoaded && typeof window !== "undefined" && (window as any).turnstile && containerRef.current) {
      // Clear previous widget if any
      if (widgetIdRef.current) {
        try {
          (window as any).turnstile.remove(widgetIdRef.current);
        } catch (e) {}
      }

      try {
        widgetIdRef.current = (window as any).turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: onSuccess,
          "expired-callback": onExpire,
        });
      } catch (error) {
        console.error("Turnstile render error:", error);
      }
    }

    return () => {
      // Cleanup widget on unmount
      if (widgetIdRef.current && typeof window !== "undefined" && (window as any).turnstile) {
        try {
          (window as any).turnstile.remove(widgetIdRef.current);
        } catch (e) {}
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
