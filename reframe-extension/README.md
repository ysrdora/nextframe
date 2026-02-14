# Reframe Chrome Extension

A hybrid Chrome extension for extracting video frames with precision. Supports both web videos and local file uploads.

## Features

### Dual Mode Operation

**🌐 Web Video Mode**
- Automatically detects videos on any webpage
- Extract frames from Vimeo, self-hosted videos, and most video players
- Real-time video synchronization with the page

**📁 Local Upload Mode**
- Upload and process local video files (MP4, WebM, etc.)
- Complete privacy - all processing happens locally
- No file size limits (browser-dependent)

### Frame Extraction

- **Precision Control**: Frame-by-frame navigation (24fps)
- **Single Capture**: Extract any frame with one click
- **Batch Capture**: Capture first and last frames automatically
- **Gallery Management**: View, select, and organize captured frames
- **Export Options**:
  - Download individual frames as PNG
  - Batch download selected frames
  - Export HTML contact sheet with all frames

### Technical Features

- 🔒 **100% Client-Side**: All processing happens in your browser
- 💾 **Persistent Storage**: Frames saved in IndexedDB (survives extension reloads)
- 🎨 **Premium UI**: Polished interface with smooth animations
- ⌨️ **Keyboard Shortcuts**: Space (play/pause), Arrow keys (frame step)

## Installation

### Development Build

1. **Clone and Install Dependencies**
   ```bash
   cd reframe-extension
   npm install
   ```

2. **Build the Extension**
   ```bash
   npm run build
   ```

   For development with watch mode:
   ```bash
   npm run dev
   ```

3. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `reframe-extension/dist` folder

### Production Build

```bash
npm run build
```

The extension will be built to the `dist/` folder, ready for Chrome Web Store submission.

## Usage

### Web Video Mode

1. Navigate to any webpage with video content (e.g., Vimeo, self-hosted videos)
2. Click the Reframe extension icon to open the side panel
3. Detected videos will appear automatically
4. Select a video from the list
5. Use the video controls to navigate and capture frames

**Supported Sites:**
- ✅ Vimeo
- ✅ Self-hosted videos
- ✅ Most HTML5 video players
- ❌ YouTube (DRM-protected, CORS-restricted)
- ❌ Netflix, Hulu, etc. (DRM-protected)

**Note:** Some videos are protected by CORS or DRM and cannot be captured due to browser security restrictions. The extension will indicate which videos are compatible.

### Local Upload Mode

1. Click the Reframe extension icon
2. Switch to "Local Upload" mode
3. Click "Upload Video" and select a file from your computer
4. Use the video controls to navigate and capture frames

### Keyboard Shortcuts

- `Space` - Play/Pause
- `→` (Right Arrow) - Step forward one frame
- `←` (Left Arrow) - Step backward one frame
- `Click video` - Play/Pause

### Frame Management

**Capturing Frames:**
- Click the camera icon to capture the current frame
- Click "First/Last" to batch capture the first and last frames

**Gallery Actions:**
- Click frames to select/deselect
- Download selected frames (batch download)
- Delete unwanted frames
- Export all frames as HTML contact sheet
- Expand gallery for larger thumbnails

## Technical Architecture

### Extension Structure

```
reframe-extension/
├── src/
│   ├── background/         # Service worker
│   ├── content/            # Video detection (content scripts)
│   ├── side-panel/         # React UI (main interface)
│   └── shared/
│       ├── hooks/          # Reusable React hooks
│       ├── components/     # UI components
│       ├── lib/            # Utilities (storage, export)
│       └── types/          # TypeScript definitions
├── public/                 # Icons and static assets
└── dist/                   # Build output
```

### Key Technologies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **IndexedDB** - Frame storage
- **Chrome Extensions API** - Side panel, content scripts

### Storage

- **IndexedDB**: Stores captured frames (unlimited quota, typically >100MB)
- **Chrome Storage**: User preferences only (<5KB)
- **Automatic Cleanup**: Frames older than 7 days are automatically deleted

## Development

### Project Scripts

```bash
npm run dev      # Development build with watch mode
npm run build    # Production build
npm run preview  # Preview production build
```

### Build Configuration

The extension uses Vite with the `@crxjs/vite-plugin` for optimal Chrome extension builds:

- **Tree-shaking**: Only used code is bundled
- **Code-splitting**: Separate chunks for React and animations
- **Minification**: Terser minification with console.log removal in production
- **TypeScript**: Full type checking

### File Watching

In development mode (`npm run dev`), Vite watches for file changes and automatically rebuilds. To see changes:

1. Make code changes
2. Wait for build to complete
3. Go to `chrome://extensions/`
4. Click the reload icon on the Reframe extension

## Permissions

The extension requires the following permissions:

- **activeTab**: Access the current tab when extension is clicked
- **storage**: Store user preferences
- **sidePanel**: Use Chrome's side panel API
- **host_permissions (`<all_urls>`)**: Detect videos on any website

All permissions are used solely for frame extraction functionality. No data is sent to external servers.

## Privacy

- ✅ All processing happens locally in your browser
- ✅ No data collection or analytics
- ✅ No external API calls
- ✅ Frames stored locally in IndexedDB
- ✅ No telemetry or tracking

## Browser Compatibility

- **Minimum Chrome Version**: 114 (for Side Panel API)
- **Also works on**: Edge, Brave, Opera, and other Chromium-based browsers

## Troubleshooting

### Video Not Detected

- Ensure the video is visible on the page
- Check that the video element has dimensions ≥200x150px
- Try refreshing the page after loading the video

### CORS / DRM Errors

Some videos cannot be captured due to browser security:

- **YouTube**: DRM-protected, use local download instead
- **Streaming services**: DRM-protected
- **Cross-origin videos**: Some CDNs restrict canvas access

**Workaround**: Download the video file and use Local Upload mode.

### Extension Not Loading

- Check Chrome version (requires 114+)
- Ensure Developer Mode is enabled in chrome://extensions/
- Try removing and re-loading the extension
- Check browser console for errors

## License

This project is based on the Reframe web application. All rights reserved.

## Credits

Built with [Claude Code](https://claude.com/claude-code) based on the original Reframe web application.
