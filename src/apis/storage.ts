import { v4 as uuidv4 } from "uuid";
import type { NoteData, GetNoteProps } from "../types/common";
import { isAuthenticated } from "./auth";
import {
  getNotes as getNotesApi,
  postNote as postNoteApi,
  putNote as putNoteApi,
  deleteNote as deleteNoteApi,
} from "./notes";

function getNotesFromLocal(props?: GetNoteProps): Promise<NoteData[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get("notes", (result) => {
      if (!result?.notes?.length) {
        resolve([]);
        return;
      }
      const { search, website } = props || {};
      const { notes = [] } = result as { notes: NoteData[] };
      const filteredNotes = (() => {
        if (search) {
          return notes.filter((note) =>
            note.title.toLowerCase().includes(search.toLowerCase())
          );
        }
        if (website) {
          return notes.filter((note) =>
            note.website.toLowerCase().includes(website.toLowerCase())
          );
        }
        return notes;
      })();

      resolve(filteredNotes);
    });
  });
}

export async function getNotes(props?: GetNoteProps): Promise<NoteData[]> {
  const auth = await isAuthenticated();

  if (auth) {
    return getNotesApi(props);
  } else {
    return getNotesFromLocal(props);
  }
}

export function saveNoteToLocal(note: NoteData): Promise<NoteData> {
  return new Promise((resolve) => {
    chrome.storage.local.get("notes", (result) => {
      const notes: NoteData[] = result.notes || [];
      const newNote = { ...note, id: uuidv4() };
      notes.push(newNote);
      chrome.storage.local.set({ notes }, () => {
        resolve(newNote);
      });
    });
  });
}

export async function saveNote(note: NoteData): Promise<NoteData> {
  const auth = await isAuthenticated();

  if (auth) {
    return postNoteApi(note);
  } else {
    return saveNoteToLocal(note);
  }
}

export function updateNoteInLocal(note: NoteData): Promise<NoteData> {
  return new Promise((resolve) => {
    chrome.storage.local.get("notes", (result) => {
      const notes: NoteData[] = result.notes || [];
      const index = notes.findIndex((n) => n.id === note.id);
      if (index !== -1) {
        notes[index] = note;
        chrome.storage.local.set({ notes }, () => {
          resolve(note);
        });
      } else {
        resolve(note);
      }
    });
  });
}

export async function updateNote(note: NoteData): Promise<NoteData> {
  const auth = await isAuthenticated();

  if (auth) {
    return putNoteApi(note);
  } else {
    return updateNoteInLocal(note);
  }
}

export function deleteNoteFromLocal(noteId: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.get("notes", (result) => {
      const notes: NoteData[] = result.notes || [];
      const filteredNotes = notes.filter((note) => note.id !== noteId);
      chrome.storage.local.set({ notes: filteredNotes }, () => {
        resolve();
      });
    });
  });
}

export async function deleteNote(noteId: string): Promise<void> {
  const auth = await isAuthenticated();

  if (auth) {
    return deleteNoteApi(noteId);
  } else {
    return deleteNoteFromLocal(noteId);
  }
}
