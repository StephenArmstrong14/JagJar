// Configuration
const API_BASE_URL = 'https://jagjar.app/api'; // Update to the actual domain
const LIMIT_HOURS = 8; // Free tier limit in hours
const LOCAL_DEV_MODE = true; // Set to true to avoid unnecessary API calls during development
const DEBUG = true; // Enable debug logging

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

// Helper function for logging
function log(...args) {
  if (DEBUG) {
    console.log('[JagJar Popup]', ...args);
  }
}

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
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
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
    log('Checking authentication status...');
    const data = await chrome.storage.local.get('user');
    
    if (data.user) {
      user = data.user;
      log('Found stored user data:', user.username);
      
      if (LOCAL_DEV_MODE) {
        log('DEV MODE: Skipping token validation');
        return;
      }
      
      // Verify the token is still valid by fetching user data from the server
      try {
        log('Validating user token...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(`${API_BASE_URL}/user`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user.token}`
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          log('Token validation failed, status:', response.status);
          // Token is invalid, clear user data
          user = null;
          await chrome.storage.local.remove('user');
        } else {
          log('Token successfully validated');
          // Update user data with latest from server
          const userData = await response.json();
          user = { ...user, ...userData };
          await chrome.storage.local.set({ user });
          log('User data updated with latest from server');
        }
      } catch (error) {
        // Only log the error but don't clear the user data if it's just a network issue
        if (error.name === 'AbortError') {
          log('Token validation request timed out');
        } else if (error.message && error.message.includes('Failed to fetch')) {
          log('Network error during token validation (API possibly unreachable)');
        } else {
          log('Error validating token:', error.message || error);
        }
        
        // Don't invalidate the user session for network errors
        // They might be offline, and we don't want to log them out unnecessarily
      }
    } else {
      log('No stored user data found');
    }
  } catch (error) {
    log('Error accessing storage for auth status:', error.message || error);
    user = null;
  }
}

// Load user's time tracking data
async function loadUserData() {
  if (!user) {
    log('No user data available, skipping loadUserData');
    return;
  }
  
  log('Loading user data for', user.username);
  
  try {
    // First update UI with basic user info that doesn't require API calls
    updateUIWithUserInfo();
    
    if (LOCAL_DEV_MODE) {
      log('DEV MODE: Using mock time tracking data');
      loadMockTimeTrackingData();
      return;
    }
    
    // Fetch time tracking data from the server
    log('Fetching time tracking data from server');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${API_BASE_URL}/time-tracking/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        log('Time tracking data fetched successfully');
        const timeData = await response.json();
        updateTimeTrackingUI(timeData);
      } else {
        log('Error fetching time tracking data, status:', response.status);
        // If we can't get the real data, use default values
        updateTimeTrackingUI({
          today: 0,
          month: 0
        });
      }
    } catch (error) {
      // Handle specific error types
      if (error.name === 'AbortError') {
        log('Time tracking data request timed out');
      } else if (error.message && error.message.includes('Failed to fetch')) {
        log('Network error fetching time tracking data (API possibly unreachable)');
      } else {
        log('Error loading time tracking data:', error.message || error);
      }
      
      // If we can't get the real data, use default values
      updateTimeTrackingUI({
        today: 0,
        month: 0
      });
    }
  } catch (error) {
    log('Error in loadUserData:', error.message || error);
    // Don't rethrow - we've handled the error and updated the UI as best we can
  }
  
  // Helper function to update UI with user info
  function updateUIWithUserInfo() {
    try {
      // Make sure all elements exist before trying to update them
      if (!elements.userName || !elements.limitTotal) {
        log('Warning: Some UI elements are not found in the DOM');
        return;
      }
      
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
      
      log('User info UI updated successfully');
    } catch (uiError) {
      log('Error updating user info UI:', uiError.message || uiError);
    }
  }
  
  // Helper function to update time tracking UI
  function updateTimeTrackingUI(timeData) {
    try {
      // Make sure all elements exist before trying to update them
      if (!elements.todayTime || !elements.monthTime) {
        log('Warning: Some time tracking UI elements are not found in the DOM');
        return;
      }
      
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
      if (user.subscriptionType !== 'premium' && elements.limitUsage && elements.progressFill) {
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
      
      log('Time tracking UI updated successfully');
    } catch (uiError) {
      log('Error updating time tracking UI:', uiError.message || uiError);
    }
  }
  
  // Helper function to use mock data in development mode
  function loadMockTimeTrackingData() {
    // Generate some random data for testing
    const mockTimeData = {
      today: Math.floor(Math.random() * 7200), // 0-2 hours in seconds
      month: Math.floor(Math.random() * 25200)  // 0-7 hours in seconds
    };
    
    log('Using mock time data:', mockTimeData);
    updateTimeTrackingUI(mockTimeData);
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
  
  log('Attempting login for user:', username);
  showView('loading');
  
  if (LOCAL_DEV_MODE) {
    log('DEV MODE: Simulating successful login');
    
    // Create a mock user for testing
    user = {
      id: 1,
      username: username,
      token: 'mock_token_for_testing',
      subscriptionType: Math.random() > 0.5 ? 'premium' : 'free',
      email: `${username}@example.com`
    };
    
    // Save mock user data to chrome storage
    try {
      await chrome.storage.local.set({ user });
      log('DEV MODE: Mock user saved to storage');
      
      await loadUserData();
      showView('loggedIn');
    } catch (storageError) {
      log('DEV MODE: Error saving mock user to storage:', storageError);
      showError('Error storing user data');
      showView('loggedOut');
    }
    
    return;
  }
  
  try {
    log('Sending login request to server');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const userData = await response.json();
      log('Login successful, received user data');
      user = userData;
      
      // Save user data to chrome storage
      try {
        await chrome.storage.local.set({ user });
        log('User data saved to storage');
        
        await loadUserData();
        showView('loggedIn');
      } catch (storageError) {
        log('Error saving user to storage:', storageError);
        showError('Login successful, but error storing user data');
        showView('loggedOut');
      }
    } else {
      let errorMessage = 'Invalid username or password';
      
      try {
        const data = await response.json();
        errorMessage = data.message || errorMessage;
      } catch (parseError) {
        log('Error parsing error response:', parseError);
      }
      
      log('Login failed:', errorMessage);
      showError(errorMessage);
      showView('loggedOut');
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      log('Login request timed out');
      showError('Login request timed out. Please try again.');
    } else if (error.message && error.message.includes('Failed to fetch')) {
      log('Network error during login (API unreachable)');
      showError('Cannot connect to the server. Please check your internet connection.');
    } else {
      log('Error during login:', error.message || error);
      showError('Failed to connect to the server');
    }
    
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
    
    // Clear user data from chrome storage
    await chrome.storage.local.remove('user');
    user = null;
    
    showView('loggedOut');
  } catch (error) {
    console.error('Error during logout:', error);
    showError('Failed to logout. Please try again.');
  }
}

// Utility functions
async function checkIfJagJarEnabled(domain) {
  // In development mode, use a hardcoded list of domains for testing
  if (LOCAL_DEV_MODE) {
    log('DEV MODE: Checking if domain is JagJar-enabled:', domain);
    
    // For testing purposes, consider these domains as JagJar-enabled
    const testEnabledDomains = [
      'example.com',
      'jagjar.app',
      'replit.com',
      'localhost'
    ];
    
    // Local testing - any domain with "test" in it is JagJar-enabled
    if (domain.includes('test') || testEnabledDomains.includes(domain)) {
      log('DEV MODE: Domain is JagJar-enabled:', domain);
      return true;
    }
    
    return false;
  }
  
  // Production mode - actually check with the API
  try {
    log('Checking if domain is JagJar-enabled:', domain);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${API_BASE_URL}/check-site?domain=${encodeURIComponent(domain)}`, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      const isEnabled = data.enabled === true;
      log(`Domain ${domain} JagJar-enabled status:`, isEnabled);
      return isEnabled;
    } else {
      log(`API returned error for domain ${domain}:`, response.status, response.statusText);
      return false;
    }
  } catch (error) {
    // More specific error handling
    if (error.name === 'AbortError') {
      log('Request timed out checking if site is JagJar enabled:', domain);
    } else if (error.message && error.message.includes('Failed to fetch')) {
      log('Network error checking if site is JagJar enabled (API possibly unreachable)');
    } else {
      log('Error checking if site is JagJar enabled:', error.message || error);
    }
    
    // Check if domain is the jagjar.app domain itself
    if (domain.includes('jagjar.app')) {
      return true; // Always consider the JagJar app itself as enabled
    }
  }
  
  // Default to false if there's an error
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
  chrome.tabs.create({ url: 'https://jagjar.app/auth' });
});

elements.forgotPasswordLink.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://jagjar.app/reset-password' });
});

elements.viewDashboardBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://jagjar.app/dashboard' });
});

elements.upgradeBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://jagjar.app/pricing' });
});

elements.logoutBtn.addEventListener('click', handleLogout);

elements.retryBtn.addEventListener('click', initializePopup);