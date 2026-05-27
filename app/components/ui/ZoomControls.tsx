interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onNextBlock?: () => void;
  showNextBlockButton: boolean;
  showTrash?: boolean;
  onTrashClick?: () => void;
}

export const ZoomControls = ({
  onZoomIn,
  onZoomOut,
  onNextBlock,
  showNextBlockButton,
  showTrash,
  onTrashClick,
}: ZoomControlsProps) => {
  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
      {showTrash && onTrashClick && (
        <button
          type="button"
          onClick={onTrashClick}
          className="w-10 h-10 bg-red-600/90 hover:bg-red-500 active:scale-95 text-white cursor-pointer flex items-center justify-center rounded select-none mb-1 shadow-lg transition-all border border-red-700/50"
          title="Eliminar bloque"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
      <button
        type="button"
        onClick={onZoomIn}
        className="w-10 h-10 bg-zinc-800 text-white font-bold text-xl cursor-pointer flex items-center justify-center rounded select-none hover:bg-zinc-700 active:scale-95 transition-all"
      >
        +
      </button>
      <button
        type="button"
        onClick={onZoomOut}
        className="w-10 h-10 bg-zinc-800 text-white font-bold text-xl cursor-pointer flex items-center justify-center rounded select-none hover:bg-zinc-700 active:scale-95 transition-all"
      >
        −
      </button>
      {showNextBlockButton && onNextBlock && (
        <button
          type="button"
          onClick={onNextBlock}
          className="w-10 h-10 bg-orange-500 text-white cursor-pointer flex items-center justify-center rounded mt-2 hover:bg-orange-400 active:scale-95 transition-all"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <polygon points="8,2 14,14 2,14" />
          </svg>
        </button>
      )}
    </div>
  );
};
