import { MessageType } from "../types/message";

export interface UserInfo {
  email: string;
  name: string;
  picture: string;
}

function sendMessage(type: MessageType, data?: any): Promise<any> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type, data }, (response) => {
      resolve(response);
    });
  });
}

export async function login(): Promise<UserInfo> {
  try {
    const response = await sendMessage(MessageType.LOGIN);
    if (!response.success) {
      throw new Error(response.error);
    }
    return transformUserInfo(response.data);
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  const response = await sendMessage(MessageType.LOGOUT);
  if (!response.success) {
    throw new Error(response.error);
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const response = await sendMessage(MessageType.CHECK_AUTH);
    return response.success && !!response.data?.user;
  } catch {
    return false;
  }
}

function transformUserInfo(session: any): UserInfo {
  if (!session?.user) {
    throw new Error('No user session found');
  }
  return {
    email: session.user.email,
    name: session.user.name,
    picture: session.user.image
  };
}
