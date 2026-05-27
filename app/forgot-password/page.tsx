"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  
  const [step, setStep] = useState<1 | 2>(1); // 1: request code, 2: reset password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Por favor, ingresa tu correo electrónico");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al enviar código");
      }
      setSuccess("Si tu correo está registrado, se habrá enviado un código de seguridad.");
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Error al procesar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (code.trim().length !== 6) {
      setError("El código debe tener 6 dígitos");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim(),
          newPassword: newPassword
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al restablecer contraseña");
      }
      setSuccess("¡Contraseña restablecida con éxito! Redirigiendo al login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Error al restablecer contraseña");
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

      {/* CARD */}
      <div className="max-w-md w-full bg-white border-4 border-gray-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 sm:p-8 rounded-none">
        <h2 className="text-2xl font-bold font-display uppercase tracking-wide mb-2">Restablecer Clave</h2>
        <p className="text-xs text-gray-500 mb-6">Recupera el acceso a tu cuenta mediante un código por correo.</p>

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

        {step === 1 ? (
          /* STEP 1: REQUEST CODE */
          <form onSubmit={handleRequestCode} className="flex flex-col gap-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#dc2a36] hover:bg-[#c02030] disabled:bg-gray-400 text-white font-bold uppercase tracking-wider text-xs py-3 border-2 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all cursor-pointer mt-2 rounded-none"
            >
              {loading ? "Enviando..." : "Enviar Código de Seguridad →"}
            </button>
          </form>
        ) : (
          /* STEP 2: VERIFY & RESET */
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <p className="text-xs text-gray-700 bg-gray-50 border border-gray-300 p-2 font-mono rounded-none">
              Correo: <strong className="text-gray-900">{email}</strong>
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-700">Código de 6 dígitos</label>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                disabled={loading}
                className="w-full bg-[#f3f4de]/50 border-2 border-gray-900 px-3 py-2 text-center text-lg font-mono font-bold tracking-widest focus:outline-none focus:bg-white rounded-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-700">Nueva Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-[#f3f4de]/50 border-2 border-gray-900 px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:bg-white rounded-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-700">Confirmar Nueva Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-[#f3f4de]/50 border-2 border-gray-900 px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:bg-white rounded-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-[#dc2a36] hover:bg-[#c02030] disabled:bg-gray-400 text-white font-bold uppercase tracking-wider text-xs py-3 border-2 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all cursor-pointer mt-2 rounded-none"
            >
              {loading ? "Restableciendo..." : "Cambiar Contraseña →"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError("");
                setSuccess("");
              }}
              className="text-xs font-bold text-gray-500 hover:text-gray-900 hover:underline mt-2 bg-transparent border-none cursor-pointer"
            >
              ← Cambiar correo electrónico
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <Link href="/login" className="text-xs font-bold text-[#dc2a36] hover:underline">
            Volver al Inicio de Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
