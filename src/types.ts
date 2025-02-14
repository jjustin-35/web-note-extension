export type Color = "yellow" | "pink" | "blue";

export interface Position {
  x: number;
  y: number;
}

export interface NoteData {
  id: string;
  title: string;
  content: string;
  website: string;
  tags: string[];
  color: Color;
  position: Position;
  createdAt?: string;
  updatedAt?: string;
}

export enum MessageType {
  CREATE_NOTE = 'CREATE_NOTE',
  FOCUS_NOTE = 'FOCUS_NOTE'
}

export enum IconType {
  EDIT = 'edit',
  DELETE = 'delete',
  CHECK = 'check'
}