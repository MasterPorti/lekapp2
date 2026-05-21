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

  const renderChildBlocks = () => {
    if (block.type !== "control-loop" || !block.children?.length) return null;

    return block.children.map((child, childIndex) => {
      const childOffsetX = LOOP_INNER_X_OFFSET * LOOP_SCALE - 1;
      const childOffsetY =
        LOOP_HEADER_HEIGHT * LOOP_SCALE -
        15 +
        childIndex * BLOCK_VERTICAL_SPACING;

      return (
        <div
          key={childIndex}
          className="absolute"
          style={{
            left: `${childOffsetX}px`,
            top: `${childOffsetY}px`,
          }}
        >
          <div className="relative">
            <BlockSvg
              type={child.type}
              text={child.text}
              color={child.color}
              stroke={child.stroke}
            />
            <BlockContent
              type={child.type}
              text={child.text}
              param={child.param}
            />
          </div>
        </div>
      );
    });
  };

  return (
    <div
      className={`absolute ${
        isBeingEdited ? "animate-pulse opacity-70 cursor-move" : ""
      }`}
      style={{
        left: `calc(50% + ${block.x}px - 42px)`,
        top: `calc(50% + ${block.y}px)`,
        transform: "translateY(-50%)",
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={onLongPressEnd}
      onMouseLeave={onLongPressEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={onLongPressEnd}
    >
      <div className="relative">
        <BlockSvg
          type={block.type}
          text={block.text}
          color={block.color}
          stroke={block.stroke}
          childrenCount={block.children?.length || 0}
        />
        <BlockContent
          type={block.type}
          text={block.text}
          param={block.param}
          onParamClick={(paramType, color) =>
            onParamClick(index, paramType, color)
          }
        />
        {renderChildBlocks()}
      </div>
    </div>
  );
};
