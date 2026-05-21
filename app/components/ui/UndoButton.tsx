interface UndoButtonProps {
  timeLeft: number;
  totalTime: number;
  onUndo: () => void;
}

export const UndoButton = ({ timeLeft, totalTime, onUndo }: UndoButtonProps) => {
  return (
    <button
      type="button"
      onClick={onUndo}
      className="absolute bottom-24 left-0 right-0 mx-auto w-fit px-6 py-3 bg-zinc-800 text-yellow-500 font-mono cursor-pointer rounded z-50 overflow-hidden select-none"
    >
      <div
        className="absolute inset-0 rounded pointer-events-none"
        style={{
          background: `linear-gradient(to right, #eab308 0%, #eab308 ${
            (timeLeft / totalTime) * 100
          }%, #3f3f46 ${(timeLeft / totalTime) * 100}%, #3f3f46 100%)`,
          padding: "2px",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      DESHACER
    </button>
  );
};
