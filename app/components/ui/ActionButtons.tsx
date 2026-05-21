interface ActionButtonsProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export const ActionButtons = ({ onCancel, onConfirm }: ActionButtonsProps) => {
  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-4 z-50">
      <button
        type="button"
        onClick={onCancel}
        className="w-12 h-12 rounded bg-zinc-800 border-2 border-red-600 text-red-500 font-bold text-xl cursor-pointer flex items-center justify-center select-none"
      >
        ✕
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className="w-12 h-12 rounded bg-zinc-800 border-2 border-green-600 text-green-500 font-bold text-xl cursor-pointer flex items-center justify-center select-none"
      >
        ✓
      </button>
    </div>
  );
};
