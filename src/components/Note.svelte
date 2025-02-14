<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { noteStorage } from "../services/noteStorage";
  import type { Note } from "../services/noteStorage";
  import Icon from "./Icon.svelte";
  import { IconType } from "../types";

  export let note: Note;
  export let focused: boolean = false;

  const dispatch = createEventDispatcher<{
    update: Note;
    delete: { id: string };
    focus: string;
  }>();

  let isEdit = false;
  let dragOffset: { x: number; y: number } | null = null;
  let originalPosition: { x: number; y: number } | null = null;
  let contentEl: HTMLDivElement;

  const colors = ["yellow", "pink", "blue"];
  let selectedColor = "yellow";

  async function handleContentChange() {
    if (!isEdit) return;
    
    try {
      const updatedNote = await noteStorage.updateNote(note.id, {
        content: contentEl.innerText
      });
      dispatch('update', updatedNote);
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  }

  async function handleDelete() {
    try {
      await noteStorage.deleteNote(note.id);
      dispatch('delete', { id: note.id });
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  }

  function startDrag(event: MouseEvent) {
    if (isEdit) return;
    
    dragOffset = {
      x: event.clientX - note.position.x,
      y: event.clientY - note.position.y
    };
    originalPosition = { ...note.position };
    
    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', stopDrag);
  }

  async function handleDrag(event: MouseEvent) {
    if (!dragOffset) return;

    const newPosition = {
      x: event.clientX - dragOffset.x,
      y: event.clientY - dragOffset.y
    };

    try {
      const updatedNote = await noteStorage.updateNote(note.id, {
        position: newPosition
      });
      dispatch('update', updatedNote);
    } catch (error) {
      console.error('Failed to update note position:', error);
    }
  }

  function stopDrag() {
    dragOffset = null;
    originalPosition = null;
    window.removeEventListener('mousemove', handleDrag);
    window.removeEventListener('mouseup', stopDrag);
  }

  function handleFocus() {
    if (!focused) {
      dispatch('focus', note.id);
    }
  }
</script>

<button
  type="button"
  class="note {selectedColor}"
  style="left: {note.position.x}px; top: {note.position.y}px;"
  on:mousedown={startDrag}
  on:click={handleFocus}
  class:focused={focused}
  aria-label="Note"
  role="button"
  tabindex="0"
>
  <div class="toolbar">
    <div class="color-picker">
      {#each colors as color}
        <button
          class="color-btn {color}"
          class:selected={selectedColor === color}
          on:click={() => selectedColor = color}
        />
      {/each}
    </div>
    <div class="actions">
      <button class="edit-btn" on:click={() => isEdit = !isEdit}>
        <Icon type={isEdit ? IconType.CHECK : IconType.EDIT} />
      </button>
      <button class="delete-btn" on:click={handleDelete}>
        <Icon type={IconType.DELETE} />
      </button>
    </div>
  </div>

  <div
    class="content"
    class:editing={isEdit}
    contenteditable={isEdit}
    bind:this={contentEl}
    on:input={handleContentChange}
  >
    {note.content}
  </div>

  <div class="timestamp">
    Updated: {new Date(note.updatedAt).toLocaleString()}
  </div>
</button>

<style>
  .note {
    position: absolute;
    width: 200px;
    min-height: 120px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    padding: 12px;
    cursor: move;
    z-index: 1000;
  }

  .note.focused {
    z-index: 1001;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .note.yellow { background: #fff9c4; }
  .note.pink { background: #f8bbd0; }
  .note.blue { background: #bbdefb; }

  .toolbar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .color-picker {
    display: flex;
    gap: 4px;
  }

  .color-btn {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.1);
    cursor: pointer;
  }

  .color-btn.yellow { background: #fff9c4; }
  .color-btn.pink { background: #f8bbd0; }
  .color-btn.blue { background: #bbdefb; }
  .color-btn.selected { border: 2px solid rgba(0, 0, 0, 0.3); }

  .actions {
    display: flex;
    gap: 4px;
  }

  .actions button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;
    opacity: 0.6;
  }

  .actions button:hover {
    opacity: 1;
  }

  .content {
    flex-grow: 1;
    min-height: 60px;
    margin-bottom: 8px;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .content.editing {
    cursor: text;
    outline: none;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    padding: 4px;
  }

  .timestamp {
    font-size: 0.8em;
    color: rgba(0, 0, 0, 0.5);
  }
</style>
