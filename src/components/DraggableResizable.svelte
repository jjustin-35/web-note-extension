<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Position, Size } from "../types/common";
  import { noteDefaultSize } from "../constants/ui";

  export let id: string;
  export let position: Position;
  export let size: Size;
  export let minWidth = noteDefaultSize.width;
  export let minHeight = noteDefaultSize.height;
  export let isFocused = false;
  export let isChangeable = true;

  const dispatch = createEventDispatcher<{
    update: { position: Position; size: Size };
  }>();

  let isDragging = false;
  let isResizing = false;
  let dragOffset: Position | null = null;
  let originalPosition: Position | null = null;
  let originalSize: Size | null = null;
  let resizeStart: Position | null = null;

  function handleDragStart(e: MouseEvent) {
    if (!isChangeable || isResizing) return;
    const target = e.target as HTMLElement;
    if (target.classList.contains("resize-handle")) return;

    isDragging = true;
    originalPosition = { ...position };
    dragOffset = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };

    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("mouseup", handleDragEnd);
    target.style.cursor = "grabbing";
  }

  function handleDragMove(e: MouseEvent) {
    if (!isDragging || !dragOffset) return;

    const newPosition = {
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    };

    position = newPosition;
  }

  function handleDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    dragOffset = null;

    if (JSON.stringify(originalPosition) !== JSON.stringify(position)) {
      dispatch("update", { position, size });
    }

    window.removeEventListener("mousemove", handleDragMove);
    window.removeEventListener("mouseup", handleDragEnd);
  }

  function handleResizeStart(e: MouseEvent) {
    if (!isChangeable || isDragging) return;
    e.stopPropagation();
    isResizing = true;
    const currentTarget = e.currentTarget as HTMLElement;
    const element = currentTarget.parentElement;
    originalSize = {
      width: element.offsetWidth,
      height: element.offsetHeight,
    };
    resizeStart = {
      x: e.clientX,
      y: e.clientY,
    };

    window.addEventListener("mousemove", handleResizeMove);
    window.addEventListener("mouseup", handleResizeEnd);
  }

  function handleResizeMove(e: MouseEvent) {
    if (!isResizing || !originalSize || !resizeStart) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;

    const newWidth = Math.max(minWidth, originalSize.width + deltaX);
    const newHeight = Math.max(minHeight, originalSize.height + deltaY);

    requestAnimationFrame(() => {
      size = { width: newWidth, height: newHeight };
    });
  }

  function handleResizeEnd() {
    if (!isResizing) return;

    dispatch("update", { position, size });
    isResizing = false;
    originalSize = null;
    resizeStart = null;

    window.removeEventListener("mousemove", handleResizeMove);
    window.removeEventListener("mouseup", handleResizeEnd);
  }
</script>

<div
  {id}
  class="draggable-resizable {isFocused ? 'isFocused' : ''}"
  role="button"
  tabindex="0"
  aria-label="Drag and resize"
  style="left: {position.x}px; top: {position.y}px; width: {size?.width ||
    minWidth}px; height: {size?.height || minHeight}px; will-change: transform, width, height;"
  on:mousedown={handleDragStart}
  on:focus
  on:blur
>
  <slot />
  <div
    class="resize-handle"
    role="button"
    tabindex="0"
    aria-label="Resize"
    on:mousedown={handleResizeStart}
  />
</div>

<style>
  .draggable-resizable {
    position: absolute;
    cursor: move;
    border-radius: 8px;
    transition:
      outline-color 0.2s ease,
      width 0.1s ease,
      height 0.1s ease;
    transform: translate3d(0,0,0);
    backface-visibility: hidden;
    perspective: 1000px;
  }

  .draggable-resizable.isFocused {
    outline: 2px dashed #666;
    z-index: 10000;
    outline-offset: 4px;
  }

  .resize-handle {
    position: absolute;
    bottom: -4px;
    right: -4px;
    width: 16px;
    height: 16px;
    cursor: se-resize;
    background: linear-gradient(
      135deg,
      transparent 50%,
      rgba(0, 0, 0, 0.2) 50%
    );
    border-radius: 0 0 8px 0;
    display: none;
  }

  .draggable-resizable:hover .resize-handle,
  .draggable-resizable.isFocused .resize-handle {
    display: block;
  }
</style>
