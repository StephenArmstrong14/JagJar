// Configuration
const API_BASE_URL = 'https://jagjar.app/api'; // Will need to be updated to the actual domain
const SYNC_INTERVAL_MINUTES = 5;
const INACTIVITY_THRESHOLD_SECONDS = 60; // Consider user inactive after 1 minute without interaction

// State
let user = null;
let activeTabId = null;
let activeTabUrl = null;
let activeTabStartTime = null;
let lastActivityTime = null;
let cumulativeTimeSpent = {}; // { domain: timeInSeconds }
let isJagJarEnabledSite = {}; // { domain: boolean }

// Initialize - For Manifest V3, we use the service worker's activation
self.addEventListener('activate', (event) => {
  console.log('JagJar extension activated');
});

// For backward compatibility, still listen to onInstalled
// Using browser for cross-browser compatibility
const browser = chrome;
browser.runtime.onInstalled.addListener(() => {
  console.log('JagJar extension installed');
  initializeExtension();
});

// Initialize functions at startup
initializeExtension();

function initializeExtension() {
  // Set up periodic sync
  browser.alarms.create('sync-time-data', {
    periodInMinutes: SYNC_INTERVAL_MINUTES
  });
  
  // Check user auth status
  checkAuthStatus();
}

// Set up listeners
browser.tabs.onActivated.addListener(activeInfo => {
  handleTabActivated(activeInfo.tabId);
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tabId === activeTabId) {
    handleTabUpdated(tab);
  }
});

// When the user navigates away from a site or closes a tab, record the time
browser.tabs.onRemoved.addListener(tabId => {
  if (tabId === activeTabId) {
    recordTimeSpent();
    activeTabId = null;
    activeTabUrl = null;
    activeTabStartTime = null;
  }
});

// Sync data to the server periodically
browser.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'sync-time-data') {
    syncTimeData();
  }
});

// Handle messages from content script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
    const tab = await browser.tabs.get(tabId);
    activeTabUrl = tab.url;
    const domain = new URL(activeTabUrl).hostname;
    
    // Check if this is a JagJar-enabled site
    if (isJagJarEnabledSite[domain] === undefined) {
      isJagJarEnabledSite[domain] = await checkIfJagJarEnabled(domain);
    }
  } catch (error) {
    console.error('Error getting tab details:', error);
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
  try {
    // In a real implementation, this would check with the JagJar API
    // For now, let's simulate a check
    const response = await fetch(`${API_BASE_URL}/check-site?domain=${encodeURIComponent(domain)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.enabled === true;
    }
  } catch (error) {
    console.error('Error checking if site is JagJar enabled:', error);
  }
  
  // Default to false if there's an error
  return false;
}

async function checkAuthStatus() {
  try {
    const data = await browser.storage.local.get('user');
    if (data.user) {
      user = data.user;
      
      // Verify the token is still valid
      const response = await fetch(`${API_BASE_URL}/validate-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (!response.ok) {
        // Token is invalid, clear user data
        user = null;
        await browser.storage.local.remove('user');
      }
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
  }
}

function showLimitNotification(limitInfo) {
  browser.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'JagJar Usage Limit Reached',
    message: `You've reached your ${limitInfo.limit} hour free tier limit for this month. Upgrade to premium for unlimited access.`,
    buttons: [
      { title: 'Upgrade Now' }
    ]
  });
}

// Badge and icon management
function updateBadge() {
  if (!activeTabUrl) return;
  
  try {
    const domain = new URL(activeTabUrl).hostname;
    if (isJagJarEnabledSite[domain]) {
      // Show time spent on this site today
      const minutes = Math.floor((cumulativeTimeSpent[domain] || 0) / 60);
      browser.action.setBadgeText({ text: minutes.toString() });
      browser.action.setBadgeBackgroundColor({ color: '#4F46E5' });
    } else {
      // Not a JagJar site
      browser.action.setBadgeText({ text: '' });
    }
  } catch (error) {
    console.error('Error updating badge:', error);
  }
}

// Update the badge every minute
setInterval(updateBadge, 60 * 1000);