import { PlacingBlock as PlacingBlockType } from "../../types";
import { BlockSvg } from "../blocks/BlockSvg";
import { BlockContent } from "../blocks/BlockContent";

interface PlacingBlockProps {
  block: PlacingBlockType;
  position: { x: number; y: number };
  zoom: number;
  onMove: (x: number, y: number) => void;
  onParamClick: (type: "icon" | "number" | "motor-icon" | "motor-percent", color?: "blue" | "orange") => void;
}

export const PlacingBlockComponent = ({
  block,
  position,
  zoom,
  onMove,
  onParamClick,
}: PlacingBlockProps) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = position.x;
    const startPosY = position.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const rawX = startPosX + (moveEvent.clientX - startX) / zoom;
      const rawY = startPosY + (moveEvent.clientY - startY) / zoom;
      onMove(rawX, rawY);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const startX = touch.clientX;
      const startY = touch.clientY;
      const startPosX = position.x;
      const startPosY = position.y;

      const handleTouchMove = (moveEvent: TouchEvent) => {
        if (moveEvent.touches.length === 1) {
          const moveTouch = moveEvent.touches[0];
          const rawX = startPosX + (moveTouch.clientX - startX) / zoom;
          const rawY = startPosY + (moveTouch.clientY - startY) / zoom;
          onMove(rawX, rawY);
        }
      };

      const handleTouchEnd = () => {
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };

      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
    }
  };

  return (
    <div
      className="absolute selected-block-glow opacity-95 cursor-move"
      style={{
        left: `calc(50% + ${position.x}px - 42px)`,
        top: `calc(50% + ${position.y}px)`,
        transform: "translateY(-50%)",
        "--glow-color": block.color,
        zIndex: 100000000,
        pointerEvents: "none",
      } as React.CSSProperties}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className="relative" style={{ pointerEvents: "none" }}>
        <BlockSvg
          type={block.type}
          text={block.text}
          color={block.color}
          stroke={block.stroke}
          childrenCount={block.childrenCount || block.children?.length || 0}
        />
        <div style={{ pointerEvents: "auto" }}>
          <BlockContent
            type={block.type}
            text={block.text}
            param={block.param}
            onParamClick={onParamClick}
          />
        </div>
      </div>
    </div>
  );
};
