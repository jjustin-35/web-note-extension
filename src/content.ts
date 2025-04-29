// content script can only use dynamic import
(async () => {
  const { default: App } = await import('./components/App.svelte');

  // Create a container with shadow DOM for style isolation
  const container = document.createElement('div');
  container.id = 'web-note-container';
  container.style.position = 'absolute';
  container.style.top = '0';
  container.style.right = '0';
  container.style.zIndex = '9999';
  document.body.appendChild(container);

  // Create shadow root for style isolation
  const shadow = container.attachShadow({ mode: 'open' });

  // Create app target inside shadow DOM
  const target = document.createElement('div');
  target.id = 'web-note-app';
  shadow.appendChild(target);

  // Add Material Icons font
  const linkEl = document.createElement('link');
  linkEl.rel = 'stylesheet';
  linkEl.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
  shadow.appendChild(linkEl);

  // Initialize Svelte app
  new App({
    target,
  });
})();