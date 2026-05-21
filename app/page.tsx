"use client";

import { useState, useRef } from "react";
import { useBlockManagement, useCanvasControls } from "./hooks";
import { LekLogo, PlacedBlock, PlacingBlockComponent } from "./components/canvas";
import { BlockSelectorModal, ParamSelectorModal } from "./components/modals";
import { ZoomControls, UndoButton, BottomButtons, ActionButtons } from "./components/ui";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [activeButton, setActiveButton] = useState<string>("programacion");
  const [activeCategory, setActiveCategory] = useState<string>("eventos");

  const canvasRef = useRef<HTMLDivElement>(null);

  const {
    placedBlocks,
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
    handleUndo,
    handleBlockLongPressStart,
    handleBlockLongPressEnd,
    handleDeleteBlock,
    handleConfirmEdit,
    handleEditBlockMove,
    handleParamSelect,
    handleConfirmBlock,
    handleCancelBlock,
  } = useBlockManagement();

  const {
    zoom,
    pan,
    handleZoomIn,
    handleZoomOut,
    handleNextBlock,
    handlePinch,
    handlePinchEnd,
    isContentOffScreen,
    handleCenterScreen,
    handleCanvasPan,
    handleCanvasTouchPan,
  } = useCanvasControls({
    placedBlocks,
    placingBlock,
    blockPosition,
  });

  const handleBlockClick = (
    type: string,
    text: string,
    color: string,
    stroke: string,
    param?: string
  ) => {
    setShowModal(false);
    setActiveButton("programacion");
    setBlockPosition({ x: -pan.x / zoom, y: -pan.y / zoom });
    setPlacingBlock({ type, text, color, stroke, param });
  };

  const handleBloquesClick = () => {
    setEditingBlockIndex(null);
    setPlacingBlock(null);
    setParamSelector(null);
    setActiveButton("bloques");
    setShowModal(true);
  };

  const handleProgramacionClick = () => {
    setActiveButton("programacion");
    setShowModal(false);
  };

  const handlePlacingBlockParamClick = (
    type: "icon" | "number" | "motor-icon" | "motor-percent",
    color?: "blue" | "orange"
  ) => {
    setParamSelector({ target: "placing", type, color });
    if (type === "number" || type === "motor-percent") {
      if (placingBlock?.param) {
        const value = type === "motor-percent"
          ? placingBlock.param.split(":")[1] || "100"
          : placingBlock.param;
        setNumberInput(value);
      }
    }
  };

  const handlePlacedBlockParamClick = (
    index: number,
    type: "icon" | "number" | "motor-icon" | "motor-percent",
    color?: "blue" | "orange"
  ) => {
    setParamSelector({ target: index, type, color });
    if (type === "number" || type === "motor-percent") {
      const block = placedBlocks[index];
      if (block?.param) {
        const value = type === "motor-percent"
          ? block.param.split(":")[1] || "100"
          : block.param;
        setNumberInput(value);
      }
    }
  };

  const handlePlacingBlockMove = (rawX: number, rawY: number) => {
    if (placingBlock) {
      const snapped = findSnapPosition(rawX, rawY, placingBlock.type);
      setBlockPosition({ x: snapped.x, y: snapped.y });
    }
  };

  const contentOffScreen = isContentOffScreen();
  const hasEventoBlocks = placedBlocks.some((b) => b.type === "evento");

  return (
    <div className="flex flex-col items-center justify-between h-dvh py-8 overflow-hidden">
      {showModal && (
        <BlockSelectorModal
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          onBlockClick={handleBlockClick}
        />
      )}

      <div
        ref={canvasRef}
        className={`flex-1 w-full overflow-hidden relative ${
          showModal ? "invisible" : ""
        }`}
        onMouseDown={handleCanvasPan}
        onTouchStart={handleCanvasTouchPan}
        onTouchMove={handlePinch}
        onTouchEnd={handlePinchEnd}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          <LekLogo />

          {placedBlocks.map((block, index) => {
            const isBeingEdited =
              editingBlockIndex !== null &&
              getConnectedBlocksBelow(editingBlockIndex).includes(index);
            return (
              <PlacedBlock
                key={index}
                block={block}
                index={index}
                isBeingEdited={isBeingEdited}
                zoom={zoom}
                onLongPressStart={handleBlockLongPressStart}
                onLongPressEnd={handleBlockLongPressEnd}
                onEditMove={handleEditBlockMove}
                onParamClick={handlePlacedBlockParamClick}
              />
            );
          })}

          {placingBlock && (
            <PlacingBlockComponent
              block={placingBlock}
              position={blockPosition}
              zoom={zoom}
              onMove={handlePlacingBlockMove}
              onParamClick={handlePlacingBlockParamClick}
            />
          )}
        </div>

        <ZoomControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onNextBlock={handleNextBlock}
          showNextBlockButton={hasEventoBlocks}
        />

        {contentOffScreen && (
          <button
            type="button"
            onClick={handleCenterScreen}
            className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-zinc-700 text-zinc-300 font-mono text-xs cursor-pointer rounded animate-expand-x z-30 border border-zinc-600"
          >
            {placedBlocks.length > 0
              ? "Volver a ultimo evento"
              : "Centrar pantalla"}
          </button>
        )}
      </div>

      {paramSelector && (
        <ParamSelectorModal
          type={paramSelector.type}
          color={paramSelector.color}
          numberValue={numberInput}
          onNumberChange={setNumberInput}
          onSelect={handleParamSelect}
          onClose={() => setParamSelector(null)}
        />
      )}

      {placingBlock && !paramSelector && (
        <ActionButtons
          onCancel={handleCancelBlock}
          onConfirm={handleConfirmBlock}
        />
      )}

      {editingBlockIndex !== null && !paramSelector && (
        <ActionButtons
          onCancel={handleDeleteBlock}
          onConfirm={handleConfirmEdit}
        />
      )}

      {undoState && !editingBlockIndex && !placingBlock && (
        <UndoButton
          timeLeft={undoState.timeLeft}
          totalTime={4000}
          onUndo={handleUndo}
        />
      )}

      <BottomButtons
        activeButton={activeButton}
        onProgramacionClick={handleProgramacionClick}
        onBloquesClick={handleBloquesClick}
      />
    </div>
  );
}
