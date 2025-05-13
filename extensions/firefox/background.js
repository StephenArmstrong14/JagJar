// Configuration
const API_BASE_URL = 'https://jagjar.app/api'; // Update to the actual domain
const SYNC_INTERVAL_MINUTES = 5;
const INACTIVITY_THRESHOLD_SECONDS = 60;

// State
let activeTabId = null;
let activeTabUrl = null;
let activeTabDomain = null;
let lastActiveTime = Date.now();
let isJagJarEnabledSite = false;
let timeByDomain = {};
let syncTimeoutId = null;

// Initialize
browser.tabs.onActivated.addListener(info => {
  handleTabActivated(info.tabId);
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.url) {
    handleTabUpdated(tab);
  }
});

// Start time tracking interval
setInterval(recordTimeSpent, 1000);

// Schedule periodic syncing
scheduleSyncTimeData();

// Tab activation handler
async function handleTabActivated(tabId) {
  try {
    const tab = await browser.tabs.get(tabId);
    
    if (!tab.url || tab.url.startsWith('about:') || tab.url.startsWith('moz-extension:')) {
      // Not a tracking tab, clear active tab
      activeTabId = null;
      activeTabUrl = null;
      activeTabDomain = null;
      isJagJarEnabledSite = false;
      return;
    }
    
    // Update active tab info
    activeTabId = tabId;
    activeTabUrl = tab.url;
    
    try {
      const url = new URL(tab.url);
      activeTabDomain = url.hostname;
      
      // Check if this is a JagJar-enabled site
      isJagJarEnabledSite = await checkIfJagJarEnabled(activeTabDomain);
      
      // Update the badge
      updateBadge();
      
      // Reset last active time
      lastActiveTime = Date.now();
    } catch (error) {
      console.error('Error parsing URL:', error);
      activeTabDomain = null;
      isJagJarEnabledSite = false;
    }
  } catch (error) {
    console.error('Error handling tab activation:', error);
  }
}

// Tab update handler
function handleTabUpdated(tab) {
  if (!tab.url || tab.url.startsWith('about:') || tab.url.startsWith('moz-extension:')) {
    // Not a tracking tab, clear active tab
    activeTabId = null;
    activeTabUrl = null;
    activeTabDomain = null;
    isJagJarEnabledSite = false;
    return;
  }
  
  // Update active tab info
  activeTabUrl = tab.url;
  
  try {
    const url = new URL(tab.url);
    const newDomain = url.hostname;
    
    // If domain changed, check if it's JagJar-enabled
    if (newDomain !== activeTabDomain) {
      activeTabDomain = newDomain;
      checkIfJagJarEnabled(activeTabDomain).then(enabled => {
        isJagJarEnabledSite = enabled;
        updateBadge();
      });
    }
    
    // Reset last active time
    lastActiveTime = Date.now();
  } catch (error) {
    console.error('Error parsing URL:', error);
    activeTabDomain = null;
    isJagJarEnabledSite = false;
  }
}

// Record time spent on the active tab
function recordTimeSpent() {
  // Only record time for JagJar-enabled sites
  if (!isJagJarEnabledSite || !activeTabDomain) {
    return;
  }
  
  // Check if user is still active
  const now = Date.now();
  const secondsSinceLastActivity = (now - lastActiveTime) / 1000;
  
  if (secondsSinceLastActivity > INACTIVITY_THRESHOLD_SECONDS) {
    // User is inactive, don't record time
    return;
  }
  
  // Initialize domain counter if needed
  if (!timeByDomain[activeTabDomain]) {
    timeByDomain[activeTabDomain] = {
      seconds: 0,
      lastUpdated: now
    };
  }
  
  // Add 1 second to the counter
  timeByDomain[activeTabDomain].seconds += 1;
  timeByDomain[activeTabDomain].lastUpdated = now;
  
  // Check if we should sync data
  if (Object.keys(timeByDomain).some(domain => timeByDomain[domain].seconds >= 60)) {
    syncTimeData();
  }
  
  // Check user limits if on a JagJar-enabled site
  checkAuthStatus().then(isLoggedIn => {
    if (isLoggedIn) {
      // Get user data from storage
      browser.storage.local.get('user').then(data => {
        if (data.user && data.user.subscriptionType === 'free') {
          // Get all time tracking for this month
          fetch(`${API_BASE_URL}/time-tracking/user`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${data.user.token}`
            }
          }).then(response => response.json())
            .then(timeData => {
              if (timeData.remainingSeconds !== null && timeData.remainingSeconds <= 0) {
                // User has hit their limit, show notification and overlay
                showLimitNotification({
                  limit: 8,
                  used: Math.ceil(timeData.month / 3600)
                });
                
                // Notify content script
                browser.tabs.sendMessage(activeTabId, { type: 'limit-reached' })
                  .catch(error => {
                    console.error('Error sending limit-reached message:', error);
                  });
              }
            })
            .catch(error => {
              console.error('Error checking time limits:', error);
            });
        }
      });
    }
  });
}

// Sync time data with the server
async function syncTimeData() {
  // Check if we have data to sync
  if (Object.keys(timeByDomain).length === 0) {
    return;
  }
  
  // Check if user is logged in
  const isLoggedIn = await checkAuthStatus();
  
  if (!isLoggedIn) {
    // User not logged in, wait until they login
    return;
  }
  
  try {
    // Get the data to sync
    const dataToSync = [];
    const now = Date.now();
    
    for (const domain in timeByDomain) {
      // Only sync domains with activity
      if (timeByDomain[domain].seconds > 0) {
        dataToSync.push({
          domain,
          seconds: timeByDomain[domain].seconds,
          timestamp: now
        });
        
        // Reset counter
        timeByDomain[domain].seconds = 0;
      }
    }
    
    if (dataToSync.length === 0) {
      return;
    }
    
    // Get the auth token
    const data = await browser.storage.local.get('user');
    
    if (!data.user || !data.user.token) {
      return;
    }
    
    // Send data to the server
    const response = await fetch(`${API_BASE_URL}/time-tracking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.user.token}`
      },
      body: JSON.stringify({
        timeData: dataToSync
      })
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    
    const result = await response.json();
    
    // Check if user has hit their limit
    if (result.status === 'limited') {
      showLimitNotification(result.limitInfo);
      
      // Notify content script if on an active JagJar site
      if (isJagJarEnabledSite && activeTabId) {
        browser.tabs.sendMessage(activeTabId, { type: 'limit-reached' })
          .catch(error => {
            console.error('Error sending limit-reached message:', error);
          });
      }
    }
  } catch (error) {
    console.error('Error syncing time data:', error);
  }
}

// Schedule periodic syncing
function scheduleSyncTimeData() {
  // Clear existing timeout if any
  if (syncTimeoutId) {
    clearTimeout(syncTimeoutId);
  }
  
  // Schedule sync every SYNC_INTERVAL_MINUTES
  syncTimeoutId = setTimeout(() => {
    syncTimeData().then(() => {
      // Schedule next sync
      scheduleSyncTimeData();
    });
  }, SYNC_INTERVAL_MINUTES * 60 * 1000);
}

// Check if a site is JagJar-enabled
async function checkIfJagJarEnabled(domain) {
  if (!domain) return false;
  
  try {
    const response = await fetch(`${API_BASE_URL}/check-site?domain=${encodeURIComponent(domain)}`);
    
    if (response.ok) {
      const data = await response.json();
      return data.enabled === true;
    }
  } catch (error) {
    console.error('Error checking if site is JagJar enabled:', error);
  }
  
  return false;
}

// Check if user is authenticated
async function checkAuthStatus() {
  try {
    const data = await browser.storage.local.get('user');
    
    if (!data.user || !data.user.token) {
      return false;
    }
    
    // Validate token
    const response = await fetch(`${API_BASE_URL}/validate-token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${data.user.token}`
      }
    });
    
    if (!response.ok) {
      // Token is invalid, clear user data
      await browser.storage.local.remove('user');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking auth status:', error);
    return false;
  }
}

// Show a notification when user reaches free tier limit
function showLimitNotification(limitInfo) {
  browser.notifications.create({
    type: 'basic',
    iconUrl: browser.runtime.getURL('icons/icon128.png'),
    title: 'JagJar Free Tier Limit Reached',
    message: `You've used ${limitInfo.used} hours of your ${limitInfo.limit} hour limit. Upgrade to premium for unlimited access.`
  });
}

// Update the browser action badge
function updateBadge() {
  if (isJagJarEnabledSite) {
    browser.browserAction.setBadgeText({ text: '✓' });
    browser.browserAction.setBadgeBackgroundColor({ color: '#059669' }); // Green
    browser.browserAction.setTitle({ title: 'JagJar: This site is enabled' });
  } else {
    browser.browserAction.setBadgeText({ text: '' });
    browser.browserAction.setTitle({ title: 'JagJar: Time Tracker' });
  }
}

// Handle messages from content scripts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'user-activity') {
    lastActiveTime = Date.now();
  } else if (message.type === 'check-jagjar-enabled') {
    if (sender.tab && sender.tab.url) {
      try {
        const url = new URL(sender.tab.url);
        const domain = url.hostname;
        
        // Check if this domain is JagJar-enabled
        checkIfJagJarEnabled(domain).then(enabled => {
          sendResponse({ isEnabled: enabled });
        });
        
        // Indicate we'll respond asynchronously
        return true;
      } catch (error) {
        console.error('Error parsing URL from content script:', error);
      }
    }
    
    // Default response
    sendResponse({ isEnabled: false });
  } else if (message.type === 'get-user-data') {
    browser.storage.local.get('user').then(data => {
      sendResponse({ user: data.user || null });
    });
    
    // Indicate we'll respond asynchronously
    return true;
  }
});