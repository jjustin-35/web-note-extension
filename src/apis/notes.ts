import type { NoteData } from "../types/common";
import { MessageType } from "../types/message";

function sendMessage(data: any): Promise<any> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: MessageType.API_REQUEST, data }, (response) => {
      resolve(response);
    });
  });
}

export async function getNotes(data?: {
  search?: string;
  website?: string;
}): Promise<NoteData[]> {
  const response = await sendMessage({
    endpoint: "/notes",
    method: "GET",
    params: data,
  });

  if (!response.success) {
    throw new Error(response.error || "Failed to load notes");
  }

  return response.data;
}

export async function postNote(note: Partial<NoteData>): Promise<NoteData> {
  const response = await sendMessage({
    endpoint: "/notes",
    method: "POST",
    body: note,
  });

  if (!response.success) {
    throw new Error(response.error || "Failed to create note");
  }

  return response.data;
}

export async function putNote(note: Partial<NoteData>): Promise<NoteData> {
  const response = await sendMessage({
    endpoint: "/notes",
    method: "PUT",
    body: note,
  });

  if (!response.success) {
    throw new Error(response.error || "Failed to update note");
  }

  return response.data;
}

export async function deleteNote(noteId: string): Promise<void> {
  const response = await sendMessage({
    endpoint: "/notes",
    method: "DELETE",
    params: { noteId },
  });

  if (!response.success) {
    throw new Error(response.error || "Failed to delete note");
  }
}
