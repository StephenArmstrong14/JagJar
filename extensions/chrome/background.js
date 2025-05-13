// Configuration
const API_BASE_URL = 'https://jagjar.app/api'; // Will need to be updated to the actual domain
const SYNC_INTERVAL_MINUTES = 5;
const INACTIVITY_THRESHOLD_SECONDS = 60; // Consider user inactive after 1 minute without interaction
const LOCAL_DEV_MODE = true; // Set to true to avoid unnecessary API calls during development

// State
let user = null;
let activeTabId = null;
let activeTabUrl = null;
let activeTabStartTime = null;
let lastActivityTime = null;
let cumulativeTimeSpent = {}; // { domain: timeInSeconds }
let isJagJarEnabledSite = {}; // { domain: boolean }

// Initialize
chrome.runtime.onInstalled.addListener(() => {
  console.log('JagJar extension installed');
  
  // Set up periodic sync
  chrome.alarms.create('sync-time-data', {
    periodInMinutes: SYNC_INTERVAL_MINUTES
  });
  
  // Check user auth status
  checkAuthStatus();
});

// Set up listeners
chrome.tabs.onActivated.addListener(activeInfo => {
  handleTabActivated(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tabId === activeTabId) {
    handleTabUpdated(tab);
  }
});

// When the user navigates away from a site or closes a tab, record the time
chrome.tabs.onRemoved.addListener(tabId => {
  if (tabId === activeTabId) {
    recordTimeSpent();
    activeTabId = null;
    activeTabUrl = null;
    activeTabStartTime = null;
  }
});

// Sync data to the server periodically
chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'sync-time-data') {
    syncTimeData();
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'user-activity') {
    lastActivityTime = Date.now();
  } else if (message.type === 'check-jagjar-enabled') {
    const domain = new URL(sender.tab.url).hostname;
    checkIfJagJarEnabled(domain)
      .then(enabled => {
        isJagJarEnabledSite[domain] = enabled;
        sendResponse({ isEnabled: enabled });
      });
    return true; // Required for async sendResponse
  } else if (message.type === 'get-user-data') {
    sendResponse({ user: user });
  }
});

// Functions
async function handleTabActivated(tabId) {
  // Record time spent on the previous active tab
  recordTimeSpent();
  
  // Update active tab info
  activeTabId = tabId;
  activeTabStartTime = Date.now();
  lastActivityTime = Date.now();
  
  try {
    // Skip tab details if the extension is not in a valid state
    if (!tabId) {
      console.log('Tab ID is not valid, skipping tab activation');
      return;
    }
    
    const tab = await chrome.tabs.get(tabId);
    
    // Sometimes tab may be undefined during rapid navigation
    if (!tab || !tab.url) {
      console.log('Tab or URL is undefined, skipping tab activation');
      return;
    }
    
    activeTabUrl = tab.url;
    
    // Only process http and https URLs
    if (!activeTabUrl.startsWith('http')) {
      console.log('Skipping non-http URL:', activeTabUrl);
      return;
    }
    
    const domain = new URL(activeTabUrl).hostname;
    
    // Check if this is a JagJar-enabled site
    if (isJagJarEnabledSite[domain] === undefined) {
      isJagJarEnabledSite[domain] = await checkIfJagJarEnabled(domain);
    }
  } catch (error) {
    // More informative error message
    if (error.message.includes('No tab with id')) {
      console.log('Tab was closed or doesn\'t exist anymore:', tabId);
    } else if (error.message.includes('Cannot read properties of undefined')) {
      console.log('Tab properties were undefined, possibly during navigation');
    } else {
      console.error('Error getting tab details:', error.message);
    }
    
    // Reset tab state on error
    activeTabUrl = null;
  }
}

function handleTabUpdated(tab) {
  recordTimeSpent();
  
  activeTabUrl = tab.url;
  activeTabStartTime = Date.now();
  lastActivityTime = Date.now();
}

function recordTimeSpent() {
  if (!activeTabId || !activeTabUrl || !activeTabStartTime) return;
  
  try {
    const domain = new URL(activeTabUrl).hostname;
    
    // Only track time for JagJar-enabled sites
    if (!isJagJarEnabledSite[domain]) return;
    
    // Calculate active time (excluding inactive periods)
    const now = Date.now();
    const inactiveTimeThreshold = lastActivityTime + (INACTIVITY_THRESHOLD_SECONDS * 1000);
    
    let activeTime;
    if (now > inactiveTimeThreshold) {
      // User has been inactive
      activeTime = (lastActivityTime - activeTabStartTime) / 1000;
    } else {
      // User is still active
      activeTime = (now - activeTabStartTime) / 1000;
    }
    
    // Round down to nearest second
    activeTime = Math.floor(activeTime);
    
    // Add to cumulative time
    if (!cumulativeTimeSpent[domain]) {
      cumulativeTimeSpent[domain] = 0;
    }
    cumulativeTimeSpent[domain] += activeTime;
    
    console.log(`Recorded ${activeTime}s on ${domain}. Total: ${cumulativeTimeSpent[domain]}s`);
    
    // Reset the start time
    activeTabStartTime = now;
  } catch (error) {
    console.error('Error recording time spent:', error);
  }
}

async function syncTimeData() {
  if (!user) {
    console.log('User not logged in, skipping time sync');
    return;
  }
  
  // Record time for the currently active tab before syncing
  recordTimeSpent();
  
  // Only sync if there's data to sync
  if (Object.keys(cumulativeTimeSpent).length === 0) {
    console.log('No time data to sync');
    return;
  }
  
  try {
    // Format data for the API
    const timeData = Object.entries(cumulativeTimeSpent).map(([domain, seconds]) => ({
      domain,
      seconds,
      timestamp: new Date().toISOString()
    }));
    
    // Send to the API
    const response = await fetch(`${API_BASE_URL}/time-tracking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify({ timeData })
    });
    
    if (response.ok) {
      console.log('Time data synced successfully');
      
      // Check for any usage limitations from the server
      const data = await response.json();
      if (data.status === 'limited') {
        // User has hit their free tier limit
        showLimitNotification(data.limitInfo);
      }
      
      // Reset the cumulative time as it's been synced
      cumulativeTimeSpent = {};
    } else {
      console.error('Error syncing time data:', response.statusText);
    }
  } catch (error) {
    console.error('Error during time data sync:', error);
  }
}

async function checkIfJagJarEnabled(domain) {
  // In development mode, use a hardcoded list of domains for testing
  if (LOCAL_DEV_MODE) {
    console.log('DEV MODE: Checking if domain is JagJar-enabled:', domain);
    
    // For testing purposes, consider these domains as JagJar-enabled
    const testEnabledDomains = [
      'example.com',
      'jagjar.app',
      'replit.com',
      'localhost'
    ];
    
    // Local testing - any domain with "test" in it is JagJar-enabled
    if (domain.includes('test') || testEnabledDomains.includes(domain)) {
      console.log('DEV MODE: Domain is JagJar-enabled:', domain);
      return true;
    }
    
    return false;
  }
  
  // Production mode - actually check with the API
  try {
    console.log('Checking if domain is JagJar-enabled:', domain);
    
    const response = await fetch(`${API_BASE_URL}/check-site?domain=${encodeURIComponent(domain)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const data = await response.json();
      const isEnabled = data.enabled === true;
      console.log(`Domain ${domain} JagJar-enabled status:`, isEnabled);
      return isEnabled;
    } else {
      console.log(`API returned error for domain ${domain}:`, response.status, response.statusText);
      return false;
    }
  } catch (error) {
    // More specific error handling
    if (error.name === 'AbortError') {
      console.log('Request timed out checking if site is JagJar enabled:', domain);
    } else if (error.message.includes('Failed to fetch')) {
      console.log('Network error checking if site is JagJar enabled (API possibly unreachable)');
    } else {
      console.error('Error checking if site is JagJar enabled:', error.message);
    }
    
    // Check if domain is the jagjar.app domain itself
    if (domain.includes('jagjar.app')) {
      return true; // Always consider the JagJar app itself as enabled
    }
  }
  
  // Default to false if there's an error
  return false;
}

async function checkAuthStatus() {
  try {
    console.log('Checking authentication status...');
    const data = await chrome.storage.local.get('user');
    
    if (data.user) {
      user = data.user;
      console.log('Found stored user data');
      
      if (LOCAL_DEV_MODE) {
        console.log('DEV MODE: Skipping token validation');
        return;
      }
      
      // Verify the token is still valid
      try {
        console.log('Validating user token...');
        const response = await fetch(`${API_BASE_URL}/validate-token`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user.token}`
          },
          // Add timeout to prevent hanging requests
          signal: AbortSignal.timeout(5000)
        });
        
        if (!response.ok) {
          console.log('Token validation failed, status:', response.status);
          // Token is invalid, clear user data
          user = null;
          await chrome.storage.local.remove('user');
        } else {
          console.log('Token successfully validated');
        }
      } catch (tokenError) {
        // Only log the error but don't clear the user data if it's just a network issue
        if (tokenError.name === 'AbortError') {
          console.log('Token validation request timed out');
        } else if (tokenError.message.includes('Failed to fetch')) {
          console.log('Network error during token validation (API possibly unreachable)');
        } else {
          console.error('Error validating token:', tokenError.message);
        }
      }
    } else {
      console.log('No stored user data found');
    }
  } catch (error) {
    console.error('Error accessing storage for auth status:', error.message);
  }
}

function showLimitNotification(limitInfo) {
  try {
    // Handle missing parameters gracefully
    const limit = limitInfo && limitInfo.limit ? limitInfo.limit : 8;
    
    console.log('Showing usage limit notification for', limit, 'hours');
    
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'JagJar Usage Limit Reached',
      message: `You've reached your ${limit} hour free tier limit for this month. Upgrade to premium for unlimited access.`,
      buttons: [
        { title: 'Upgrade Now' }
      ]
    }, (notificationId) => {
      if (chrome.runtime.lastError) {
        console.log('Error showing notification:', chrome.runtime.lastError.message);
      } else {
        console.log('Notification shown successfully:', notificationId);
      }
    });
  } catch (error) {
    console.error('Error showing limit notification:', error.message);
  }
}

// Badge and icon management
function updateBadge() {
  if (!activeTabUrl) return;
  
  try {
    const domain = new URL(activeTabUrl).hostname;
    if (isJagJarEnabledSite[domain]) {
      // Show time spent on this site today
      const minutes = Math.floor((cumulativeTimeSpent[domain] || 0) / 60);
      chrome.action.setBadgeText({ text: minutes.toString() });
      chrome.action.setBadgeBackgroundColor({ color: '#4F46E5' });
    } else {
      // Not a JagJar site
      chrome.action.setBadgeText({ text: '' });
    }
  } catch (error) {
    console.error('Error updating badge:', error);
  }
}

// Update the badge every minute
setInterval(updateBadge, 60 * 1000);