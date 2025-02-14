<script lang="ts">
  import { authService } from '../services/auth';
  import type { UserInfo } from '../services/auth';
  import { onMount } from 'svelte';

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

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<div class="login-container">
  {#if isLoading}
    <div class="loading">Loading...</div>
  {:else if userInfo}
    <div class="user-info">
      <img src={userInfo.picture} alt={userInfo.name} class="avatar" />
      <div class="user-details">
        <p class="name">{userInfo.name}</p>
        <p class="email">{userInfo.email}</p>
      </div>
      <button on:click={handleLogout} class="logout-btn">
        Logout
      </button>
    </div>
  {:else}
    <button on:click={handleLogin} class="login-btn">
      Sign in with Google
    </button>
  {/if}
  
  {#if error}
    <div class="error">{error}</div>
  {/if}
</div>

<style>
  .login-container {
    padding: 1rem;
    text-align: center;
  }

  .loading {
    color: #666;
    margin: 1rem 0;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 8px;
    background: #f5f5f5;
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  .user-details {
    flex: 1;
    text-align: left;
  }

  .name {
    font-weight: bold;
    margin: 0;
  }

  .email {
    font-size: 0.9em;
    color: #666;
    margin: 0;
  }

  .login-btn, .logout-btn {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .login-btn {
    background-color: #4285f4;
    color: white;
  }

  .login-btn:hover {
    background-color: #3367d6;
  }

  .logout-btn {
    background-color: #f1f1f1;
    color: #333;
  }

  .logout-btn:hover {
    background-color: #e2e2e2;
  }

  .error {
    color: #d32f2f;
    margin-top: 0.5rem;
    font-size: 0.9em;
  }
</style>
