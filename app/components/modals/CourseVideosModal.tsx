import React, { useState, useEffect } from "react";

interface Video {
  id: string;
  title: string;
  duration: string;
  description: string;
  url: string;
  isFree?: boolean;
}

interface CourseVideosModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: number;
  courseTitle: string;
}

export const CourseVideosModal = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
}: CourseVideosModalProps) => {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  // Reset active video index when opening a different course
  useEffect(() => {
    setActiveVideoIndex(0);
  }, [courseId, isOpen]);

  if (!isOpen) return null;

  // 10 videos specifically for Course 1: "Cómo armar tu Lek 2"
  const course1Videos: Video[] = [
    {
      id: "v1",
      title: "Unboxing y Reconocimiento de Componentes",
      duration: "5:10",
      description: "Descubre todas las piezas, sensores, motores y tornillos incluidos en tu kit de robótica Lek 2 antes de comenzar el ensamble.",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    },
    {
      id: "v2",
      title: "Montaje del Chasis Base",
      duration: "8:25",
      description: "Ensambla la estructura inferior de acrílico/plástico y asegura los soportes principales para sostener el peso de la batería.",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    },
    {
      id: "v3",
      title: "Instalación de Motores de Tracción",
      duration: "7:40",
      description: "Acopla los motores reductores a los soportes laterales del chasis y aprieta los tornillos de fijación de los ejes.",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    },
    {
      id: "v4",
      title: "Colocación de Ruedas y Rueda Loca",
      duration: "6:15",
      description: "Monta las ruedas principales con neumático de goma y ajusta la rueda loca delantera para un giro multidireccional fluido.",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    },
    {
      id: "v5",
      title: "Fijación de la Placa de Control Lek Brain",
      duration: "9:30",
      description: "Posiciona y atornilla la tarjeta controladora principal sobre los espaciadores de nylon para evitar cortocircuitos.",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    },
    {
      id: "v6",
      title: "Cableado de Motores y Alimentación",
      duration: "10:15",
      description: "Conecta los cables de los motores de tracción a las terminales correspondientes de la placa y asegura el portabaterías.",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    },
    {
      id: "v7",
      title: "Montaje de Sensores Infrarrojos Inferiores",
      duration: "8:50",
      description: "Posiciona los sensores infrarrojos de rastreo en la parte frontal inferior del chasis para detectar líneas negras en la pista.",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    },
    {
      id: "v8",
      title: "Instalación de Sensor de Distancia Ultrasónico",
      duration: "11:05",
      description: "Acopla el sensor de distancia ultrasónico frontal mediante su soporte y conéctalo al puerto de expansión de la placa Lek Brain.",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    },
    {
      id: "v9",
      title: "Organización del Cableado y Seguridad",
      duration: "6:40",
      description: "Utiliza cinchos plásticos para organizar y sujetar los cables, evitando que rocen con las ruedas o los engranajes.",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    },
    {
      id: "v10",
      title: "Prueba de Encendido y Autodiagnóstico",
      duration: "7:20",
      description: "Enciende el interruptor de energía y verifica los códigos de luces LED para asegurar que todas las conexiones sean correctas.",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    },
  ];

  // Course 2 videos
  const course2Videos: Video[] = [
    {
      id: "c2v1",
      title: "Primeros Pasos en LekCode",
      duration: "4:30",
      description: "Conoce la interfaz de programación, cómo arrastrar bloques al lienzo y las categorías de movimiento.",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    },
    {
      id: "c2v2",
      title: "Avanzar y Retroceder Motores",
      duration: "6:15",
      description: "Configura la velocidad y dirección de los motores izquierdo y derecho para realizar traslaciones lineales.",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    },
    {
      id: "c2v3",
      title: "Giros y Ángulos de Rotación",
      duration: "5:50",
      description: "Aprende a programar giros sobre el propio eje (giros pivotantes) y curvas amplias variando la velocidad relativa.",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    },
    {
      id: "c2v4",
      title: "Uso del Bloque Esperar (Delays)",
      duration: "4:10",
      description: "Controla los tiempos de ejecución de las acciones de movimiento usando retardos en segundos.",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    },
    {
      id: "c2v5",
      title: "Estructuras de Secuencia Lineal",
      duration: "7:25",
      description: "Crea rutinas completas (ej. dibujar un cuadrado) combinando de forma lógica bloques secuenciales.",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    },
  ];

  // Course 3 videos
  const course3Videos: Video[] = [
    {
      id: "c3v1",
      title: "Introducción a los Sensores del Lek 2",
      duration: "5:45",
      description: "Aprende cómo operan los sensores ópticos infrarrojos y el transductor de distancia ultrasónico por rebote.",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    },
    {
      id: "c3v2",
      title: "Condicionales Simples (Si / Sino)",
      duration: "8:10",
      description: "Haz que tu robot tome decisiones en tiempo real analizando la lectura de presencia de obstáculos.",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    },
    {
      id: "c3v3",
      title: "Bucles Infinitos y de Condición",
      duration: "9:20",
      description: "Crea lazos de control continuos para que el robot responda indefinidamente a su entorno.",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    },
    {
      id: "c3v4",
      title: "Algoritmo Seguidor de Línea Básico",
      duration: "11:30",
      description: "Programa la lógica para que los sensores infrarrojos sigan una pista negra de forma autónoma.",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    },
  ];

  // Course 4 videos
  const course4Videos: Video[] = [
    {
      id: "c4v1",
      title: "Qué es la Comunidad Lek y los Retos",
      duration: "3:40",
      description: "Explora la sección de retos semanales y cómo funcionan los sistemas de puntaje e insignias.",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    },
    {
      id: "c4v2",
      title: "Optimización de Código para Menor Espacio",
      duration: "6:55",
      description: "Aprende técnicas para usar bucles repetir en lugar de secuencias repetitivas redundantes.",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    },
    {
      id: "c4v3",
      title: "Análisis y Estrategia de un Circuito",
      duration: "7:50",
      description: "Planifica la trayectoria óptima y los puntos de decisión antes de arrastrar el primer bloque de programación.",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    },
  ];

  // Determine current playlist based on courseId
  const getPlaylist = (): Video[] => {
    switch (courseId) {
      case 1:
        return course1Videos;
      case 2:
        return course2Videos;
      case 3:
        return course3Videos;
      case 4:
        return course4Videos;
      default:
        return course1Videos;
    }
  };

  const playlist = getPlaylist();
  const currentVideo = playlist[activeVideoIndex] || playlist[0] || {
    title: "Sin video",
    duration: "0:00",
    description: "No hay videos disponibles.",
    url: "",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/65 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Box */}
      <div className="relative bg-[#f3f4de] border border-[#dc2a36]/20 rounded-none w-full max-w-5xl h-[88vh] md:h-[80vh] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in duration-200 font-sans">
        
        {/* LEFT PANEL: VIDEO PLAYER & METADATA */}
        <div className="flex-1 flex flex-col p-5 md:p-6 overflow-y-auto md:border-r md:border-gray-200">
          
          {/* Top Title & Close for Mobile */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span className="text-[10px] font-bold text-[#dc2a36] bg-[#dc2a36]/10 border border-[#dc2a36]/20 px-2 py-0.5 uppercase tracking-wider block w-fit mb-1 font-mono">
                {courseTitle}
              </span>
              <h3 className="text-gray-900 font-bold text-base sm:text-lg uppercase tracking-wide font-display">
                {currentVideo.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="md:hidden w-8 h-8 bg-zinc-200 hover:bg-zinc-300 active:scale-95 text-gray-700 hover:text-gray-900 rounded-none flex items-center justify-center transition-all cursor-pointer shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Video Player */}
          <div className="relative aspect-video w-full bg-zinc-950 border border-gray-300 shadow-sm shrink-0 overflow-hidden">
            {currentVideo.url ? (
              <video
                key={currentVideo.id} // Forces re-render on video source change
                className="w-full h-full object-contain"
                controls
                autoPlay={activeVideoIndex > 0} // Autoplay only after the user actively starts clicking playlist items
                src={currentVideo.url}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 font-mono text-xs">
                <svg className="w-12 h-12 text-zinc-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 00-2-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>No hay video disponible</span>
              </div>
            )}
          </div>

          {/* Video Description */}
          <div className="mt-5 flex-1">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">Descripción de la clase</h4>
            <p className="text-xs sm:text-sm text-gray-700 font-sans mt-1.5 leading-relaxed bg-white border border-gray-200/80 p-4 shadow-inner">
              {currentVideo.description}
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: PLAYLIST SIDEBAR */}
        <div className="w-full md:w-[320px] bg-white flex flex-col h-[280px] md:h-full shrink-0 border-t border-gray-200 md:border-t-0">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#dc2a36]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span className="text-xs font-bold text-gray-800 uppercase tracking-wider font-display">Clases del Curso</span>
            </div>
            <span className="text-[10px] font-bold text-gray-500 font-mono px-2 py-0.5 bg-gray-200/70">
              {playlist.length} VIDEOS
            </span>
            <button
              type="button"
              onClick={onClose}
              className="hidden md:flex w-7 h-7 bg-zinc-200 hover:bg-zinc-300 active:scale-95 text-gray-700 hover:text-gray-900 rounded-none items-center justify-center transition-all cursor-pointer shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Videos List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {playlist.map((video, index) => {
              const isActive = index === activeVideoIndex;
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isCompleted = isFirst; // Mocking first video as completed
              const isInProgress = isSecond && courseId === 2; // Mocking second video in progress for course 2
              
              return (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => setActiveVideoIndex(index)}
                  className={`w-full p-3.5 text-left transition-all flex items-start gap-3.5 cursor-pointer border-l-4 ${
                    isActive
                      ? "bg-[#dc2a36]/5 border-l-[#dc2a36] hover:bg-[#dc2a36]/10"
                      : "border-l-transparent hover:bg-gray-50/80"
                  }`}
                >
                  {/* Number Index */}
                  <span className={`text-xs font-mono font-bold w-4 shrink-0 text-center ${isActive ? "text-[#dc2a36]" : "text-gray-400"}`}>
                    {(index + 1).toString().padStart(2, "0")}
                  </span>

                  {/* Thumbnail / Status Icon Indicator */}
                  <div className="relative w-12 aspect-video bg-zinc-950 shrink-0 border border-gray-200 overflow-hidden flex items-center justify-center">
                    {/* Tiny Play icon */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      {isActive ? (
                        <svg className="w-3 h-3 text-[#dc2a36] animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      ) : (
                        <svg className="w-2.5 h-2.5 text-white/90" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Title & Duration */}
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className={`text-[11px] font-bold leading-tight block truncate ${isActive ? "text-[#dc2a36]" : "text-gray-700"}`}>
                      {video.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-gray-400 font-mono tracking-wider font-bold">
                        {video.duration} MIN
                      </span>
                      {isCompleted && (
                        <span className="text-[8px] font-bold text-emerald-600 bg-emerald-100 px-1 font-mono uppercase tracking-wider scale-90 origin-left">
                          Visto
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
};
