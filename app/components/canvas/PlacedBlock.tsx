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
  onLongPressStart: (index: number) => void;
  onLongPressEnd: () => void;
  onEditMove: (index: number, newX: number, newY: number) => void;
  onParamClick: (
    index: number,
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
    if (isBeingEdited) {
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      const startPosX = block.x;
      const startPosY = block.y;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        onEditMove(
          index,
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
      onLongPressStart(index);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isBeingEdited) {
      e.stopPropagation();
      const touch = e.touches[0];
      const startX = touch.clientX;
      const startY = touch.clientY;
      const startPosX = block.x;
      const startPosY = block.y;

      const handleTouchMove = (moveEvent: TouchEvent) => {
        if (moveEvent.touches.length === 1) {
          const moveTouch = moveEvent.touches[0];
          onEditMove(
            index,
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
      onLongPressStart(index);
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
      } as React.CSSProperties}
      onMouseDown={handleMouseDown}
      onMouseUp={onLongPressEnd}
      onMouseLeave={onLongPressEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={onLongPressEnd}
    >
      <div className={`relative ${
        !isBeingEdited ? "cursor-pointer active:scale-[0.99]" : ""
      }`}>
        <BlockSvg
          type={block.type}
          text={block.text}
          color={block.color}
          stroke={block.stroke}
          childrenCount={block.childrenCount || 0}
        />
        <BlockContent
          type={block.type}
          text={block.text}
          param={block.param}
          onParamClick={(paramType, color) =>
            onParamClick(index, paramType, color)
          }
        />
      </div>
    </div>
  );
};
