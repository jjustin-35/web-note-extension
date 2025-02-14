export interface Note {
  id: string;
  content: string;
  position: {
    x: number;
    y: number;
  };
  url: string;
  createdAt: number;
  updatedAt: number;
}

class NoteStorageService {
  private static generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  async getAllNotes(): Promise<Note[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get('notes', (result) => {
        resolve(result.notes || []);
      });
    });
  }

  async getNotesByUrl(url: string): Promise<Note[]> {
    const notes = await this.getAllNotes();
    return notes.filter(note => note.url === url);
  }

  async addNote(content: string, position: { x: number; y: number }, url: string): Promise<Note> {
    const notes = await this.getAllNotes();
    const newNote: Note = {
      id: NoteStorageService.generateId(),
      content,
      position,
      url,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    notes.push(newNote);
    await this.saveNotes(notes);
    return newNote;
  }

  async updateNote(noteId: string, updates: Partial<Note>): Promise<Note> {
    const notes = await this.getAllNotes();
    const noteIndex = notes.findIndex(note => note.id === noteId);
    
    if (noteIndex === -1) {
      throw new Error('Note not found');
    }

    const updatedNote = {
      ...notes[noteIndex],
      ...updates,
      updatedAt: Date.now()
    };

    notes[noteIndex] = updatedNote;
    await this.saveNotes(notes);
    return updatedNote;
  }

  async deleteNote(noteId: string): Promise<void> {
    const notes = await this.getAllNotes();
    const filteredNotes = notes.filter(note => note.id !== noteId);
    await this.saveNotes(filteredNotes);
  }

  private async saveNotes(notes: Note[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ notes }, resolve);
    });
  }

  async clearAllNotes(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.remove('notes', resolve);
    });
  }
}

export const noteStorage = new NoteStorageService();
