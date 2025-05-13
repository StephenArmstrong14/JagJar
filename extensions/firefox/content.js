// This script runs in the context of the web page

// Configuration
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart'];
const ACTIVITY_UPDATE_THROTTLE_MS = 5000; // Limit activity updates to once per 5 seconds

// State
let lastActivityUpdate = 0;
let isJagJarEnabledSite = false;
let limitReached = false;
let limitOverlay = null;

// Check if this site is JagJar-enabled
browser.runtime.sendMessage({type: 'check-jagjar-enabled'})
  .then(response => {
    if (response && response.isEnabled) {
      isJagJarEnabledSite = true;
      initializeActivityTracking();
      checkUserLimits();
    }
  })
  .catch(error => {
    console.error('Error checking if site is JagJar enabled:', error);
  });

// Initialize activity tracking if this is a JagJar-enabled site
function initializeActivityTracking() {
  // Add listeners for user activity
  ACTIVITY_EVENTS.forEach(eventType => {
    document.addEventListener(eventType, reportActivity, { passive: true });
  });
  
  // Initial activity report
  reportActivity();
  
  console.log('JagJar activity tracking initialized');
}

// Report user activity to the background script
function reportActivity() {
  const now = Date.now();
  
  // Throttle activity updates to avoid excessive messaging
  if (now - lastActivityUpdate > ACTIVITY_UPDATE_THROTTLE_MS) {
    lastActivityUpdate = now;
    browser.runtime.sendMessage({ type: 'user-activity' })
      .catch(error => {
        console.error('Error reporting activity:', error);
      });
  }
}

// Check if user has reached usage limits
function checkUserLimits() {
  browser.runtime.sendMessage({ type: 'get-user-data' })
    .then(response => {
      const userData = response.user;
      
      if (!userData || (userData.subscriptionType === 'free' && userData.remainingTimeSeconds <= 0)) {
        // User has reached their limit, show overlay
        limitReached = true;
        showLimitOverlay();
      }
    })
    .catch(error => {
      console.error('Error getting user data:', error);
    });
}

// Create and show an overlay when the user has reached their free tier limit
function showLimitOverlay() {
  if (limitOverlay) return; // Already showing
  
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
  
  // Add content to the overlay
  limitOverlay.innerHTML = `
    <div style="max-width: 500px;">
      <img src="${browser.runtime.getURL('icons/icon128.png')}" alt="JagJar" style="width: 80px; height: 80px; margin-bottom: 20px;">
      <h1 style="font-size: 24px; margin-bottom: 10px;">Free Tier Limit Reached</h1>
      <p style="font-size: 16px; margin-bottom: 20px;">You've reached your monthly free tier limit for JagJar-enabled websites.</p>
      <p style="font-size: 16px; margin-bottom: 30px;">Upgrade to premium for unlimited access to all JagJar-enabled sites.</p>
      <button id="jagjar-upgrade-btn" style="background-color: #4F46E5; color: white; border: none; padding: 12px 24px; font-size: 16px; border-radius: 4px; cursor: pointer;">Upgrade to Premium</button>
      <p style="margin-top: 20px; font-size: 14px;">Your monthly limit will reset in <span id="jagjar-reset-countdown">--</span></p>
    </div>
  `;
  
  // Add the overlay to the page
  document.body.appendChild(limitOverlay);
  
  // Add event listener to the upgrade button
  document.getElementById('jagjar-upgrade-btn').addEventListener('click', () => {
    // Open the upgrade page in a new tab
    window.open('https://jagjar.app/pricing', '_blank');
  });
  
  // Block interaction with the underlying page
  const originalOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  
  // Clean up when navigating away
  window.addEventListener('beforeunload', () => {
    document.body.style.overflow = originalOverflow;
  });
}

// Listen for messages from the background script
browser.runtime.onMessage.addListener((message) => {
  if (message.type === 'limit-reached') {
    limitReached = true;
    showLimitOverlay();
  }
});