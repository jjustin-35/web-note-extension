<script lang="ts">
  import { onMount } from "svelte";
  import Note from "./Note.svelte";
  import { MessageType, type NoteData } from "../types";
  import { noteStorage } from "../services/noteStorage";

  let notes: NoteData[] = [];
  let focusedNoteId: string | null = null;
  let currentWebsite: string = window.location.href;

  // 標準化 URL 函數
  function normalizeUrl(url: string): string {
    return url.replace(/^https?:\/\/(www\.)?/, "").split("#")[0];
  }

  async function loadNotes() {
    try {
      const website = normalizeUrl(currentWebsite);
      notes = await noteStorage.getNotes({ website });
    } catch (error) {
      console.error("Failed to load notes:", error);
    }
  }

  onMount(() => {
    loadNotes();

    // 監聽 URL 變化
    const handleUrlChange = () => {
      currentWebsite = window.location.href;
      loadNotes();
    };

    // 監聽 history 變化
    window.addEventListener("popstate", handleUrlChange);

    // 監聽使用 pushState 或 replaceState 的變化
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (
      data: any,
      unused: string,
      url?: string | URL
    ) {
      originalPushState.call(this, data, unused, url);
      handleUrlChange();
    };

    history.replaceState = function (
      data: any,
      unused: string,
      url?: string | URL
    ) {
      originalReplaceState.call(this, data, unused, url);
      handleUrlChange();
    };

    const messageListener = (
      message: any,
      _: any,
      sendResponse: (response: any) => void
    ) => {
      if (message.type === MessageType.CREATE_NOTE) {
        createNewNote();
      } else if (message.type === MessageType.FOCUS_NOTE) {
        const note = notes.find((n) => n.id === message.noteId);
        if (note) {
          handleNoteSelect({ detail: note } as CustomEvent<NoteData>);
        }
      }
      sendResponse({ success: true });
      return true;
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
      window.removeEventListener("popstate", handleUrlChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  });

  async function createNewNote() {
    const note: NoteData = {
      id: null,
      title: "New Note",
      content: "",
      website: normalizeUrl(currentWebsite),
      color: "yellow",
      position: { x: 100, y: 100 },
      size: { width: 200, height: 120 },
      tags: [],
    };

    try {
      const newNote = await noteStorage.saveNote(note);
      notes = [...notes, newNote];
      focusedNoteId = newNote.id;
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  }

  async function handleUpdateNote(note: NoteData) {
    try {
      const updatedNote = await noteStorage.saveNote(note);
      notes = notes.map((n) => (n.id === updatedNote.id ? updatedNote : n));
    } catch (error) {
      console.error("Failed to update note:", error);
    }
  }

  async function handleDeleteNote(id: string) {
    try {
      await noteStorage.deleteNote(id);
      notes = notes.filter((n) => n.id !== id);

      if (focusedNoteId === id) {
        focusedNoteId = null;
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  }

  function handleNoteSelect(event: CustomEvent<NoteData>) {
    const note = event.detail;
    if (!note) return;

    focusedNoteId = note.id;
  }

  function handleNoteFocus(event: CustomEvent<string>) {
    focusedNoteId = event.detail;
  }
</script>

{#each notes as note (note.id)}
  <Note
    {note}
    focused={note.id === focusedNoteId}
    on:update={async (event) => handleUpdateNote(event.detail)}
    on:delete={async () => handleDeleteNote(note.id)}
    on:focus={handleNoteFocus}
  />
{/each}

<style>
  :global(.web-note-toggle) {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }

  :global(.web-note-toggle:hover) {
    background-color: #f5f5f5;
  }

  :global(.web-note-toggle svg) {
    width: 24px;
    height: 24px;
  }
</style>
