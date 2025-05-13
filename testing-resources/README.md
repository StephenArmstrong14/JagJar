# JagJar Browser Extension Testing Guide

This guide will help you test the JagJar browser extensions across different browsers after installation.

## Installation Instructions

### Chrome Extension
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" using the toggle in the top-right corner
3. Click "Load unpacked" and select the `jagjar-extensions/chrome` directory from the extracted archive
4. The extension should now appear in your extensions list and be visible in the toolbar

### Edge Extension
1. Open Edge and navigate to `edge://extensions/`
2. Enable "Developer mode" using the toggle in the bottom-left corner
3. Click "Load unpacked" and select the `jagjar-extensions/edge` directory from the extracted archive
4. The extension should now appear in your extensions list and be visible in the toolbar

### Firefox Extension
1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..."
3. Navigate to the extracted archive and select the `manifest.json` file in the `jagjar-extensions/firefox` directory
4. The extension should now appear in your add-ons list and be visible in the toolbar

### Safari Extension
Safari extension development requires:
1. An Apple Developer account
2. Xcode installed on a Mac
3. Building the extension using Xcode

For testing purposes:
1. Open the Safari extension project in Xcode by opening the `.xcodeproj` file in the `jagjar-extensions/safari` directory
2. Click the "Run" button to build and install the extension in Safari's development mode
3. Enable the extension in Safari's preferences

## Testing the Extensions

### Basic Testing
1. After installing the extension, you should see the JagJar icon in your browser's toolbar
2. Click on the icon to open the popup
3. You should see login fields or user information if already logged in

### Using the Test Page
1. Open the `jagjar-test.html` file in your browser (from the `testing-resources` directory)
2. This page simulates a JagJar-enabled website and provides interactive tests
3. Click the buttons to run the tests and verify the extension functionality

### Extension Detection Test
This test verifies that the browser can detect the JagJar extension. Click the "Check Extension" button to initiate this test.

### Activity Tracking Test
This test verifies that the extension properly tracks user activity on JagJar-enabled websites. Click the "Test Activity Tracking" button, then follow the instructions to move your mouse and press keys.

### Browser API Compatibility Test
This test checks if the browser-specific API adaptations are working correctly. It detects your current browser and tests the appropriate API implementations.

## API Testing with Actual Websites

To test the extensions in a real-world scenario, you can visit any website and:

1. Open the browser's developer tools (F12 or right-click > Inspect)
2. In the console, add a JagJar API key simulation:
   ```javascript
   window.JagJar = { apiKey: 'jag_k1_test123456789' };
   ```
3. Click on the JagJar extension icon
4. The extension should recognize the site as JagJar-enabled

## Common Issues and Troubleshooting

### Extension Not Responding
- Make sure you have properly installed the extension from the correct directory
- Check if there are any errors in the browser's developer console
- Try restarting the browser

### Cross-Browser Compatibility
- Different browsers might have slight variations in behavior
- Safari has the most differences due to its unique extension architecture
- If issues occur in one browser but not others, it may be related to the browser's specific implementation of the extension APIs

### Testing the Free-Tier Limit Feature
To test the free-tier limit feature:
1. Ensure you're logged in with a free-tier account
2. Artificially set the usage time to near the limit using the developer console:
   ```javascript
   localStorage.setItem('jagjar_usage_override', JSON.stringify({
     used: 7.9, // Hours used (8 hours is the limit)
     limit: 8   // Free tier limit
   }));
   ```
3. Refresh the page and stay active for a short time
4. You should see the limit notification overlay appear

## Reporting Issues
If you encounter any issues during testing, please document:
1. The browser being used (including version)
2. The specific extension version
3. Steps to reproduce the issue
4. Any error messages visible in the console
5. Screenshots if applicable
