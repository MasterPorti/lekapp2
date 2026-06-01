import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Block, PlacingBlock, ParamSelectorState } from "../types";
import {
  SNAP_THRESHOLD,
  BLOCK_VERTICAL_SPACING,
  LOOP_HEADER_HEIGHT,
  LOOP_SCALE,
  LOOP_INNER_X_OFFSET,
  getLoopTotalHeight,
} from "../utils/blockDimensions";

const triggerHapticFeedback = () => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate(10);
    } catch (e) {
      console.warn("Haptics not supported or blocked:", e);
    }
  }
};

// Helper function to sanitize, assign IDs, and flatten any legacy nested blocks
export const sanitizeBlocks = (blocks: Block[]): Block[] => {
  const flatBlocks: Block[] = [];
  
  const flatten = (b: Block, parentId?: string): string => {
    const id = b.id || Math.random().toString(36).substring(2, 9);
    const flatBlock: Block = {
      ...b,
      id,
      parentId,
      children: undefined, // Clear legacy children array
    };
    flatBlocks.push(flatBlock);
    
    if (b.children && b.children.length > 0) {
      let prevChildId: string | undefined = undefined;
      b.children.forEach((child, idx) => {
        const childId = flatten(child, id);
        if (idx === 0) {
          flatBlock.childBlockId = childId;
        } else if (prevChildId) {
          const prevChild = flatBlocks.find(fb => fb.id === prevChildId);
          if (prevChild) prevChild.nextBlockId = childId;
        }
        prevChildId = childId;
      });
    }
    
    return id;
  };
  
  blocks.forEach(b => {
    if (b.parentId) {
      if (!b.id) b.id = Math.random().toString(36).substring(2, 9);
      flatBlocks.push({ ...b, children: undefined });
    } else {
      flatten(b);
    }
  });
  
  return flatBlocks;
};

const getBlockTopOffset = (type: string, height: number): number => {
  return type === "control-loop" ? -height / 2 : -18;
};

const getBlockBottomOffset = (type: string, height: number): number => {
  return type === "control-loop" ? height / 2 - 9 : 9;
};

// Layout Solver to compute visual (x, y) coordinates based on connection tree
export const resolveBlockLayouts = (blocks: Block[]): Block[] => {
  if (blocks.length === 0) return [];
  
  const flatBlocks = sanitizeBlocks(blocks);
  const blockMap = new Map<string, Block>();
  flatBlocks.forEach(b => blockMap.set(b.id, { ...b }));
  
  const roots = flatBlocks.filter(b => !b.parentId || !blockMap.has(b.parentId));
  const visited = new Set<string>();
  
  const getBlockHeight = (b: Block): number => {
    if (b.type === "control-loop") {
      let childrenCount = 0;
      let tempId = b.childBlockId;
      while (tempId) {
        const child = blockMap.get(tempId);
        if (!child) break;
        childrenCount++;
        tempId = child.nextBlockId;
      }
      b.childrenCount = childrenCount;
      return getLoopTotalHeight(childrenCount);
    }
    return 27;
  };
  
  const layoutBlock = (blockId: string, currentX: number, currentY: number, isInsideLoop = false) => {
    if (visited.has(blockId)) return;
    visited.add(blockId);
    
    const block = blockMap.get(blockId);
    if (!block) return;
    
    block.x = currentX;
    block.y = currentY;
    block.isChild = isInsideLoop;
    
    const blockHeight = getBlockHeight(block);
    
    if (block.type === "control-loop") {
      let childId = block.childBlockId;
      const topOfLoop = currentY - blockHeight / 2;
      let currentChildTopY = topOfLoop + 54;
      
      while (childId) {
        const child = blockMap.get(childId);
        if (!child) break;
        
        const childHeight = getBlockHeight(child);
        const childTopOffset = getBlockTopOffset(child.type, childHeight);
        const childY = currentChildTopY - childTopOffset;
          
        layoutBlock(childId, currentX + 39, childY, true);
        
        const childBottomOffset = getBlockBottomOffset(child.type, childHeight);
        const currentChildBottomY = childY + childBottomOffset;
          
        currentChildTopY = currentChildBottomY;
        childId = child.nextBlockId;
      }
    }
    
    if (block.nextBlockId) {
      const nextBlock = blockMap.get(block.nextBlockId);
      if (nextBlock) {
        const nextHeight = getBlockHeight(nextBlock);
        const currentBottomOffset = getBlockBottomOffset(block.type, blockHeight);
        const nextTopOffset = getBlockTopOffset(nextBlock.type, nextHeight);
        
        const connectionY = currentY + currentBottomOffset;
        const nextY = connectionY - nextTopOffset;
          
        layoutBlock(block.nextBlockId, currentX, nextY, isInsideLoop);
      }
    }
  };
  
  roots.forEach(root => {
    layoutBlock(root.id, root.x, root.y, false);
  });
  
  return Array.from(blockMap.values());
};

export const useBlockManagement = () => {
  const [placedBlocks, setPlacedBlocks] = useState<Block[]>([]);
  const [placingBlock, setPlacingBlock] = useState<PlacingBlock | null>(null);
  const [blockPosition, setBlockPosition] = useState({ x: 0, y: 0 });
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [paramSelector, setParamSelector] = useState<ParamSelectorState | null>(
    null
  );
  const [numberInput, setNumberInput] = useState("");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [undoState, setUndoState] = useState<{
    blocks: Block[];
    timeLeft: number;
  } | null>(null);
  const [preEditBlocks, setPreEditBlocks] = useState<Block[] | null>(null);

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const undoTimer = useRef<NodeJS.Timeout | null>(null);
  const nextZIndexOrder = useRef(1);

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

  const hasMaleBottom = (type: string, text?: string) => {
    if (text && text === "Detener todos") return false;
    return (
      type === "evento" ||
      type === "movimiento" ||
      type === "control" ||
      type === "control-loop"
    );
  };

  const hasFemaleTop = (type: string) =>
    type === "movimiento" || type === "control" || type === "control-loop";

  const getConnectedBlocksBelow = useCallback(
    (startId: string): string[] => {
      const connected: string[] = [startId];
      const block = placedBlocks.find(x => x.id === startId);
      if (!block) return connected;

      const addChain = (blockId: string) => {
        const b = placedBlocks.find(x => x.id === blockId);
        if (!b) return;
        if (!connected.includes(blockId)) {
          connected.push(blockId);
        }
        if (b.childBlockId) {
          addChain(b.childBlockId);
        }
        if (b.nextBlockId) {
          addChain(b.nextBlockId);
        }
      };

      if (block.childBlockId) {
        addChain(block.childBlockId);
      }
      if (block.nextBlockId) {
        addChain(block.nextBlockId);
      }

      return connected;
    },
    [placedBlocks]
  );

  const findSnapPosition = useCallback(
    (
      currentX: number,
      currentY: number,
      currentType: string,
      excludeIds: string[] = [],
      currentChildrenCount: number = 0,
      currentText: string = ""
    ) => {
      let snappedX = currentX;
      let snappedY = currentY;
      let didSnap = false;
      let bestDistance = SNAP_THRESHOLD;
      let targetBlockId: string | null = null;
      let snapConnectionMode: "next" | "child" | "prev" | null = null;

      const excludeSet = new Set(excludeIds);

      const currentHeight = currentType === "control-loop"
        ? getLoopTotalHeight(currentChildrenCount)
        : 27;
      const currentTopOffset = getBlockTopOffset(currentType, currentHeight);
      const currentBottomOffset = getBlockBottomOffset(currentType, currentHeight);

      for (let i = 0; i < placedBlocks.length; i++) {
        const other = placedBlocks[i];
        if (excludeSet.has(other.id)) continue;

        let otherHeight = 27;
        if (other.type === "control-loop") {
          otherHeight = getLoopTotalHeight(other.childrenCount || 0);
        }
        const otherTopOffset = getBlockTopOffset(other.type, otherHeight);
        const otherBottomOffset = getBlockBottomOffset(other.type, otherHeight);

        // Mode 1: Connect current BELOW other (meaning current's top notch connects to other's bottom notch)
        if (hasFemaleTop(currentType)) {
          if (hasMaleBottom(other.type, other.text)) {
            const expectedX = other.x;
            const expectedY = other.y + otherBottomOffset - currentTopOffset;

            const xDiff = Math.abs(currentX - expectedX);
            const yDiff = Math.abs(currentY - expectedY);
            const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);

            if (xDiff < SNAP_THRESHOLD && yDiff < SNAP_THRESHOLD && distance < bestDistance) {
              snappedX = expectedX;
              snappedY = expectedY;
              bestDistance = distance;
              didSnap = true;
              targetBlockId = other.id;
              snapConnectionMode = "next";
            }
          }

          // Mode 2: Connect current INSIDE other (meaning current's top notch connects to other's inner top notch)
          if (other.type === "control-loop" && !other.childBlockId) {
            const innerTopConnectionY = other.y - otherHeight / 2 + 54;
            const expectedX = other.x + 39;
            const expectedY = innerTopConnectionY - currentTopOffset;

            const xDiff = Math.abs(currentX - expectedX);
            const yDiff = Math.abs(currentY - expectedY);
            const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);

            if (xDiff < SNAP_THRESHOLD && yDiff < SNAP_THRESHOLD && distance < bestDistance) {
              snappedX = expectedX;
              snappedY = expectedY;
              bestDistance = distance;
              didSnap = true;
              targetBlockId = other.id;
              snapConnectionMode = "child";
            }
          }
        }

        // Mode 3: Connect current ABOVE other (meaning current's bottom notch connects to other's top notch)
        if (
          hasMaleBottom(currentType, currentText) &&
          hasFemaleTop(other.type) &&
          (!other.parentId || hasFemaleTop(currentType))
        ) {
          const expectedX = other.x;
          const expectedY = other.y + otherTopOffset - currentBottomOffset;

          const xDiff = Math.abs(currentX - expectedX);
          const yDiff = Math.abs(currentY - expectedY);
          const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);

          if (xDiff < SNAP_THRESHOLD && yDiff < SNAP_THRESHOLD && distance < bestDistance) {
            snappedX = expectedX;
            snappedY = expectedY;
            bestDistance = distance;
            didSnap = true;
            targetBlockId = other.id;
            snapConnectionMode = "prev";
          }
        }
      }

      return {
        x: snappedX,
        y: snappedY,
        snapped: didSnap,
        targetBlockId,
        snapConnectionMode,
      };
    },
    [placedBlocks]
  );

  const avoidOverlap = useCallback(
    (
      x: number,
      y: number,
      type: string,
      text?: string,
      excludeIds: string[] = []
    ): { x: number; y: number } => {
      let newX = x;
      let newY = y;
      let attempts = 0;
      const OVERLAP_THRESHOLD = 35;
      const excludeSet = new Set(excludeIds);

      while (attempts < 10) {
        const overlapping = placedBlocks.find((block) => {
          if (excludeSet.has(block.id)) return false;

          const dx = Math.abs(block.x - newX);
          const dy = Math.abs(block.y - newY);
          if (dx > OVERLAP_THRESHOLD || dy > OVERLAP_THRESHOLD) return false;

          const canConnectBelow =
            hasMaleBottom(block.type, block.text) &&
            hasFemaleTop(type) &&
            Math.abs(block.y + BLOCK_VERTICAL_SPACING - newY) < 5;
          const canConnectAbove =
            hasMaleBottom(type, text) &&
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

  const handleBlockLongPressStart = (blockId: string) => {
    longPressTimer.current = setTimeout(() => {
      const block = placedBlocks.find(b => b.id === blockId);
      setPreEditBlocks([...placedBlocks]);
      let newBlocks = [...placedBlocks];
      if (block && block.parentId) {
        newBlocks = newBlocks.map(b => {
          if (b.id === block.parentId) {
            const update: Partial<Block> = {};
            if (b.nextBlockId === block.id) update.nextBlockId = undefined;
            if (b.childBlockId === block.id) update.childBlockId = undefined;
            return { ...b, ...update };
          }
          if (b.id === block.id) {
            return { ...b, parentId: undefined };
          }
          return b;
        });
      }
      setPlacedBlocks(resolveBlockLayouts(newBlocks));
      setEditingBlockId(blockId);
    }, 500);
  };

  const handleBlockLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleDeleteBlock = () => {
    if (editingBlockId !== null) {
      saveForUndo();
      const block = placedBlocks.find(b => b.id === editingBlockId);
      if (!block) return;
      const toDelete = new Set(getConnectedBlocksBelow(editingBlockId));
      
      let newBlocks = placedBlocks.filter((b) => !toDelete.has(b.id));
      if (block.parentId) {
        newBlocks = newBlocks.map(b => {
          if (b.id === block.parentId) {
            const update: Partial<Block> = {};
            if (b.nextBlockId === block.id) update.nextBlockId = undefined;
            if (b.childBlockId === block.id) update.childBlockId = undefined;
            return { ...b, ...update };
          }
          return b;
        });
      }
      
      setPlacedBlocks(resolveBlockLayouts(newBlocks));
      setEditingBlockId(null);
      setPreEditBlocks(null);
    }
  };

  const handleCancelEdit = () => {
    if (preEditBlocks) {
      setPlacedBlocks(resolveBlockLayouts(preEditBlocks));
      setPreEditBlocks(null);
    }
    setEditingBlockId(null);
  };

  const handleConfirmEdit = () => {
    if (editingBlockId !== null) {
      const block = placedBlocks.find(b => b.id === editingBlockId);
      if (!block) return;
      const connectedIds = getConnectedBlocksBelow(editingBlockId);
      
      const snapped = findSnapPosition(
        block.x,
        block.y,
        block.type,
        connectedIds,
        block.childrenCount || 0,
        block.text
      );

      let newBlocks = [...placedBlocks];
      if (snapped.snapped && snapped.targetBlockId && snapped.snapConnectionMode) {
        const targetId = snapped.targetBlockId;
        const mode = snapped.snapConnectionMode;
        
        if (mode === "next" || mode === "child") {
          newBlocks = newBlocks.map(b => {
            if (b.id === block.id) return { ...b, parentId: targetId };
            return b;
          });

          const targetBlock = placedBlocks.find(b => b.id === targetId);
          let displacedId: string | undefined = undefined;
          if (targetBlock) {
            if (mode === "next") displacedId = targetBlock.nextBlockId;
            else if (mode === "child") displacedId = targetBlock.childBlockId;
          }

          newBlocks = newBlocks.map(b => {
            if (b.id === targetId) {
              if (mode === "next") return { ...b, nextBlockId: block.id };
              if (mode === "child") return { ...b, childBlockId: block.id };
            }
            return b;
          });

          if (displacedId) {
            let chainEndId = block.id;
            while (true) {
              const current = newBlocks.find(b => b.id === chainEndId);
              if (current && current.nextBlockId) {
                chainEndId = current.nextBlockId;
              } else {
                break;
              }
            }
            const dId = displacedId;
            newBlocks = newBlocks.map(b => {
              if (b.id === chainEndId) return { ...b, nextBlockId: dId };
              if (b.id === dId) return { ...b, parentId: chainEndId };
              return b;
            });
          }
        } else if (mode === "prev") {
          const targetBlock = placedBlocks.find(b => b.id === targetId);
          const oldParentId = targetBlock?.parentId;
          const wasChildOfParent = oldParentId && (newBlocks.find(b => b.id === oldParentId)?.childBlockId === targetId);

          let chainEndId = block.id;
          while (true) {
            const current = newBlocks.find(b => b.id === chainEndId);
            if (current && current.nextBlockId) {
              chainEndId = current.nextBlockId;
            } else {
              break;
            }
          }

          newBlocks = newBlocks.map(b => {
            if (b.id === targetId) return { ...b, parentId: chainEndId };
            if (b.id === chainEndId) return { ...b, nextBlockId: targetId };
            return b;
          });

          if (oldParentId) {
            newBlocks = newBlocks.map(b => {
              if (b.id === block.id) return { ...b, parentId: oldParentId };
              if (b.id === oldParentId) {
                if (wasChildOfParent) return { ...b, childBlockId: block.id };
                return { ...b, nextBlockId: block.id };
              }
              return b;
            });
          }
        }
      } else {
        const final = avoidOverlap(
          block.x,
          block.y,
          block.type,
          block.text,
          connectedIds
        );
        const deltaX = final.x - block.x;
        const deltaY = final.y - block.y;
        
        const connectedIdsSet = new Set(connectedIds);
        newBlocks = newBlocks.map(b => {
          if (connectedIdsSet.has(b.id)) {
            return {
              ...b,
              x: b.x + deltaX,
              y: b.y + deltaY,
            };
          }
          return b;
        });
      }

      const order = nextZIndexOrder.current++;
      const connectedIdsSet = new Set(connectedIds);
      newBlocks = newBlocks.map(b => {
        if (connectedIdsSet.has(b.id)) {
          return { ...b, lastMovedAt: order };
        }
        return b;
      });
      
      setPlacedBlocks(resolveBlockLayouts(newBlocks));
      setEditingBlockId(null);
      setPreEditBlocks(null);
      triggerHapticFeedback();
    }
  };

  const { displayBlocks, displayBlockPosition } = useMemo(() => {
    if (placedBlocks.length === 0) {
      return { displayBlocks: [], displayBlockPosition: blockPosition };
    }

    let tempBlocks = placedBlocks.map(b => ({ ...b }));
    let hasTempPlacing = false;

    // Case 1: We are placing a new block
    if (placingBlock) {
      const snapped = findSnapPosition(
        blockPosition.x,
        blockPosition.y,
        placingBlock.type,
        [],
        placingBlock.childrenCount || placingBlock.children?.length || 0,
        placingBlock.text
      );

      if (snapped.snapped && snapped.targetBlockId && snapped.snapConnectionMode) {
        const targetId = snapped.targetBlockId;
        const mode = snapped.snapConnectionMode;
        const tempPlacingId = "temp-placing-id";
        hasTempPlacing = true;

        // Create a temp block to represent placingBlock in the layout tree
        const tempPlacingBlock: Block = {
          ...placingBlock,
          id: tempPlacingId,
          x: snapped.x,
          y: snapped.y,
        };

        if (mode === "next" || mode === "child") {
          tempPlacingBlock.parentId = targetId;
          const targetIndex = tempBlocks.findIndex(b => b.id === targetId);
          if (targetIndex !== -1) {
            const targetBlock = tempBlocks[targetIndex];
            let displacedId: string | undefined = undefined;
            if (mode === "next") {
              displacedId = targetBlock.nextBlockId;
              tempBlocks[targetIndex] = { ...targetBlock, nextBlockId: tempPlacingId };
            } else {
              displacedId = targetBlock.childBlockId;
              tempBlocks[targetIndex] = { ...targetBlock, childBlockId: tempPlacingId };
            }

            if (displacedId) {
              tempPlacingBlock.nextBlockId = displacedId;
              const displacedIndex = tempBlocks.findIndex(b => b.id === displacedId);
              if (displacedIndex !== -1) {
                tempBlocks[displacedIndex] = { ...tempBlocks[displacedIndex], parentId: tempPlacingId };
              }
            }
          }
        } else if (mode === "prev") {
          const targetIndex = tempBlocks.findIndex(b => b.id === targetId);
          if (targetIndex !== -1) {
            const targetBlock = tempBlocks[targetIndex];
            const oldParentId = targetBlock.parentId;
            const wasChildOfParent = oldParentId && (tempBlocks.find(b => b.id === oldParentId)?.childBlockId === targetId);

            tempPlacingBlock.nextBlockId = targetId;
            tempBlocks[targetIndex] = { ...targetBlock, parentId: tempPlacingId };

            if (oldParentId) {
              tempPlacingBlock.parentId = oldParentId;
              const parentIndex = tempBlocks.findIndex(b => b.id === oldParentId);
              if (parentIndex !== -1) {
                if (wasChildOfParent) {
                  tempBlocks[parentIndex] = { ...tempBlocks[parentIndex], childBlockId: tempPlacingId };
                } else {
                  tempBlocks[parentIndex] = { ...tempBlocks[parentIndex], nextBlockId: tempPlacingId };
                }
              }
            }
          }
        }
        tempBlocks.push(tempPlacingBlock);
      }
    }

    // Case 2: We are dragging/editing an existing block tree
    if (editingBlockId !== null) {
      const mainBlock = placedBlocks.find(b => b.id === editingBlockId);
      if (mainBlock) {
        const connectedIds = getConnectedBlocksBelow(editingBlockId);

        const snapped = findSnapPosition(
          mainBlock.x,
          mainBlock.y,
          mainBlock.type,
          connectedIds,
          mainBlock.childrenCount || 0,
          mainBlock.text
        );

        if (snapped.snapped && snapped.targetBlockId && snapped.snapConnectionMode) {
          const targetId = snapped.targetBlockId;
          const mode = snapped.snapConnectionMode;
          const mainBlockId = mainBlock.id;

          const mainBlockIndex = tempBlocks.findIndex(b => b.id === mainBlockId);
          if (mainBlockIndex !== -1) {
            if (mode === "next" || mode === "child") {
              tempBlocks[mainBlockIndex] = { ...tempBlocks[mainBlockIndex], parentId: targetId };

              const targetIndex = tempBlocks.findIndex(b => b.id === targetId);
              if (targetIndex !== -1) {
                const targetBlock = tempBlocks[targetIndex];
                let displacedId: string | undefined = undefined;
                if (mode === "next") {
                  displacedId = targetBlock.nextBlockId;
                  tempBlocks[targetIndex] = { ...targetBlock, nextBlockId: mainBlockId };
                } else {
                  displacedId = targetBlock.childBlockId;
                  tempBlocks[targetIndex] = { ...targetBlock, childBlockId: mainBlockId };
                }

                if (displacedId && displacedId !== mainBlockId) {
                  // Find end of dragged chain
                  let chainEndId = mainBlockId;
                  while (true) {
                    const current = tempBlocks.find(b => b.id === chainEndId);
                    if (current && current.nextBlockId) {
                      chainEndId = current.nextBlockId;
                    } else {
                      break;
                    }
                  }
                  const chainEndIndex = tempBlocks.findIndex(b => b.id === chainEndId);
                  if (chainEndIndex !== -1) {
                    tempBlocks[chainEndIndex] = { ...tempBlocks[chainEndIndex], nextBlockId: displacedId };
                  }
                  const displacedIndex = tempBlocks.findIndex(b => b.id === displacedId);
                  if (displacedIndex !== -1) {
                    tempBlocks[displacedIndex] = { ...tempBlocks[displacedIndex], parentId: chainEndId };
                  }
                }
              }
            } else if (mode === "prev") {
              const targetIndex = tempBlocks.findIndex(b => b.id === targetId);
              if (targetIndex !== -1) {
                const targetBlock = tempBlocks[targetIndex];
                const oldParentId = targetBlock.parentId;
                const wasChildOfParent = oldParentId && (tempBlocks.find(b => b.id === oldParentId)?.childBlockId === targetId);

                let chainEndId = mainBlockId;
                while (true) {
                  const current = tempBlocks.find(b => b.id === chainEndId);
                  if (current && current.nextBlockId) {
                    chainEndId = current.nextBlockId;
                  } else {
                    break;
                  }
                }

                const chainEndIndex = tempBlocks.findIndex(b => b.id === chainEndId);
                if (chainEndIndex !== -1) {
                  tempBlocks[chainEndIndex] = { ...tempBlocks[chainEndIndex], nextBlockId: targetId };
                }
                tempBlocks[targetIndex] = { ...targetBlock, parentId: chainEndId };

                if (oldParentId && oldParentId !== mainBlockId) {
                  tempBlocks[mainBlockIndex] = { ...tempBlocks[mainBlockIndex], parentId: oldParentId };
                  const parentIndex = tempBlocks.findIndex(b => b.id === oldParentId);
                  if (parentIndex !== -1) {
                    if (wasChildOfParent) {
                      tempBlocks[parentIndex] = { ...tempBlocks[parentIndex], childBlockId: mainBlockId };
                    } else {
                      tempBlocks[parentIndex] = { ...tempBlocks[parentIndex], nextBlockId: mainBlockId };
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    const resolved = resolveBlockLayouts(tempBlocks);

    let resolvedPlacingPos = blockPosition;
    if (hasTempPlacing) {
      const tempPlacing = resolved.find(b => b.id === "temp-placing-id");
      if (tempPlacing) {
        resolvedPlacingPos = { x: tempPlacing.x, y: tempPlacing.y };
      }
    }

    return {
      displayBlocks: resolved.filter(b => b.id !== "temp-placing-id"),
      displayBlockPosition: resolvedPlacingPos,
    };
  }, [placedBlocks, placingBlock, blockPosition, editingBlockId, findSnapPosition]);

  const handleEditBlockMove = (
    draggedId: string,
    newX: number,
    newY: number
  ) => {
    if (editingBlockId === null) return;

    const mainBlock = placedBlocks.find(b => b.id === editingBlockId);
    const draggedBlock = placedBlocks.find(b => b.id === draggedId);
    if (!mainBlock || !draggedBlock) return;

    const displayBlock = displayBlocks.find((b) => b.id === draggedId);
    const shiftX = displayBlock ? displayBlock.x - draggedBlock.x : 0;
    const shiftY = displayBlock ? displayBlock.y - draggedBlock.y : 0;

    const correctedNewX = newX - shiftX;
    const correctedNewY = newY - shiftY;

    const deltaX = correctedNewX - draggedBlock.x;
    const deltaY = correctedNewY - draggedBlock.y;
    const connectedIds = getConnectedBlocksBelow(editingBlockId);
    const connectedIdsSet = new Set(connectedIds);

    let newBlocks = placedBlocks.map(b => {
      if (connectedIdsSet.has(b.id)) {
        return {
          ...b,
          x: b.x + deltaX,
          y: b.y + deltaY,
        };
      }
      return b;
    });

    const updatedMainBlock = newBlocks.find(b => b.id === editingBlockId);
    if (updatedMainBlock) {
      const snapped = findSnapPosition(
        updatedMainBlock.x,
        updatedMainBlock.y,
        mainBlock.type,
        connectedIds,
        mainBlock.childrenCount || 0,
        mainBlock.text
      );
      if (snapped.snapped) {
        const snapDeltaX = snapped.x - updatedMainBlock.x;
        const snapDeltaY = snapped.y - updatedMainBlock.y;
        newBlocks = newBlocks.map(b => {
          if (connectedIdsSet.has(b.id)) {
            return {
              ...b,
              x: b.x + snapDeltaX,
              y: b.y + snapDeltaY,
            };
          }
          return b;
        });
      }
    }

    setPlacedBlocks(newBlocks);
  };

  const handleParamSelect = (option: string) => {
    let finalOption = option;
    let isControlLoop = false;
    if (paramSelector?.target === "placing" && placingBlock) {
      if (placingBlock.type === "control-loop") {
        isControlLoop = true;
      }
    } else if (paramSelector?.target && paramSelector.target !== "placing") {
      const currentBlock = placedBlocks.find(b => b.id === paramSelector.target);
      if (currentBlock && currentBlock.type === "control-loop") {
        isControlLoop = true;
      }
    }

    if (isControlLoop) {
      const val = parseFloat(option);
      if (!isNaN(val) && val > 9999999) {
        setAlertMessage("¡Tranquilo! 🤠 ¡No hagas explotar la computadora! 😂");
        finalOption = "";
      }
    }

    if (paramSelector?.target === "placing" && placingBlock) {
      if (paramSelector.type === "motor-icon") {
        const currentPercent = placingBlock.param?.split(":")[1] || "100";
        setPlacingBlock({
          ...placingBlock,
          param: `${finalOption}:${currentPercent}`,
        });
      } else if (paramSelector.type === "motor-percent") {
        const currentIcon = placingBlock.param?.split(":")[0] || "X";
        setPlacingBlock({ ...placingBlock, param: `${currentIcon}:${finalOption}` });
      } else {
        setPlacingBlock({ ...placingBlock, param: finalOption });
      }
    } else if (paramSelector?.target && paramSelector.target !== "placing") {
      const newBlocks = placedBlocks.map(b => {
        if (b.id === paramSelector.target) {
          if (paramSelector.type === "motor-icon") {
            const currentPercent = b.param?.split(":")[1] || "100";
            return {
              ...b,
              param: `${finalOption}:${currentPercent}`,
            };
          } else if (paramSelector.type === "motor-percent") {
            const currentIcon = b.param?.split(":")[0] || "X";
            return {
              ...b,
              param: `${currentIcon}:${finalOption}`,
            };
          } else {
            return { ...b, param: finalOption };
          }
        }
        return b;
      });
      setPlacedBlocks(resolveBlockLayouts(newBlocks));
    }
    setParamSelector(null);
  };

  const handleConfirmBlock = () => {
    if (placingBlock) {
      const snapped = findSnapPosition(
        blockPosition.x,
        blockPosition.y,
        placingBlock.type,
        [],
        placingBlock.childrenCount || placingBlock.children?.length || 0,
        placingBlock.text
      );

      const blockId = Math.random().toString(36).substring(2, 9);
      const newBlock: Block = {
        ...placingBlock,
        id: blockId,
        x: snapped.x,
        y: snapped.y,
        lastMovedAt: nextZIndexOrder.current++,
      };

      let newBlocks = [...placedBlocks, newBlock];

      if (snapped.snapped && snapped.targetBlockId && snapped.snapConnectionMode) {
        const targetId = snapped.targetBlockId;
        const mode = snapped.snapConnectionMode;

        if (mode === "next" || mode === "child") {
          newBlocks = newBlocks.map(b => {
            if (b.id === blockId) return { ...b, parentId: targetId };
            return b;
          });

          const targetBlock = placedBlocks.find(b => b.id === targetId);
          let displacedId: string | undefined = undefined;
          if (targetBlock) {
            if (mode === "next") displacedId = targetBlock.nextBlockId;
            else if (mode === "child") displacedId = targetBlock.childBlockId;
          }

          newBlocks = newBlocks.map(b => {
            if (b.id === targetId) {
              if (mode === "next") return { ...b, nextBlockId: blockId };
              if (mode === "child") return { ...b, childBlockId: blockId };
            }
            return b;
          });

          if (displacedId) {
            const dId = displacedId;
            newBlocks = newBlocks.map(b => {
              if (b.id === blockId) return { ...b, nextBlockId: dId };
              if (b.id === dId) return { ...b, parentId: blockId };
              return b;
            });
          }
        } else if (mode === "prev") {
          const targetBlock = placedBlocks.find(b => b.id === targetId);
          const oldParentId = targetBlock?.parentId;
          const wasChildOfParent = oldParentId && (newBlocks.find(b => b.id === oldParentId)?.childBlockId === targetId);

          newBlocks = newBlocks.map(b => {
            if (b.id === targetId) return { ...b, parentId: blockId };
            if (b.id === blockId) return { ...b, nextBlockId: targetId };
            return b;
          });

          if (oldParentId) {
            newBlocks = newBlocks.map(b => {
              if (b.id === blockId) return { ...b, parentId: oldParentId };
              if (b.id === oldParentId) {
                if (wasChildOfParent) return { ...b, childBlockId: blockId };
                return { ...b, nextBlockId: blockId };
              }
              return b;
            });
          }
        }
      } else {
        const final = avoidOverlap(snapped.x, snapped.y, placingBlock.type, placingBlock.text);
        newBlock.x = final.x;
        newBlock.y = final.y;
      }
      
      setPlacedBlocks(resolveBlockLayouts(newBlocks));
      setPlacingBlock(null);
      triggerHapticFeedback();
    }
  };

  // useMemo of displayBlocks moved above handleEditBlockMove

  const handleCancelBlock = () => {
    setPlacingBlock(null);
  };

  return {
    placedBlocks: displayBlocks,
    setPlacedBlocks: (blocks: Block[]) => setPlacedBlocks(resolveBlockLayouts(blocks)),
    placingBlock,
    setPlacingBlock,
    blockPosition: displayBlockPosition,
    rawBlockPosition: blockPosition,
    setBlockPosition,
    editingBlockId,
    setEditingBlockId,
    paramSelector,
    setParamSelector,
    numberInput,
    setNumberInput,
    alertMessage,
    setAlertMessage,
    undoState,
    getConnectedBlocksBelow,
    findSnapPosition,
    saveForUndo,
    handleUndo,
    handleBlockLongPressStart,
    handleBlockLongPressEnd,
    handleDeleteBlock,
    handleCancelEdit,
    handleConfirmEdit,
    handleEditBlockMove,
    handleParamSelect,
    handleConfirmBlock,
    handleCancelBlock,
  };
};
