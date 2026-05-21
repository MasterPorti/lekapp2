import { useState, useRef, useEffect, useCallback } from "react";
import { Block, PlacingBlock, ParamSelectorState } from "../types";
import {
  SNAP_THRESHOLD,
  BLOCK_VERTICAL_SPACING,
  LOOP_HEADER_HEIGHT,
  LOOP_SCALE,
  LOOP_INNER_X_OFFSET,
  getLoopTotalHeight,
} from "../utils/blockDimensions";

export const useBlockManagement = () => {
  const [placedBlocks, setPlacedBlocks] = useState<Block[]>([]);
  const [placingBlock, setPlacingBlock] = useState<PlacingBlock | null>(null);
  const [blockPosition, setBlockPosition] = useState({ x: 0, y: 0 });
  const [editingBlockIndex, setEditingBlockIndex] = useState<number | null>(
    null
  );
  const [paramSelector, setParamSelector] = useState<ParamSelectorState | null>(
    null
  );
  const [numberInput, setNumberInput] = useState("");
  const [undoState, setUndoState] = useState<{
    blocks: Block[];
    timeLeft: number;
  } | null>(null);

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const undoTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (undoState && undoState.timeLeft > 0) {
      undoTimer.current = setTimeout(() => {
        setUndoState((prev) =>
          prev ? { ...prev, timeLeft: prev.timeLeft - 100 } : null
        );
      }, 100);
    } else if (undoState && undoState.timeLeft <= 0) {
      setUndoState(null);
    }
    return () => {
      if (undoTimer.current) clearTimeout(undoTimer.current);
    };
  }, [undoState]);

  const hasMaleBottom = (type: string) =>
    type === "evento" ||
    type === "movimiento" ||
    type === "control" ||
    type === "control-loop";

  const hasFemaleTop = (type: string) =>
    type === "movimiento" || type === "control" || type === "control-loop";

  const getConnectedBlocksBelow = useCallback(
    (startIndex: number): number[] => {
      const connected: number[] = [startIndex];
      const block = placedBlocks[startIndex];
      if (!block || !hasMaleBottom(block.type)) return connected;

      for (let i = 0; i < placedBlocks.length; i++) {
        if (i === startIndex) continue;
        const other = placedBlocks[i];

        if (
          hasFemaleTop(other.type) &&
          Math.abs(other.x - block.x) < 10 &&
          Math.abs(other.y - (block.y + BLOCK_VERTICAL_SPACING)) < 10
        ) {
          connected.push(...getConnectedBlocksBelow(i));
          break;
        }
      }

      return connected;
    },
    [placedBlocks]
  );

  const CHILD_BLOCK_RENDERED_HEIGHT = 62;

  const getLoopInnerPosition = (loopBlock: Block) => {
    const childCount = loopBlock.children?.length || 0;
    const currentLoopHeight = getLoopTotalHeight(childCount);
    const innerX = loopBlock.x + LOOP_INNER_X_OFFSET * LOOP_SCALE;
    const childOffsetY =
      LOOP_HEADER_HEIGHT * LOOP_SCALE -
      15 +
      childCount * BLOCK_VERTICAL_SPACING;
    const innerY =
      loopBlock.y -
      currentLoopHeight / 2 +
      childOffsetY +
      CHILD_BLOCK_RENDERED_HEIGHT / 2;
    return { x: innerX, y: innerY };
  };

  const getLoopBottomPosition = (loopBlock: Block) => {
    const childCount = loopBlock.children?.length || 0;
    const loopHeight = getLoopTotalHeight(childCount);
    return { x: loopBlock.x, y: loopBlock.y + loopHeight / 2 };
  };

  const findSnapPosition = useCallback(
    (
      currentX: number,
      currentY: number,
      currentType: string,
      excludeIndices: number[] = []
    ) => {
      let snappedX = currentX;
      let snappedY = currentY;
      let didSnap = false;
      let bestDistance = SNAP_THRESHOLD;
      let snapToLoopIndex: number | null = null;
      const excludeSet = new Set(excludeIndices);

      for (let i = 0; i < placedBlocks.length; i++) {
        if (excludeSet.has(i)) continue;
        const other = placedBlocks[i];

        // Snap inside control-loop block
        if (other.type === "control-loop" && hasFemaleTop(currentType)) {
          const innerPos = getLoopInnerPosition(other);
          const expectedX = innerPos.x;
          const expectedY = innerPos.y;

          const xDiff = Math.abs(currentX - expectedX);
          const yDiff = Math.abs(currentY - expectedY);
          const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);

          if (
            xDiff < SNAP_THRESHOLD * 1.5 &&
            yDiff < SNAP_THRESHOLD * 1.5 &&
            distance < bestDistance
          ) {
            snappedX = expectedX;
            snappedY = expectedY;
            bestDistance = distance;
            didSnap = true;
            snapToLoopIndex = i;
          }
        }

        const xDiff = Math.abs(currentX - other.x);
        if (xDiff > SNAP_THRESHOLD) continue;

        if (hasMaleBottom(other.type) && hasFemaleTop(currentType)) {
          let expectedY: number;
          if (other.type === "control-loop") {
            const bottomPos = getLoopBottomPosition(other);
            expectedY = bottomPos.y;
          } else {
            expectedY = other.y + BLOCK_VERTICAL_SPACING;
          }

          // Si el bloque actual es control-loop, ajustar para su altura
          if (currentType === "control-loop") {
            const currentChildCount = 0; // Bloque nuevo no tiene hijos aún
            const currentLoopHeight = getLoopTotalHeight(currentChildCount);
            expectedY = expectedY + currentLoopHeight / 2 - 20;
          }

          const distance = Math.abs(currentY - expectedY);
          const occupied = placedBlocks.some(
            (b, idx) =>
              !excludeSet.has(idx) &&
              Math.abs(b.x - other.x) < 10 &&
              Math.abs(b.y - expectedY) < 10
          );

          if (distance < bestDistance && !occupied) {
            snappedX = other.x;
            snappedY = expectedY;
            bestDistance = distance;
            didSnap = true;
            snapToLoopIndex = null;
          }
        }

        if (hasMaleBottom(currentType) && hasFemaleTop(other.type)) {
          let expectedY: number;
          if (other.type === "control-loop") {
            const childCount = other.children?.length || 0;
            const loopHeight = getLoopTotalHeight(childCount);
            expectedY = other.y - loopHeight / 2 - BLOCK_VERTICAL_SPACING + 14;
          } else {
            expectedY = other.y - BLOCK_VERTICAL_SPACING;
          }
          const distance = Math.abs(currentY - expectedY);
          const occupied = placedBlocks.some(
            (b, idx) =>
              !excludeSet.has(idx) &&
              Math.abs(b.x - other.x) < 10 &&
              Math.abs(b.y - expectedY) < 10
          );

          if (distance < bestDistance && !occupied) {
            snappedX = other.x;
            snappedY = expectedY;
            bestDistance = distance;
            didSnap = true;
            snapToLoopIndex = null;
          }
        }
      }

      return {
        x: snappedX,
        y: snappedY,
        snapped: didSnap,
        loopIndex: snapToLoopIndex,
      };
    },
    [placedBlocks]
  );

  const avoidOverlap = useCallback(
    (x: number, y: number, type: string): { x: number; y: number } => {
      let newX = x;
      let newY = y;
      let attempts = 0;
      const OVERLAP_THRESHOLD = 35;

      while (attempts < 10) {
        const overlapping = placedBlocks.find((block) => {
          const dx = Math.abs(block.x - newX);
          const dy = Math.abs(block.y - newY);
          if (dx > OVERLAP_THRESHOLD || dy > OVERLAP_THRESHOLD) return false;

          const canConnectBelow =
            hasMaleBottom(block.type) &&
            hasFemaleTop(type) &&
            Math.abs(block.y + BLOCK_VERTICAL_SPACING - newY) < 5;
          const canConnectAbove =
            hasMaleBottom(type) &&
            hasFemaleTop(block.type) &&
            Math.abs(block.y - BLOCK_VERTICAL_SPACING - newY) < 5;

          return !canConnectBelow && !canConnectAbove;
        });

        if (!overlapping) break;

        newX += 40;
        newY -= 30;
        attempts++;
      }

      return { x: newX, y: newY };
    },
    [placedBlocks]
  );

  const saveForUndo = () => {
    setUndoState({ blocks: [...placedBlocks], timeLeft: 4000 });
  };

  const handleUndo = () => {
    if (undoState) {
      setPlacedBlocks(undoState.blocks);
      setUndoState(null);
    }
  };

  const handleBlockLongPressStart = (index: number) => {
    longPressTimer.current = setTimeout(() => {
      setEditingBlockIndex(index);
    }, 500);
  };

  const handleBlockLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleDeleteBlock = () => {
    if (editingBlockIndex !== null) {
      saveForUndo();
      const toDelete = new Set(getConnectedBlocksBelow(editingBlockIndex));
      setPlacedBlocks(placedBlocks.filter((_, i) => !toDelete.has(i)));
      setEditingBlockIndex(null);
    }
  };

  const handleConfirmEdit = () => {
    setEditingBlockIndex(null);
  };

  const handleEditBlockMove = (
    draggedIndex: number,
    newX: number,
    newY: number
  ) => {
    if (editingBlockIndex === null) return;

    const mainBlock = placedBlocks[editingBlockIndex];
    const draggedBlock = placedBlocks[draggedIndex];
    const deltaX = newX - draggedBlock.x;
    const deltaY = newY - draggedBlock.y;
    const connectedIndices = getConnectedBlocksBelow(editingBlockIndex);

    const newBlocks = [...placedBlocks];
    for (const i of connectedIndices) {
      newBlocks[i] = {
        ...newBlocks[i],
        x: newBlocks[i].x + deltaX,
        y: newBlocks[i].y + deltaY,
      };
    }

    const snapped = findSnapPosition(
      newBlocks[editingBlockIndex].x,
      newBlocks[editingBlockIndex].y,
      mainBlock.type,
      connectedIndices
    );
    if (snapped.snapped) {
      const snapDeltaX = snapped.x - newBlocks[editingBlockIndex].x;
      const snapDeltaY = snapped.y - newBlocks[editingBlockIndex].y;
      for (const i of connectedIndices) {
        newBlocks[i] = {
          ...newBlocks[i],
          x: newBlocks[i].x + snapDeltaX,
          y: newBlocks[i].y + snapDeltaY,
        };
      }
    }

    setPlacedBlocks(newBlocks);
  };

  const handleParamSelect = (option: string) => {
    if (paramSelector?.target === "placing" && placingBlock) {
      if (paramSelector.type === "motor-icon") {
        const currentPercent = placingBlock.param?.split(":")[1] || "100";
        setPlacingBlock({
          ...placingBlock,
          param: `${option}:${currentPercent}`,
        });
      } else if (paramSelector.type === "motor-percent") {
        const currentIcon = placingBlock.param?.split(":")[0] || "X";
        setPlacingBlock({ ...placingBlock, param: `${currentIcon}:${option}` });
      } else {
        setPlacingBlock({ ...placingBlock, param: option });
      }
    } else if (typeof paramSelector?.target === "number") {
      const newBlocks = [...placedBlocks];
      const currentBlock = newBlocks[paramSelector.target];
      if (paramSelector.type === "motor-icon") {
        const currentPercent = currentBlock.param?.split(":")[1] || "100";
        newBlocks[paramSelector.target] = {
          ...currentBlock,
          param: `${option}:${currentPercent}`,
        };
      } else if (paramSelector.type === "motor-percent") {
        const currentIcon = currentBlock.param?.split(":")[0] || "X";
        newBlocks[paramSelector.target] = {
          ...currentBlock,
          param: `${currentIcon}:${option}`,
        };
      } else {
        newBlocks[paramSelector.target] = { ...currentBlock, param: option };
      }
      setPlacedBlocks(newBlocks);
    }
    setParamSelector(null);
  };

  const handleConfirmBlock = () => {
    if (placingBlock) {
      const snapped = findSnapPosition(
        blockPosition.x,
        blockPosition.y,
        placingBlock.type
      );

      if (snapped.loopIndex !== null && snapped.loopIndex !== undefined) {
        const newBlocks = [...placedBlocks];
        const loopBlock = newBlocks[snapped.loopIndex];
        const newChild: Block = {
          x: snapped.x,
          y: snapped.y,
          ...placingBlock,
        };
        newBlocks[snapped.loopIndex] = {
          ...loopBlock,
          children: [...(loopBlock.children || []), newChild],
        };
        setPlacedBlocks(newBlocks);
      } else {
        const final = avoidOverlap(snapped.x, snapped.y, placingBlock.type);
        setPlacedBlocks([
          ...placedBlocks,
          { x: final.x, y: final.y, ...placingBlock },
        ]);
      }
      setPlacingBlock(null);
    }
  };

  const handleCancelBlock = () => {
    setPlacingBlock(null);
  };

  return {
    placedBlocks,
    setPlacedBlocks,
    placingBlock,
    setPlacingBlock,
    blockPosition,
    setBlockPosition,
    editingBlockIndex,
    setEditingBlockIndex,
    paramSelector,
    setParamSelector,
    numberInput,
    setNumberInput,
    undoState,
    getConnectedBlocksBelow,
    findSnapPosition,
    saveForUndo,
    handleUndo,
    handleBlockLongPressStart,
    handleBlockLongPressEnd,
    handleDeleteBlock,
    handleConfirmEdit,
    handleEditBlockMove,
    handleParamSelect,
    handleConfirmBlock,
    handleCancelBlock,
  };
};
