import { 
  users, type User, type InsertUser,
  developers, type Developer, type InsertDeveloper,
  apiKeys, type ApiKey, type InsertApiKey,
  websites, type Website, type InsertWebsite,
  timeTracking, type TimeTracking, type InsertTimeTracking,
  revenue, type Revenue, type InsertRevenue,
  payouts,
  revenueSettings,
  revenueDistributionLogs,
  developerEarnings
} from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq, desc, and, asc } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Developer operations
  createDeveloper(developer: InsertDeveloper): Promise<Developer>;
  getDeveloperByUserId(userId: number): Promise<Developer | undefined>;
  
  // API Key operations
  createApiKey(apiKey: InsertApiKey & { key: string }): Promise<ApiKey>;
  getApiKey(id: number): Promise<ApiKey | undefined>;
  getApiKeysByDeveloperId(developerId: number): Promise<ApiKey[]>;
  getApiKeyByKey(key: string): Promise<ApiKey | undefined>;
  deleteApiKey(id: number): Promise<void>;
  
  // Website operations
  createWebsite(website: InsertWebsite): Promise<Website>;
  getWebsitesByApiKeyId(apiKeyId: number): Promise<Website[]>;
  getWebsiteById(id: number): Promise<Website | undefined>;
  
  // Time Tracking operations
  createTimeTracking(timeTracking: InsertTimeTracking): Promise<TimeTracking>;
  getTimeTrackingByUserId(userId: number): Promise<TimeTracking[]>;
  getTimeTrackingByWebsiteId(websiteId: number): Promise<TimeTracking[]>;
  
  // Revenue operations
  createRevenue(revenue: InsertRevenue): Promise<Revenue>;
  getRevenueByDeveloperId(developerId: number): Promise<Revenue[]>;
  
  // Payout operations
  createPayout(payout: any): Promise<any>;
  getPayoutsByDeveloperId(developerId: number): Promise<any[]>;
  updatePayoutStatus(id: number, status: string): Promise<any>;
  
  // Revenue Settings operations
  getRevenueSettings(): Promise<any>;
  updateRevenueSettings(settings: any): Promise<any>;
  
  // Revenue Distribution operations
  logRevenueDistribution(log: any): Promise<any>;
  getRevenueDistributionLogs(): Promise<any[]>;
  
  // Developer Earnings operations
  createDeveloperEarning(earning: any): Promise<any>;
  getDeveloperEarningsByDeveloperId(developerId: number, month?: string): Promise<any[]>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'sessions' 
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        isSubscribed: false,
        subscriptionType: "free",
        isAdmin: false
      })
      .returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Developer operations
  async createDeveloper(insertDeveloper: InsertDeveloper): Promise<Developer> {
    const [developer] = await db
      .insert(developers)
      .values({
        ...insertDeveloper,
        companyName: insertDeveloper.companyName || null,
        website: insertDeveloper.website || null,
        paymentDetails: insertDeveloper.paymentDetails || null
      })
      .returning();
    return developer;
  }
  
  async getDeveloperByUserId(userId: number): Promise<Developer | undefined> {
    const [developer] = await db
      .select()
      .from(developers)
      .where(eq(developers.userId, userId));
    return developer;
  }

  // API Key operations
  async createApiKey(apiKey: InsertApiKey & { key: string }): Promise<ApiKey> {
    try {
      console.log("Creating API key with:", apiKey);
      const [newApiKey] = await db
        .insert(apiKeys)
        .values({
          developerId: apiKey.developerId,
          name: apiKey.name,
          key: apiKey.key
        })
        .returning();
      console.log("API key created:", newApiKey);
      return newApiKey;
    } catch (error) {
      console.error("Error in createApiKey:", error);
      throw error;
    }
  }
  
  async getApiKey(id: number): Promise<ApiKey | undefined> {
    const [apiKey] = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.id, id));
    return apiKey;
  }
  
  async getApiKeysByDeveloperId(developerId: number): Promise<ApiKey[]> {
    return db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.developerId, developerId));
  }
  
  async getApiKeyByKey(key: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.key, key));
    return apiKey;
  }
  
  async deleteApiKey(id: number): Promise<void> {
    // First, delete related websites
    await db
      .delete(websites)
      .where(eq(websites.apiKeyId, id));
      
    // Then delete the API key
    await db
      .delete(apiKeys)
      .where(eq(apiKeys.id, id));
  }

  // Website operations
  async createWebsite(insertWebsite: InsertWebsite): Promise<Website> {
    const [website] = await db
      .insert(websites)
      .values(insertWebsite)
      .returning();
    return website;
  }
  
  async getWebsitesByApiKeyId(apiKeyId: number): Promise<Website[]> {
    return db
      .select()
      .from(websites)
      .where(eq(websites.apiKeyId, apiKeyId));
  }
  
  async getWebsiteById(id: number): Promise<Website | undefined> {
    const [website] = await db
      .select()
      .from(websites)
      .where(eq(websites.id, id));
    return website;
  }

  // Time Tracking operations
  async createTimeTracking(insertTimeTrackingData: InsertTimeTracking): Promise<TimeTracking> {
    const [trackingEntry] = await db
      .insert(timeTracking)
      .values(insertTimeTrackingData)
      .returning();
    return trackingEntry;
  }
  
  async getTimeTrackingByUserId(userId: number): Promise<TimeTracking[]> {
    return db
      .select()
      .from(timeTracking)
      .where(eq(timeTracking.userId, userId));
  }
  
  async getTimeTrackingByWebsiteId(websiteId: number): Promise<TimeTracking[]> {
    return db
      .select()
      .from(timeTracking)
      .where(eq(timeTracking.websiteId, websiteId));
  }

  // Revenue operations
  async createRevenue(insertRevenue: InsertRevenue): Promise<Revenue> {
    const [revenueEntry] = await db
      .insert(revenue)
      .values(insertRevenue)
      .returning();
    return revenueEntry;
  }
  
  async getRevenueByDeveloperId(developerId: number): Promise<Revenue[]> {
    return db
      .select()
      .from(revenue)
      .where(eq(revenue.developerId, developerId))
      .orderBy(revenue.month);
  }
  
  // Payout operations
  async createPayout(payout: any): Promise<any> {
    const [newPayout] = await db
      .insert(payouts)
      .values(payout)
      .returning();
    return newPayout;
  }
  
  async getPayoutsByDeveloperId(developerId: number): Promise<any[]> {
    return db
      .select()
      .from(payouts)
      .where(eq(payouts.developerId, developerId))
      .orderBy(desc(payouts.createdAt));
  }
  
  async updatePayoutStatus(id: number, status: string): Promise<any> {
    // Convert string status to enum value
    const payoutStatus = status as any; // This is a workaround for the type issue
    const [updatedPayout] = await db
      .update(payouts)
      .set({ status: payoutStatus })
      .where(eq(payouts.id, id))
      .returning();
    return updatedPayout;
  }
  
  // Revenue Settings operations
  async getRevenueSettings(): Promise<any> {
    const [settings] = await db
      .select()
      .from(revenueSettings)
      .limit(1);
    return settings;
  }
  
  async updateRevenueSettings(settings: any): Promise<any> {
    const [updatedSettings] = await db
      .update(revenueSettings)
      .set({
        ...settings,
        updatedAt: new Date()
      })
      .where(eq(revenueSettings.id, 1))
      .returning();
    return updatedSettings;
  }
  
  // Revenue Distribution operations
  async logRevenueDistribution(log: any): Promise<any> {
    const [newLog] = await db
      .insert(revenueDistributionLogs)
      .values(log)
      .returning();
    return newLog;
  }
  
  async getRevenueDistributionLogs(): Promise<any[]> {
    return db
      .select()
      .from(revenueDistributionLogs)
      .orderBy(desc(revenueDistributionLogs.runAt));
  }
  
  // Developer Earnings operations
  async createDeveloperEarning(earning: any): Promise<any> {
    const [newEarning] = await db
      .insert(developerEarnings)
      .values(earning)
      .returning();
    return newEarning;
  }
  
  async getDeveloperEarningsByDeveloperId(developerId: number, month?: string): Promise<any[]> {
    if (month) {
      return db
        .select()
        .from(developerEarnings)
        .where(and(
          eq(developerEarnings.developerId, developerId),
          eq(developerEarnings.month, month)
        ))
        .orderBy(desc(developerEarnings.month));
    }
    
    return db
      .select()
      .from(developerEarnings)
      .where(eq(developerEarnings.developerId, developerId))
      .orderBy(desc(developerEarnings.month));
  }
}

// We're now using the PostgreSQL database instead of in-memory storage
export const storage = new DatabaseStorage();