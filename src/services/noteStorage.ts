import type { NoteData, GetNoteProps } from "../types";
import { authService } from "./auth";
import {
  getNotes as getNotesApi,
  postNote,
  putNote,
  deleteNote as deleteNoteApi,
} from "../apis/notes";

class NoteStorageService {
  private static generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  async getNotes(props?: GetNoteProps): Promise<NoteData[]> {
    const isAuth = await authService.isAuthenticated();

    if (isAuth) {
      return getNotesApi(props);
    } else {
      return this.getNotesFromLocal(props);
    }
  }

  private getNotesFromLocal(props?: GetNoteProps): Promise<NoteData[]> {
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
            return (notes || []).filter((note) =>
              note.website.toLowerCase().includes(website.toLowerCase())
            );
          }
          return notes || [];
        })();

        resolve(filteredNotes);
      });
    });
  }

  async saveNote(note: NoteData): Promise<NoteData> {
    const isAuth = await authService.isAuthenticated();

    if (isAuth) {
      if (note.id) {
        return await putNote(note);
      } else {
        return await postNote(note);
      }
    } else {
      return this.saveNoteToLocal(note);
    }
  }

  private saveNoteToLocal(note: NoteData): Promise<NoteData> {
    return new Promise((resolve) => {
      chrome.storage.local.get("notes", (result) => {
        const notes: NoteData[] = result.notes || [];
        const newNote = note.id
          ? note
          : {
              ...note,
              id: NoteStorageService.generateId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
        const updatedNotes = note.id
          ? notes.map((n) =>
              n.id === note.id
                ? { ...newNote, updatedAt: new Date().toISOString() }
                : n
            )
          : [...notes, newNote];

        chrome.storage.local.set({ notes: updatedNotes }, () => {
          resolve(newNote);
        });
      });
    });
  }

  async deleteNote(id: string): Promise<void> {
    const isAuth = await authService.isAuthenticated();

    if (isAuth) {
      await deleteNoteApi(id);
    } else {
      await this.deleteNoteFromLocal(id);
    }
  }

  private deleteNoteFromLocal(id: string): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.get("notes", (result) => {
        const notes: NoteData[] = result.notes || [];
        const updatedNotes = notes.filter((note: NoteData) => note.id !== id);
        chrome.storage.local.set({ notes: updatedNotes }, () => {
          resolve();
        });
      });
    });
  }

  // async clearAllNotes(): Promise<void> {
  //   const isAuth = await authService.isAuthenticated();

  //   if (isAuth) {
  //     try {
  //       // Since there's no bulk delete in the API, we'll get all notes and delete them one by one
  //       const notes = await this.getNotes();
  //       await Promise.all(notes.map((note) => deleteNoteApi(note.id)));
  //     } catch (error) {
  //       console.error("Error clearing all notes from API:", error);
  //       // Fallback to local storage if API fails
  //       await this.clearAllNotesFromLocal();
  //     }
  //   } else {
  //     await this.clearAllNotesFromLocal();
  //   }
  // }

  // private clearAllNotesFromLocal(): Promise<void> {
  //   return new Promise((resolve) => {
  //     chrome.storage.local.remove("notes", resolve);
  //   });
  // }
}

export const noteStorage = new NoteStorageService();
