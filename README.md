# Web Note Chrome Extension

A Chrome extension for adding draggable sticky notes to any web page.

## Features

- Add draggable sticky notes to any web page
- Choose from different note colors
- Notes persist across page reloads
- Organize notes in a sidebar
- Access notes from the dashboard

## Prerequisites

- Node.js (v16 or higher)
- Yarn package manager
- Chrome browser

## Project Structure

```
extension/
├── src/
│   ├── components/
│   │   ├── App.svelte
│   │   ├── Note.svelte
│   │   └── Sidebar.svelte
│   ├── content.ts
│   ├── sidebar.ts
│   ├── sidebar.html
│   ├── manifest.json
│   └── types.ts
├── dist/           # Built files
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Development

1. Install dependencies:
```bash
yarn install
```

2. Build the extension:
```bash
yarn build
```

3. For development with watch mode:
```bash
yarn watch
```

### Loading the Extension in Chrome

1. Run the build command:
```bash
yarn build
```

2. Open Chrome and navigate to `chrome://extensions`

3. Enable "Developer mode" in the top right corner

4. Click "Load unpacked" and select the `extension` folder (the root folder containing the dist directory)

5. The extension should now be loaded and ready to use

## Usage

1. Click the extension icon in your Chrome toolbar to open the side panel
2. Click the "+" button to add a new note
3. Drag notes around the page
4. Click notes to edit their content
5. Use the color picker to change note colors
6. Access the dashboard to manage all your notes
