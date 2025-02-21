import { MAIN_WEB } from "../config";

export interface UserInfo {
  email: string;
  name: string;
  picture: string;
}

export class AuthService {
  private static readonly SESSION_URL = `${MAIN_WEB}/auth/session`;

  private openLoginWindow(url: string): Promise<chrome.windows.Window> {
    return new Promise((resolve) => {
      chrome.windows.create({
        url,
        type: 'popup',
        width: 600,
        height: 700
      }, (window) => resolve(window));
    });
  }

  private closeLoginWindow(window: chrome.windows.Window): Promise<void> {
    return new Promise((resolve) => {
      chrome.windows.remove(window.id, () => resolve());
    });
  }

  private waitForLogin(loginWindow: chrome.windows.Window): Promise<void> {
    return new Promise((resolve, reject) => {
      // use promise to wait for login
      const checkInterval = setInterval(async () => {
        try {
          const session = await this.getSession();
          if (session?.user) {
            clearInterval(checkInterval);
            if (loginWindow.id) {
              await this.closeLoginWindow(loginWindow);
            }
            resolve();
          }
        } catch (error) {
          console.error('Error checking session:', error);
        }
      }, 1000);

      // timeout after 5 minutes
      setTimeout(async () => {
        clearInterval(checkInterval);
        if (loginWindow.id) {
          await this.closeLoginWindow(loginWindow);
        }
        reject(new Error('Login timeout'));
      }, 300000);
    });
  }

  private async getSession(): Promise<any> {
    const response = await fetch(AuthService.SESSION_URL, {
      credentials: 'include'
    });
    if (!response.ok) return null;
    return response.json();
  }

  private async getUserInfo(): Promise<UserInfo> {
    const session = await this.getSession();
    if (!session?.user) {
      throw new Error('No user session found');
    }
    return {
      email: session.user.email,
      name: session.user.name,
      picture: session.user.image
    };
  }

  async login(): Promise<UserInfo> {
    try {
      // 開啟登入頁面
      const loginUrl = `${MAIN_WEB}/auth/signin`;
      const loginWindow = await this.openLoginWindow(loginUrl);
      
      // 等待登入完成
      await this.waitForLogin(loginWindow);
      
      // 獲取使用者資訊
      return await this.getUserInfo();
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    const response = await fetch(`${MAIN_WEB}/auth/signout`, {
      method: 'POST',
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Logout failed');
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const session = await this.getSession();
      return !!session?.user;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
