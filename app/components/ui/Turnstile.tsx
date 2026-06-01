"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

interface TurnstileProps {
  siteKey: string;
  onSuccess: (token: string) => void;
  onExpire?: () => void;
}

export function Turnstile({ siteKey, onSuccess, onExpire }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const renderWidget = () => {
      if (typeof window !== "undefined" && (window as any).turnstile && containerRef.current) {
        // Remove existing widget if re-rendering
        if (widgetIdRef.current) {
          try {
            (window as any).turnstile.remove(widgetIdRef.current);
          } catch (e) {}
        }
        
        widgetIdRef.current = (window as any).turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: onSuccess,
          "expired-callback": onExpire,
        });
      }
    };

    // If script loaded already, render immediately
    if (typeof window !== "undefined" && (window as any).turnstile) {
      renderWidget();
    }

    return () => {
      // Cleanup widget on unmount
      if (widgetIdRef.current && typeof window !== "undefined" && (window as any).turnstile) {
        try {
          (window as any).turnstile.remove(widgetIdRef.current);
        } catch (e) {}
      }
    };
  }, [siteKey, onSuccess, onExpire]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback"
        async
        defer
        strategy="afterInteractive"
      />
      <div ref={containerRef} className="cf-turnstile my-4 flex justify-center" />
    </>
  );
}
