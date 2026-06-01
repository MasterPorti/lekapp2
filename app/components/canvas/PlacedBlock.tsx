import { Block } from "../../types";
import { BlockSvg } from "../blocks/BlockSvg";
import { BlockContent } from "../blocks/BlockContent";
import {
  LOOP_HEADER_HEIGHT,
  BLOCK_VERTICAL_SPACING,
  LOOP_SCALE,
  LOOP_INNER_X_OFFSET,
} from "../../utils/blockDimensions";

interface PlacedBlockProps {
  block: Block;
  index: number;
  isBeingEdited: boolean;
  zoom: number;
  onLongPressStart: (id: string) => void;
  onLongPressEnd: () => void;
  onEditMove: (id: string, newX: number, newY: number) => void;
  onParamClick: (
    id: string,
    type: "icon" | "number" | "motor-icon" | "motor-percent",
    color?: "blue" | "orange"
  ) => void;
}

export const PlacedBlock = ({
  block,
  index,
  isBeingEdited,
  zoom,
  onLongPressStart,
  onLongPressEnd,
  onEditMove,
  onParamClick,
}: PlacedBlockProps) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBeingEdited) {
      e.preventDefault();
      const startX = e.clientX;
      const startY = e.clientY;
      const startPosX = block.x;
      const startPosY = block.y;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        onEditMove(
          block.id,
          startPosX + (moveEvent.clientX - startX) / zoom,
          startPosY + (moveEvent.clientY - startY) / zoom
        );
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      onLongPressStart(block.id);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (isBeingEdited) {
      const touch = e.touches[0];
      const startX = touch.clientX;
      const startY = touch.clientY;
      const startPosX = block.x;
      const startPosY = block.y;

      const handleTouchMove = (moveEvent: TouchEvent) => {
        if (moveEvent.touches.length === 1) {
          const moveTouch = moveEvent.touches[0];
          onEditMove(
            block.id,
            startPosX + (moveTouch.clientX - startX) / zoom,
            startPosY + (moveTouch.clientY - startY) / zoom
          );
        }
      };

      const handleTouchEnd = () => {
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };

      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
    } else {
      onLongPressStart(block.id);
    }
  };

  return (
    <div
      className={`absolute ${
        isBeingEdited ? "selected-block-glow opacity-95 cursor-move" : ""
      }`}
      style={{
        left: `calc(50% + ${block.x}px - 42px)`,
        top: `calc(50% + ${block.y}px)`,
        transform: "translateY(-50%)",
        "--glow-color": block.color,
        zIndex: isBeingEdited
          ? 100000000
          : 1000 + Math.round(block.y / 10) + (block.lastMovedAt || 0) * 100,
        pointerEvents: "none",
      } as React.CSSProperties}
      onMouseDown={handleMouseDown}
      onMouseUp={onLongPressEnd}
      onMouseLeave={onLongPressEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={onLongPressEnd}
    >
      <div 
        className={`relative ${
          !isBeingEdited ? "cursor-pointer active:scale-[0.99]" : ""
        }`}
        style={{ pointerEvents: "none" }}
      >
        <BlockSvg
          type={block.type}
          text={block.text}
          color={block.color}
          stroke={block.stroke}
          childrenCount={block.childrenCount || 0}
        />
        <div style={{ pointerEvents: "auto" }}>
          <BlockContent
            type={block.type}
            text={block.text}
            param={block.param}
            onParamClick={(paramType, color) =>
              onParamClick(block.id, paramType, color)
            }
          />
        </div>
      </div>
    </div>
  );
};
