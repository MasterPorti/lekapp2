import { ParamIcon } from "../blocks/ParamIcon";
import { PARAM_OPTIONS } from "../../utils/blockDimensions";

interface ParamSelectorModalProps {
  type: "icon" | "number" | "motor-icon" | "motor-percent";
  color?: "blue" | "orange";
  numberValue: string;
  onNumberChange: (value: string) => void;
  onSelect: (option: string) => void;
  onClose: () => void;
}

export const ParamSelectorModal = ({
  type,
  color,
  numberValue,
  onNumberChange,
  onSelect,
  onClose,
}: ParamSelectorModalProps) => {
  const isIconType = type === "icon" || type === "motor-icon";

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      {isIconType ? (
        <div className="relative bg-zinc-800 rounded-lg p-4 flex gap-3">
          {PARAM_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className={`w-14 h-14 rounded text-white cursor-pointer flex items-center justify-center select-none border-2 ${
                color === "orange"
                  ? "bg-orange-600 hover:bg-orange-500 border-orange-400"
                  : "bg-blue-600 hover:bg-blue-500 border-blue-400"
              }`}
            >
              <ParamIcon param={option} size={28} />
            </button>
          ))}
        </div>
      ) : (
        <div className="relative bg-zinc-800 rounded-lg p-4 flex flex-col gap-3">
          <input
            type="text"
            inputMode="decimal"
            pattern="[0-9]*\.?[0-9]*"
            value={numberValue}
            onChange={(e) => onNumberChange(e.target.value.replace(/[^0-9.]/g, ""))}
            className={`w-32 px-3 py-2 bg-zinc-700 text-white font-mono text-xl text-center rounded border-2 outline-none ${
              color === "blue" ? "border-blue-500" : "border-yellow-500"
            }`}
            autoFocus
          />
          <button
            type="button"
            onClick={() => onSelect(numberValue || "1")}
            className={`px-4 py-2 rounded font-mono font-bold cursor-pointer ${
              color === "blue"
                ? "bg-blue-500 hover:bg-blue-400 text-white"
                : "bg-yellow-500 hover:bg-yellow-400 text-black"
            }`}
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
};
