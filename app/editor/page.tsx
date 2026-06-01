"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBlockManagement, useCanvasControls, useAuth } from "../hooks";
import { LekLogo, PlacedBlock, PlacingBlockComponent } from "../components/canvas";
import { BlockSelectorModal, ParamSelectorModal, ControlSimulatorModal } from "../components/modals";
import { ZoomControls, UndoButton, BottomButtons, ActionButtons } from "../components/ui";
import { generateRandomName } from "../utils/randomNames";
import { UnlockOverlay } from "../components/auth/UnlockOverlay";

export default function EditorPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, needsActivation, isFreePlan } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showControlModal, setShowControlModal] = useState(false);
  const [activeButton, setActiveButton] = useState<string>("programacion");
  const [activeCategory, setActiveCategory] = useState<string>("eventos");
  const [showDesktopWarning, setShowDesktopWarning] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const {
    placedBlocks,
    setPlacedBlocks,
    placingBlock,
    setPlacingBlock,
    blockPosition,
    rawBlockPosition,
    setBlockPosition,
    editingBlockId,
    setEditingBlockId,
    paramSelector,
    setParamSelector,
    numberInput,
    setNumberInput,
    alertMessage,
    setAlertMessage,
    undoState,
    getConnectedBlocksBelow,
    findSnapPosition,
    handleUndo,
    handleBlockLongPressStart,
    handleBlockLongPressEnd,
    handleDeleteBlock,
    handleCancelEdit,
    handleConfirmEdit,
    handleEditBlockMove,
    handleParamSelect,
    handleConfirmBlock,
    handleCancelBlock,
  } = useBlockManagement();

  const {
    zoom,
    pan,
    handleZoomIn,
    handleZoomOut,
    handleNextBlock,
    handlePinch,
    handlePinchEnd,
    isContentOffScreen,
    handleCenterScreen,
    handleCanvasPan,
    handleCanvasTouchPan,
  } = useCanvasControls({
    placedBlocks,
    placingBlock,
    blockPosition,
    onCanvasClick: handleCancelEdit,
  });

  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Proyectos / Files logic
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeProjectName, setActiveProjectName] = useState<string>("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [isSavedInDb, setIsSavedInDb] = useState(false);

  const createNewProject = () => {
    if (isFreePlan) {
      alert("La creación de nuevos LekCodes está restringida en el plan gratis. ¡Ingresa tu código de kit LEK para desbloquear todos los accesos!");
      return;
    }
    const newId = "proj-" + Math.random().toString(36).substring(2, 9);
    const newName = generateRandomName();
    setActiveProjectId(newId);
    setActiveProjectName(newName);
    setPlacedBlocks([]);
    setIsSavedInDb(false);
    
    // Update URL search parameters to sync the state without reloading
    const newUrl = window.location.pathname + `?id=${newId}`;
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
  };

  const handleRenameSave = async () => {
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== activeProjectName) {
      setActiveProjectName(trimmed);
      if (isSavedInDb || placedBlocks.length > 0) {
        await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: activeProjectId, name: trimmed, blocks: placedBlocks })
        })
        .then(() => {
          setIsSavedInDb(true);
        })
        .catch(err => console.error("Error renaming project:", err));
      }
    }
    setIsEditingName(false);
  };

  // Initial load
  useEffect(() => {
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobileDevice(isMobileUA);

    if (!isAuthenticated) return;
    const init = async () => {
      try {
        const res = await fetch("/api/projects");
        const list = await res.json();
        
        const params = new URLSearchParams(window.location.search);
        const urlProjId = params.get("id");
        
        if (urlProjId) {
          const found = list.find((p: any) => p.id === urlProjId);
          if (found) {
            setActiveProjectId(found.id);
            setActiveProjectName(found.name);
            setPlacedBlocks(found.blocks || []);
            setIsSavedInDb(true);
            return;
          } else {
            // New in-memory project
            setActiveProjectId(urlProjId);
            const newName = generateRandomName();
            setActiveProjectName(newName);
            setPlacedBlocks([]);
            setIsSavedInDb(false);
            return;
          }
        }
        
        // Fallback to latest project
        if (list && list.length > 0) {
          const sorted = list.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          const latest = sorted[0];
          setActiveProjectId(latest.id);
          setActiveProjectName(latest.name);
          setPlacedBlocks(latest.blocks || []);
          setIsSavedInDb(true);
          
          // Update URL search parameters to sync the state without reloading
          const newUrl = window.location.pathname + `?id=${latest.id}`;
          window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
        } else {
          createNewProject();
        }
      } catch (err) {
        console.error("Error initial loading:", err);
        createNewProject();
      }
    };
    init();

    // Check if the user is on a desktop computer
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isCpu = !isMobileUA && !hasTouch;

    const dismissed = sessionStorage.getItem("desktop-warning-dismissed");
    if (isCpu && !dismissed) {
      setShowDesktopWarning(true);
    }
  }, [isAuthenticated]);

  // Auto-save effect
  useEffect(() => {
    if (!isAuthenticated || !activeProjectId || !activeProjectName) return;
    
    // Only save if it has been saved before OR if we have blocks!
    if (!isSavedInDb && placedBlocks.length === 0) return;

    const timer = setTimeout(() => {
      fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeProjectId,
          name: activeProjectName,
          blocks: placedBlocks
        })
      })
      .then(() => {
        setIsSavedInDb(true);
      })
      .catch(err => console.error("Error auto-saving project:", err));
    }, 500);

    return () => clearTimeout(timer);
  }, [placedBlocks, activeProjectId, activeProjectName, isSavedInDb, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    document.documentElement.classList.add("canvas-page-lock");
    document.body.classList.add("canvas-page-lock");
    return () => {
      document.documentElement.classList.remove("canvas-page-lock");
      document.body.classList.remove("canvas-page-lock");
    };
  }, [isAuthenticated]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f3f4de] flex items-center justify-center font-mono text-xs text-gray-500">
        Cargando editor LekCode...
      </div>
    );
  }

  const handleBlockClick = (
    type: string,
    text: string,
    color: string,
    stroke: string,
    param?: string
  ) => {
    setShowModal(false);
    setActiveButton("programacion");
    setBlockPosition({ x: -pan.x / zoom, y: -pan.y / zoom });
    setPlacingBlock({ type, text, color, stroke, param });
  };

  const handleBloquesClick = () => {
    setEditingBlockId(null);
    setPlacingBlock(null);
    setParamSelector(null);
    setActiveButton("bloques");
    setShowModal(true);
  };

  const handleProgramacionClick = () => {
    setActiveButton("programacion");
    setShowModal(false);
  };

  const handlePlacingBlockParamClick = (
    type: "icon" | "number" | "motor-icon" | "motor-percent",
    color?: "blue" | "orange"
  ) => {
    setParamSelector({ target: "placing", type, color });
    if (type === "number" || type === "motor-percent") {
      if (placingBlock?.param) {
        const value = type === "motor-percent"
          ? placingBlock.param.split(":")[1] || "100"
          : placingBlock.param;
        setNumberInput(value);
      }
    }
  };

  const handlePlacedBlockParamClick = (
    id: string,
    type: "icon" | "number" | "motor-icon" | "motor-percent",
    color?: "blue" | "orange"
  ) => {
    setParamSelector({ target: id, type, color });
    if (type === "number" || type === "motor-percent") {
      const block = placedBlocks.find(b => b.id === id);
      if (block?.param) {
        const value = type === "motor-percent"
          ? block.param.split(":")[1] || "100"
          : block.param;
        setNumberInput(value);
      }
    }
  };

  const handlePlacingBlockMove = (rawX: number, rawY: number) => {
    if (placingBlock) {
      const shiftX = blockPosition.x - rawBlockPosition.x;
      const shiftY = blockPosition.y - rawBlockPosition.y;

      const correctedX = rawX - shiftX;
      const correctedY = rawY - shiftY;

      const snapped = findSnapPosition(
        correctedX,
        correctedY,
        placingBlock.type,
        [],
        placingBlock.children?.length || 0,
        placingBlock.text
      );
      setBlockPosition({ x: snapped.x, y: snapped.y });
    }
  };

  const contentOffScreen = isContentOffScreen();
  const hasEventoBlocks = placedBlocks.some((b) => b.type === "evento");

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-between h-dvh py-8 overflow-hidden text-white font-mono select-none">
      {showModal && (
        <BlockSelectorModal
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          onBlockClick={handleBlockClick}
          onClose={handleProgramacionClick}
        />
      )}

      <div
        ref={canvasRef}
        className={`flex-1 w-full overflow-hidden relative ${
          showModal ? "invisible" : ""
        }`}
        onMouseDown={handleCanvasPan}
        onTouchStart={handleCanvasTouchPan}
        onTouchMove={handlePinch}
        onTouchEnd={handlePinchEnd}
      >
        {/* Botones de Acción Superiores */}
        <div 
          className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 pointer-events-auto flex-none">
            <button
              type="button"
              className="w-10 h-10 bg-zinc-800/80 border border-zinc-700/50 backdrop-blur-md rounded-full flex items-center justify-center text-zinc-300 hover:bg-zinc-700 hover:text-white active:scale-95 transition-all shadow-lg cursor-pointer flex-none"
              onClick={() => router.push("/")}
              title="Atrás"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setShowDebugPanel(true)}
              className="w-10 h-10 bg-zinc-800/80 border border-zinc-700/50 backdrop-blur-md rounded-full flex items-center justify-center text-lg hover:bg-zinc-700 hover:text-white active:scale-95 transition-all shadow-lg cursor-pointer flex-none select-none"
              title="Panel de depuración"
            >
              🐛
            </button>
          </div>

          {/* Centered Tinkercad-style Project Name */}
          <div className="flex-1 flex justify-center px-4 max-w-[calc(100%-120px)] pointer-events-auto">
            {isEditingName ? (
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={handleRenameSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameSave();
                  if (e.key === "Escape") setIsEditingName(false);
                }}
                autoFocus
                className="bg-zinc-900 border border-orange-500/50 text-white font-mono text-xs px-3 py-1.5 rounded-xl text-center outline-none w-full max-w-[200px] shadow-lg shadow-orange-500/10"
              />
            ) : (
              <div
                onClick={() => {
                  setNameInput(activeProjectName);
                  setIsEditingName(true);
                }}
                className="px-4 py-1.5 bg-zinc-900/80 border border-zinc-800 hover:border-orange-500/30 hover:text-orange-400 rounded-xl font-mono text-xs text-zinc-300 flex items-center gap-2 cursor-pointer transition-all shadow-md active:scale-98 select-none"
                title="Haz clic para renombrar"
              >
                <span>{activeProjectName || "Cargando..."}</span>
                <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                </svg>
              </div>
            )}
          </div>

          <button
            type="button"
            className="w-10 h-10 bg-zinc-800/80 border border-zinc-700/50 backdrop-blur-md rounded-full flex items-center justify-center text-zinc-300 hover:bg-zinc-700 hover:text-white active:scale-95 transition-all pointer-events-auto shadow-lg cursor-pointer flex-none"
            onClick={() => setShowControlModal(true)}
            title="Control"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="6" width="18" height="12" rx="3" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 12h4M9 10v4M15 12h.01M17 10h.01" />
            </svg>
          </button>
        </div>

        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          <LekLogo />

          {placedBlocks.map((block, index) => {
            const isBeingEdited =
              editingBlockId !== null &&
              getConnectedBlocksBelow(editingBlockId).includes(block.id);
            return (
              <PlacedBlock
                key={block.id}
                block={block}
                index={index}
                isBeingEdited={isBeingEdited}
                zoom={zoom}
                onLongPressStart={handleBlockLongPressStart}
                onLongPressEnd={handleBlockLongPressEnd}
                onEditMove={handleEditBlockMove}
                onParamClick={handlePlacedBlockParamClick}
              />
            );
          })}

          {placingBlock && (
            <PlacingBlockComponent
              block={placingBlock}
              position={blockPosition}
              zoom={zoom}
              onMove={handlePlacingBlockMove}
              onParamClick={handlePlacingBlockParamClick}
            />
          )}
        </div>

        <ZoomControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onNextBlock={handleNextBlock}
          showNextBlockButton={hasEventoBlocks}
          showTrash={editingBlockId !== null}
          onTrashClick={handleDeleteBlock}
        />

        {contentOffScreen && (
          <button
            type="button"
            onClick={handleCenterScreen}
            className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-zinc-700 text-zinc-300 font-mono text-xs cursor-pointer rounded animate-expand-x z-30 border border-zinc-600"
          >
            {placedBlocks.length > 0
              ? "Volver a ultimo evento"
              : "Centrar pantalla"}
          </button>
        )}
      </div>

      {paramSelector && (
        <ParamSelectorModal
          type={paramSelector.type}
          color={paramSelector.color}
          numberValue={numberInput}
          onNumberChange={setNumberInput}
          onSelect={handleParamSelect}
          onClose={() => setParamSelector(null)}
        />
      )}

      {placingBlock && !paramSelector && (
        <ActionButtons
          onCancel={handleCancelBlock}
          onConfirm={handleConfirmBlock}
        />
      )}

      {editingBlockId !== null && !paramSelector && (
        <ActionButtons
          onCancel={handleCancelEdit}
          onConfirm={handleConfirmEdit}
        />
      )}

      {undoState && !editingBlockId && !placingBlock && (
        <UndoButton
          timeLeft={undoState.timeLeft}
          totalTime={4000}
          onUndo={handleUndo}
        />
      )}

      <BottomButtons
        activeButton={activeButton}
        onProgramacionClick={() => {
          handleProgramacionClick();
        }}
        onBloquesClick={() => {
          handleBloquesClick();
        }}
      />

      {alertMessage && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setAlertMessage(null)} 
          />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center gap-4 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center text-2xl font-bold">
              ⚠️
            </div>
            <h3 className="text-white font-mono font-bold text-lg">¡Límite alcanzado!</h3>
            <p className="text-zinc-400 font-mono text-sm leading-relaxed">{alertMessage}</p>
            <button
              type="button"
              onClick={() => setAlertMessage(null)}
              className="w-full mt-2 py-2.5 bg-yellow-500 hover:bg-yellow-400 active:scale-[0.98] text-black font-mono font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-yellow-500/20"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {showControlModal && (
        <ControlSimulatorModal
          isOpen={showControlModal}
          onClose={() => setShowControlModal(false)}
          placedBlocks={placedBlocks}
        />
      )}

      {/* Desktop optimization warning modal */}
      {showDesktopWarning && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
            onClick={() => {
              setShowDesktopWarning(false);
              sessionStorage.setItem("desktop-warning-dismissed", "true");
            }} 
          />
          <div className="relative bg-zinc-950 border border-red-950/80 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center gap-5 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-red-950/30 border border-red-900/30 text-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-950/20">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h3 className="text-white font-mono font-bold text-base uppercase tracking-wider">
              Experiencia Móvil
            </h3>
            
            <p className="text-zinc-400 font-sans text-xs sm:text-sm leading-relaxed">
              Puedes usar LekCode en ordenador, pero la experiencia está optimizada para teléfonos móviles y pantallas táctiles. Estamos trabajando en una versión de escritorio.
            </p>
            
            <button
              type="button"
              onClick={() => {
                setShowDesktopWarning(false);
                sessionStorage.setItem("desktop-warning-dismissed", "true");
              }}
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-red-900/40 text-red-500 font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-red-950/20 active:scale-[0.98]"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Mobile orientation landscape blocker overlay */}
      {isMobileDevice && (
        <div className="fixed inset-0 z-[200] bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center select-none lg:hidden portrait:hidden landscape:flex">
          <div className="flex flex-col items-center gap-6 max-w-sm">
            {/* Rotating Phone SVG Icon in industrial red/black aesthetic */}
            <div className="w-20 h-20 flex items-center justify-center text-red-500 bg-red-950/20 border border-red-900/30 rounded-full shadow-lg shadow-red-900/10 relative">
              <svg className="w-12 h-12 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" className="origin-center animate-[spin_3s_ease-in-out_infinite]" />
                <path d="M21 12a9 9 0 0 1-9 9" />
                <path d="M21 12v-4h-4" />
              </svg>
              <div className="absolute inset-0 border border-red-500 rounded-full animate-ping opacity-10 pointer-events-none" />
            </div>
            
            <h2 className="text-red-500 font-mono font-bold text-lg tracking-widest uppercase">
              Gira tu dispositivo
            </h2>
            
            <p className="text-zinc-400 font-sans text-xs sm:text-sm leading-relaxed">
              LekCode está optimizado exclusivamente para su uso en modo vertical. Por favor, voltea tu teléfono.
            </p>
          </div>
        </div>
      )}

      {/* Modal del panel de depuración */}
      {showDebugPanel && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowDebugPanel(false)} 
          />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-white font-mono font-bold text-base flex items-center gap-2">
                <span>Panel de Depuración 🐛</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/10 text-yellow-500 rounded border border-yellow-500/20 font-normal">DEV</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowDebugPanel(false)}
                className="text-zinc-400 hover:text-white font-mono text-xs cursor-pointer select-none"
              >
                ✕ Cerrar
              </button>
            </div>

            <div className="flex flex-col gap-2 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-800/40">
                <span className="text-zinc-500">editingBlockId:</span>
                <span className="text-yellow-500 font-bold">{editingBlockId || "null"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/40">
                <span className="text-zinc-500">placingBlock (Colocando):</span>
                <span className={placingBlock ? "text-green-500 font-bold" : "text-zinc-400"}>
                  {placingBlock ? "true" : "false"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/40">
                <span className="text-zinc-500">Total Placed Blocks:</span>
                <span className="text-white font-bold">{placedBlocks.length}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-400 font-mono text-xs">Estado JSON de los bloques:</label>
              <textarea
                readOnly
                value={JSON.stringify(placedBlocks, null, 2)}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                className="w-full h-48 bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-[10px] text-zinc-300 focus:outline-none resize-none overflow-y-auto"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(placedBlocks, null, 2));
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
              }}
              className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 active:scale-[0.98] text-black font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
            >
              {isCopied ? "¡Copiado al Portapapeles! 🎉" : "Copiar Estado JSON"}
            </button>
          </div>
        </div>
      )}

      {needsActivation && <UnlockOverlay onUnlocked={() => window.location.reload()} />}
    </div>
  );
}
