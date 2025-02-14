import { API_URL } from "../config";
import type { NoteData } from "../types";

export async function getNotes(data?: {
  search?: string;
  website?: string;
}): Promise<NoteData[]> {
  const { search, website } = data || {};
  const searchParams = new URLSearchParams({
    search: search || '',
    website: website || '',
  });
  const response = await fetch(`${API_URL}/notes?${searchParams.toString()}`);
  if (!response.ok) throw new Error("Failed to load notes");
  return response.json();
}

export async function postNote(note: Partial<NoteData>): Promise<NoteData> {
  const response = await fetch(`${API_URL}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  if (!response.ok) throw new Error("Failed to create note");
  return response.json();
}

export async function putNote(note: Partial<NoteData>): Promise<NoteData> {
  const response = await fetch(`${API_URL}/notes`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  if (!response.ok) throw new Error("Failed to update note");
  return response.json();
}

export async function deleteNote(noteId: string): Promise<void> {
  const response = await fetch(`${API_URL}/notes?noteId=${noteId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete note");
}
