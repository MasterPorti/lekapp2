interface UndoButtonProps {
  timeLeft: number;
  totalTime: number;
  onUndo: () => void;
}

export const UndoButton = ({ timeLeft, totalTime, onUndo }: UndoButtonProps) => {
  const percentage = (timeLeft / totalTime) * 100;

  return (
    <button
      type="button"
      onClick={onUndo}
      className="absolute bottom-24 left-0 right-0 mx-auto w-fit px-6 py-3 bg-zinc-800 text-yellow-500 font-mono cursor-pointer rounded z-50 overflow-hidden select-none"
    >
      {/* Spent/Grey Border */}
      <div className="absolute inset-0 rounded border-2 border-zinc-700 pointer-events-none" />
      
      {/* Active/Yellow Progress Border with Smooth Transition */}
      <div
        className="absolute inset-0 rounded border-2 border-yellow-500 pointer-events-none"
        style={{
          clipPath: `inset(0 ${100 - percentage}% 0 0)`,
          transition: "clip-path 100ms linear",
        }}
      />
      DESHACER
    </button>
  );
};
