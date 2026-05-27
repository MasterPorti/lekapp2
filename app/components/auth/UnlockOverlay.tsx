import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

interface UnlockOverlayProps {
  onUnlocked: () => void;
}

export const UnlockOverlay: React.FC<UnlockOverlayProps> = ({ onUnlocked }) => {
  const { unlock, logout } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUnlockCode = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalCode = code.trim();
    if (!finalCode) {
      setError("Por favor, ingresa un código de kit LEK");
      return;
    }

    // Prepend LEK- if not already present
    if (!finalCode.toUpperCase().startsWith("LEK-")) {
      finalCode = `LEK-${finalCode}`;
    }

    setLoading(true);
    setError("");
    try {
      await unlock(finalCode, false);
      onUnlocked();
    } catch (err: any) {
      setError(err.message || "Código inválido. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleFreePlan = async () => {
    setLoading(true);
    setError("");
    try {
      await unlock(null, true);
      onUnlocked();
    } catch (err: any) {
      setError(err.message || "Error al activar plan gratis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#f3f4de] border-4 border-gray-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] max-w-md md:max-w-3xl w-full p-6 sm:p-8 rounded-none text-gray-900 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#dc2a36] border-2 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] text-white mb-4 rounded-none">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold font-display uppercase tracking-wide text-gray-900">Activa tu LEK</h2>
          <p className="text-xs text-gray-600 mt-2 max-w-lg mx-auto">
            Para continuar, debes ingresar el código de activación de tu kit o seleccionar el plan de acceso limitado.
          </p>
        </div>

        {error && (
          <div className="bg-[#dc2a36]/10 border-2 border-[#dc2a36] text-[#dc2a36] px-4 py-2.5 text-xs font-mono font-bold rounded-none">
            {error}
          </div>
        )}

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Option A: Kit Code */}
          <form onSubmit={handleUnlockCode} className="flex flex-col justify-between gap-4 p-5 bg-white border-2 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] min-h-[220px]">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono font-bold bg-[#dc2a36] text-white px-2 py-0.5 self-start uppercase tracking-wider">
                Opción A: Kit LEK Completo
              </span>
              <h3 className="text-sm font-bold text-gray-900 mt-1">Ingresa tu código LEK</h3>
              <p className="text-[11px] text-gray-500">Desbloquea todos los cursos y el entorno de programación LekCode.</p>
              
              <div className="flex border-2 border-gray-900 bg-[#f3f4de]/50 mt-2">
                <span className="bg-gray-900 text-white font-mono font-bold px-3 py-2 text-xs flex items-center select-none border-r-2 border-gray-900">
                  LEK-
                </span>
                <input
                  type="text"
                  placeholder="XXXX-XXX"
                  value={code}
                  onChange={(e) => {
                    let val = e.target.value.toUpperCase();
                    // Strip LEK- or LEK prefix if the user typed/pasted it
                    if (val.startsWith("LEK-")) {
                      val = val.substring(4);
                    } else if (val.startsWith("LEK")) {
                      val = val.substring(3);
                    }
                    // Allow only letters, numbers, and hyphens
                    val = val.replace(/[^A-Z0-9-]/g, "");
                    setCode(val);
                  }}
                  disabled={loading}
                  className="w-full bg-transparent px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider focus:outline-none focus:bg-white rounded-none border-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#dc2a36] hover:bg-[#c02030] disabled:bg-gray-400 text-white font-bold uppercase tracking-wider text-xs py-2.5 border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all cursor-pointer rounded-none mt-auto"
            >
              {loading ? "Validando..." : "Activar Kit Completo →"}
            </button>
          </form>

          {/* Option B: Free Plan */}
          <div className="flex flex-col justify-between gap-4 p-5 bg-white border-2 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] min-h-[220px]">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono font-bold bg-gray-900 text-white px-2 py-0.5 self-start uppercase tracking-wider">
                Opción B: Plan de Acceso Libre
              </span>
              <h3 className="text-sm font-bold text-gray-900 mt-1">Plan Gratis</h3>
              <p className="text-[11px] text-gray-500">
                Accede únicamente al primer curso <strong>"Arma tu Lek 2"</strong>. Los otros cursos y la creación de códigos LekCode permanecerán bloqueados.
              </p>
            </div>

            <button
              onClick={handleFreePlan}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-100 text-gray-900 font-bold uppercase tracking-wider text-xs py-2.5 border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all cursor-pointer rounded-none mt-auto"
            >
              Activar Plan Gratis
            </button>
          </div>
        </div>

        {/* Logout Link */}
        <button
          onClick={logout}
          className="text-xs font-bold text-[#dc2a36] hover:underline self-center bg-transparent border-none cursor-pointer mt-2"
        >
          Cerrar Sesión
        </button>

      </div>
    </div>
  );
};
