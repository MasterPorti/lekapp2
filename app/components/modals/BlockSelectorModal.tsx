import { ParamIcon } from "../blocks/ParamIcon";
import { CShapedBlockSvg } from "../blocks/CShapedBlockSvg";

interface BlockSelectorModalProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onBlockClick: (type: string, text: string, color: string, stroke: string, param?: string) => void;
}

export const BlockSelectorModal = ({
  activeCategory,
  onCategoryChange,
  onBlockClick,
}: BlockSelectorModalProps) => {
  return (
    <div className="fixed inset-0 bg-zinc-900 flex flex-col items-center pt-8 animate-slide-up">
      <p className="font-mono text-white text-sm mb-4 opacity-70">BLOQUES</p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          type="button"
          onClick={() => onCategoryChange("eventos")}
          className={`px-5 py-2 font-mono cursor-pointer transition-all flex items-center gap-2 ${
            activeCategory === "eventos"
              ? "bg-orange-500 text-white"
              : "bg-zinc-800 text-white border border-orange-500"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <polygon points="8,1 15,15 1,15" />
          </svg>
          EVENTOS
        </button>
        <button
          type="button"
          onClick={() => onCategoryChange("control")}
          className={`px-5 py-2 font-mono cursor-pointer transition-all flex items-center gap-2 ${
            activeCategory === "control"
              ? "bg-yellow-500 text-black"
              : "bg-zinc-800 text-white border border-yellow-500"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="1" width="14" height="14" />
          </svg>
          CONTROL
        </button>
        <button
          type="button"
          onClick={() => onCategoryChange("movimiento")}
          className={`px-5 py-2 font-mono cursor-pointer transition-all flex items-center gap-2 ${
            activeCategory === "movimiento"
              ? "bg-blue-500 text-white"
              : "bg-zinc-800 text-white border border-blue-500"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <polygon points="8,1 15,6 12,15 4,15 1,6" />
          </svg>
          MOVIMIENTO
        </button>
        <button
          type="button"
          onClick={() => onCategoryChange("sonidos")}
          className={`px-5 py-2 font-mono cursor-pointer transition-all flex items-center gap-2 ${
            activeCategory === "sonidos"
              ? "bg-purple-500 text-white"
              : "bg-zinc-800 text-white border border-purple-500"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <polygon points="8,1 14,4 14,12 8,15 2,12 2,4" />
          </svg>
          SONIDOS
        </button>
      </div>

      {activeCategory === "eventos" && (
        <div className="mt-8 flex flex-col items-start gap-2 pl-8">
          <BlockOption
            onClick={() => onBlockClick("evento", "Al iniciar Lek 2", "#F97316", "#EA580C")}
            width={235}
            viewBox="0 0 157 24"
            path="M155 0.5C155.828 0.5 156.5 1.17158 156.5 2V17C156.5 17.8284 155.828 18.5 155 18.5H38C37.7239 18.5 37.5 18.7239 37.5 19V22C37.5 22.8284 36.8284 23.5 36 23.5H21C20.1716 23.5 19.5 22.8284 19.5 22V19C19.5 18.7239 19.2761 18.5 19 18.5H2C1.17157 18.5 0.5 17.8284 0.5 17V2C0.5 1.17157 1.17158 0.500001 2 0.5H155Z"
            fill="#F97316"
            stroke="#EA580C"
          >
            <p className="absolute top-[40%] left-[68px] -translate-y-1/2 font-mono text-white text-sm whitespace-nowrap select-none">
              Al iniciar Lek 2
            </p>
          </BlockOption>
          <BlockOption
            onClick={() => onBlockClick("evento", "Al presionar boton X", "#F97316", "#EA580C", "X")}
            width={280}
            viewBox="0 0 187 24"
            path="M185 0.5C185.828 0.5 186.5 1.17158 186.5 2V17C186.5 17.8284 185.828 18.5 185 18.5H38C37.7239 18.5 37.5 18.7239 37.5 19V22C37.5 22.8284 36.8284 23.5 36 23.5H21C20.1716 23.5 19.5 22.8284 19.5 22V19C19.5 18.7239 19.2761 18.5 19 18.5H2C1.17157 18.5 0.5 17.8284 0.5 17V2C0.5 1.17157 1.17158 0.500001 2 0.5H185Z"
            fill="#F97316"
            stroke="#EA580C"
          >
            <div className="absolute top-[40%] left-[68px] -translate-y-1/2 font-mono text-white text-sm whitespace-nowrap select-none flex items-center gap-1">
              Al presionar boton{" "}
              <span className="bg-orange-700 px-1.5 py-0.5 rounded inline-flex items-center justify-center">
                <ParamIcon param="X" size={14} />
              </span>
            </div>
          </BlockOption>
          <BlockOption
            onClick={() => onBlockClick("evento", "Al soltar boton X", "#F97316", "#EA580C", "X")}
            width={255}
            viewBox="0 0 170 24"
            path="M168 0.5C168.828 0.5 169.5 1.17158 169.5 2V17C169.5 17.8284 168.828 18.5 168 18.5H38C37.7239 18.5 37.5 18.7239 37.5 19V22C37.5 22.8284 36.8284 23.5 36 23.5H21C20.1716 23.5 19.5 22.8284 19.5 22V19C19.5 18.7239 19.2761 18.5 19 18.5H2C1.17157 18.5 0.5 17.8284 0.5 17V2C0.5 1.17157 1.17158 0.500001 2 0.5H168Z"
            fill="#F97316"
            stroke="#EA580C"
          >
            <div className="absolute top-[40%] left-[68px] -translate-y-1/2 font-mono text-white text-sm whitespace-nowrap select-none flex items-center gap-1">
              Al soltar boton{" "}
              <span className="bg-orange-700 px-1.5 py-0.5 rounded inline-flex items-center justify-center">
                <ParamIcon param="X" size={14} />
              </span>
            </div>
          </BlockOption>
          <BlockOption
            onClick={() => onBlockClick("evento", "Mientras se presiona X", "#F97316", "#EA580C", "X")}
            width={305}
            viewBox="0 0 203 24"
            path="M201 0.5C201.828 0.5 202.5 1.17158 202.5 2V17C202.5 17.8284 201.828 18.5 201 18.5H38C37.7239 18.5 37.5 18.7239 37.5 19V22C37.5 22.8284 36.8284 23.5 36 23.5H21C20.1716 23.5 19.5 22.8284 19.5 22V19C19.5 18.7239 19.2761 18.5 19 18.5H2C1.17157 18.5 0.5 17.8284 0.5 17V2C0.5 1.17157 1.17158 0.500001 2 0.5H201Z"
            fill="#F97316"
            stroke="#EA580C"
          >
            <div className="absolute top-[40%] left-[68px] -translate-y-1/2 font-mono text-white text-sm whitespace-nowrap select-none flex items-center gap-1">
              Mientras se presiona{" "}
              <span className="bg-orange-700 px-1.5 py-0.5 rounded inline-flex items-center justify-center">
                <ParamIcon param="X" size={14} />
              </span>
            </div>
          </BlockOption>
          <BlockOption
            onClick={() => onBlockClick("evento", "Al soltar todos los botones", "#F97316", "#EA580C")}
            width={340}
            viewBox="0 0 227 24"
            path="M225 0.5C225.828 0.5 226.5 1.17158 226.5 2V17C226.5 17.8284 225.828 18.5 225 18.5H38C37.7239 18.5 37.5 18.7239 37.5 19V22C37.5 22.8284 36.8284 23.5 36 23.5H21C20.1716 23.5 19.5 22.8284 19.5 22V19C19.5 18.7239 19.2761 18.5 19 18.5H2C1.17157 18.5 0.5 17.8284 0.5 17V2C0.5 1.17157 1.17158 0.500001 2 0.5H225Z"
            fill="#F97316"
            stroke="#EA580C"
          >
            <p className="absolute top-[40%] left-[68px] -translate-y-1/2 font-mono text-white text-sm whitespace-nowrap select-none">
              Al soltar todos los botones
            </p>
          </BlockOption>
        </div>
      )}

      {activeCategory === "control" && (
        <div className="mt-8 flex flex-col items-start gap-2 pl-8">
          <BlockOption
            onClick={() => onBlockClick("control", "Esperar 1 segundos", "#EAB308", "#CA8A04", "1")}
            width={255}
            viewBox="0 0 170 24"
            path="M19 0.5H2C1.17157 0.5 0.5 1.17157 0.5 2V17C0.5 17.8284 1.17157 18.5 2 18.5H19C19.2761 18.5 19.5 18.7239 19.5 19V22C19.5 22.8284 20.1716 23.5 21 23.5H36C36.8284 23.5 37.5 22.8284 37.5 22V19C37.5 18.7239 37.7239 18.5 38 18.5H168C168.828 18.5 169.5 17.8284 169.5 17V2C169.5 1.17157 168.828 0.5 168 0.5H38C37.7239 0.5 37.5 0.72386 37.5 1V4C37.5 4.82843 36.8284 5.5 36 5.5H21C20.1716 5.5 19.5 4.82843 19.5 4V1C19.5 0.72386 19.2761 0.5 19 0.5Z"
            fill="#EAB308"
            stroke="#CA8A04"
          >
            <div className="absolute top-[45%] left-[68px] -translate-y-1/2 font-mono text-black text-sm whitespace-nowrap select-none flex items-center gap-1">
              Esperar{" "}
              <span className="bg-yellow-600 text-white px-1.5 py-0.5 rounded">1</span>{" "}
              segundos
            </div>
          </BlockOption>
          <BlockOption
            onClick={() => onBlockClick("control", "Detener todos", "#EAB308", "#CA8A04")}
            width={230}
            viewBox="0 0 153 24"
            path="M19 0.5H2C1.17157 0.5 0.5 1.17157 0.5 2V17C0.5 17.8284 1.17157 18.5 2 18.5H19C19.2761 18.5 19.5 18.7239 19.5 19V22C19.5 22.8284 20.1716 23.5 21 23.5H36C36.8284 23.5 37.5 22.8284 37.5 22V19C37.5 18.7239 37.7239 18.5 38 18.5H151C151.828 18.5 152.5 17.8284 152.5 17V2C152.5 1.17157 151.828 0.5 151 0.5H38C37.7239 0.5 37.5 0.72386 37.5 1V4C37.5 4.82843 36.8284 5.5 36 5.5H21C20.1716 5.5 19.5 4.82843 19.5 4V1C19.5 0.72386 19.2761 0.5 19 0.5Z"
            fill="#EAB308"
            stroke="#CA8A04"
          >
            <div className="absolute top-[45%] left-[68px] -translate-y-1/2 font-mono text-black text-sm whitespace-nowrap select-none flex items-center gap-2">
              <span className="w-4 h-4 bg-red-600 rounded-full border border-red-800"></span>
              Detener todos
            </div>
          </BlockOption>
          <CShapedBlockOption
            onClick={() => onBlockClick("control-loop", "Repetir 10 veces", "#EAB308", "#CA8A04", "10")}
          />
        </div>
      )}

      {activeCategory === "movimiento" && (
        <div className="mt-8 flex flex-col items-start gap-2 pl-8">
          <BlockOption
            onClick={() => onBlockClick("movimiento", "Mover adelante 100%", "#3B82F6", "#2563EB", "100")}
            width={260}
            viewBox="0 0 173 24"
            path="M19 0.5H2C1.17157 0.5 0.5 1.17157 0.5 2V17C0.5 17.8284 1.17157 18.5 2 18.5H19C19.2761 18.5 19.5 18.7239 19.5 19V22C19.5 22.8284 20.1716 23.5 21 23.5H36C36.8284 23.5 37.5 22.8284 37.5 22V19C37.5 18.7239 37.7239 18.5 38 18.5H171C171.828 18.5 172.5 17.8284 172.5 17V2C172.5 1.17157 171.828 0.5 171 0.5H38C37.7239 0.5 37.5 0.72386 37.5 1V4C37.5 4.82843 36.8284 5.5 36 5.5H21C20.1716 5.5 19.5 4.82843 19.5 4V1C19.5 0.72386 19.2761 0.5 19 0.5Z"
            fill="#3B82F6"
            stroke="#2563EB"
          >
            <div className="absolute top-[45%] left-[68px] -translate-y-1/2 font-mono text-white text-sm whitespace-nowrap select-none flex items-center gap-1">
              Mover adelante{" "}
              <span className="bg-blue-700 px-1.5 py-0.5 rounded">100</span>%
            </div>
          </BlockOption>
          <BlockOption
            onClick={() => onBlockClick("movimiento", "Motor X Adelante 100%", "#3B82F6", "#2563EB", "X:100")}
            width={280}
            viewBox="0 0 187 24"
            path="M19 0.5H2C1.17157 0.5 0.5 1.17157 0.5 2V17C0.5 17.8284 1.17157 18.5 2 18.5H19C19.2761 18.5 19.5 18.7239 19.5 19V22C19.5 22.8284 20.1716 23.5 21 23.5H36C36.8284 23.5 37.5 22.8284 37.5 22V19C37.5 18.7239 37.7239 18.5 38 18.5H185C185.828 18.5 186.5 17.8284 186.5 17V2C186.5 1.17157 185.828 0.5 185 0.5H38C37.7239 0.5 37.5 0.72386 37.5 1V4C37.5 4.82843 36.8284 5.5 36 5.5H21C20.1716 5.5 19.5 4.82843 19.5 4V1C19.5 0.72386 19.2761 0.5 19 0.5Z"
            fill="#3B82F6"
            stroke="#2563EB"
          >
            <div className="absolute top-[45%] left-[68px] -translate-y-1/2 font-mono text-white text-sm whitespace-nowrap select-none flex items-center gap-1">
              Motor{" "}
              <span className="bg-blue-700 px-1.5 py-0.5 rounded inline-flex items-center justify-center">
                <ParamIcon param="X" size={14} />
              </span>{" "}
              <span className="bg-blue-700 px-1.5 py-0.5 rounded">100</span>% Adelante
            </div>
          </BlockOption>
          <BlockOption
            onClick={() => onBlockClick("movimiento", "Motor X Atras 100%", "#3B82F6", "#2563EB", "X:100")}
            width={255}
            viewBox="0 0 170 24"
            path="M19 0.5H2C1.17157 0.5 0.5 1.17157 0.5 2V17C0.5 17.8284 1.17157 18.5 2 18.5H19C19.2761 18.5 19.5 18.7239 19.5 19V22C19.5 22.8284 20.1716 23.5 21 23.5H36C36.8284 23.5 37.5 22.8284 37.5 22V19C37.5 18.7239 37.7239 18.5 38 18.5H168C168.828 18.5 169.5 17.8284 169.5 17V2C169.5 1.17157 168.828 0.5 168 0.5H38C37.7239 0.5 37.5 0.72386 37.5 1V4C37.5 4.82843 36.8284 5.5 36 5.5H21C20.1716 5.5 19.5 4.82843 19.5 4V1C19.5 0.72386 19.2761 0.5 19 0.5Z"
            fill="#3B82F6"
            stroke="#2563EB"
          >
            <div className="absolute top-[45%] left-[68px] -translate-y-1/2 font-mono text-white text-sm whitespace-nowrap select-none flex items-center gap-1">
              Motor{" "}
              <span className="bg-blue-700 px-1.5 py-0.5 rounded inline-flex items-center justify-center">
                <ParamIcon param="X" size={14} />
              </span>{" "}
              <span className="bg-blue-700 px-1.5 py-0.5 rounded">100</span>% Atras
            </div>
          </BlockOption>
          <BlockOption
            onClick={() => onBlockClick("movimiento", "Avanzar todos adelante 100%", "#3B82F6", "#2563EB", "100")}
            width={310}
            viewBox="0 0 207 24"
            path="M19 0.5H2C1.17157 0.5 0.5 1.17157 0.5 2V17C0.5 17.8284 1.17157 18.5 2 18.5H19C19.2761 18.5 19.5 18.7239 19.5 19V22C19.5 22.8284 20.1716 23.5 21 23.5H36C36.8284 23.5 37.5 22.8284 37.5 22V19C37.5 18.7239 37.7239 18.5 38 18.5H205C205.828 18.5 206.5 17.8284 206.5 17V2C206.5 1.17157 205.828 0.5 205 0.5H38C37.7239 0.5 37.5 0.72386 37.5 1V4C37.5 4.82843 36.8284 5.5 36 5.5H21C20.1716 5.5 19.5 4.82843 19.5 4V1C19.5 0.72386 19.2761 0.5 19 0.5Z"
            fill="#3B82F6"
            stroke="#2563EB"
          >
            <div className="absolute top-[45%] left-[68px] -translate-y-1/2 font-mono text-white text-sm whitespace-nowrap select-none flex items-center gap-1">
              Avanzar todos{" "}
              <span className="bg-blue-700 px-1.5 py-0.5 rounded">100</span>% adelante
            </div>
          </BlockOption>
          <BlockOption
            onClick={() => onBlockClick("movimiento", "Avanzar todos atras 100%", "#3B82F6", "#2563EB", "100")}
            width={285}
            viewBox="0 0 190 24"
            path="M19 0.5H2C1.17157 0.5 0.5 1.17157 0.5 2V17C0.5 17.8284 1.17157 18.5 2 18.5H19C19.2761 18.5 19.5 18.7239 19.5 19V22C19.5 22.8284 20.1716 23.5 21 23.5H36C36.8284 23.5 37.5 22.8284 37.5 22V19C37.5 18.7239 37.7239 18.5 38 18.5H188C188.828 18.5 189.5 17.8284 189.5 17V2C189.5 1.17157 188.828 0.5 188 0.5H38C37.7239 0.5 37.5 0.72386 37.5 1V4C37.5 4.82843 36.8284 5.5 36 5.5H21C20.1716 5.5 19.5 4.82843 19.5 4V1C19.5 0.72386 19.2761 0.5 19 0.5Z"
            fill="#3B82F6"
            stroke="#2563EB"
          >
            <div className="absolute top-[45%] left-[68px] -translate-y-1/2 font-mono text-white text-sm whitespace-nowrap select-none flex items-center gap-1">
              Avanzar todos{" "}
              <span className="bg-blue-700 px-1.5 py-0.5 rounded">100</span>% atras
            </div>
          </BlockOption>
        </div>
      )}
    </div>
  );
};

interface BlockOptionProps {
  onClick: () => void;
  width: number;
  viewBox: string;
  path: string;
  fill: string;
  stroke: string;
  children: React.ReactNode;
}

const BlockOption = ({
  onClick,
  width,
  viewBox,
  path,
  fill,
  stroke,
  children,
}: BlockOptionProps) => (
  <div
    onClick={onClick}
    className="cursor-pointer hover:opacity-80 transition-opacity relative"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height="62"
      viewBox={viewBox}
      fill="none"
    >
      <path d={path} fill={fill} stroke={stroke} />
    </svg>
    {children}
  </div>
);

interface CShapedBlockOptionProps {
  onClick: () => void;
}

const CShapedBlockOption = ({ onClick }: CShapedBlockOptionProps) => (
  <div
    onClick={onClick}
    className="cursor-pointer hover:opacity-80 transition-opacity relative"
  >
    <CShapedBlockSvg color="#EAB308" stroke="#CA8A04" childrenCount={0} />
    <div className="absolute top-[27px] left-[68px] -translate-y-1/2 font-mono text-black text-sm whitespace-nowrap select-none flex items-center gap-1">
      Repetir{" "}
      <span className="bg-yellow-600 text-white px-1.5 py-0.5 rounded">10</span>{" "}
      veces
    </div>
  </div>
);
