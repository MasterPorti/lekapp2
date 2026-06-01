import { useState, useRef, useCallback } from "react";
import { Block, PlacingBlock } from "../types";

interface UseCanvasControlsProps {
  placedBlocks: Block[];
  placingBlock: PlacingBlock | null;
  blockPosition: { x: number; y: number };
  onCanvasClick?: () => void;
}

export const useCanvasControls = ({
  placedBlocks,
  placingBlock,
  blockPosition,
  onCanvasClick,
}: UseCanvasControlsProps) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);

  const lastTouchDistance = useRef<number | null>(null);

  const handleZoomIn = () => {
    setZoom((z) => Math.min(z + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(z - 0.2, 0.3));
  };

  const handleNextBlock = useCallback(() => {
    const eventoBlocks = placedBlocks
      .map((block, index) => ({ block, index }))
      .filter(({ block }) => block.type === "evento");

    if (eventoBlocks.length === 0) return;

    const currentEventoIndex = eventoBlocks.findIndex(
      ({ index }) => index === currentBlockIndex
    );
    const nextEventoIndex = (currentEventoIndex + 1) % eventoBlocks.length;
    const { block, index } = eventoBlocks[nextEventoIndex];

    setCurrentBlockIndex(index);
    setPan({ x: -block.x * zoom, y: -block.y * zoom });
  }, [placedBlocks, currentBlockIndex, zoom]);

  const handlePinch = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      if (lastTouchDistance.current !== null) {
        const delta = distance - lastTouchDistance.current;
        setZoom((z) => Math.max(0.3, Math.min(3, z + delta * 0.005)));
      }
      lastTouchDistance.current = distance;
    }
  };

  const handlePinchEnd = () => {
    lastTouchDistance.current = null;
  };

  const isContentOffScreen = useCallback(() => {
    const screenW = typeof window !== "undefined" ? window.innerWidth : 400;
    const screenH = typeof window !== "undefined" ? window.innerHeight : 800;
    const centerX = screenW / 2;
    const centerY = screenH / 2;

    const svgScreenX = centerX + pan.x;
    const svgScreenY = centerY + pan.y;
    const svgW = (180 * zoom) / 2;
    const svgH = (128 * zoom) / 2;

    const svgVisible =
      svgScreenX + svgW > 0 &&
      svgScreenX - svgW < screenW &&
      svgScreenY + svgH > 0 &&
      svgScreenY - svgH < screenH;

    if (placedBlocks.length === 0 && !placingBlock) {
      return !svgVisible;
    }

    const allBlocks = placingBlock
      ? [...placedBlocks, blockPosition]
      : placedBlocks;

    for (const block of allBlocks) {
      const blockScreenX = centerX + pan.x + block.x * zoom;
      const blockScreenY = centerY + pan.y + block.y * zoom;
      const blockW = 140 * zoom;
      const blockH = 25 * zoom;

      if (
        blockScreenX + blockW > 0 &&
        blockScreenX - blockW < screenW &&
        blockScreenY + blockH > 0 &&
        blockScreenY - blockH < screenH
      ) {
        return false;
      }
    }
    return true;
  }, [pan, zoom, placedBlocks, placingBlock, blockPosition]);

  const handleCenterScreen = useCallback(() => {
    if (placedBlocks.length > 0) {
      const lastBlock = placedBlocks[placedBlocks.length - 1];
      setPan({ x: -lastBlock.x * zoom, y: -lastBlock.y * zoom });
    } else {
      setPan({ x: 0, y: 0 });
      setZoom(1);
    }
  }, [placedBlocks, zoom]);

  const handleCanvasPan = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startPanX = pan.x;
    const startPanY = pan.y;
    let hasMoved = false;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      if (Math.hypot(dx, dy) > 5) {
        hasMoved = true;
      }
      setPan({
        x: startPanX + dx,
        y: startPanY + dy,
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (!hasMoved && onCanvasClick) {
        onCanvasClick();
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleCanvasTouchPan = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    const startPanX = pan.x;
    const startPanY = pan.y;
    let hasMoved = false;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length !== 1) return;
      const moveTouch = moveEvent.touches[0];
      const dx = moveTouch.clientX - startX;
      const dy = moveTouch.clientY - startY;
      if (Math.hypot(dx, dy) > 5) {
        hasMoved = true;
      }
      setPan({
        x: startPanX + dx,
        y: startPanY + dy,
      });
    };

    const handleTouchEnd = () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      if (!hasMoved && onCanvasClick) {
        onCanvasClick();
      }
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
  };

  return {
    zoom,
    pan,
    setPan,
    handleZoomIn,
    handleZoomOut,
    handleNextBlock,
    handlePinch,
    handlePinchEnd,
    isContentOffScreen,
    handleCenterScreen,
    handleCanvasPan,
    handleCanvasTouchPan,
  };
};
