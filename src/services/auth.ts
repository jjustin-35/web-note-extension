export interface UserInfo {
  email: string;
  name: string;
  picture: string;
}

class AuthService {
  // private static readonly AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
  // private static readonly TOKEN_URL = 'https://oauth2.googleapis.com/token';
  private static readonly USERINFO_URL = 'https://www.googleapis.com/oauth2/v1/userinfo';
  
  async login(): Promise<UserInfo> {
    try {
      const token = await this.getAuthToken();
      return await this.getUserInfo(token);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  private async getAuthToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve(token);
      });
    });
  }

  private async getUserInfo(token: string): Promise<UserInfo> {
    const response = await fetch(AuthService.USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  }

  async logout(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: false }, (token) => {
        if (!token) {
          resolve();
          return;
        }

        // Revoke token
        chrome.identity.removeCachedAuthToken({ token }, () => {
          const revokeUrl = `https://accounts.google.com/o/oauth2/revoke?token=${token}`;
          fetch(revokeUrl)
            .then(() => resolve())
            .catch(reject);
        });
      });
    });
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getAuthToken();
      return true;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
