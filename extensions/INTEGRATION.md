# JagJar Extension Integration Guide

This document provides instructions for integrating your website with JagJar, allowing you to monetize based on user engagement time.

## Quick Start

1. **Sign up** for a JagJar account at [jagjar.app](https://jagjar.app/auth)
2. **Generate an API key** from your developer dashboard
3. **Add the JagJar script** to your website
4. **Test integration** using the browser extension

## Integration Steps

### 1. Generate an API Key

1. Log in to your JagJar developer account
2. Navigate to the API Keys section
3. Click "Generate New API Key"
4. Name your key (e.g., "Production Website")
5. Enter your website URL
6. Copy the generated API key

### 2. Add the JagJar Script

Add the following code snippet to your website's HTML, preferably before the closing `</body>` tag:

```html
<script>
  (function() {
    window.JagJar = window.JagJar || {};
    
    // Replace 'YOUR_API_KEY' with your actual API key
    window.JagJar.apiKey = 'YOUR_API_KEY';
    
    // Optional: Set custom configuration
    window.JagJar.config = {
      trackScrollDepth: true,
      trackClicks: true
    };
    
    // Load the JagJar script
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = 'https://cdn.jagjar.app/tracker.js';
    var x = document.getElementsByTagName('script')[0];
    x.parentNode.insertBefore(s, x);
  })();
</script>
```

### 3. Verify Integration

1. Install the JagJar browser extension (Chrome, Firefox, or Edge)
2. Visit your website
3. Click on the JagJar extension icon in your browser toolbar
4. If integration is successful, you'll see a green checkmark and "JagJar Enabled ✓"

## Advanced Configuration

The JagJar script accepts several configuration options:

```javascript
window.JagJar.config = {
  // Track user scroll depth (default: true)
  trackScrollDepth: true,
  
  // Track user clicks (default: true)
  trackClicks: true,
  
  // Track form interactions (default: false)
  trackForms: false,
  
  // Custom domain for API calls (for enterprise customers)
  apiDomain: 'https://api.your-custom-domain.com'
};
```

## Tracking Events

You can manually track important user events with:

```javascript
// Track a custom event
JagJar.trackEvent('completed_tutorial');

// Track a conversion event with value
JagJar.trackConversion('subscription', { value: 25 });
```

## Testing

### Test Mode

To test your integration without affecting production data:

```javascript
window.JagJar.testMode = true;
```

### Verify API Key

You can verify your API key is working correctly by checking the console for:
- `[JagJar] Successfully initialized with API key: jag_k1_...`

If you see an error message, check that your API key is correct.

## Troubleshooting

Common issues:

1. **API key not recognized**: Ensure you're using the correct API key for your domain
2. **Script not loading**: Check your network tab for any failed requests
3. **Extension not detecting**: Make sure you're using the latest extension version

For more help, contact support@jagjar.app

## Data Privacy Compliance

JagJar is designed to be GDPR, CCPA, and PECR compliant. The script:
- Does not use cookies by default
- Does not track personally identifiable information
- Only tracks time spent on your website
- Has configurable user consent options

For full privacy details, see our [privacy policy](https://jagjar.app/privacy).