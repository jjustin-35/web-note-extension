export enum MessageType {
  // Note operations
  CREATE_NOTE = 'CREATE_NOTE',
  UPDATE_NOTE = 'UPDATE_NOTE',
  DELETE_NOTE = 'DELETE_NOTE',
  FOCUS_NOTE = 'FOCUS_NOTE',
  
  // Authentication
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  CHECK_AUTH = 'CHECK_AUTH',
  
  // API operations
  API_REQUEST = 'API_REQUEST',
}

export interface MessageRequest<T = any> {
  type: MessageType;
  data?: T;
}

export interface MessageResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
