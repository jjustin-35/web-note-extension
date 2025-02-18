<!-- DraggableResizable.svelte -->
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Position, Size } from "../types";

  export let id: string;
  export let position: Position;
  export let size: Size;
  export let minWidth = 200;
  export let minHeight = 120;
  export let focused = false;

  const dispatch = createEventDispatcher<{
    update: { position: Position; size: Size };
  }>();

  let isEdit = false;
  let isDragging = false;
  let isResizing = false;
  let dragOffset: Position | null = null;
  let originalPosition: Position | null = null;
  let originalSize: Size | null = null;
  let resizeStart: Position | null = null;

  function handleDragStart(e: MouseEvent) {
    if (isEdit || isResizing) return;
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

    const element = document.querySelector(`#${id}`) as HTMLElement;
    if (element) {
      element.style.width = `${newWidth}px`;
      element.style.height = `${newHeight}px`;
      size = { width: newWidth, height: newHeight };
    }
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
  class="draggable-resizable {focused ? 'focused' : ''}"
  role="button"
  tabindex="0"
  aria-label="Drag and resize"
  style="left: {position.x}px; top: {position.y}px; width: {size.width}px; height: {size.height}px;"
  on:mousedown={handleDragStart}
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
    outline: 2px dashed #666;
    outline-offset: 4px;
    transition:
      outline-color 0.2s ease,
      width 0.1s ease,
      height 0.1s ease;
  }

  .draggable-resizable.focused {
    outline: 2px dashed #666;
    z-index: 10000;
  }

  .resize-handle {
    position: absolute;
    bottom: 0;
    right: 0;
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
  .draggable-resizable.focused .resize-handle {
    display: block;
  }
</style>
