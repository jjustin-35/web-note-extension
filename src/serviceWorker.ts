import { MAIN_WEB, API_URL, AUTH_URL } from "./config";
import { MessageType } from "./types/message";

// 設定 side panel 行為
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// 監聽 tab 更新
chrome.tabs.onUpdated.addListener(async (tabId, _, tab) => {
  if (!tab?.url) return;
  const url = new URL(tab.url);
  if (url.origin === MAIN_WEB) {
    await chrome.sidePanel.setOptions({
      tabId,
      enabled: false,
    });
  } else {
    await chrome.sidePanel.setOptions({
      tabId,
      enabled: true,
    });
  }
});

// API 請求處理
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id) {
    return;
  }

  switch (message.type) {
    case MessageType.API_REQUEST:
      handleApiRequest(message.data, sendResponse);
      return true; // 保持連接開啟，等待非同步回應
    case MessageType.CHECK_AUTH:
      handleCheckAuth(sendResponse);
      return true;
    case MessageType.LOGIN:
      handleLogin(sendResponse);
      return true;
    case MessageType.LOGOUT:
      handleLogout(sendResponse);
      return true;
    default:
      return false;
  }
});

async function handleApiRequest(
  data: {
    endpoint: string;
    method?: string;
    body?: any;
    params?: Record<string, string>;
  },
  sendResponse: (response: any) => void
) {
  try {
    const url = new URL(`${API_URL}${data.endpoint}`);

    // 添加查詢參數
    if (data.params) {
      Object.entries(data.params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method: data.method || "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      ...(data.body ? { body: JSON.stringify(data.body) } : {}),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const result = await response.json();
    sendResponse({ success: true, data: result });
  } catch (error) {
    console.error("API request error:", error);
    sendResponse({ success: false, error: error.message });
  }
}

// 認證相關請求處理
async function handleCheckAuth(sendResponse: (response: any) => void) {
  try {
    const response = await fetch(`${AUTH_URL}/session`, {
      credentials: "include",
    });
    const session = await response.json();
    sendResponse({ success: true, data: session });
  } catch (error) {
    console.error("Check auth error:", error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleLogin(sendResponse: (response: any) => void) {
  try {
    // 開啟登入視窗
    const loginTab = await chrome.windows.create({
      url: `${AUTH_URL}/signin`,
      type: "popup",
      width: 600,
      height: 700,
    });

    // 監聽登入狀態
    const checkInterval = setInterval(async () => {
      try {
        const response = await fetch(`${AUTH_URL}/session`, {
          credentials: "include",
        });
        const session = await response.json();

        if (session?.user) {
          clearInterval(checkInterval);
          if (loginTab.id) {
            await chrome.windows.remove(loginTab.id);
          }
          sendResponse({ success: true, data: session });
        }
      } catch (error) {
        console.error("Login check error:", error);
      }
    }, 1000);

    // 設定超時
    setTimeout(() => {
      clearInterval(checkInterval);
      if (loginTab.id) {
        chrome.windows.remove(loginTab.id);
      }
      sendResponse({ success: false, error: "Login timeout" });
    }, 300000); // 5 分鐘超時
  } catch (error) {
    console.error("Login error:", error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleLogout(sendResponse: (response: any) => void) {
  try {
    const response = await fetch(`${AUTH_URL}/signout`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    sendResponse({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    sendResponse({ success: false, error: error.message });
  }
}
