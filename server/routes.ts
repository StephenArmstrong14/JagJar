import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { createApiKey, generateApiKeyString } from "./utils";
import { z } from "zod";
import { 
  insertApiKeySchema, 
  insertWebsiteSchema, 
  insertTimeTrackingSchema,
  websites
} from "@shared/schema";
import { db } from "./db";
import * as revenueController from "./controllers/revenueController";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // API Keys
  app.get("/api/keys", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = req.user?.id;
      // Get the developer record for this user
      const developer = await storage.getDeveloperByUserId(userId!);
      
      if (!developer) {
        // If user doesn't have a developer record yet, create one
        const newDeveloper = await storage.createDeveloper({
          userId: userId!,
          companyName: "",
          website: ""
        });
        
        // Return empty array since new developer doesn't have keys yet
        return res.json([]);
      }
      
      // Get API keys for this developer
      const apiKeys = await storage.getApiKeysByDeveloperId(developer.id);
      res.json(apiKeys);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve API keys" });
    }
  });

  app.post("/api/keys", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = req.user?.id;
      
      // Validate request body
      console.log("API key request body:", req.body);
      // Only validate the name field from the insert schema
      const validatedData = { name: req.body.name };
      
      // Get or create developer record
      let developer = await storage.getDeveloperByUserId(userId!);
      
      if (!developer) {
        developer = await storage.createDeveloper({
          userId: userId!,
          companyName: req.body.companyName || "",
          website: req.body.website || ""
        });
      }
      
      // Generate a unique API key
      const apiKeyString = generateApiKeyString();
      
      // Create API key
      const apiKey = await storage.createApiKey({
        developerId: developer.id,
        name: validatedData.name,
        key: apiKeyString
      });
      
      // Only create a website record if there's a valid URL
      if (req.body.website && typeof req.body.website === 'string' && req.body.website.trim() !== '') {
        try {
          // Ensure the URL is valid
          const validUrl = req.body.website.startsWith('http://') || req.body.website.startsWith('https://') 
            ? req.body.website 
            : `https://${req.body.website}`;
          
          console.log("Creating website with URL:", validUrl);
          await storage.createWebsite({
            apiKeyId: apiKey.id,
            url: validUrl,
            name: validatedData.name
          });
          console.log("Website created successfully");
        } catch (error) {
          console.error("Error creating website record:", error);
          // Continue without throwing an error - we already have the API key
        }
      }
      
      res.status(201).json(apiKey);
    } catch (error) {
      console.error("API Key creation error:", error);
      res.status(400).json({ 
        message: "Failed to create API key", 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  });

  app.delete("/api/keys/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = req.user?.id;
      const keyId = parseInt(req.params.id);
      
      // Get developer record
      const developer = await storage.getDeveloperByUserId(userId!);
      
      if (!developer) {
        return res.status(404).json({ message: "Developer not found" });
      }
      
      // Get the API key
      const apiKey = await storage.getApiKey(keyId);
      
      // Check if API key exists and belongs to this developer
      if (!apiKey || apiKey.developerId !== developer.id) {
        return res.status(404).json({ message: "API key not found" });
      }
      
      // Delete the API key
      await storage.deleteApiKey(keyId);
      
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete API key" });
    }
  });

  // Time tracking
  app.post("/api/tracking", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = req.user?.id;
      
      // Validate request body
      const validatedData = insertTimeTrackingSchema.parse({
        ...req.body,
        userId: userId
      });
      
      // Create time tracking record
      const timeTracking = await storage.createTimeTracking(validatedData);
      
      res.status(201).json(timeTracking);
    } catch (error) {
      res.status(400).json({ message: "Failed to create time tracking record", error: String(error) });
    }
  });

  // Analytics
  app.get("/api/analytics/overview", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = req.user?.id;
      
      // Get developer record
      const developer = await storage.getDeveloperByUserId(userId!);
      
      if (!developer) {
        return res.status(404).json({ message: "Developer not found" });
      }
      
      // Get API keys for this developer
      const apiKeys = await storage.getApiKeysByDeveloperId(developer.id);
      
      if (!apiKeys || apiKeys.length === 0) {
        // Return empty analytics if developer has no API keys
        return res.json({
          totalTime: 0,
          activeUsers: 0,
          estimatedEarnings: 0,
          timeData: []
        });
      }
      
      // Get all websites associated with this developer's API keys
      const apiKeyIds = apiKeys.map(key => key.id);
      let websites = [];
      
      for (const apiKeyId of apiKeyIds) {
        const websitesForKey = await storage.getWebsitesByApiKeyId(apiKeyId);
        websites = websites.concat(websitesForKey);
      }
      
      if (websites.length === 0) {
        // Return empty analytics if developer has no websites
        return res.json({
          totalTime: 0,
          activeUsers: 0,
          estimatedEarnings: 0,
          timeData: []
        });
      }
      
      // Get all time tracking data for the websites
      const websiteIds = websites.map(website => website.id);
      let totalTimeSeconds = 0;
      let uniqueUserIds = new Set();
      const timeDataByDate = new Map();
      
      for (const websiteId of websiteIds) {
        const timeTrackingData = await storage.getTimeTrackingByWebsiteId(websiteId);
        
        // Calculate total time
        for (const record of timeTrackingData) {
          totalTimeSeconds += record.duration;
          uniqueUserIds.add(record.userId);
          
          // Format the date for display (e.g., "Mar 26")
          const date = new Date(record.date);
          const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
          
          // Accumulate hours by date
          const hoursForRecord = Math.round(record.duration / 3600);
          if (timeDataByDate.has(formattedDate)) {
            timeDataByDate.set(formattedDate, timeDataByDate.get(formattedDate) + hoursForRecord);
          } else {
            timeDataByDate.set(formattedDate, hoursForRecord);
          }
        }
      }
      
      // Get earnings data
      const earningsData = await storage.getRevenueByDeveloperId(developer.id);
      let estimatedEarnings = 0;
      
      if (earningsData && earningsData.length > 0) {
        // Sum up all earnings
        estimatedEarnings = earningsData.reduce((total, record) => total + record.amount, 0) / 100;
      }
      
      // Convert timeDataByDate map to array for chart
      const timeData = Array.from(timeDataByDate).map(([date, hours]) => ({
        date,
        hours
      }));
      
      // Sort timeData chronologically
      timeData.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
      
      const analyticsData = {
        totalTime: totalTimeSeconds,
        activeUsers: uniqueUserIds.size,
        estimatedEarnings: estimatedEarnings,
        timeData: timeData
      };
      
      res.json(analyticsData);
    } catch (error) {
      console.error("Analytics overview error:", error);
      res.status(500).json({ message: "Failed to retrieve analytics overview" });
    }
  });

  app.get("/api/analytics/time-distribution", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = req.user?.id;
      
      // Get developer record
      const developer = await storage.getDeveloperByUserId(userId!);
      
      if (!developer) {
        return res.status(404).json({ message: "Developer not found" });
      }
      
      // Get API keys for this developer
      const apiKeys = await storage.getApiKeysByDeveloperId(developer.id);
      
      if (!apiKeys || apiKeys.length === 0) {
        return res.json([]);
      }
      
      // Get all websites associated with this developer's API keys
      const apiKeyIds = apiKeys.map(key => key.id);
      let websites = [];
      
      for (const apiKeyId of apiKeyIds) {
        const websitesForKey = await storage.getWebsitesByApiKeyId(apiKeyId);
        websites = websites.concat(websitesForKey);
      }
      
      if (websites.length === 0) {
        return res.json([]);
      }
      
      // Get time distribution by website
      const distributionData = [];
      const websiteIds = websites.map(website => website.id);
      const websiteNameMap = new Map(websites.map(website => [website.id, website.name]));
      
      let totalTime = 0;
      
      // First, calculate total time across all websites
      for (const websiteId of websiteIds) {
        const timeTrackingData = await storage.getTimeTrackingByWebsiteId(websiteId);
        for (const record of timeTrackingData) {
          totalTime += record.duration;
        }
      }
      
      // If there's no time tracked, return empty array
      if (totalTime === 0) {
        return res.json([]);
      }
      
      // Get time for each website and calculate percentage
      for (const websiteId of websiteIds) {
        const timeTrackingData = await storage.getTimeTrackingByWebsiteId(websiteId);
        
        if (timeTrackingData.length > 0) {
          const websiteTime = timeTrackingData.reduce((sum, record) => sum + record.duration, 0);
          const percentage = Math.round((websiteTime / totalTime) * 100);
          
          if (percentage > 0) {
            distributionData.push({
              name: websiteNameMap.get(websiteId) || `Website ${websiteId}`,
              value: percentage
            });
          }
        }
      }
      
      // If we have too many websites with small percentages, combine them into "Other"
      if (distributionData.length > 5) {
        // Sort by value (highest first)
        distributionData.sort((a, b) => b.value - a.value);
        
        // Take top 4 websites
        const topSites = distributionData.slice(0, 4);
        
        // Combine the rest into "Other"
        const otherSites = distributionData.slice(4);
        const otherValue = otherSites.reduce((sum, site) => sum + site.value, 0);
        
        // Return top 4 + "Other"
        const result = [...topSites];
        if (otherValue > 0) {
          result.push({ name: 'Other', value: otherValue });
        }
        
        res.json(result);
      } else {
        res.json(distributionData);
      }
    } catch (error) {
      console.error("Time distribution error:", error);
      res.status(500).json({ message: "Failed to retrieve time distribution data" });
    }
  });

  app.get("/api/analytics/user-growth", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = req.user?.id;
      
      // Get developer record
      const developer = await storage.getDeveloperByUserId(userId!);
      
      if (!developer) {
        return res.status(404).json({ message: "Developer not found" });
      }
      
      // Get all API keys for this developer
      const apiKeys = await storage.getApiKeysByDeveloperId(developer.id);
      
      if (!apiKeys || apiKeys.length === 0) {
        return res.json([]);
      }
      
      // Get all websites associated with this developer's API keys
      const apiKeyIds = apiKeys.map(key => key.id);
      let websites = [];
      
      for (const apiKeyId of apiKeyIds) {
        const websitesForKey = await storage.getWebsitesByApiKeyId(apiKeyId);
        websites = websites.concat(websitesForKey);
      }
      
      if (websites.length === 0) {
        return res.json([]);
      }
      
      // Get all time tracking data for the websites
      const websiteIds = websites.map(website => website.id);
      
      // Create a map to track unique users by month
      const usersByMonth = new Map();
      const returningUsersByMonth = new Map();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Initialize the maps for all months
      monthNames.forEach(month => {
        usersByMonth.set(month, new Set());
        returningUsersByMonth.set(month, new Set());
      });
      
      // Track all users we've seen (for returning users calculation)
      const knownUsers = new Set();
      
      // For each website, get time tracking data
      for (const websiteId of websiteIds) {
        const timeTrackingData = await storage.getTimeTrackingByWebsiteId(websiteId);
        
        // Process each time tracking record
        for (const record of timeTrackingData) {
          const date = new Date(record.date);
          const month = monthNames[date.getMonth()];
          const userId = record.userId;
          
          // Add to users for this month
          usersByMonth.get(month).add(userId);
          
          // If we've seen this user before, add to returning users
          if (knownUsers.has(userId)) {
            returningUsersByMonth.get(month).add(userId);
          }
          
          // Add to known users
          knownUsers.add(userId);
        }
      }
      
      // Convert the data to the format expected by the client
      const growthData = monthNames.map(month => {
        const totalUsers = usersByMonth.get(month).size;
        const returningUsers = returningUsersByMonth.get(month).size;
        const newUsers = totalUsers - returningUsers;
        
        return {
          month,
          new: newUsers,
          returning: returningUsers
        };
      });
      
      // If we have no data, provide empty default data to avoid rendering issues
      if (growthData.every(item => item.new === 0 && item.returning === 0)) {
        return res.json([]);
      }
      
      res.json(growthData);
    } catch (error) {
      console.error("User growth error:", error);
      res.status(500).json({ message: "Failed to retrieve user growth data" });
    }
  });

  app.get("/api/analytics/recent-activity", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = req.user?.id;
      
      // Get developer record
      const developer = await storage.getDeveloperByUserId(userId!);
      
      if (!developer) {
        return res.status(404).json({ message: "Developer not found" });
      }
      
      // Get all API keys for this developer
      const apiKeys = await storage.getApiKeysByDeveloperId(developer.id);
      
      if (!apiKeys || apiKeys.length === 0) {
        return res.json([]);
      }
      
      // Get all websites associated with this developer's API keys
      const apiKeyIds = apiKeys.map(key => key.id);
      let websites = [];
      
      for (const apiKeyId of apiKeyIds) {
        const websitesForKey = await storage.getWebsitesByApiKeyId(apiKeyId);
        websites = websites.concat(websitesForKey);
      }
      
      if (websites.length === 0) {
        return res.json([]);
      }
      
      // Get time tracking data for all websites
      const websiteIds = websites.map(website => website.id);
      const websiteNameMap = new Map(websites.map(website => [website.id, website.name]));
      
      // Get all time tracking data and sort by date (most recent first)
      let allTimeTrackingData = [];
      
      for (const websiteId of websiteIds) {
        const timeTrackingData = await storage.getTimeTrackingByWebsiteId(websiteId);
        if (timeTrackingData.length > 0) {
          // Add website info to each record
          const enhancedData = timeTrackingData.map(record => ({
            ...record,
            websiteName: websiteNameMap.get(websiteId) || `Website ${websiteId}`,
            websiteId
          }));
          allTimeTrackingData = allTimeTrackingData.concat(enhancedData);
        }
      }
      
      // If we have no data, return empty array
      if (allTimeTrackingData.length === 0) {
        return res.json([]);
      }
      
      // Sort by date (most recent first)
      allTimeTrackingData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Take the most recent 5 records
      const recentData = allTimeTrackingData.slice(0, 5);
      
      // Format the data for display
      const recentActivities = recentData.map((record, index) => {
        // Create initials for avatar
        const randomNames = [
          'John Doe', 'Alice Smith', 'Robert Johnson', 'Emily Davis', 
          'Michael Brown', 'Sarah Wilson', 'David Clark', 'Lisa Martinez',
          'James Taylor', 'Jennifer Anderson'
        ];
        
        // Use userId to consistently select a name
        const nameIndex = record.userId % randomNames.length;
        const name = randomNames[nameIndex];
        const initials = name.split(' ').map(part => part[0]).join('');
        
        // Format the time spent
        const minutes = Math.round(record.duration / 60);
        const timeSpent = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        
        // Format the date relative to now
        const date = new Date(record.date);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        let formattedDate;
        if (diffDays === 0) {
          formattedDate = `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
        } else if (diffDays === 1) {
          formattedDate = `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
        } else {
          formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        
        return {
          id: index + 1,
          user: { 
            name: name,
            avatar: initials,
            isPremium: (record.userId % 2 === 0) // Randomly assign premium status
          },
          timeSpent: timeSpent,
          page: record.path || `/${record.websiteName.toLowerCase().replace(/\s+/g, '-')}`,
          date: formattedDate
        };
      });
      
      res.json(recentActivities);
    } catch (error) {
      console.error("Recent activity error:", error);
      res.status(500).json({ message: "Failed to retrieve recent activity data" });
    }
  });

  // Earnings
  app.get("/api/earnings", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = req.user?.id;
      
      // Get developer record
      const developer = await storage.getDeveloperByUserId(userId!);
      
      if (!developer) {
        return res.status(404).json({ message: "Developer not found" });
      }
      
      // Get revenue records for this developer
      const earnings = await storage.getRevenueByDeveloperId(developer.id);
      
      res.json(earnings);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve earnings data" });
    }
  });

  // Developer Revenue Distribution API Routes
  // Get earnings overview
  app.get("/api/revenue/earnings", revenueController.getDeveloperEarnings);
  
  // Get detailed earnings by website for a specific month
  app.get("/api/revenue/earnings/:month", revenueController.getDeveloperEarningsDetails);
  
  // Get payout history
  app.get("/api/revenue/payouts", revenueController.getDeveloperPayouts);
  
  // Admin routes
  app.post("/api/admin/revenue/calculate", revenueController.calculateRevenue);
  app.get("/api/admin/revenue/settings", revenueController.getRevenueSettings);
  app.put("/api/admin/revenue/settings", revenueController.updateRevenueSettings);
  app.get("/api/admin/revenue/stats", revenueController.getPlatformRevenueStats);
  app.get("/api/admin/revenue/top-developers/:month", revenueController.getTopEarningDevelopers);

  // Browser extension endpoints
  app.get("/api/check-site", async (req, res) => {
    const domain = req.query.domain as string;
    
    if (!domain) {
      return res.status(400).json({ error: "Domain parameter is required" });
    }
    
    try {
      // Check if any website in our database matches this domain
      // For now, we'll do a simple implementation
      const allWebsites = await db.select().from(websites);
      
      // Check if any website URL contains this domain
      const matchingWebsite = allWebsites.find(site => {
        try {
          const siteUrl = new URL(site.url);
          const siteDomain = siteUrl.hostname;
          return siteDomain === domain || domain.includes(siteDomain) || siteDomain.includes(domain);
        } catch {
          return false;
        }
      });
      
      res.json({ enabled: !!matchingWebsite });
    } catch (error) {
      console.error("Error checking site:", error);
      res.json({ enabled: false });
    }
  });
  
  app.get("/api/time-tracking/user", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });
    
    try {
      const userId = req.user?.id;
      
      // Get time tracking data for this user
      const timeTrackingData = await storage.getTimeTrackingByUserId(userId!);
      
      // Calculate total time today
      const today = new Date().toISOString().split('T')[0];
      const todaySeconds = timeTrackingData
        .filter(record => record.date.toISOString().startsWith(today))
        .reduce((total, record) => total + record.duration, 0);
      
      // Calculate total time this month
      const thisMonth = new Date().toISOString().slice(0, 7); // Format: YYYY-MM
      const monthSeconds = timeTrackingData
        .filter(record => record.date.toISOString().startsWith(thisMonth))
        .reduce((total, record) => total + record.duration, 0);
      
      // Get the user subscription type
      const subscriptionType = req.user?.subscriptionType || 'free';
      const isSubscribed = req.user?.isSubscribed || false;
      
      // Get the time limit for free users (in seconds)
      const timeLimit = 8 * 3600; // 8 hours in seconds
      
      // Calculate remaining time for free users
      const remainingSeconds = isSubscribed || subscriptionType === 'premium' 
        ? null // No limit for premium users
        : Math.max(0, timeLimit - monthSeconds);
      
      res.json({
        today: todaySeconds,
        month: monthSeconds,
        subscriptionType,
        isSubscribed,
        remainingSeconds,
        timeLimit: isSubscribed || subscriptionType === 'premium' ? null : timeLimit
      });
    } catch (error) {
      console.error("Error getting user time tracking data:", error);
      res.status(500).json({ error: "Failed to retrieve time tracking data" });
    }
  });
  
  app.post("/api/time-tracking", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });
    
    try {
      const userId = req.user?.id;
      const { timeData } = req.body;
      
      if (!Array.isArray(timeData) || timeData.length === 0) {
        return res.status(400).json({ error: "Invalid time data format" });
      }
      
      // Process each time record
      for (const record of timeData) {
        const { domain, seconds, timestamp } = record;
        
        // Skip invalid records
        if (!domain || !seconds || seconds <= 0 || !timestamp) continue;
        
        // Find website by domain
        let websiteId;
        const allWebsites = await db.select().from(websites);
        
        const matchingWebsite = allWebsites.find(site => {
          try {
            const siteUrl = new URL(site.url);
            const siteDomain = siteUrl.hostname;
            return siteDomain === domain || domain.includes(siteDomain) || siteDomain.includes(domain);
          } catch {
            return false;
          }
        });
        
        if (matchingWebsite) {
          websiteId = matchingWebsite.id;
        } else {
          // Skip if no matching website
          continue;
        }
        
        // Create time tracking record
        await storage.createTimeTracking({
          userId: userId!,
          websiteId,
          duration: seconds,
          date: new Date(timestamp),
          path: '/' // Default path
        });
      }
      
      // Check if the user has hit their free tier limit
      const subscriptionType = req.user?.subscriptionType || 'free';
      const isSubscribed = req.user?.isSubscribed || false;
      
      // Only check limits for free users
      if (!isSubscribed && subscriptionType !== 'premium') {
        // Get all time tracking for this month
        const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const timeTrackingData = await storage.getTimeTrackingByUserId(userId!);
        const monthSeconds = timeTrackingData
          .filter(record => record.date.toISOString().startsWith(thisMonth))
          .reduce((total, record) => total + record.duration, 0);
        
        // Free tier limit is 8 hours (28800 seconds)
        const freeLimit = 8 * 3600;
        
        if (monthSeconds >= freeLimit) {
          // User has hit their limit
          return res.json({
            status: 'limited',
            limitInfo: {
              limit: 8,
              used: Math.ceil(monthSeconds / 3600),
              remaining: 0
            }
          });
        }
      }
      
      // Return success
      res.json({ status: 'success' });
    } catch (error) {
      console.error("Error processing time tracking data:", error);
      res.status(500).json({ error: "Failed to process time tracking data" });
    }
  });
  
  app.get("/api/validate-token", (req, res) => {
    // This endpoint simply checks if the user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Invalid token" });
    }
    
    res.json({ valid: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
