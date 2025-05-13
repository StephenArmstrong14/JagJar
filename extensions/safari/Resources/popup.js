// Configuration
const API_BASE_URL = 'https://jagjar.app/api'; // Update to the actual domain
const LIMIT_HOURS = 8; // Free tier limit in hours

// Safari-specific browser polyfill
const browser = {
  tabs: {
    query: function(queryInfo) {
      return new Promise((resolve) => {
        const activeTab = safari.application.activeBrowserWindow.activeTab;
        resolve([{ 
          id: activeTab.id,
          url: activeTab.url,
          title: activeTab.title,
          active: true,
          windowId: safari.application.activeBrowserWindow.id
        }]);
      });
    },
    create: function(createProperties) {
      return new Promise((resolve) => {
        const newTab = safari.application.activeBrowserWindow.openTab();
        newTab.url = createProperties.url;
        resolve({ id: newTab.id });
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
  runtime: {
    sendMessage: function(message) {
      return new Promise((resolve) => {
        const messageId = `msg_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        message.messageId = messageId;
        
        // Create a one-time event listener for this specific message
        const responseHandler = function(event) {
          if (event.name === "backgroundResponse" && event.message.messageId === messageId) {
            safari.application.removeEventListener("message", responseHandler, false);
            resolve(event.message.response);
          }
        };
        
        safari.application.addEventListener("message", responseHandler, false);
        
        // Send the message to the background script
        safari.extension.dispatchMessage("fromPopup", message);
        
        // Add a timeout to clean up the listener if no response
        setTimeout(() => {
          safari.application.removeEventListener("message", responseHandler, false);
          resolve(null);
        }, 5000);
      });
    }
  }
};

// DOM Elements
const views = {
  loggedOut: document.getElementById('logged-out-view'),
  loggedIn: document.getElementById('logged-in-view'),
  loading: document.getElementById('loading-view'),
  error: document.getElementById('error-view')
};

const elements = {
  loginForm: document.getElementById('login-form'),
  createAccountLink: document.getElementById('create-account-link'),
  forgotPasswordLink: document.getElementById('forgot-password-link'),
  userName: document.getElementById('user-name'),
  subscriptionStatus: document.getElementById('subscription-status'),
  todayTime: document.getElementById('today-time'),
  monthTime: document.getElementById('month-time'),
  limitUsage: document.getElementById('limit-usage'),
  limitTotal: document.getElementById('limit-total'),
  progressFill: document.getElementById('progress-fill'),
  freeTierProgress: document.getElementById('free-tier-progress'),
  premiumBadge: document.getElementById('premium-badge'),
  currentSiteStatus: document.getElementById('current-site-status'),
  viewDashboardBtn: document.getElementById('view-dashboard-btn'),
  upgradeBtn: document.getElementById('upgrade-btn'),
  logoutBtn: document.getElementById('logout-btn'),
  errorMessage: document.getElementById('error-message'),
  retryBtn: document.getElementById('retry-btn')
};

// State
let user = null;
let currentTabUrl = null;
let isJagJarEnabledSite = false;

// Show the appropriate view
function showView(viewName) {
  Object.values(views).forEach(view => {
    view.classList.add('hidden');
  });
  
  views[viewName].classList.remove('hidden');
}

// Initialize the popup
async function initializePopup() {
  showView('loading');
  
  try {
    // Get the active tab
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    currentTabUrl = activeTab.url;
    
    // Check if the current site is JagJar-enabled
    if (currentTabUrl) {
      try {
        const domain = new URL(currentTabUrl).hostname;
        isJagJarEnabledSite = await checkIfJagJarEnabled(domain);
        elements.currentSiteStatus.textContent = isJagJarEnabledSite 
          ? 'JagJar Enabled ✓' 
          : 'Not a JagJar site';
        
        if (isJagJarEnabledSite) {
          elements.currentSiteStatus.style.color = '#059669'; // Green color
        }
      } catch (error) {
        console.error('Error checking if site is JagJar enabled:', error);
      }
    }
    
    // Check user auth status
    await checkAuthStatus();
    
    if (user) {
      await loadUserData();
      showView('loggedIn');
    } else {
      showView('loggedOut');
    }
  } catch (error) {
    console.error('Error initializing popup:', error);
    elements.errorMessage.textContent = 'Failed to initialize. Please try again.';
    showView('error');
  }
}

// Check if the user is logged in
async function checkAuthStatus() {
  try {
    const data = await browser.storage.local.get('user');
    if (data.user) {
      user = data.user;
      
      // Verify the token is still valid by fetching user data from the server
      try {
        const response = await fetch(`${API_BASE_URL}/user`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        
        if (!response.ok) {
          // Token is invalid, clear user data
          user = null;
          await browser.storage.local.remove('user');
        } else {
          // Update user data with latest from server
          const userData = await response.json();
          user = { ...user, ...userData };
          await browser.storage.local.set({ user });
        }
      } catch (error) {
        console.error('Error validating token:', error);
      }
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
    user = null;
  }
}

// Load user's time tracking data
async function loadUserData() {
  if (!user) return;
  
  try {
    // Update UI with user info
    elements.userName.textContent = user.username;
    elements.limitTotal.textContent = LIMIT_HOURS;
    
    if (user.subscriptionType === 'premium') {
      elements.subscriptionStatus.textContent = 'Premium Subscription';
      elements.subscriptionStatus.style.color = '#059669'; // Green color
      elements.freeTierProgress.classList.add('hidden');
      elements.premiumBadge.classList.remove('hidden');
      elements.upgradeBtn.textContent = 'Manage Subscription';
    } else {
      elements.subscriptionStatus.textContent = 'Free Tier';
      elements.freeTierProgress.classList.remove('hidden');
      elements.premiumBadge.classList.add('hidden');
      elements.upgradeBtn.textContent = 'Upgrade to Premium';
    }
    
    // Fetch time tracking data
    const response = await fetch(`${API_BASE_URL}/time-tracking/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    });
    
    if (response.ok) {
      const timeData = await response.json();
      
      // Update today's time
      const todaySeconds = timeData.today || 0;
      const todayHours = Math.floor(todaySeconds / 3600);
      const todayMinutes = Math.floor((todaySeconds % 3600) / 60);
      elements.todayTime.textContent = `${todayHours}h ${todayMinutes}m`;
      
      // Update month's time
      const monthSeconds = timeData.month || 0;
      const monthHours = Math.floor(monthSeconds / 3600);
      const monthMinutes = Math.floor((monthSeconds % 3600) / 60);
      elements.monthTime.textContent = `${monthHours}h ${monthMinutes}m`;
      
      // Update progress bar for free tier users
      if (user.subscriptionType !== 'premium') {
        const limitSeconds = LIMIT_HOURS * 3600;
        const usagePercentage = Math.min(100, (monthSeconds / limitSeconds) * 100);
        elements.limitUsage.textContent = monthHours;
        elements.progressFill.style.width = `${usagePercentage}%`;
        
        // Change color based on usage
        if (usagePercentage > 90) {
          elements.progressFill.style.backgroundColor = '#ef4444'; // Red
        } else if (usagePercentage > 75) {
          elements.progressFill.style.backgroundColor = '#f59e0b'; // Amber
        }
      }
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

// Login handler
async function handleLogin(event) {
  event.preventDefault();
  
  const username = event.target.username.value.trim();
  const password = event.target.password.value;
  
  if (!username || !password) {
    showError('Please enter both username and password');
    return;
  }
  
  showView('loading');
  
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    if (response.ok) {
      const userData = await response.json();
      user = userData;
      
      // Save user data to browser storage
      await browser.storage.local.set({ user });
      
      await loadUserData();
      showView('loggedIn');
    } else {
      const data = await response.json();
      showError(data.message || 'Invalid username or password');
      showView('loggedOut');
    }
  } catch (error) {
    console.error('Error during login:', error);
    showError('Failed to connect to the server');
    showView('loggedOut');
  }
}

// Logout handler
async function handleLogout() {
  showView('loading');
  
  try {
    // Call the logout API
    await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    });
    
    // Clear user data from browser storage
    await browser.storage.local.remove('user');
    user = null;
    
    showView('loggedOut');
  } catch (error) {
    console.error('Error during logout:', error);
    showError('Failed to logout. Please try again.');
  }
}

// Utility functions
async function checkIfJagJarEnabled(domain) {
  try {
    const response = await fetch(`${API_BASE_URL}/check-site?domain=${encodeURIComponent(domain)}`, {
      method: 'GET'
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.enabled === true;
    }
  } catch (error) {
    console.error('Error checking if site is JagJar enabled:', error);
  }
  
  return false;
}

function showError(message) {
  elements.errorMessage.textContent = message;
  showView('error');
}

// Event listeners
document.addEventListener('DOMContentLoaded', initializePopup);

elements.loginForm.addEventListener('submit', handleLogin);

elements.createAccountLink.addEventListener('click', () => {
  browser.tabs.create({ url: 'https://jagjar.app/auth' });
});

elements.forgotPasswordLink.addEventListener('click', () => {
  browser.tabs.create({ url: 'https://jagjar.app/reset-password' });
});

elements.viewDashboardBtn.addEventListener('click', () => {
  browser.tabs.create({ url: 'https://jagjar.app/dashboard' });
});

elements.upgradeBtn.addEventListener('click', () => {
  browser.tabs.create({ url: 'https://jagjar.app/pricing' });
});

elements.logoutBtn.addEventListener('click', handleLogout);

elements.retryBtn.addEventListener('click', initializePopup);