<script lang="ts">
  import { onMount } from "svelte";
  import type { NoteData } from "../types";
  import { noteStorage } from "../services/noteStorage";
  import { MAIN_WEB } from "../config";
  import { noteDefaultPosition, noteDefaultSize } from "../constants/ui";

  export let notes: NoteData[] = [];

  onMount(async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const data = await noteStorage.getNotes({ website: tab.url });
      notes = data;
    } catch (error) {
      console.error("Failed to load notes:", error);
    }
  });

  async function handleAdd() {
    // Get the active tab
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) return;

    // Send message to content script to create a note
    chrome.tabs.sendMessage(tab.id, {
      type: "CREATE_NOTE",
      data: {
        title: "New Note",
        content: "",
        website: tab.url || "",
        color: "yellow",
        position: { ...noteDefaultPosition },
        size: { ...noteDefaultSize },
      },
    });
  }

  function handleSelect(note: NoteData) {
    // Send message to content script to focus the note
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "FOCUS_NOTE",
          noteId: note.id,
        });
      }
    });
  }
</script>

<div class="container">
  <nav class="header">
    <h1 class="title">Note Papers</h1>
    <div class="actions">
      <a
        href={MAIN_WEB}
        target="_blank"
        class="action-button"
        aria-label="Open dashboard in new tab"
      >
        <span class="material-symbols-outlined">dashboard</span>
      </a>
      <button
        class="action-button"
        on:click={handleAdd}
        aria-label="Add new note"
      >
        <span class="material-symbols-outlined">add</span>
      </button>
    </div>
  </nav>

  <div class="content">
    {#if notes.length === 0}
      <div class="empty-state">
        <span class="material-symbols-outlined icon">note_add</span>
        <p>No notes yet</p>
        <button on:click={handleAdd} class="create-button">
          Create your first note
        </button>
      </div>
    {:else}
      <div class="notes-list">
        {#each notes as note}
          <div
            role="button"
            tabindex="0"
            class="note-item"
            on:click={() => handleSelect(note)}
            on:keydown={(e) => e.key === "Enter" && handleSelect(note)}
          >
            <div class="note-header">
              <h3 class="note-title">{note.title || "Untitled Note"}</h3>
            </div>
            <p class="note-content">{note.content || "No content"}</p>
            <div class="note-tags">
              <span class="tag {note.color}">{note.color}</span>
              <span class="tag website">Website: {note.website}</span>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .container {
    width: 100%;
    min-height: 100vh;
    background-color: #f8fafc;
  }

  .header {
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: white;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .title {
    font-size: 1.5rem;
    font-weight: bold;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-button {
    padding: 0.5rem;
    color: #6b7280;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .action-button:hover {
    color: #374151;
  }

  .content {
    padding: 1rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
    color: #6b7280;
  }

  .icon {
    font-size: 2.5rem;
  }

  .create-button {
    background-color: #3b82f6;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .create-button:hover {
    background-color: #2563eb;
  }

  .notes-list {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .note-item {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    padding: 1rem;
    cursor: pointer;
    transition: box-shadow 0.2s;
  }

  .note-item:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .note-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
  }

  .note-title {
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .note-content {
    color: #4b5563;
    font-size: 0.875rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .note-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .tag {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
  }

  .tag.yellow {
    background-color: #fef3c7;
  }

  .tag.pink {
    background-color: #fce7f3;
  }

  .tag.blue {
    background-color: #dbeafe;
  }

  .tag.website {
    background-color: #dbeafe;
  }
</style>
