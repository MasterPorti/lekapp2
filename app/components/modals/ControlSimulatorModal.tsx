import React, { useState, useEffect, useRef } from "react";
import { Block } from "../../types";
import { ParamIcon } from "../blocks/ParamIcon";

interface ControlSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  placedBlocks: Block[];
}

interface MotorState {
  speed: number;
  direction: "adelante" | "atras";
}

export const ControlSimulatorModal = ({
  isOpen,
  onClose,
  placedBlocks,
}: ControlSimulatorModalProps) => {
  const [motors, setMotors] = useState<Record<string, MotorState>>({
    TRIANGULO: { speed: 0, direction: "adelante" },
    CIRCULO: { speed: 0, direction: "adelante" },
    CUADRADO: { speed: 0, direction: "adelante" },
    X: { speed: 0, direction: "adelante" },
  });

  const [activeButtons, setActiveButtons] = useState<Record<string, boolean>>({
    TRIANGULO: false,
    CIRCULO: false,
    CUADRADO: false,
    X: false,
  });

  const activeExecutions = useRef<Record<string, { abort: boolean }>>({});
  const motorContributions = useRef<Record<string, Record<string, number>>>({});

  const updateMotorSpeeds = () => {
    const netMotors: Record<string, MotorState> = {
      TRIANGULO: { speed: 0, direction: "adelante" },
      CIRCULO: { speed: 0, direction: "adelante" },
      CUADRADO: { speed: 0, direction: "adelante" },
      X: { speed: 0, direction: "adelante" },
    };

    const sums: Record<string, number> = { TRIANGULO: 0, CIRCULO: 0, CUADRADO: 0, X: 0 };

    Object.values(motorContributions.current).forEach((contrib) => {
      Object.entries(contrib).forEach(([shape, value]) => {
        if (sums[shape] !== undefined) {
          sums[shape] += value;
        }
      });
    });

    Object.entries(sums).forEach(([shape, val]) => {
      const clampedVal = Math.max(-100, Math.min(100, val));
      if (clampedVal > 0) {
        netMotors[shape] = { speed: clampedVal, direction: "adelante" };
      } else if (clampedVal < 0) {
        netMotors[shape] = { speed: Math.abs(clampedVal), direction: "atras" };
      } else {
        netMotors[shape] = { speed: 0, direction: "adelante" };
      }
    });

    setMotors(netMotors);
  };

  const setContribution = (executionKey: string, shape: string, value: number) => {
    // Clear this motor's contribution from all other execution keys to act as an override
    Object.keys(motorContributions.current).forEach((key) => {
      if (key !== executionKey && motorContributions.current[key]) {
        delete motorContributions.current[key][shape];
      }
    });

    if (!motorContributions.current[executionKey]) {
      motorContributions.current[executionKey] = {};
    }
    motorContributions.current[executionKey][shape] = value;
    updateMotorSpeeds();
  };

  const clearContribution = (executionKey: string) => {
    if (motorContributions.current[executionKey]) {
      delete motorContributions.current[executionKey];
      updateMotorSpeeds();
    }
  };

  const [connectionState, setConnectionState] = useState<"disconnected" | "connecting" | "connected">("disconnected");

  const handleLinkDevice = () => {
    if (connectionState === "connected") {
      setConnectionState("disconnected");
    } else if (connectionState === "disconnected") {
      setConnectionState("connecting");
      setTimeout(() => {
        setConnectionState("connected");
      }, 2000);
    }
  };

  if (!isOpen) return null;

  const executeLoopChain = async (startBlockId: string, context: { abort: boolean }, executionKey: string) => {
    let currentId: string | undefined = startBlockId;
    while (currentId && !context.abort) {
      const block = placedBlocks.find((b) => b.id === currentId);
      if (!block) break;

      if (block.type === "movimiento" && block.text.includes("Detener todos los motores")) {
        motorContributions.current = {};
        updateMotorSpeeds();
      } else if (block.type === "movimiento" && block.text.includes("Detener motor") && block.param) {
        const shape = block.param;
        setContribution(executionKey, shape, 0);
      } else if (block.type === "movimiento" && block.text.includes("Motor") && block.param) {
        const [shape, speedStr] = block.param.split(":");
        const parsedSpeed = parseFloat(speedStr);
        const speed = isNaN(parsedSpeed) ? 100 : parsedSpeed;
        const direction = block.text.includes("Atras") ? "atras" : "adelante";
        setContribution(executionKey, shape, direction === "atras" ? -speed : speed);
      } else if (block.type === "movimiento" && block.text.includes("Avanzar todos") && block.param) {
        const parsedSpeed = parseFloat(block.param);
        const speed = isNaN(parsedSpeed) ? 100 : parsedSpeed;
        const direction = block.text.toLowerCase().includes("atras") ? "atras" : "adelante";
        const val = direction === "atras" ? -speed : speed;
        setContribution(executionKey, "TRIANGULO", val);
        setContribution(executionKey, "CIRCULO", val);
        setContribution(executionKey, "CUADRADO", val);
        setContribution(executionKey, "X", val);
      } else if (block.type === "control" && block.text.includes("Detener")) {
        motorContributions.current = {};
        updateMotorSpeeds();
      } else if (block.type === "control" && block.text.includes("Esperar") && block.param) {
        const parsedSeconds = parseFloat(block.param);
        const seconds = isNaN(parsedSeconds) ? 1 : parsedSeconds;
        await new Promise<void>((resolve) => {
          const start = Date.now();
          const timer = setInterval(() => {
            if (context.abort || Date.now() - start >= seconds * 1000) {
              clearInterval(timer);
              resolve();
            }
          }, 50);
        });
      } else if (block.type === "control-loop") {
        const parsedRepeats = parseInt(block.param || "1");
        const repeats = isNaN(parsedRepeats) ? 1 : parsedRepeats;
        const innerStart = block.childBlockId;
        if (innerStart) {
          for (let i = 0; i < repeats && !context.abort; i++) {
            await executeLoopChain(innerStart, context, executionKey);
          }
        }
      }

      currentId = block.nextBlockId;
    }
  };

  const runEventChain = async (eventType: string, param?: string) => {
    const startBlocks = placedBlocks.filter(
      (b) => {
        if (b.type !== "evento") return false;
        
        // Match "Al soltar todos los botones"
        if (eventType === "Al soltar todos los botones") {
          return b.text.toLowerCase().includes("soltar todos");
        }
        
        // Match "Al iniciar Lek 2"
        if (eventType === "Al iniciar Lek 2") {
          return b.text.toLowerCase().includes("iniciar lek");
        }
        
        // Standard matching
        return b.text.toLowerCase().includes(eventType.toLowerCase()) && b.param === param;
      }
    );

    for (const startBlock of startBlocks) {
      if (!startBlock.nextBlockId) continue;

      const executionKey = `${eventType}-${param || "all"}-${startBlock.id}`;
      if (activeExecutions.current[executionKey]) {
        activeExecutions.current[executionKey].abort = true;
      }
      const context = { abort: false };
      activeExecutions.current[executionKey] = context;

      // Start async execution
      (async () => {
        let currentId: string | undefined = startBlock.nextBlockId;
        while (currentId && !context.abort) {
          const block = placedBlocks.find((b) => b.id === currentId);
          if (!block) break;

          if (block.type === "movimiento" && block.text.includes("Detener todos los motores")) {
            motorContributions.current = {};
            updateMotorSpeeds();
          } else if (block.type === "movimiento" && block.text.includes("Detener motor") && block.param) {
            const shape = block.param;
            setContribution(executionKey, shape, 0);
          } else if (block.type === "movimiento" && block.text.includes("Motor") && block.param) {
            const [shape, speedStr] = block.param.split(":");
            const parsedSpeed = parseFloat(speedStr);
            const speed = isNaN(parsedSpeed) ? 100 : parsedSpeed;
            const direction = block.text.includes("Atras") ? "atras" : "adelante";
            setContribution(executionKey, shape, direction === "atras" ? -speed : speed);
          } else if (block.type === "movimiento" && block.text.includes("Avanzar todos") && block.param) {
            const parsedSpeed = parseFloat(block.param);
            const speed = isNaN(parsedSpeed) ? 100 : parsedSpeed;
            const direction = block.text.toLowerCase().includes("atras") ? "atras" : "adelante";
            const val = direction === "atras" ? -speed : speed;
            setContribution(executionKey, "TRIANGULO", val);
            setContribution(executionKey, "CIRCULO", val);
            setContribution(executionKey, "CUADRADO", val);
            setContribution(executionKey, "X", val);
          } else if (block.type === "control" && block.text.includes("Detener")) {
            motorContributions.current = {};
            updateMotorSpeeds();
          } else if (block.type === "control" && block.text.includes("Esperar") && block.param) {
            const parsedSeconds = parseFloat(block.param);
            const seconds = isNaN(parsedSeconds) ? 1 : parsedSeconds;
            await new Promise<void>((resolve) => {
              const start = Date.now();
              const timer = setInterval(() => {
                if (context.abort || Date.now() - start >= seconds * 1000) {
                  clearInterval(timer);
                  resolve();
                }
              }, 50);
            });
          } else if (block.type === "control-loop") {
            const parsedRepeats = parseInt(block.param || "1");
            const repeats = isNaN(parsedRepeats) ? 1 : parsedRepeats;
            const innerStart = block.childBlockId;
            if (innerStart) {
              for (let i = 0; i < repeats && !context.abort; i++) {
                await executeLoopChain(innerStart, context, executionKey);
              }
            }
          }

          currentId = block.nextBlockId;
        }
        
        if (context.abort) {
          clearContribution(executionKey);
        }
        delete activeExecutions.current[executionKey];
      })();
    }
  };

  useEffect(() => {
    runEventChain("Al iniciar Lek 2");
    return () => {
      // Abort all running chains
      Object.values(activeExecutions.current).forEach((exec) => {
        exec.abort = true;
      });
    };
  }, []);

  const handleButtonPress = (param: string) => {
    setActiveButtons((prev) => ({ ...prev, [param]: true }));
    runEventChain("Al presionar", param);
    runEventChain("Mientras se presiona", param);
  };

  const handleButtonRelease = (param: string) => {
    setActiveButtons((prev) => ({ ...prev, [param]: false }));

    // Abort "Mientras se presiona" chains for this button
    const mientrasBlocks = placedBlocks.filter(
      (b) =>
        b.type === "evento" &&
        b.text.toLowerCase().includes("mientras") &&
        b.param === param
    );

    mientrasBlocks.forEach((startBlock) => {
      const executionKey = `Mientras se presiona-${param}-${startBlock.id}`;
      if (activeExecutions.current[executionKey]) {
        activeExecutions.current[executionKey].abort = true;
      }
      clearContribution(executionKey);
    });

    // Run "Al soltar" chains
    runEventChain("Al soltar", param);

    // Run "Al soltar todos los botones" if all buttons are now released
    const nextActiveButtons = { ...activeButtons, [param]: false };
    const allReleased = !Object.values(nextActiveButtons).some((val) => val === true);
    if (allReleased) {
      runEventChain("Al soltar todos los botones");
    }
  };

  // Find all programmed event actions in workspace to display them
  const programmedEvents = placedBlocks.filter((b) => b.type === "evento");

  const getMotorBadgeColor = (shape: string) => {
    switch (shape) {
      case "TRIANGULO":
        return "bg-green-600 border-green-500 text-white";
      case "CIRCULO":
        return "bg-red-600 border-red-500 text-white";
      case "CUADRADO":
        return "bg-blue-600 border-blue-500 text-white";
      case "X":
        return "bg-purple-600 border-purple-500 text-white";
      default:
        return "bg-zinc-700 border-zinc-600";
    }
  };

  const renderWheel = (label: string, shape: string, motor: MotorState) => {
    const isSpinning = motor.speed > 0;
    // Map speed to animation duration: 100% -> 0.2s, 10% -> 2s
    const spinDuration = isSpinning ? `${2 / (motor.speed / 10)}s` : "0s";
    const spinDirection = motor.direction === "atras" ? "reverse" : "normal";

    const spinStyle = isSpinning
      ? {
          animation: "spin linear infinite",
          animationDuration: spinDuration,
          animationDirection: spinDirection as any,
          transformOrigin: "50px 50px",
        }
      : {};

    return (
      <div className="w-20 h-[112px] sm:w-24 sm:h-[136px] flex flex-col items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 bg-zinc-900/60 border border-zinc-800/80 rounded-xl select-none flex-none">
        <span className="text-[9px] sm:text-xs font-mono text-zinc-400 font-bold uppercase tracking-wider">{label}</span>
        <svg className="w-16 h-16 sm:w-20 sm:h-20" viewBox="0 0 100 100">
          {/* Tire ring */}
          <circle cx="50" cy="50" r="44" fill="#0f0f11" stroke="#27272a" strokeWidth="6" />
          <circle cx="50" cy="50" r="38" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
          
          {/* Rotatable wheel spokes/treads */}
          <g style={spinStyle}>
            {/* Treads */}
            <circle cx="50" cy="50" r="28" fill="none" stroke="#27272a" strokeWidth="3" strokeDasharray="6 6" />
            <line x1="50" y1="12" x2="50" y2="88" stroke="#27272a" strokeWidth="5" />
            <line x1="12" y1="50" x2="88" y2="50" stroke="#27272a" strokeWidth="5" />
            <line x1="23" y1="23" x2="77" y2="77" stroke="#27272a" strokeWidth="3" />
            <line x1="77" y1="23" x2="23" y2="77" stroke="#27272a" strokeWidth="3" />
          </g>

          {/* Hub center colored by shape */}
          <circle
            cx="50"
            cy="50"
            r="18"
            className={
              shape === "TRIANGULO"
                ? "fill-green-600"
                : shape === "CIRCULO"
                ? "fill-red-600"
                : shape === "CUADRADO"
                ? "fill-blue-600"
                : "fill-purple-600"
            }
          />
          {/* Small inner shape icon */}
          <g transform="translate(41, 41)">
            <ParamIcon param={shape} size={18} />
          </g>
        </svg>

        <div className="flex flex-col items-center font-mono mt-0.5 sm:mt-1 text-[8px] sm:text-[10px] w-full">
          <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[11px] font-bold ${isSpinning ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse" : "bg-zinc-800 text-zinc-500"}`}>
            {isSpinning ? `${motor.speed}%` : "APAGADO"}
          </span>
          <span className={`text-[8px] sm:text-[10px] text-zinc-400 mt-0.5 transition-opacity duration-300 ${isSpinning ? "opacity-100" : "opacity-0 select-none pointer-events-none"}`}>
            {motor.direction === "atras" ? "← Atrás" : "Adelante →"}
          </span>
        </div>
      </div>
    );
  };

  const renderMobileWheel = (label: string, shape: string, motor: MotorState) => {
    const isSpinning = motor.speed > 0;
    const spinDuration = isSpinning ? `${2 / (motor.speed / 10)}s` : "0s";
    const spinDirection = motor.direction === "atras" ? "reverse" : "normal";

    const spinStyle = isSpinning
      ? {
          animation: "spin linear infinite",
          animationDuration: spinDuration,
          animationDirection: spinDirection as any,
          transformOrigin: "50px 50px",
        }
      : {};

    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-zinc-900/40 border border-zinc-800/60 rounded-2xl select-none relative overflow-hidden">
        {/* Subtle shape color background glow when active */}
        {isSpinning && (
          <div className={`absolute inset-0 opacity-[0.08] pointer-events-none transition-all duration-300 ${
            shape === "TRIANGULO" ? "bg-green-500" :
            shape === "CIRCULO" ? "bg-red-500" :
            shape === "CUADRADO" ? "bg-blue-500" :
            "bg-purple-500"
          }`} />
        )}
        
        {/* Top Label & Active Status indicator */}
        <div className="w-full flex items-center justify-between px-1.5 mb-1 z-10">
          <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">{label}</span>
          <span className={`w-2 h-2 rounded-full ${isSpinning ? "bg-yellow-400 animate-pulse" : "bg-zinc-800"}`} />
        </div>

        {/* Large SVG wheel */}
        <svg className="w-[72px] h-[72px] max-w-[80%] max-h-[60%] z-10" viewBox="0 0 100 100">
          {/* Tire ring */}
          <circle cx="50" cy="50" r="44" fill="#0f0f11" stroke="#27272a" strokeWidth="6" />
          <circle cx="50" cy="50" r="38" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
          
          {/* Rotatable wheel spokes/treads */}
          <g style={spinStyle}>
            <circle cx="50" cy="50" r="28" fill="none" stroke="#27272a" strokeWidth="3" strokeDasharray="6 6" />
            <line x1="50" y1="12" x2="50" y2="88" stroke="#27272a" strokeWidth="5" />
            <line x1="12" y1="50" x2="88" y2="50" stroke="#27272a" strokeWidth="5" />
            <line x1="23" y1="23" x2="77" y2="77" stroke="#27272a" strokeWidth="3" />
            <line x1="77" y1="23" x2="23" y2="77" stroke="#27272a" strokeWidth="3" />
          </g>

          {/* Hub center colored by shape */}
          <circle
            cx="50"
            cy="50"
            r="18"
            className={
              shape === "TRIANGULO"
                ? "fill-green-600"
                : shape === "CIRCULO"
                ? "fill-red-600"
                : shape === "CUADRADO"
                ? "fill-blue-600"
                : "fill-purple-600"
            }
          />
          {/* Small inner shape icon */}
          <g transform="translate(41, 41)">
            <ParamIcon param={shape} size={18} />
          </g>
        </svg>

        {/* Speed Badge & Direction Indicator */}
        <div className="flex flex-col items-center mt-2 z-10 w-full">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide font-mono ${isSpinning ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse" : "bg-zinc-800 text-zinc-500"}`}>
            {isSpinning ? `${motor.speed}%` : "APAGADO"}
          </span>
          <span className={`text-[9px] text-zinc-400 mt-1 transition-opacity duration-300 font-sans ${isSpinning ? "opacity-100" : "opacity-0 select-none pointer-events-none"}`}>
            {motor.direction === "atras" ? "← Atrás" : "Adelante →"}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950 text-white font-mono overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 12h4M8 10v4" />
            <circle cx="15.5" cy="13" r="1" fill="currentColor" />
            <circle cx="18.5" cy="10" r="1" fill="currentColor" />
            <rect x="2" y="6" width="20" height="12" rx="3" />
          </svg>
          <button
            type="button"
            onClick={handleLinkDevice}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-300 flex items-center gap-2 cursor-pointer active:scale-95 ${
              connectionState === "connected"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                : connectionState === "connecting"
                ? "bg-blue-500/10 border-blue-500/30 text-blue-400 animate-pulse"
                : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white hover:border-zinc-600"
            }`}
          >
            {connectionState === "connected" && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            )}
            {connectionState === "connecting" && (
              <svg className="animate-spin h-3 w-3 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {connectionState === "disconnected" && (
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            )}
            {connectionState === "connected"
              ? "Lek 2 Vinculado"
              : connectionState === "connecting"
              ? "Vinculando..."
              : "Vincular Lek 2"}
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 hover:text-white rounded-lg flex items-center justify-center transition-all cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden min-h-0">
        
        {/* Top / Left Half: Motor Simulation */}
        <div className="w-full sm:w-1/2 flex flex-col items-center justify-center p-4 sm:p-6 border-b sm:border-b-0 sm:border-r border-zinc-900 bg-zinc-950 relative flex-[3] sm:flex-1 min-h-0">
          <div className="absolute top-3 left-4 sm:top-4 sm:left-6 z-10">
            <span className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest">Simulación de Motores</span>
          </div>

          {/* Subtle Grid Background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "16px 16px"
          }} />

          {/* Mobile view: 2x2 Grid */}
          <div className="sm:hidden w-full h-full pt-9 pb-2 px-1 grid grid-cols-2 grid-rows-2 gap-2 min-h-0">
            {renderMobileWheel("FL", "TRIANGULO", motors.TRIANGULO)}
            {renderMobileWheel("FR", "CIRCULO", motors.CIRCULO)}
            {renderMobileWheel("RL", "CUADRADO", motors.CUADRADO)}
            {renderMobileWheel("RR", "X", motors.X)}
          </div>

          {/* Desktop view: Robot Chassis Drawing */}
          <div className="hidden sm:flex relative w-80 h-[350px] bg-zinc-900/10 border-2 border-zinc-900 rounded-3xl p-3 sm:p-4 flex flex-col justify-between items-center shadow-inner">
            {/* Front Axle Line */}
            <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-zinc-800/80 -z-10" />
            {/* Rear Axle Line */}
            <div className="absolute bottom-1/4 left-0 right-0 h-0.5 bg-zinc-800/80 -z-10" />
            {/* Center Chassis Spine */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-zinc-800/80 -translate-x-1/2 -z-10" />
            
            {/* Front Motors row */}
            <div className="w-full flex justify-between">
              {/* Front-Left: TRIANGULO */}
              {renderWheel("FL", "TRIANGULO", motors.TRIANGULO)}
              {/* Front-Right: CIRCULO */}
              {renderWheel("FR", "CIRCULO", motors.CIRCULO)}
            </div>

            {/* Rear Motors row */}
            <div className="w-full flex justify-between">
              {/* Rear-Left: CUADRADO */}
              {renderWheel("RL", "CUADRADO", motors.CUADRADO)}
              {/* Rear-Right: X */}
              {renderWheel("RR", "X", motors.X)}
            </div>
          </div>
        </div>

        {/* Bottom / Right Half: Controls & Active Code */}
        <div className="w-full sm:w-1/2 flex flex-col bg-zinc-900/10 flex-[2] sm:flex-1 min-h-0">
          
          {/* Diamond Gamepad area */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 border-b border-zinc-900 min-h-0 relative">
            <div className="absolute top-3 left-4 sm:top-4 sm:left-6">
              <span className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest">Controlador Virtual</span>
            </div>
            
            {/* Gamepad diamond button container */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center bg-zinc-900/40 border border-zinc-800/80 rounded-full shadow-2xl">
              
              {/* Inner subtle branding label */}
              <div className="absolute text-[8px] sm:text-[10px] font-bold text-zinc-700/80 font-mono tracking-widest uppercase pointer-events-none select-none">
                LEK 2
              </div>

              {/* TRIANGULO (Top) */}
              <button
                type="button"
                onMouseDown={() => handleButtonPress("TRIANGULO")}
                onMouseUp={() => handleButtonRelease("TRIANGULO")}
                onMouseLeave={() => activeButtons.TRIANGULO && handleButtonRelease("TRIANGULO")}
                onTouchStart={(e) => { e.preventDefault(); handleButtonPress("TRIANGULO"); }}
                onTouchEnd={(e) => { e.preventDefault(); handleButtonRelease("TRIANGULO"); }}
                className={`absolute top-1 sm:top-2 w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 ${
                  activeButtons.TRIANGULO 
                    ? "bg-green-600 border-green-400 text-white scale-90 shadow-[0_0_15px_rgba(22,163,74,0.6)]" 
                    : "bg-zinc-800/90 border-zinc-700 text-green-500 hover:bg-zinc-700"
                }`}
              >
                <ParamIcon param="TRIANGULO" size={18} />
              </button>

              {/* CIRCULO (Right) */}
              <button
                type="button"
                onMouseDown={() => handleButtonPress("CIRCULO")}
                onMouseUp={() => handleButtonRelease("CIRCULO")}
                onMouseLeave={() => activeButtons.CIRCULO && handleButtonRelease("CIRCULO")}
                onTouchStart={(e) => { e.preventDefault(); handleButtonPress("CIRCULO"); }}
                onTouchEnd={(e) => { e.preventDefault(); handleButtonRelease("CIRCULO"); }}
                className={`absolute right-1 sm:right-2 w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 ${
                  activeButtons.CIRCULO 
                    ? "bg-red-600 border-red-400 text-white scale-90 shadow-[0_0_15px_rgba(220,38,38,0.6)]" 
                    : "bg-zinc-800/90 border-zinc-700 text-red-500 hover:bg-zinc-700"
                }`}
              >
                <ParamIcon param="CIRCULO" size={18} />
              </button>

              {/* CUADRADO (Left) */}
              <button
                type="button"
                onMouseDown={() => handleButtonPress("CUADRADO")}
                onMouseUp={() => handleButtonRelease("CUADRADO")}
                onMouseLeave={() => activeButtons.CUADRADO && handleButtonRelease("CUADRADO")}
                onTouchStart={(e) => { e.preventDefault(); handleButtonPress("CUADRADO"); }}
                onTouchEnd={(e) => { e.preventDefault(); handleButtonRelease("CUADRADO"); }}
                className={`absolute left-1 sm:left-2 w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 ${
                  activeButtons.CUADRADO 
                    ? "bg-blue-600 border-blue-400 text-white scale-90 shadow-[0_0_15px_rgba(37,99,235,0.6)]" 
                    : "bg-zinc-800/90 border-zinc-700 text-blue-500 hover:bg-zinc-700"
                }`}
              >
                <ParamIcon param="CUADRADO" size={18} />
              </button>

              {/* X (Bottom) */}
              <button
                type="button"
                onMouseDown={() => handleButtonPress("X")}
                onMouseUp={() => handleButtonRelease("X")}
                onMouseLeave={() => activeButtons.X && handleButtonRelease("X")}
                onTouchStart={(e) => { e.preventDefault(); handleButtonPress("X"); }}
                onTouchEnd={(e) => { e.preventDefault(); handleButtonRelease("X"); }}
                className={`absolute bottom-1 sm:bottom-2 w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 ${
                  activeButtons.X 
                    ? "bg-purple-600 border-purple-400 text-white scale-90 shadow-[0_0_15px_rgba(147,51,234,0.6)]" 
                    : "bg-zinc-800/90 border-zinc-700 text-purple-500 hover:bg-zinc-700"
                }`}
              >
                <ParamIcon param="X" size={18} />
              </button>
            </div>
          </div>

          {/* Active Programming Code list */}
          <div className="h-28 sm:h-44 p-4 flex flex-col overflow-hidden bg-zinc-950/40 border-t border-zinc-900/60 min-h-0">
            <span className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Eventos Programados</span>
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {programmedEvents.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center p-3 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
                  <p className="text-[9px] sm:text-xs text-zinc-500 leading-relaxed font-mono">
                    No hay bloques de programación activos.<br />
                    Vuelve al lienzo y agrega bloques de eventos para asignarles acciones.
                  </p>
                </div>
              ) : (
                programmedEvents.map((eventBlock) => {
                  // Traverse event chain and format actions nicely
                  let actionsStr = "";
                  let currentId = eventBlock.nextBlockId;
                  const maxDepth = 4;
                  let depth = 0;
                  
                  while (currentId && depth < maxDepth) {
                    const actionBlock = placedBlocks.find(b => b.id === currentId);
                    if (!actionBlock) break;

                    let description = "";
                    if (actionBlock.type === "movimiento" && actionBlock.text.includes("Detener todos los motores")) {
                       description = "Detener todos los motores";
                    } else if (actionBlock.type === "movimiento" && actionBlock.text.includes("Detener motor") && actionBlock.param) {
                       description = `Detener motor [${actionBlock.param}]`;
                    } else if (actionBlock.type === "movimiento" && actionBlock.text.includes("Motor") && actionBlock.param) {
                      const [shape, percent] = actionBlock.param.split(":");
                      const direction = actionBlock.text.includes("Atras") ? "Atrás" : "Adelante";
                      description = `Motor [${shape}] ${percent}% ${direction}`;
                    } else if (actionBlock.type === "movimiento" && actionBlock.text.includes("Avanzar todos") && actionBlock.param) {
                      const direction = actionBlock.text.includes("Atras") ? "Atrás" : "Adelante";
                      description = `Avanzar todos ${actionBlock.param}% ${direction}`;
                    } else if (actionBlock.type === "control" && actionBlock.text.includes("Esperar")) {
                      description = `Esperar ${actionBlock.param}s`;
                    } else if (actionBlock.type === "control" && actionBlock.text.includes("Detener")) {
                      description = `Detener todo`;
                    } else if (actionBlock.type === "control-loop") {
                      description = `Repetir ${actionBlock.param} veces`;
                    }

                    if (description) {
                      actionsStr += (actionsStr ? " ➔ " : "") + description;
                    }
                    currentId = actionBlock.nextBlockId;
                    depth++;
                  }

                  if (currentId) actionsStr += " ➔ ...";

                  return (
                    <div
                      key={eventBlock.id}
                      className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 bg-zinc-900/80 border border-zinc-800/60 rounded-lg text-xs"
                    >
                      <div className={`flex items-center justify-center p-1 sm:p-1.5 border rounded-md sm:rounded-lg ${getMotorBadgeColor(eventBlock.param || "")}`}>
                        {eventBlock.param ? (
                          <ParamIcon param={eventBlock.param} size={12} />
                        ) : (
                          <span className="text-[8px] font-bold text-zinc-300">ALL</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-zinc-300 block text-[9px] sm:text-[10px] leading-tight">
                          {eventBlock.text.includes("todos")
                            ? "Al soltar todos los botones"
                            : eventBlock.text.includes("soltar")
                            ? "Al soltar botón"
                            : eventBlock.text.includes("Mientras")
                            ? "Mientras se presiona"
                            : "Al presionar botón"}
                        </span>
                        <span className="text-zinc-500 font-mono block truncate text-[8px] sm:text-[9px] mt-0.5">
                          {actionsStr || "Sin acciones programadas"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
