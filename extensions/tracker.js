/**
 * JagJar Website Tracker Script
 * 
 * This script tracks user engagement time and activities on JagJar-enabled websites.
 * It communicates with JagJar browser extensions and the JagJar API server.
 * 
 * Usage:
 * 
 * <script>
 *   (function() {
 *     window.JagJar = window.JagJar || {};
 *     window.JagJar.apiKey = 'YOUR_API_KEY';
 *     
 *     var s = document.createElement('script');
 *     s.type = 'text/javascript';
 *     s.async = true;
 *     s.src = 'https://cdn.jagjar.app/tracker.js';
 *     var x = document.getElementsByTagName('script')[0];
 *     x.parentNode.insertBefore(s, x);
 *   })();
 * </script>
 */

(function() {
  // Configuration
  const API_BASE_URL = 'https://jagjar.app/api';
  const VERSION = '1.0.0';
  const DEFAULT_CONFIG = {
    trackScrollDepth: true,
    trackClicks: true,
    trackForms: false,
    apiDomain: null,
    debug: false
  };
  
  // State
  let active = false;
  let timeActive = 0;
  let lastActiveTime = Date.now();
  let activityInterval = null;
  let syncInterval = null;
  let config = Object.assign({}, DEFAULT_CONFIG);
  let apiKey = '';
  let testMode = false;
  let userConsent = true; // Default to true, but sites may override based on their consent management
  
  // Initialize JagJar
  function init() {
    if (!window.JagJar) {
      window.JagJar = {};
    }
    
    // Get API key
    apiKey = window.JagJar.apiKey;
    
    if (!apiKey) {
      log('Error: No API key provided. JagJar will not track engagement.', true);
      return;
    }
    
    // Get test mode setting
    testMode = window.JagJar.testMode === true;
    
    // Merge config
    if (window.JagJar.config) {
      config = Object.assign({}, DEFAULT_CONFIG, window.JagJar.config);
    }
    
    // Set up API domain
    if (config.apiDomain) {
      API_BASE_URL = config.apiDomain;
    }
    
    // Expose public methods
    window.JagJar.trackEvent = trackEvent;
    window.JagJar.trackConversion = trackConversion;
    window.JagJar.pause = pause;
    window.JagJar.resume = resume;
    window.JagJar.setConsent = setConsent;
    
    // Validate API key
    validateApiKey().then(valid => {
      if (valid) {
        log(`Successfully initialized with API key: ${maskApiKey(apiKey)}`);
        startTracking();
      } else {
        log('Error: Invalid API key. JagJar will not track engagement.', true);
      }
    });
    
    // Add extension messaging
    setupExtensionMessaging();
  }
  
  // Start tracking user activity
  function startTracking() {
    active = true;
    
    // Set up activity tracking
    document.addEventListener('mousemove', onUserActivity);
    document.addEventListener('keydown', onUserActivity);
    document.addEventListener('scroll', onUserActivity);
    document.addEventListener('touchstart', onUserActivity);
    
    // Set up optional tracking
    if (config.trackClicks) {
      document.addEventListener('click', onUserClick);
    }
    
    if (config.trackScrollDepth) {
      window.addEventListener('scroll', onUserScroll);
    }
    
    if (config.trackForms) {
      document.addEventListener('submit', onFormSubmit);
    }
    
    // Start activity interval
    activityInterval = setInterval(checkActivity, 1000);
    
    // Sync data every 5 minutes
    syncInterval = setInterval(syncData, 5 * 60 * 1000);
    
    // Sync before unload
    window.addEventListener('beforeunload', onBeforeUnload);
    
    // Initial activity timestamp
    lastActiveTime = Date.now();
  }
  
  // Stop tracking
  function stopTracking() {
    active = false;
    
    // Remove event listeners
    document.removeEventListener('mousemove', onUserActivity);
    document.removeEventListener('keydown', onUserActivity);
    document.removeEventListener('scroll', onUserActivity);
    document.removeEventListener('touchstart', onUserActivity);
    
    if (config.trackClicks) {
      document.removeEventListener('click', onUserClick);
    }
    
    if (config.trackScrollDepth) {
      window.removeEventListener('scroll', onUserScroll);
    }
    
    if (config.trackForms) {
      document.removeEventListener('submit', onFormSubmit);
    }
    
    // Clear intervals
    if (activityInterval) {
      clearInterval(activityInterval);
      activityInterval = null;
    }
    
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
    
    // Remove unload handler
    window.removeEventListener('beforeunload', onBeforeUnload);
  }
  
  // Event handlers
  function onUserActivity() {
    if (!active || !userConsent) return;
    lastActiveTime = Date.now();
  }
  
  function onUserClick(event) {
    if (!active || !userConsent) return;
    
    // Track click on important elements
    if (event.target.tagName === 'BUTTON' || 
        event.target.tagName === 'A' || 
        event.target.closest('button') || 
        event.target.closest('a')) {
      
      trackEvent('click', {
        element: event.target.tagName.toLowerCase(),
        text: event.target.textContent?.trim() || '',
        path: event.target.id || getElementPath(event.target)
      });
    }
  }
  
  function onUserScroll() {
    if (!active || !userConsent) return;
    
    // Get scroll depth as percentage
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    const scrollPercentage = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
    
    // Track scroll milestones (25%, 50%, 75%, 100%)
    const milestones = [25, 50, 75, 100];
    
    for (const milestone of milestones) {
      if (scrollPercentage >= milestone && !window.JagJar.scrollMilestones?.[milestone]) {
        if (!window.JagJar.scrollMilestones) {
          window.JagJar.scrollMilestones = {};
        }
        
        window.JagJar.scrollMilestones[milestone] = true;
        trackEvent('scroll_depth', { depth: milestone });
      }
    }
  }
  
  function onFormSubmit(event) {
    if (!active || !userConsent) return;
    
    // Get form info
    const form = event.target;
    const formId = form.id || getElementPath(form);
    
    trackEvent('form_submit', { formId });
  }
  
  function onBeforeUnload() {
    if (active && userConsent) {
      syncData();
    }
  }
  
  // Check if user is still active
  function checkActivity() {
    if (!active || !userConsent) return;
    
    const now = Date.now();
    const inactiveTime = now - lastActiveTime;
    
    // Consider user inactive after 60 seconds
    if (inactiveTime < 60000) {
      timeActive += 1;
      
      // Notify extensions that this is a JagJar site
      if (timeActive % 5 === 0) {
        notifyExtension({
          type: 'jagjar_site',
          apiKey: apiKey
        });
      }
    }
  }
  
  // Sync data with the server
  function syncData() {
    if (!active || !userConsent || timeActive === 0) return;
    
    // Don't send data in test mode
    if (testMode) {
      log('Test mode: would send time data:', { timeActive, url: window.location.href });
      timeActive = 0;
      return;
    }
    
    // Send data to the server
    fetch(`${API_BASE_URL}/time`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-JagJar-Key': apiKey,
        'X-JagJar-Version': VERSION
      },
      body: JSON.stringify({
        time: timeActive,
        url: window.location.href,
        path: window.location.pathname,
        title: document.title,
        referrer: document.referrer
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      log('Time data sent successfully:', data);
      
      // Reset time counter
      timeActive = 0;
    })
    .catch(error => {
      log('Error sending time data:', error, true);
      
      // Keep the time data for next sync
    });
  }
  
  // Validate API key with the server
  async function validateApiKey() {
    try {
      // Don't validate in test mode
      if (testMode) {
        log('Test mode: Skipping API key validation');
        return true;
      }
      
      const response = await fetch(`${API_BASE_URL}/validate-key?key=${apiKey}`, {
        method: 'GET',
        headers: {
          'X-JagJar-Version': VERSION
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      const data = await response.json();
      return data.valid === true;
    } catch (error) {
      log('Error validating API key:', error, true);
      return false;
    }
  }
  
  // Track a custom event
  function trackEvent(eventName, eventData = {}) {
    if (!active || !userConsent) return;
    
    log('Tracking event:', { eventName, eventData });
    
    // Don't send events in test mode
    if (testMode) {
      return;
    }
    
    fetch(`${API_BASE_URL}/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-JagJar-Key': apiKey,
        'X-JagJar-Version': VERSION
      },
      body: JSON.stringify({
        event: eventName,
        data: eventData,
        url: window.location.href,
        path: window.location.pathname,
        title: document.title
      })
    })
    .catch(error => {
      log('Error sending event data:', error, true);
    });
  }
  
  // Track a conversion event
  function trackConversion(conversionType, conversionData = {}) {
    if (!active || !userConsent) return;
    
    log('Tracking conversion:', { conversionType, conversionData });
    
    // Don't send conversions in test mode
    if (testMode) {
      return;
    }
    
    fetch(`${API_BASE_URL}/conversion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-JagJar-Key': apiKey,
        'X-JagJar-Version': VERSION
      },
      body: JSON.stringify({
        type: conversionType,
        data: conversionData,
        url: window.location.href,
        path: window.location.pathname,
        title: document.title
      })
    })
    .catch(error => {
      log('Error sending conversion data:', error, true);
    });
  }
  
  // Pause tracking
  function pause() {
    active = false;
    log('Tracking paused');
  }
  
  // Resume tracking
  function resume() {
    active = true;
    lastActiveTime = Date.now();
    log('Tracking resumed');
  }
  
  // Set user consent
  function setConsent(hasConsent) {
    userConsent = !!hasConsent;
    log(`User consent set to: ${userConsent}`);
    
    if (userConsent && !active) {
      resume();
    } else if (!userConsent && active) {
      pause();
    }
  }
  
  // Communicate with browser extensions
  function setupExtensionMessaging() {
    window.addEventListener('message', event => {
      // Verify sender
      if (event.source !== window) return;
      
      // Check for JagJar messages
      if (event.data && event.data.type && event.data.type.startsWith('jagjar_')) {
        handleExtensionMessage(event.data);
      }
    });
  }
  
  // Handle messages from extensions
  function handleExtensionMessage(message) {
    switch (message.type) {
      case 'jagjar_ping':
        // Respond to ping with site info
        notifyExtension({
          type: 'jagjar_site_info',
          apiKey: apiKey,
          isTrackingActive: active && userConsent
        });
        break;
        
      case 'jagjar_pause':
        // Extension requested pause (e.g., user reached free tier limit)
        pause();
        break;
        
      case 'jagjar_resume':
        // Extension requested resume
        resume();
        break;
    }
  }
  
  // Send message to extension
  function notifyExtension(message) {
    window.postMessage({
      ...message,
      source: 'jagjar_tracker'
    }, window.location.origin);
  }
  
  // Utility functions
  function log(message, data, isError = false) {
    if (config.debug || isError) {
      const logMethod = isError ? console.error : console.log;
      logMethod(`[JagJar] ${message}`, data);
    }
  }
  
  function maskApiKey(key) {
    if (!key) return '';
    
    // Only show the first 8 and last 4 characters
    if (key.length <= 12) return key;
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
  }
  
  function getElementPath(element, maxDepth = 3) {
    let path = '';
    let depth = 0;
    let currentElement = element;
    
    while (currentElement && depth < maxDepth) {
      let identifier = currentElement.id ? `#${currentElement.id}` : currentElement.tagName.toLowerCase();
      
      if (currentElement.className && typeof currentElement.className === 'string') {
        const classes = currentElement.className.trim().split(/\s+/);
        if (classes.length > 0 && classes[0]) {
          identifier += `.${classes[0]}`;
        }
      }
      
      path = path ? `${identifier} > ${path}` : identifier;
      currentElement = currentElement.parentElement;
      depth++;
    }
    
    return path;
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();