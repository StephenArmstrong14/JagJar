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

// Safari-specific: Add browser polyfill support
const browser = (function() {
  return {
    tabs: {
      onActivated: {
        addListener: function(callback) {
          safari.application.addEventListener("activate", function(event) {
            if (event.target instanceof SafariBrowserTab) {
              callback({ tabId: event.target.id });
            }
          }, true);
        }
      },
      onUpdated: {
        addListener: function(callback) {
          safari.application.addEventListener("navigate", function(event) {
            if (event.target instanceof SafariBrowserTab) {
              callback(event.target.id, { status: "complete" }, { url: event.target.url });
            }
          }, true);
        }
      },
      get: function(tabId) {
        return new Promise((resolve) => {
          const tab = safari.application.browserWindows.some(function(window) {
            return window.tabs.some(function(tab) {
              if (tab.id === tabId) {
                resolve({ id: tab.id, url: tab.url });
                return true;
              }
              return false;
            });
          });
          if (!tab) {
            resolve(null);
          }
        });
      },
      sendMessage: function(tabId, message) {
        return new Promise((resolve, reject) => {
          try {
            safari.application.browserWindows.some(function(window) {
              return window.tabs.some(function(tab) {
                if (tab.id === tabId) {
                  tab.page.dispatchMessage("fromBackground", message);
                  resolve();
                  return true;
                }
                return false;
              });
            });
          } catch (error) {
            reject(error);
          }
        });
      }
    },
    runtime: {
      onMessage: {
        addListener: function(callback) {
          safari.application.addEventListener("message", function(event) {
            if (event.name === "fromContent") {
              const response = callback(event.message, { tab: { id: event.target.id, url: event.target.url } });
              if (response) {
                event.target.page.dispatchMessage("backgroundResponse", response);
              }
            }
          }, false);
        }
      },
      sendMessage: function(message) {
        return new Promise((resolve) => {
          // No direct equivalent in Safari
          setTimeout(() => resolve({ success: true }), 0);
        });
      }
    },
    storage: {
      local: {
        get: function(keys) {
          return new Promise((resolve) => {
            const result = {};
            if (typeof keys === "string") {
              result[keys] = localStorage.getItem(keys);
              if (result[keys]) {
                try {
                  result[keys] = JSON.parse(result[keys]);
                } catch (e) {} // Keep as string if not JSON
              }
            } else if (Array.isArray(keys)) {
              keys.forEach(key => {
                result[key] = localStorage.getItem(key);
                if (result[key]) {
                  try {
                    result[key] = JSON.parse(result[key]);
                  } catch (e) {} // Keep as string if not JSON
                }
              });
            } else if (typeof keys === "object") {
              Object.keys(keys).forEach(key => {
                const value = localStorage.getItem(key);
                result[key] = value !== null ? value : keys[key];
                if (result[key]) {
                  try {
                    result[key] = JSON.parse(result[key]);
                  } catch (e) {} // Keep as string if not JSON
                }
              });
            } else {
              // Get all storage
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                result[key] = localStorage.getItem(key);
                if (result[key]) {
                  try {
                    result[key] = JSON.parse(result[key]);
                  } catch (e) {} // Keep as string if not JSON
                }
              }
            }
            resolve(result);
          });
        },
        set: function(items) {
          return new Promise((resolve) => {
            Object.keys(items).forEach(key => {
              const value = items[key];
              localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value);
            });
            resolve();
          });
        },
        remove: function(keys) {
          return new Promise((resolve) => {
            if (typeof keys === "string") {
              localStorage.removeItem(keys);
            } else if (Array.isArray(keys)) {
              keys.forEach(key => localStorage.removeItem(key));
            }
            resolve();
          });
        }
      }
    },
    notifications: {
      create: function(options) {
        // Safari doesn't support notifications in the same way
        // Using native notification API instead
        if (Notification.permission === "granted") {
          new Notification(options.title, {
            body: options.message,
            icon: options.iconUrl
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then(permission => {
            if (permission === "granted") {
              new Notification(options.title, {
                body: options.message,
                icon: options.iconUrl
              });
            }
          });
        }
      }
    },
    browserAction: {
      setBadgeText: function(details) {
        // No direct equivalent in Safari
        // Could use custom UI modifications in popup.html
      },
      setBadgeBackgroundColor: function(details) {
        // No direct equivalent in Safari
      },
      setTitle: function(details) {
        // No direct equivalent in Safari
      }
    }
  };
})();

// Initialize
function initialize() {
  console.log('JagJar extension initialized');
  
  // Set up periodic sync (Safari doesn't have alarms API)
  setInterval(syncTimeData, SYNC_INTERVAL_MINUTES * 60 * 1000);
  
  // Check user auth status
  checkAuthStatus();
}

// Call initialize when the extension loads
initialize();

// Set up listeners
browser.tabs.onActivated.addListener(activeInfo => {
  handleTabActivated(activeInfo.tabId);
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tabId === activeTabId) {
    handleTabUpdated(tab);
  }
});

// Tab activation handler
async function handleTabActivated(tabId) {
  try {
    // Record end time for previous tab
    if (activeTabId && activeTabStartTime && activeTabUrl) {
      const domain = extractDomain(activeTabUrl);
      
      if (domain && isJagJarEnabledSite[domain]) {
        // Calculate time spent on previous tab
        const timeSpentSeconds = Math.floor((Date.now() - activeTabStartTime) / 1000);
        
        if (timeSpentSeconds > 0) {
          cumulativeTimeSpent[domain] = (cumulativeTimeSpent[domain] || 0) + timeSpentSeconds;
        }
      }
    }
    
    // Get new active tab
    const tab = await browser.tabs.get(tabId);
    
    // Skip if tab is undefined or has no URL (e.g., new tab page)
    if (!tab || !tab.url || tab.url.startsWith('safari-extension://')) {
      activeTabId = null;
      activeTabUrl = null;
      activeTabStartTime = null;
      return;
    }
    
    // Update active tab info
    activeTabId = tabId;
    activeTabUrl = tab.url;
    activeTabStartTime = Date.now();
    lastActivityTime = Date.now();
    
    // Extract domain from URL
    const domain = extractDomain(tab.url);
    
    if (domain) {
      // Check if domain is already known
      if (isJagJarEnabledSite[domain] === undefined) {
        // Check if this is a JagJar-enabled site
        checkIfJagJarEnabled(domain).then(isEnabled => {
          isJagJarEnabledSite[domain] = isEnabled;
        });
      }
    }
  } catch (error) {
    console.error('Error handling tab activation:', error);
  }
}

// Tab update handler
function handleTabUpdated(tab) {
  if (!tab || !tab.url) return;
  
  // Skip extension pages
  if (tab.url.startsWith('safari-extension://')) {
    return;
  }
  
  // Update active tab info
  activeTabUrl = tab.url;
  
  // Extract domain from URL
  const domain = extractDomain(tab.url);
  
  if (domain) {
    // Check if domain is already known
    if (isJagJarEnabledSite[domain] === undefined) {
      // Check if this is a JagJar-enabled site
      checkIfJagJarEnabled(domain).then(isEnabled => {
        isJagJarEnabledSite[domain] = isEnabled;
      });
    }
  }
  
  // Reset activity timer
  lastActivityTime = Date.now();
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
    user = null;
  }
}

// Sync time data with the server
async function syncTimeData() {
  // Only sync if there's data to sync and the user is logged in
  if (Object.keys(cumulativeTimeSpent).length === 0 || !user) return;
  
  const dataToSync = [];
  const now = Date.now();
  
  // Prepare data to sync
  for (const domain in cumulativeTimeSpent) {
    if (cumulativeTimeSpent[domain] > 0) {
      dataToSync.push({
        domain,
        seconds: cumulativeTimeSpent[domain],
        timestamp: now
      });
      
      // Reset the counter
      cumulativeTimeSpent[domain] = 0;
    }
  }
  
  if (dataToSync.length === 0) return;
  
  try {
    // Send data to the server
    const response = await fetch(`${API_BASE_URL}/time-tracking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify({
        timeData: dataToSync
      })
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Time data synced successfully', data);
    
    // Check if user has hit their limit
    if (data.status === 'limited') {
      showLimitNotification(data.limitInfo);
    }
  } catch (error) {
    console.error('Failed to sync time data:', error);
    
    // Keep the data for next sync attempt
    for (const record of dataToSync) {
      cumulativeTimeSpent[record.domain] = (cumulativeTimeSpent[record.domain] || 0) + record.seconds;
    }
  }
}

// Show a notification when the user reaches their free tier limit
function showLimitNotification(limitInfo) {
  browser.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'JagJar Free Tier Limit Reached',
    message: `You've used ${limitInfo.used} hours of your ${limitInfo.limit} hour limit. Upgrade to premium for unlimited access.`
  });
}

// Extract domain from URL
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    console.error('Error extracting domain:', error);
    return null;
  }
}

// Handle messages from content scripts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'user-activity') {
    // Update last activity time
    lastActivityTime = Date.now();
  } else if (message.type === 'check-jagjar-enabled') {
    // Check if the current site is JagJar-enabled
    const domain = extractDomain(sender.tab?.url || '');
    
    if (domain) {
      if (isJagJarEnabledSite[domain] !== undefined) {
        // We already know the status
        sendResponse({ isEnabled: isJagJarEnabledSite[domain] });
      } else {
        // Need to check the status
        checkIfJagJarEnabled(domain).then(isEnabled => {
          isJagJarEnabledSite[domain] = isEnabled;
          sendResponse({ isEnabled });
        });
        
        // Need to return true to indicate we'll respond asynchronously
        return true;
      }
    } else {
      sendResponse({ isEnabled: false });
    }
  } else if (message.type === 'get-user-data') {
    // Send the user data back to the content script
    sendResponse({ user });
  }
});