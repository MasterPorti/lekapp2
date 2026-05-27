import React, { useState, useEffect } from "react";
import { useLekConfig } from "../../hooks";

interface ConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConfigurationModal = ({ isOpen, onClose }: ConfigurationModalProps) => {
  const { username, email, soundEffects, autoSave, notifications, themeColor, updateConfig } = useLekConfig();

  // Local state for form fields
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formSounds, setFormSounds] = useState(true);
  const [formAutoSave, setFormAutoSave] = useState(true);
  const [formNotifications, setFormNotifications] = useState(true);
  const [formTheme, setFormTheme] = useState("red");

  // Sync state when modal opens/config loads
  useEffect(() => {
    if (isOpen) {
      setFormName(username);
      setFormEmail(email);
      setFormSounds(soundEffects);
      setFormAutoSave(autoSave);
      setFormNotifications(notifications);
      setFormTheme(themeColor || "red");
    }
  }, [isOpen, username, email, soundEffects, autoSave, notifications, themeColor]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("El nombre de usuario no puede estar vacío");
      return;
    }
    updateConfig({
      username: formName.trim(),
      email: formEmail.trim(),
      soundEffects: formSounds,
      autoSave: formAutoSave,
      notifications: formNotifications,
      themeColor: formTheme,
    });
    onClose();
  };

  const themeColors = [
    { id: "red", name: "Rojo Lek", hex: "#dc2a36" },
    { id: "blue", name: "Azul Cyber", hex: "#2563eb" },
    { id: "green", name: "Verde Ácido", hex: "#16a34a" },
    { id: "purple", name: "Púrpura Neon", hex: "#7c3aed" },
    { id: "yellow", name: "Oro Retro", hex: "#d97706" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Modal Card */}
      <div className="relative bg-[#f3f4de] border-2 border-gray-900 rounded-none p-6 max-w-md w-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-150 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-gray-900">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#dc2a36] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-gray-900 font-bold text-sm uppercase tracking-wider font-display">Ajustes del Sistema</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 bg-white hover:bg-gray-100 active:scale-90 border border-gray-900 text-gray-900 rounded-none flex items-center justify-center transition-all cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)]"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          
          {/* Section: Perfil */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Perfil de Usuario</span>
            
            {/* Input Name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Nombre de Usuario</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                maxLength={30}
                placeholder="Escribe tu nombre"
                className="w-full px-3 py-2 bg-white border-2 border-gray-900 rounded-none text-xs font-bold text-gray-900 focus:outline-none focus:bg-[#dc2a36]/5 placeholder-gray-400 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              />
            </div>

            {/* Input Email */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Correo Electrónico</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                maxLength={50}
                placeholder="correo@ejemplo.com"
                className="w-full px-3 py-2 bg-white border-2 border-gray-900 rounded-none text-xs font-bold text-gray-900 focus:outline-none focus:bg-[#dc2a36]/5 placeholder-gray-400 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              />
            </div>
          </div>

          <div className="border-t border-gray-300 my-1" />

          {/* Section: Preferencias */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Preferencias y Sistema</span>

            {/* Auto Save Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-800">Guardado Automático</span>
                <span className="text-[10px] text-gray-500">Guarda tus proyectos en segundo plano</span>
              </div>
              <button
                type="button"
                onClick={() => setFormAutoSave(!formAutoSave)}
                className={`w-14 h-7 border-2 border-gray-900 rounded-none relative transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] active:scale-95 ${
                  formAutoSave ? "bg-[#16a34a]" : "bg-gray-300"
                }`}
              >
                <div 
                  className={`absolute top-0.5 bottom-0.5 w-5 bg-white border border-gray-900 transition-all ${
                    formAutoSave ? "right-0.5" : "left-0.5"
                  }`} 
                />
              </button>
            </div>

            {/* Sound Effects Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-800">Efectos de Sonido</span>
                <span className="text-[10px] text-gray-500">Reproduce sonidos en el simulador</span>
              </div>
              <button
                type="button"
                onClick={() => setFormSounds(!formSounds)}
                className={`w-14 h-7 border-2 border-gray-900 rounded-none relative transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] active:scale-95 ${
                  formSounds ? "bg-[#16a34a]" : "bg-gray-300"
                }`}
              >
                <div 
                  className={`absolute top-0.5 bottom-0.5 w-5 bg-white border border-gray-900 transition-all ${
                    formSounds ? "right-0.5" : "left-0.5"
                  }`} 
                />
              </button>
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-800">Notificaciones</span>
                <span className="text-[10px] text-gray-500">Alertas de logros y retos semanales</span>
              </div>
              <button
                type="button"
                onClick={() => setFormNotifications(!formNotifications)}
                className={`w-14 h-7 border-2 border-gray-900 rounded-none relative transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] active:scale-95 ${
                  formNotifications ? "bg-[#16a34a]" : "bg-gray-300"
                }`}
              >
                <div 
                  className={`absolute top-0.5 bottom-0.5 w-5 bg-white border border-gray-900 transition-all ${
                    formNotifications ? "right-0.5" : "left-0.5"
                  }`} 
                />
              </button>
            </div>

            {/* Theme Select (Brutalist Accent) */}
            <div className="flex flex-col gap-1.5 mt-1">
              <label className="text-xs font-bold text-gray-700">Tema de Acento</label>
              <div className="flex flex-wrap gap-2">
                {themeColors.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setFormTheme(theme.id)}
                    style={{ backgroundColor: theme.hex }}
                    className={`w-6 h-6 border-2 rounded-none transition-all active:scale-90 cursor-pointer ${
                      formTheme === theme.id 
                        ? "border-gray-900 scale-110 shadow-[2px_2px_0px_rgba(0,0,0,1)]" 
                        : "border-gray-900/30 opacity-70 hover:opacity-100"
                    }`}
                    title={theme.name}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-300 my-1" />

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-white hover:bg-gray-100 active:scale-95 border-2 border-gray-900 text-gray-900 font-bold text-xs uppercase tracking-wider rounded-none transition-all cursor-pointer shadow-[3px_3px_0px_rgba(0,0,0,1)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#dc2a36] hover:bg-[#c02030] active:scale-95 border-2 border-gray-900 text-white font-bold text-xs uppercase tracking-wider rounded-none transition-all cursor-pointer shadow-[3px_3px_0px_rgba(0,0,0,1)]"
            >
              Guardar Cambios
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
