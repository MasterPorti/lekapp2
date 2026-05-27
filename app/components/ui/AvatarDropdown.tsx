import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLekConfig, useAuth } from "../../hooks";
import { ConfigurationModal } from "../modals";
import { UnlockOverlay } from "../auth/UnlockOverlay";

interface AvatarDropdownProps {
  beigeBg?: boolean;
}

export const AvatarDropdown = ({ beigeBg = false }: AvatarDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { username, email } = useLekConfig();
  const { user, logout, isFreePlan } = useAuth();
  const [isUnlockOpen, setIsUnlockOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  const handleAction = (label: string) => {
    setIsOpen(false);
    if (label === "Configuración") {
      setIsConfigOpen(true);
    } else if (label === "Panel de Administración") {
      router.push("/admin");
    } else {
      alert(`Has hecho clic en: ${label} (Simulación)`);
    }
  };

  const displayUsername = user?.username || username || "Julio";
  const displayEmail = user?.email || email || "julio@lekrobotics.com";

  // Get initial letter of user name
  const avatarLetter = displayUsername ? displayUsername.trim().charAt(0).toUpperCase() : "J";

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      {/* Square Profile Avatar Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-8.5 h-8.5 ${
          beigeBg ? "bg-[#f3f4de]" : "bg-white"
        } border-2 border-[#dc2a36] shadow-sm hover:bg-[#dc2a36]/5 active:scale-95 flex items-center justify-center font-bold text-xs text-[#dc2a36] font-sans cursor-pointer transition-all focus:outline-none rounded-none select-none`}
        type="button"
        title="Menú de Usuario"
      >
        {avatarLetter}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-48 bg-[#f3f4de] border-2 border-gray-900 rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)] py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150 font-sans">
          {/* User Header */}
          <div className="px-4 py-2 border-b border-gray-300">
            <p className="text-xs font-bold text-gray-900 uppercase font-display tracking-wider truncate">{displayUsername}</p>
            <p className="text-[9px] font-mono text-gray-500 truncate">{displayEmail}</p>
          </div>

          {/* Options */}
          {user?.role === "admin" && (
            <button
              onClick={() => handleAction("Panel de Administración")}
              className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 hover:bg-[#dc2a36]/5 hover:text-gray-900 flex items-center gap-2 transition-all cursor-pointer rounded-none border-0 bg-transparent"
            >
              <svg className="w-3.5 h-3.5 text-[#dc2a36]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Admin Panel
            </button>
          )}
          {isFreePlan && (
            <button
              onClick={() => {
                setIsOpen(false);
                setIsUnlockOpen(true);
              }}
              className="w-full text-left px-4 py-2 text-xs font-bold text-amber-600 hover:bg-amber-500/10 flex items-center gap-2 transition-all cursor-pointer rounded-none border-0 bg-transparent"
            >
              <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Activar Kit Completo
            </button>
          )}
          <button
            onClick={() => handleAction("Mi Perfil")}
            className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 hover:bg-[#dc2a36]/5 hover:text-gray-900 flex items-center gap-2 transition-all cursor-pointer rounded-none border-0 bg-transparent"
          >
            <svg className="w-3.5 h-3.5 text-[#dc2a36]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Mi Perfil
          </button>

          <button
            onClick={() => handleAction("Configuración")}
            className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 hover:bg-[#dc2a36]/5 hover:text-gray-900 flex items-center gap-2 transition-all cursor-pointer rounded-none border-0 bg-transparent"
          >
            <svg className="w-3.5 h-3.5 text-[#dc2a36]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configuración
          </button>

          <button
            onClick={() => handleAction("Mis Kits de Robótica")}
            className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 hover:bg-[#dc2a36]/5 hover:text-gray-900 flex items-center gap-2 transition-all cursor-pointer rounded-none border-0 bg-transparent"
          >
            <svg className="w-3.5 h-3.5 text-[#dc2a36]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Mis Kits
          </button>

          {/* Divider */}
          <div className="border-t border-gray-300 my-1" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-xs font-bold text-[#dc2a36] hover:bg-[#dc2a36]/10 flex items-center gap-2 transition-all cursor-pointer rounded-none border-0 bg-transparent"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      )}

      {/* Configuration Modal */}
      <ConfigurationModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />

      {isUnlockOpen && (
        <UnlockOverlay 
          onUnlocked={() => {
            setIsUnlockOpen(false);
            window.location.reload();
          }} 
        />
      )}
    </div>
  );
};

