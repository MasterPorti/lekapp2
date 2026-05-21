interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onNextBlock?: () => void;
  showNextBlockButton: boolean;
}

export const ZoomControls = ({
  onZoomIn,
  onZoomOut,
  onNextBlock,
  showNextBlockButton,
}: ZoomControlsProps) => {
  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
      <button
        type="button"
        onClick={onZoomIn}
        className="w-10 h-10 bg-zinc-800 text-white font-bold text-xl cursor-pointer flex items-center justify-center rounded select-none"
      >
        +
      </button>
      <button
        type="button"
        onClick={onZoomOut}
        className="w-10 h-10 bg-zinc-800 text-white font-bold text-xl cursor-pointer flex items-center justify-center rounded select-none"
      >
        −
      </button>
      {showNextBlockButton && onNextBlock && (
        <button
          type="button"
          onClick={onNextBlock}
          className="w-10 h-10 bg-orange-500 text-white cursor-pointer flex items-center justify-center rounded mt-2"
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
