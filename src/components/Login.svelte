<script lang="ts">
  import { authService } from '../services/auth';
  import type { UserInfo } from '../services/auth';
  import { onMount, createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    login: UserInfo;
    logout: void;
  }>();

  let isLoading = false;
  let error = '';
  let userInfo: UserInfo = null;

  onMount(async () => {
    checkAuthStatus();
  });

  async function checkAuthStatus() {
    try {
      const isAuthenticated = await authService.isAuthenticated();
      if (isAuthenticated) {
        await handleLogin();
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    }
  }

  async function handleLogin() {
    isLoading = true;
    error = '';
    
    try {
      userInfo = await authService.login();
      // Dispatch event to notify parent components
      dispatch('login', userInfo);
    } catch (err) {
      error = 'Login failed. Please try again.';
      console.error('Login error:', err);
    } finally {
      isLoading = false;
    }
  }

  async function handleLogout() {
    isLoading = true;
    try {
      await authService.logout();
      userInfo = null;
      dispatch('logout');
    } catch (err) {
      error = 'Logout failed. Please try again.';
      console.error('Logout error:', err);
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="login-container">
  {#if userInfo}
    <div class="user-info">
      <img src={userInfo.picture} alt={userInfo.name} class="avatar" />
      <button class="logout-button" on:click={handleLogout} disabled={isLoading}>
        Logout
      </button>
    </div>
  {:else}
    <button class="login-button" on:click={handleLogin} disabled={isLoading}>
      {#if isLoading}
        Loading...
      {:else}
        Login with Google
      {/if}
    </button>
  {/if}
  
  {#if error}
    <div class="error">{error}</div>
  {/if}
</div>

<style>
  .login-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .avatar {
    width: 2rem;
    height: 2rem;
    border-radius: 9999px;
    object-fit: cover;
  }

  .login-button, .logout-button {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }

  .login-button {
    background-color: #4285f4;
    color: white;
  }

  .login-button:hover {
    background-color: #3367d6;
  }

  .logout-button {
    background-color: #f3f4f6;
    color: #374151;
  }

  .logout-button:hover {
    background-color: #e5e7eb;
  }

  button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .error {
    color: #dc2626;
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }
</style>
