export type Color = "yellow" | "pink" | "blue";

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface GetNoteProps {
  search?: string;
  website?: string;
}

export interface NoteData {
  id: string;
  title: string;
  content: string;
  website: string;
  tags: string[];
  color: Color;
  position: Position;
  size: Size;
  createdAt?: string;
  updatedAt?: string;
}

export enum IconType {
  EDIT = 'edit',
  DELETE = 'delete',
  CHECK = 'check'
}