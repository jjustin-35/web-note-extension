<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Color, NoteData, Position, Size } from "../types";
  import { IconType } from "../types";
  import Icon from "./Icon.svelte";
  import DraggableResizable from "./DraggableResizable.svelte";

  export let note: NoteData;
  export let isFocused: boolean = false;
  let value: string = note.content;

  const dispatch = createEventDispatcher<{
    update: NoteData;
    delete: { id: string };
    focus: NoteData["id"];
  }>();

  let isEdit = false;
  const colors: Color[] = ["yellow", "pink", "blue"];

  function handleUpdate({ detail }: CustomEvent<{ position: Position; size: Size }>) {
    note.position = detail.position;
    note.size = detail.size;
    dispatch("update", note);
  }

  function handleFocus() {
    dispatch("focus", note.id);
  }

  function handleBlur() {
    dispatch("focus", null);
  }

  function toggleEdit() {
    setTimeout(() => {
      isEdit = !isEdit;
    }, 100);
  }

  function handleNoteBlur(e: FocusEvent) {
    const target = e.currentTarget as HTMLElement;
    const relatedElement = e.relatedTarget as HTMLElement;
    if (!isEdit) return;
    if (target.contains(relatedElement)) return;

    note.content = value;
    note.title = value.split("\n")[0].trim() || "Untitled Note";

    isEdit = false;
    handleBlur();
    dispatch("update", note);
  }

  function handleColorChange(color: Color) {
    note.color = color;
    dispatch("update", note);
  }

  function handleDelete() {
    dispatch("delete", { id: note.id });
  }
</script>

<DraggableResizable
  id="note-{note.id}"
  position={note.position}
  size={note.size}
  {isFocused}
  isChangeable={!isEdit}
  on:update={handleUpdate}
  on:mousedown={handleFocus}
  on:focus={handleFocus}
  on:blur={handleBlur}
>
  <div
    class="note {note.color} {isEdit ? 'drag-disable' : ''}"
    on:blur={handleNoteBlur}
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
        on:blur={handleNoteBlur}
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
  </div>
</DraggableResizable>

<style>
  .note {
    width: 100%;
    height: 100%;
    padding: 8px 16px 16px;
    border-radius: 8px;
    background-color: var(--note-bg);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 9999;
    transition: box-shadow 0.2s ease;
    display: flex;
    flex-direction: column;
  }

  .note.isFocused {
    z-index: 10000;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    outline: 2px dashed #666;
    resize: both;
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
