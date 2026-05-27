import React, { useState } from "react";

interface Project {
  id: string;
  name: string;
  updatedAt: string;
}

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProjectId: string | null;
  projects: Project[];
  onLoadProject: (id: string) => void;
  onCreateProject: () => void;
  onDeleteProject: (id: string) => void;
  onRenameProject: (id: string, newName: string) => void;
}

export const ProjectManagerModal = ({
  isOpen,
  onClose,
  currentProjectId,
  projects,
  onLoadProject,
  onCreateProject,
  onDeleteProject,
  onRenameProject,
}: ProjectManagerModalProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState("");

  if (!isOpen) return null;

  const handleStartRename = (project: Project) => {
    setEditingId(project.id);
    setRenameInput(project.name);
  };

  const handleSaveRename = (id: string) => {
    const trimmed = renameInput.trim();
    if (trimmed) {
      onRenameProject(id, trimmed);
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      <div className="relative bg-[#f3f4de] border border-[#dc2a36]/20 rounded-none p-6 max-w-lg w-full shadow-2xl flex flex-col gap-6 max-h-[85vh] overflow-hidden animate-in fade-in zoom-in duration-200 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5 text-[#dc2a36] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <h3 className="text-gray-900 font-bold text-base uppercase tracking-wider font-display">Mis LekCodes</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 bg-zinc-200 hover:bg-zinc-300 active:scale-95 text-gray-700 hover:text-gray-900 rounded-none flex items-center justify-center transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Create New Code Button */}
        <button
          type="button"
          onClick={() => {
            onCreateProject();
            onClose();
          }}
          className="w-full py-3 bg-[#dc2a36] hover:bg-[#c02030] active:scale-[0.98] text-white font-bold rounded-none transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#dc2a36]/20 uppercase tracking-wider text-xs"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Crear LekCode
        </button>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
            LekCodes Recientes ({projects.length})
          </span>
          {projects.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-gray-300 rounded-none bg-white/40">
              <p className="text-xs text-gray-500 font-mono">No tienes LekCodes guardados aún.</p>
            </div>
          ) : (
            projects.map((project) => {
              const isCurrent = project.id === currentProjectId;
              const isEditing = editingId === project.id;
              
              return (
                <div
                  key={project.id}
                  className={`p-4 border rounded-none flex items-center justify-between transition-all gap-4 ${
                    isCurrent
                      ? "bg-[#dc2a36]/5 border-[#dc2a36]/30"
                      : "bg-white border-gray-200 hover:border-[#dc2a36]/40"
                  }`}
                >
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={renameInput}
                        onChange={(e) => setRenameInput(e.target.value)}
                        onBlur={() => handleSaveRename(project.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveRename(project.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        autoFocus
                        className="bg-white border border-[#dc2a36]/50 text-gray-900 font-sans text-xs px-2.5 py-1 rounded-none outline-none w-full max-w-[200px]"
                      />
                    ) : (
                      <span className="text-xs font-bold text-gray-900 truncate block">
                        {project.name} {isCurrent && <span className="text-[9px] px-1.5 py-0.5 rounded-none bg-[#dc2a36]/10 text-[#dc2a36] border border-[#dc2a36]/20 ml-1.5 uppercase font-normal">Activo</span>}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-500 font-sans">
                      Modificado: {new Date(project.updatedAt).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-none">
                    {!isCurrent && !isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          onLoadProject(project.id);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-[#dc2a36] hover:bg-[#c02030] active:scale-95 text-white text-[11px] font-bold rounded-none transition-all cursor-pointer uppercase tracking-wider shadow-sm"
                      >
                        Abrir
                      </button>
                    )}
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => handleStartRename(project)}
                        className="p-1.5 bg-zinc-200 hover:bg-zinc-300 active:scale-95 text-gray-600 hover:text-gray-900 rounded-none transition-all cursor-pointer"
                        title="Renombrar"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                        </svg>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDeleteProject(project.id)}
                      className="p-1.5 bg-zinc-200 hover:bg-red-500/10 hover:text-red-600 active:scale-95 text-gray-500 rounded-none transition-all cursor-pointer"
                      title="Eliminar"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
