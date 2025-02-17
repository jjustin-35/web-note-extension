<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Color, NoteData } from "../types";
  import { IconType } from "../types";
  import Icon from "./Icon.svelte";

  export let note: NoteData;
  export let focused: boolean = false;

  const dispatch = createEventDispatcher<{
    update: NoteData;
    delete: { id: string };
    focus: NoteData["id"];
  }>();

  let isEdit = false;
  let value: string = note.content;
  let dragOffset: { x: number; y: number } | null = null;
  let originalPosition: { x: number; y: number } | null = null;
  let isResizing = false;
  let originalSize: { width: number; height: number } | null = null;
  let resizeStart: { x: number; y: number } | null = null;

  const colors: Color[] = ["yellow", "pink", "blue"];

  function handleDragStart(e: MouseEvent) {
    if (isEdit) return;
    if (isResizing) return;
    const target = e.target as HTMLElement;

    originalPosition = { ...note.position };

    dragOffset = {
      x: e.clientX - note.position.x,
      y: e.clientY - note.position.y,
    };

    target.style.cursor = "grabbing";
    dispatch("focus", note.id);
  }

  function handleDragMove(e: MouseEvent) {
    if (isEdit) return;
    if (isResizing) return;
    if (!dragOffset) return;

    note.position = {
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    };
  }

  function handleDragEnd(e: MouseEvent) {
    if (isEdit) return;
    if (isResizing) return;
    if (!dragOffset) return;

    dragOffset = null;
    const target = e.target as HTMLElement;
    target.style.cursor = "move";

    if (JSON.stringify(originalPosition) !== JSON.stringify(note.position)) {
      dispatch("update", note);
    }
  }

  function toggleEdit() {
    setTimeout(() => {
      isEdit = !isEdit;
    }, 100);
  }

  function handleBlur(e: FocusEvent) {
    const target = e.currentTarget as HTMLElement;
    const relatedElement = e.relatedTarget as HTMLElement;
    if (!isEdit) return;
    if (target.contains(relatedElement)) return;

    note.content = value;
    note.title = value.split("\n")[0].trim() || "Untitled Note";

    isEdit = false;
    dispatch("update", note);
  }

  function handleColorChange(color: Color) {
    note.color = color;
    dispatch("update", note);
  }

  function handleDelete() {
    dispatch("delete", { id: note.id });
  }

  function handleResizeStart(e: MouseEvent) {
    e.stopPropagation();
    console.log('handleResizeStart')
    isResizing = true;
    const currentTarget = e.currentTarget as HTMLElement;
    const noteElement = currentTarget.parentElement;
    originalSize = {
      width: noteElement.offsetWidth,
      height: noteElement.offsetHeight,
    };
    resizeStart = {
      x: e.clientX,
      y: e.clientY,
    };

    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);
  }

  function handleResizeMove(e: MouseEvent) {
    if (!isResizing || !originalSize || !resizeStart) return;
    console.log('handleResizeMove')

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;

    const newWidth = Math.max(200, originalSize.width + deltaX);
    const newHeight = Math.max(120, originalSize.height + deltaY);

    const noteElement = document.querySelector(`#note-${note.id}`) as HTMLElement;
    if (noteElement) {
      console.log('noteElement', noteElement)
      noteElement.style.width = `${newWidth}px`;
      noteElement.style.height = `${newHeight}px`;
      note.size = { width: newWidth, height: newHeight };
    }
  }

  function handleResizeEnd() {
    if (!isResizing) return;
    console.log('handleResizeEnd');
    
    dispatch("update", note);
    isResizing = false;
    originalSize = null;
    resizeStart = null;

    window.removeEventListener('mousemove', handleResizeMove);
    window.removeEventListener('mouseup', handleResizeEnd);
  }
</script>

<div
  class="note {note.color} drag-handle {isEdit ? 'drag-disable' : ''}"
  style="left: {note.position.x}px; top: {note.position.y}px;"
  role="button"
  tabindex="0"
  on:mousedown={handleDragStart}
  on:mousemove={handleDragMove}
  on:mouseup={handleDragEnd}
  on:blur={handleBlur}
  id="note-{note.id}"
  data-note-id={note.id}
  aria-label="Draggable note"
>
  <div class="controls">
    <button
      class="button edit"
      aria-label="{isEdit ? 'finish' : ''} edit note"
      on:click={toggleEdit}
    >
      <Icon type={isEdit ? IconType.CHECK : IconType.EDIT} />
    </button>
    <button
      class="button delete"
      on:click={handleDelete}
      aria-label="Delete note"
    >
      <Icon type={IconType.DELETE} />
    </button>
  </div>

  {#if isEdit}
    <textarea
      class="content"
      on:blur={handleBlur}
      aria-multiline="true"
      bind:value
    />
  {:else}
    <p class="content">{value}</p>
  {/if}

  {#if isEdit}
    <div class="color-picker" role="toolbar" aria-label="Note color options">
      {#each colors as color}
        <button
          class="color-option {color} {color === note.color ? 'selected' : ''}"
          on:click={() => handleColorChange(color)}
          on:keydown={(e) => e.key === "Enter" && handleColorChange(color)}
          aria-label="Set note color to {color}"
          aria-pressed={color === note.color}
        />
      {/each}
    </div>
  {/if}
  <div
    class="resize-handle"
    role="button"
    tabindex="0"
    aria-label="Resize note"
    on:mousedown={handleResizeStart}
  />
</div>

<style>
  .note {
    position: absolute;
    width: 200px;
    min-height: 120px;
    padding: 8px 16px 16px;
    border-radius: 8px;
    background-color: var(--note-bg);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 9999;
    transition: box-shadow 0.2s ease;
    display: flex;
    flex-direction: column;
    cursor: move;
    overflow: auto;
    outline: 2px dashed #666;
    outline-offset: 4px;
    transition: outline-color 0.2s ease, width 0.1s ease, height 0.1s ease;
  }

  .note.focused {
    z-index: 10000;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    outline: 2px dashed #666;
    resize: both;
  }

  .drag-handle {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 24px;
    cursor: move;
  }

  .drag-disable {
    cursor: unset;
  }

  .note.yellow {
    background-color: #fff9c4;
  }
  .note.pink {
    background-color: #f8bbd0;
  }
  .note.blue {
    background-color: #bbdefb;
  }

  .controls {
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .note:hover .controls {
    opacity: 1;
  }

  .button {
    padding: 4px;
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
    border-radius: 4px;
  }

  .button:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  .content {
    margin: 8px 14px;
    outline: none;
    overflow-x: hidden;
    overflow-y: auto;
    word-break: break-word;
    white-space: pre-wrap;
    height: 100%;
    border: none;
    font-size: 14px;
  }

  textarea.content {
    background-color: inherit;
    padding: 0;
    resize: none;
  }

  .color-picker {
    position: absolute;
    bottom: 8px;
    right: 8px;
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .note:hover .color-picker {
    opacity: 1;
  }

  .color-option {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid transparent;
    padding: 0;
    background: none;
  }

  .color-option.selected {
    border-color: rgba(0, 0, 0, 0.3);
  }

  .color-option.yellow {
    background-color: #fff9c4;
  }
  .color-option.pink {
    background-color: #f8bbd0;
  }
  .color-option.blue {
    background-color: #bbdefb;
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

  .note:hover .resize-handle {
    display: block;
  }
</style>
