// This script runs in the context of the web page

// Configuration
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart'];
const ACTIVITY_UPDATE_THROTTLE_MS = 5000; // Limit activity updates to once per 5 seconds
const DEBUG = true; // Enable debugging logs

// State
let lastActivityUpdate = 0;
let isJagJarEnabledSite = false;
let limitReached = false;
let limitOverlay = null;

// Helper function for logging
function log(...args) {
  if (DEBUG) {
    console.log('[JagJar Content]', ...args);
  }
}

// Add a listener for test events on our test page
document.addEventListener('jagjar_extension_check', (event) => {
  log('Extension check event received:', event.detail);
  
  // Respond in multiple ways to maximize compatibility
  // 1. Using window.postMessage
  window.postMessage({ 
    from: 'jagjar_extension', 
    message: 'Extension is active',
    timestamp: Date.now()
  }, '*');
  
  // 2. Using a custom event
  const responseEvent = new CustomEvent('jagjar_extension_response', {
    detail: {
      active: true,
      extensionId: chrome.runtime.id,
      timestamp: Date.now()
    }
  });
  document.dispatchEvent(responseEvent);
  
  // 3. Add a DOM element
  const marker = document.createElement('div');
  marker.id = 'jagjar-extension-marker';
  marker.style.display = 'none';
  marker.dataset.active = 'true';
  marker.dataset.timestamp = Date.now().toString();
  
  if (!document.getElementById('jagjar-extension-marker')) {
    document.body.appendChild(marker);
  }
  
  log('Sent extension detection responses via multiple methods');
});

document.addEventListener('jagjar_api_test', (event) => {
  log('API test event received:', event.detail);
  
  // Multiple response methods again
  // 1. Using window.postMessage
  window.postMessage({
    from: 'jagjar_api_test_response',
    message: 'Browser API working in ' + (event.detail.browser || 'current browser'),
    browser: chrome.runtime.getManifest().name,
    timestamp: Date.now()
  }, '*');
  
  // 2. Using a custom event
  const responseEvent = new CustomEvent('jagjar_api_test_result', {
    detail: {
      success: true,
      browser: chrome.runtime.getManifest().name,
      timestamp: Date.now()
    }
  });
  document.dispatchEvent(responseEvent);
  
  log('Sent API test responses');
});

// Look for JagJar API key in the page for testing
try {
  if (window.JagJar && window.JagJar.apiKey) {
    log('Found JagJar API key on page:', window.JagJar.apiKey.substring(0, 10) + '...');
    isJagJarEnabledSite = true;
    initializeActivityTracking();
    checkUserLimits();
  } else {
    // Standard flow - check with the background script
    log('Checking with background script if site is JagJar-enabled');
    
    chrome.runtime.sendMessage({type: 'check-jagjar-enabled'}, response => {
      if (chrome.runtime.lastError) {
        log('Error checking if site is JagJar-enabled:', chrome.runtime.lastError.message);
        return;
      }
      
      if (response && response.isEnabled) {
        log('Background script confirmed site is JagJar-enabled');
        isJagJarEnabledSite = true;
        initializeActivityTracking();
        checkUserLimits();
      } else {
        log('Site is not JagJar-enabled');
      }
    });
  }
} catch (error) {
  console.error('Error in JagJar content script initialization:', error);
}

// Initialize activity tracking if this is a JagJar-enabled site
function initializeActivityTracking() {
  try {
    // Add listeners for user activity
    ACTIVITY_EVENTS.forEach(eventType => {
      document.addEventListener(eventType, reportActivity, { passive: true });
      log(`Added event listener for ${eventType}`);
    });
    
    // Initial activity report
    reportActivity();
    
    log('JagJar activity tracking initialized successfully');
  } catch (error) {
    console.error('Error initializing activity tracking:', error);
  }
}

// Report user activity to the background script
function reportActivity() {
  try {
    const now = Date.now();
    
    // Throttle activity updates to avoid excessive messaging
    if (now - lastActivityUpdate > ACTIVITY_UPDATE_THROTTLE_MS) {
      lastActivityUpdate = now;
      
      chrome.runtime.sendMessage({ type: 'user-activity' }, () => {
        if (chrome.runtime.lastError) {
          // Only log once every few minutes to avoid console spam
          if (Math.random() < 0.05) { // Log ~5% of errors
            log('Error reporting activity:', chrome.runtime.lastError.message);
          }
        }
      });
    }
  } catch (error) {
    // Only log occasionally to avoid console spam
    if (Math.random() < 0.05) { // Log ~5% of errors
      console.error('Error in activity reporting:', error);
    }
  }
}

// Check if user has reached usage limits
function checkUserLimits() {
  try {
    log('Checking user limits...');
    
    chrome.runtime.sendMessage({ type: 'get-user-data' }, response => {
      if (chrome.runtime.lastError) {
        log('Error getting user data:', chrome.runtime.lastError.message);
        return;
      }
      
      if (!response) {
        log('No response received when checking user limits');
        return;
      }
      
      const userData = response.user;
      log('User data received:', userData ? 'User found' : 'No user data');
      
      if (!userData) {
        log('No user is logged in, limits not applicable');
        return;
      }
      
      // For free users, check remaining time
      if (userData.subscriptionType === 'free') {
        const remainingTime = userData.remainingTimeSeconds || 0;
        log(`Free user has ${remainingTime} seconds remaining`);
        
        if (remainingTime <= 0) {
          log('User has reached their free tier limit');
          limitReached = true;
          showLimitOverlay();
        }
      } else {
        log('User has a premium subscription, no limits apply');
      }
    });
  } catch (error) {
    console.error('Error checking user limits:', error);
  }
}

// Create and show an overlay when the user has reached their free tier limit
function showLimitOverlay() {
  try {
    // Check if we already have an overlay
    if (limitOverlay) {
      log('Limit overlay already exists, not creating another one');
      return;
    }
    
    log('Creating usage limit overlay');
    
    // Create the overlay
    limitOverlay = document.createElement('div');
    limitOverlay.id = 'jagjar-limit-overlay';
    limitOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.85);
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 20px;
    `;
    
    // Make sure we can get the icon URL
    let iconUrl = 'icons/icon128.png';
    try {
      iconUrl = chrome.runtime.getURL('icons/icon128.png');
      log('Got icon URL:', iconUrl);
    } catch (iconError) {
      console.error('Error getting icon URL:', iconError);
      // Use a fallback icon or none at all
      iconUrl = '';
    }
    
    // Add content to the overlay
    limitOverlay.innerHTML = `
      <div style="max-width: 500px;">
        ${iconUrl ? `<img src="${iconUrl}" alt="JagJar" style="width: 80px; height: 80px; margin-bottom: 20px;">` : ''}
        <h1 style="font-size: 24px; margin-bottom: 10px;">Free Tier Limit Reached</h1>
        <p style="font-size: 16px; margin-bottom: 20px;">You've reached your monthly free tier limit for JagJar-enabled websites.</p>
        <p style="font-size: 16px; margin-bottom: 30px;">Upgrade to premium for unlimited access to all JagJar-enabled sites.</p>
        <button id="jagjar-upgrade-btn" style="background-color: #4F46E5; color: white; border: none; padding: 12px 24px; font-size: 16px; border-radius: 4px; cursor: pointer;">Upgrade to Premium</button>
        <p style="margin-top: 20px; font-size: 14px;">Your monthly limit will reset in <span id="jagjar-reset-countdown">--</span></p>
      </div>
    `;
    
    // Add the overlay to the page
    if (document.body) {
      document.body.appendChild(limitOverlay);
      log('Limit overlay added to page');
      
      // Add event listener to the upgrade button
      const upgradeButton = document.getElementById('jagjar-upgrade-btn');
      if (upgradeButton) {
        upgradeButton.addEventListener('click', () => {
          log('Upgrade button clicked');
          // Open the upgrade page in a new tab
          window.open('https://jagjar.app/pricing', '_blank');
        });
      } else {
        console.error('Could not find upgrade button element');
      }
      
      // Block interaction with the underlying page
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      // Clean up when navigating away
      window.addEventListener('beforeunload', () => {
        log('Page unloading, restoring original overflow');
        document.body.style.overflow = originalOverflow;
      });
    } else {
      console.error('Document body not available, cannot add overlay');
    }
  } catch (error) {
    console.error('Error displaying limit overlay:', error);
  }
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    log('Message received from background script:', message.type);
    
    if (message.type === 'limit-reached') {
      log('Limit reached notification received');
      limitReached = true;
      showLimitOverlay();
    } else if (message.type === 'test') {
      // Used for testing extension connectivity
      log('Test message received');
      sendResponse({success: true, message: 'Content script received test message'});
    }
  } catch (error) {
    console.error('Error handling message from background script:', error);
  }
});