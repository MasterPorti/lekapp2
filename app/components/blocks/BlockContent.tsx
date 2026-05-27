import { ParamIcon } from "./ParamIcon";

interface BlockContentProps {
  type: string;
  text: string;
  param?: string;
  onParamClick?: (paramType: "icon" | "number" | "motor-icon" | "motor-percent", color?: "blue" | "orange") => void;
}

export const BlockContent = ({ type, text, param, onParamClick }: BlockContentProps) => {
  if (type === "movimiento" && text.includes("Detener todos los motores")) {
    return (
      <div className="absolute top-[45%] left-[68px] -translate-y-1/2 font-mono text-white text-sm whitespace-nowrap select-none flex items-center gap-2">
        <span className="w-4 h-4 bg-red-600 rounded-full border border-red-800"></span>
        Detener todos los motores
      </div>
    );
  }

  if (param && type === "movimiento" && text.includes("Detener motor")) {
    return (
      <div className="absolute top-[45%] left-[68px] -translate-y-1/2 font-mono text-white text-sm whitespace-nowrap select-none flex items-center gap-1">
        Detener motor{" "}
        <span
          className="bg-blue-700 px-1.5 py-0.5 rounded cursor-pointer hover:bg-blue-600 inline-flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            onParamClick?.("icon", "blue");
          }}
        >
          <ParamIcon param={param} size={14} />
        </span>
      </div>
    );
  }

  if (param && type === "movimiento" && text.includes("Motor")) {
    return (
      <div className="absolute top-[45%] left-[68px] -translate-y-1/2 font-mono text-white text-sm whitespace-nowrap select-none flex items-center gap-1">
        Motor{" "}
        <span
          className="bg-blue-700 px-1.5 py-0.5 rounded cursor-pointer hover:bg-blue-600 inline-flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            onParamClick?.("motor-icon", "blue");
          }}
        >
          <ParamIcon param={param.split(":")[0]} size={14} />
        </span>{" "}
        <span
          className="bg-blue-700 px-1.5 py-0.5 rounded cursor-pointer hover:bg-blue-600"
          onClick={(e) => {
            e.stopPropagation();
            onParamClick?.("motor-percent", "blue");
          }}
        >
          {param.split(":")[1] || "100"}
        </span>
        % {text.includes("Atras") ? "Atras" : "Adelante"}
      </div>
    );
  }

  if (param && type === "movimiento" && text.includes("Mover")) {
    return (
      <div className="absolute top-[45%] left-[68px] -translate-y-1/2 font-mono text-white text-sm whitespace-nowrap select-none flex items-center gap-1">
        Mover adelante{" "}
        <span
          className="bg-blue-700 px-1.5 py-0.5 rounded cursor-pointer hover:bg-blue-600"
          onClick={(e) => {
            e.stopPropagation();
            onParamClick?.("number", "blue");
          }}
        >
          {param}
        </span>
        %
      </div>
    );
  }

  if (param && type === "movimiento" && text.includes("Avanzar")) {
    return (
      <div className="absolute top-[45%] left-[68px] -translate-y-1/2 font-mono text-white text-sm whitespace-nowrap select-none flex items-center gap-1">
        Avanzar todos{" "}
        <span
          className="bg-blue-700 px-1.5 py-0.5 rounded cursor-pointer hover:bg-blue-600"
          onClick={(e) => {
            e.stopPropagation();
            onParamClick?.("number", "blue");
          }}
        >
          {param}
        </span>
        % {text.includes("atras") ? "atras" : "adelante"}
      </div>
    );
  }

  if (param && type === "evento") {
    return (
      <div className="absolute top-[40%] left-[68px] -translate-y-1/2 font-mono text-white text-sm whitespace-nowrap select-none flex items-center gap-1">
        {text.includes("soltar boton")
          ? "Al soltar boton"
          : text.includes("Mientras")
          ? "Mientras se presiona"
          : "Al presionar boton"}{" "}
        <span
          className="bg-orange-700 px-1.5 py-0.5 rounded cursor-pointer hover:bg-orange-600 inline-flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            onParamClick?.("icon", "orange");
          }}
        >
          <ParamIcon param={param} size={14} />
        </span>
      </div>
    );
  }

  if (param && type === "control") {
    return (
      <div className="absolute top-[45%] left-[68px] -translate-y-1/2 font-mono text-black text-sm whitespace-nowrap select-none flex items-center gap-1">
        Esperar{" "}
        <span
          className="bg-yellow-600 px-1.5 py-0.5 rounded cursor-pointer hover:bg-yellow-500 text-white"
          onClick={(e) => {
            e.stopPropagation();
            onParamClick?.("number");
          }}
        >
          {param}
        </span>{" "}
        segundos
      </div>
    );
  }

  if (type === "control" && text.includes("Detener")) {
    return (
      <div className="absolute top-[45%] left-[68px] -translate-y-1/2 font-mono text-black text-sm whitespace-nowrap select-none flex items-center gap-2">
        <span className="w-4 h-4 bg-red-600 rounded-full border border-red-800"></span>
        Detener todos
      </div>
    );
  }

  if (type === "control-loop" && param !== undefined) {
    return (
      <div className="absolute top-[27px] left-[68px] -translate-y-1/2 font-mono text-black text-sm whitespace-nowrap select-none flex items-center gap-1">
        Repetir{" "}
        <span
          className="bg-yellow-600 px-1.5 py-0.5 rounded cursor-pointer hover:bg-yellow-500 text-white min-w-[20px] inline-block text-center"
          onClick={(e) => {
            e.stopPropagation();
            onParamClick?.("number");
          }}
        >
          {param}
        </span>{" "}
        veces
      </div>
    );
  }

  return (
    <p className="absolute top-[40%] left-[68px] -translate-y-1/2 font-mono text-white text-sm whitespace-nowrap select-none">
      {text}
    </p>
  );
};
