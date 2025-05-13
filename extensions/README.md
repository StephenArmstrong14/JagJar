# JagJar Browser Extensions

This directory contains browser extensions for JagJar, a platform for monetizing web applications based on actual user engagement time.

## Features

- Track time spent on JagJar-enabled websites
- Display time usage statistics
- Enforce free tier limits (8 hours/month)
- Provide a seamless premium subscription experience
- Works across Chrome, Firefox, and other browsers

## Directory Structure

```
extensions/
├── chrome/        # Chrome/Edge/Opera extension
│   ├── icons/     # Extension icons
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
└── firefox/       # Firefox extension
    ├── icons/
    ├── manifest.json
    ├── background.js
    ├── content.js
    ├── popup.html
    ├── popup.css
    └── popup.js
```

## Building and Installing Extensions

### Chrome Extension

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" by toggling the switch in the top right corner
3. Click "Load unpacked" and select the `extensions/chrome` directory
4. The extension should now be installed and visible in your toolbar

### Firefox Extension

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..."
3. Select any file in the `extensions/firefox` directory (e.g., `manifest.json`)
4. The extension should now be installed and visible in your toolbar

### To create a production-ready package:

#### Chrome:
1. Zip the contents of the `extensions/chrome` directory
2. Submit to the Chrome Web Store Dashboard

#### Firefox:
1. Zip the contents of the `extensions/firefox` directory
2. Submit to the Firefox Add-ons Portal

## API Endpoints

The extension interacts with the following API endpoints on the JagJar server:

- `/api/user` - Get user information
- `/api/login` - Authenticate user
- `/api/logout` - Log out user
- `/api/time-tracking` - Send time tracking data
- `/api/time-tracking/user` - Get user's time statistics
- `/api/check-site` - Check if a website is JagJar-enabled
- `/api/validate-token` - Validate authentication token

## Development Notes

### Configuration

Update `API_BASE_URL` in both `background.js` and `popup.js` files to point to your actual JagJar API server.

### Key Components

1. **Background Script (`background.js`):**
   - Tracks active tabs and user activity
   - Records time spent on JagJar-enabled websites
   - Periodically syncs time data with the server
   - Manages free tier time limits

2. **Content Script (`content.js`):**
   - Runs in the context of each web page
   - Detects user activity (mouse, keyboard, scroll)
   - Shows an overlay when the user reaches their free tier limit

3. **Popup UI (`popup.html`, `popup.css`, `popup.js`):**
   - Provides login/logout functionality
   - Displays time usage statistics
   - Shows subscription status
   - Links to the JagJar dashboard and pricing pages

### Browser Compatibility

The extensions are designed to work with:

- Chrome 88+
- Firefox 57+
- Microsoft Edge 88+ (Chromium-based)
- Opera 74+

## Customization

You may customize the following aspects of the extensions:

- UI colors and styles in `popup.css`
- Free tier time limit (change `LIMIT_HOURS` in `popup.js`)
- Activity tracking settings (modify `ACTIVITY_EVENTS` and `INACTIVITY_THRESHOLD_SECONDS` in the scripts)
- Domain checking (replace `checkIfJagJarEnabled` with your implementation)

## License

Copyright (c) 2025 JagJar. All rights reserved.