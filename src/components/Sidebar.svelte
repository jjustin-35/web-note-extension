<script lang="ts">
  import { onMount } from "svelte";
  import type { NoteData } from "../types/common";
  import { getNotes } from "../apis/storage";
  import { noteDefaultPosition, noteDefaultSize } from "../constants/ui";
  import Login from "./Login.svelte";
  import type { UserInfo } from "../apis/auth";

  export let notes: NoteData[] = [];
  let userInfo: UserInfo = null;

  onMount(async () => {
    loadNotes();
  });

  async function loadNotes() {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const data = await getNotes({ website: tab.url });
      notes = data;
    } catch (error) {
      console.error("Failed to load notes:", error);
    }
  }

  async function handleAdd() {
    if (!userInfo) {
      return;
    }

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

  function handleLogin(event: CustomEvent<UserInfo>) {
    userInfo = event.detail;
    loadNotes();
  }

  function handleLogout() {
    userInfo = null;
    notes = [];
  }
</script>

<div class="container">
  <div class="header">
    <h1>Web Note</h1>
    <Login on:login={handleLogin} on:logout={handleLogout} />
  </div>

  {#if userInfo}
    <div class="content">
      <div class="actions">
        <button class="add-button" on:click={handleAdd}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Note
        </button>
      </div>

      <div class="notes-list">
        {#if notes.length === 0}
          <div class="empty-state">
            <p>No notes yet. Click "Add Note" to create one!</p>
          </div>
        {:else}
          {#each notes as note}
            <div
              class="note-item"
              on:click={() => handleSelect(note)}
              on:keydown={(e) => e.key === 'Enter' && handleSelect(note)}
              role="button"
              tabindex="0"
            >
              <div class="note-content">
                <h3>{note.title || 'Untitled'}</h3>
                <p>{note.content || 'No content'}</p>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  {:else}
    <div class="login-prompt">
      <p>Please login to view and create notes.</p>
    </div>
  {/if}
</div>

<style>
  .container {
    width: 100%;
    min-height: 100vh;
    background-color: #f8fafc;
    display: flex;
    flex-direction: column;
  }

  .header {
    padding: 1rem;
    background-color: white;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }

  .content {
    flex: 1;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
  }

  .add-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .add-button:hover {
    background-color: #2563eb;
  }

  .notes-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .note-item {
    background-color: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .note-item:hover {
    border-color: #cbd5e1;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .note-content h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
  }

  .note-content p {
    margin: 0;
    font-size: 0.875rem;
    color: #64748b;
    line-height: 1.25rem;
  }

  .empty-state {
    text-align: center;
    padding: 2rem;
    color: #64748b;
  }

  .login-prompt {
    text-align: center;
    padding: 2rem;
    color: #64748b;
  }
</style>
