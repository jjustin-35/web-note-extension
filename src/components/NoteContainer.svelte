<script lang="ts">
  import { onMount } from 'svelte';
  import { noteStorage } from '../services/noteStorage';
  import type { Note } from '../services/noteStorage';
  import NoteComponent from './Note.svelte';

  let notes: Note[] = [];
  let currentUrl: string = '';
  let focusedNoteId: string | null = null;

  onMount(async () => {
    // Get current tab URL
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    currentUrl = tabs[0].url;
    loadNotes();
  });

  async function loadNotes() {
    notes = await noteStorage.getNotesByUrl(currentUrl);
  }

  async function createNote(event: MouseEvent) {
    const newNote = await noteStorage.addNote(
      'New Note',
      { x: event.clientX, y: event.clientY },
      currentUrl
    );
    notes = [...notes, newNote];
    focusedNoteId = newNote.id;
  }

  function handleNoteUpdate(event: CustomEvent<Note>) {
    const updatedNote = event.detail;
    notes = notes.map(note => 
      note.id === updatedNote.id ? updatedNote : note
    );
  }

  function handleNoteDelete(event: CustomEvent<{ id: string }>) {
    const { id } = event.detail;
    notes = notes.filter(note => note.id !== id);
    if (focusedNoteId === id) {
      focusedNoteId = null;
    }
  }

  function handleNoteFocus(event: CustomEvent<string>) {
    focusedNoteId = event.detail;
  }
</script>

<div class="note-container" on:dblclick={createNote}>
  {#each notes as note (note.id)}
    <NoteComponent
      {note}
      focused={focusedNoteId === note.id}
      on:update={handleNoteUpdate}
      on:delete={handleNoteDelete}
      on:focus={handleNoteFocus}
    />
  {/each}
</div>

<style>
  .note-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
  }

  .note-container :global(.note) {
    pointer-events: all;
  }
</style>
