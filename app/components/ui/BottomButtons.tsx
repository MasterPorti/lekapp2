interface BottomButtonsProps {
  activeButton: string;
  onProgramacionClick: () => void;
  onBloquesClick: () => void;
}

export const BottomButtons = ({
  activeButton,
  onProgramacionClick,
  onBloquesClick,
}: BottomButtonsProps) => {
  return (
    <div className="flex gap-4 z-50 pb-safe">
      <button
        type="button"
        onClick={onProgramacionClick}
        className={`px-6 py-3 font-mono cursor-pointer border-2 border-red-900 transition-all select-none ${
          activeButton === "programacion"
            ? "bg-red-600 text-white"
            : "bg-zinc-800 text-white"
        }`}
      >
        PROGRAMACION
      </button>
      <button
        type="button"
        onClick={onBloquesClick}
        className={`px-6 py-3 font-mono cursor-pointer border-2 border-red-900 transition-all select-none ${
          activeButton === "bloques"
            ? "bg-red-600 text-white"
            : "bg-zinc-800 text-white"
        }`}
      >
        BLOQUES
      </button>
    </div>
  );
};
