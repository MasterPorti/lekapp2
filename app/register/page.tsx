"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { Turnstile } from "../components/ui/Turnstile";

export default function RegisterPage() {
  const router = useRouter();
  const { register, verify, isAuthenticated, loading: authLoading } = useAuth();
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isMounted, setIsMounted] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const isLocalhost = typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  // Verification States
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // Resend Cooldown Cooldown Timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (isMounted && !isLocalhost && !captchaToken) {
      setError("Por favor, completa la verificación de seguridad");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await register(username.trim(), email.trim(), password, captchaToken || undefined);
      setSuccess("¡Cuenta creada! Se ha enviado un código de verificación a tu correo.");
      setVerificationEmail(email.trim());
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Error al crear la cuenta");
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      setError("El código debe tener 6 dígitos");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await verify(verificationEmail, verificationCode);
      setSuccess("¡Cuenta verificada con éxito! Iniciando sesión...");
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Código incorrecto o vencido");
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verificationEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al reenviar");
      }
      setSuccess("¡Código de verificación reenviado con éxito!");
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.message || "Error al reenviar el código");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || isAuthenticated) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#f3f4de]">
        <div className="text-sm font-mono font-bold text-gray-700">Cargando aplicación...</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-dvh flex flex-col items-center justify-center bg-[#f3f4de] p-4 text-gray-900 font-sans"
      style={{
        backgroundImage: 'radial-gradient(rgba(220, 42, 55, 0.08) 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px'
      }}
    >
      {/* BRAND HEADER */}
      <div className="flex items-center gap-3 mb-8">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-12 h-12 overflow-hidden shadow-md shadow-[#dc2a36]/10 shrink-0" 
          viewBox="0 0 1000 1000" 
          fill="none"
        >
          <rect width="1000" height="1000" fill="#DC2A37"/>
          <path d="M67.5 168.106V561.39H394.926L342.115 466.953H186.79V168.106H67.5Z" fill="white"/>
          <path d="M366.346 427.811L439.66 558.905H645.311L589.394 466.953H425.37V403.58H535.962V318.462H425.37V256.953H560.192L608.033 165H304.837V427.811H366.346Z" fill="white"/>
          <path d="M668.299 558.905H718.624V403.58L829.216 558.905H962.796L842.263 354.497L962.796 165H829.216L718.624 318.462V165H645.311L608.033 271.243V427.811L668.299 558.905Z" fill="white"/>
          <path d="M322 723V804.5H231.5V759.5H152.5V804.5H61V723L135 609H249.5L322 723ZM162.5 719.5H221L193.5 666L162.5 719.5Z" fill="white"/>
          <path d="M584 609L632.5 655V711L584 761H452.5V802.5H360V609H584ZM451.5 706.5H531L542 694.5V671L531 661.5H451.5V706.5Z" fill="white"/>
          <path d="M888 609L936.5 655V711L888 761H756.5V802.5H664V609H888ZM755.5 706.5H835L846 694.5V671L835 661.5H755.5V706.5Z" fill="white"/>
        </svg>
        <span className="text-xl font-bold font-display uppercase tracking-widest text-gray-900 leading-none">
          LEK LEARNING
        </span>
      </div>

      {verificationEmail ? (
        /* VERIFICATION CARD */
        <div className="max-w-md w-full bg-white border-4 border-gray-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 sm:p-8 rounded-none">
          <h2 className="text-2xl font-bold font-display uppercase tracking-wide mb-6">Verificar Cuenta</h2>
          
          <p className="text-xs font-sans text-gray-700 mb-6 leading-relaxed">
            Ingresa el código de 6 dígitos que hemos enviado a tu correo electrónico: <strong className="font-mono text-gray-950 font-bold select-all">{verificationEmail}</strong>
          </p>

          {error && (
            <div className="bg-[#dc2a36]/10 border-2 border-[#dc2a36] text-[#dc2a36] px-4 py-2.5 text-xs font-mono font-bold mb-6 rounded-none">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-700 px-4 py-2.5 text-xs font-mono font-bold mb-6 rounded-none">
              {success}
            </div>
          )}

          <form onSubmit={handleVerifySubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-700">Código de Verificación</label>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                disabled={loading}
                className="w-full bg-[#f3f4de]/50 border-2 border-gray-900 px-3 py-2 text-center text-lg font-mono font-bold tracking-widest focus:outline-none focus:bg-white rounded-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="w-full bg-[#dc2a36] hover:bg-[#c02030] disabled:bg-gray-400 text-white font-bold uppercase tracking-wider text-xs py-3 border-2 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all cursor-pointer mt-4 rounded-none"
            >
              {loading ? "Verificando..." : "Confirmar Código →"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col gap-3 text-center">
            <button
              onClick={handleResendCode}
              disabled={resendCooldown > 0 || loading}
              className="text-xs font-bold text-gray-750 hover:text-gray-950 hover:underline disabled:text-gray-400 bg-transparent border-none cursor-pointer"
            >
              {resendCooldown > 0 ? `Reenviar código en ${resendCooldown}s` : "Reenviar Código de Verificación"}
            </button>
            
            <button
              onClick={() => {
                setVerificationEmail("");
                setError("");
                setSuccess("");
              }}
              className="text-xs font-bold text-[#dc2a36] hover:underline bg-transparent border-none cursor-pointer"
            >
              ← Volver al Registro
            </button>
          </div>
        </div>
      ) : (
        /* REGISTER CARD */
        <div className="max-w-md w-full bg-white border-4 border-gray-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 sm:p-8 rounded-none">
          <h2 className="text-2xl font-bold font-display uppercase tracking-wide mb-6">Crear Cuenta</h2>

          {error && (
            <div className="bg-[#dc2a36]/10 border-2 border-[#dc2a36] text-[#dc2a36] px-4 py-2.5 text-xs font-mono font-bold mb-6 rounded-none">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-700 px-4 py-2.5 text-xs font-mono font-bold mb-6 rounded-none">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-700">Nombre de Usuario</label>
              <input
                type="text"
                placeholder="Tu Nombre"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="w-full bg-[#f3f4de]/50 border-2 border-gray-900 px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:bg-white rounded-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-700">Correo Electrónico</label>
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-[#f3f4de]/50 border-2 border-gray-900 px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:bg-white rounded-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-700">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full bg-[#f3f4de]/50 border-2 border-gray-900 pl-3 pr-10 py-2 text-xs font-mono font-bold focus:outline-none focus:bg-white rounded-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-[#dc2a36] cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-700">Confirmar Contraseña</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="w-full bg-[#f3f4de]/50 border-2 border-gray-900 pl-3 pr-10 py-2 text-xs font-mono font-bold focus:outline-none focus:bg-white rounded-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-[#dc2a36] cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {isMounted && !isLocalhost && (
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                onSuccess={(token) => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken(null)}
              />
            )}

            <button
              type="submit"
              disabled={loading || (isMounted && !isLocalhost && !captchaToken)}
              className="w-full bg-[#dc2a36] hover:bg-[#c02030] disabled:bg-gray-400 text-white font-bold uppercase tracking-wider text-xs py-3 border-2 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all cursor-pointer mt-4 rounded-none"
            >
              {loading ? "Registrando..." : "Registrar Cuenta →"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="font-bold text-[#dc2a36] hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
