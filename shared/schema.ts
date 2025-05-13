import { pgTable, text, serial, integer, boolean, timestamp, primaryKey, decimal, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  isSubscribed: boolean("is_subscribed").default(false).notNull(),
  subscriptionType: text("subscription_type").default("free").notNull(),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

// Developer model
export const developers = pgTable("developers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  companyName: text("company_name"),
  website: text("website"),
  paymentDetails: text("payment_details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDeveloperSchema = createInsertSchema(developers).pick({
  userId: true,
  companyName: true,
  website: true,
  paymentDetails: true,
});

// API Keys model
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  developerId: integer("developer_id").notNull().references(() => developers.id),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  developerId: true,
  name: true,
});

// Websites model
export const websites = pgTable("websites", {
  id: serial("id").primaryKey(),
  apiKeyId: integer("api_key_id").notNull().references(() => apiKeys.id),
  url: text("url").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWebsiteSchema = createInsertSchema(websites).pick({
  apiKeyId: true,
  url: true,
  name: true,
});

// Time Tracking model
export const timeTracking = pgTable("time_tracking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  websiteId: integer("website_id").notNull().references(() => websites.id),
  duration: integer("duration").notNull(), // duration in seconds
  date: timestamp("date").defaultNow().notNull(),
  path: text("path"),
  isPremium: boolean("is_premium").default(false),
});

export const insertTimeTrackingSchema = createInsertSchema(timeTracking).pick({
  userId: true,
  websiteId: true,
  duration: true,
  date: true,
  path: true,
  isPremium: true,
});

// Revenue model
export const revenue = pgTable("revenue", {
  id: serial("id").primaryKey(),
  developerId: integer("developer_id").notNull().references(() => developers.id),
  amount: integer("amount").notNull(), // amount in cents
  month: text("month").notNull(), // format: YYYY-MM
  premiumMinutes: integer("premium_minutes"),
  websitesCount: integer("websites_count"),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
});

export const insertRevenueSchema = createInsertSchema(revenue).pick({
  developerId: true,
  amount: true,
  month: true,
});

// Subscription plans
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(), // price in cents
  timeLimit: integer("time_limit"), // time limit in seconds, null for unlimited
  description: text("description").notNull(),
});

export const insertPlanSchema = createInsertSchema(plans).pick({
  name: true,
  price: true,
  timeLimit: true,
  description: true,
});

// Payment status enum
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'processing', 'completed', 'failed']);

// Developer payouts model
export const payouts = pgTable("payouts", {
  id: serial("id").primaryKey(),
  developerId: integer("developer_id").notNull().references(() => developers.id),
  amount: integer("amount").notNull(), // amount in cents
  status: paymentStatusEnum("status").notNull().default('pending'),
  paymentMethod: text("payment_method"),
  referenceId: text("reference_id"), // External payment reference ID
  createdAt: timestamp("created_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
  notes: text("notes"),
});

export const insertPayoutSchema = createInsertSchema(payouts).pick({
  developerId: true,
  amount: true,
  paymentMethod: true,
  notes: true,
});

// Revenue sharing settings model
export const revenueSettings = pgTable("revenue_settings", {
  id: serial("id").primaryKey(),
  platformFeePercentage: decimal("platform_fee_percentage", { precision: 5, scale: 2 }).notNull().default('30.00'), // Default 30%
  minimumPayoutAmount: integer("minimum_payout_amount").notNull().default(1000), // Default $10 (in cents)
  payoutSchedule: text("payout_schedule").notNull().default('monthly'), // 'monthly', 'weekly', etc.
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  premiumSubscriptionPrice: integer("premium_subscription_price").default(999), // Default $9.99 (in cents)
  developerShare: integer("developer_share").default(70), // Default 70%
  platformFee: integer("platform_fee").default(30), // Default 30%
  payoutThreshold: integer("payout_threshold").default(5000), // Default $50 (in cents)
  payoutDay: integer("payout_day").default(15), // Default 15th of the month
  highPerformanceBonusThreshold: integer("high_performance_bonus_threshold").default(120), // Default 120 minutes
  highPerformanceBonusMultiplier: decimal("high_performance_bonus_multiplier", { precision: 3, scale: 1 }).default('1.5'), // Default 1.5x
});

// Revenue distribution logs
export const revenueDistributionLogs = pgTable("revenue_distribution_logs", {
  id: serial("id").primaryKey(),
  month: text("month").notNull(), // format: YYYY-MM
  totalRevenue: integer("total_revenue").notNull(), // Total revenue collected for the period
  totalDistributed: integer("total_distributed").notNull(), // Total amount distributed to developers
  platformFee: integer("platform_fee").notNull(), // Platform fee amount
  developerCount: integer("developer_count").notNull(), // Number of developers who received payments
  runAt: timestamp("run_at").defaultNow().notNull(),
  status: text("status").notNull().default('completed'),
  notes: text("notes"),
});

// Developer earnings breakdown by website
export const developerEarnings = pgTable("developer_earnings", {
  id: serial("id").primaryKey(),
  developerId: integer("developer_id").notNull().references(() => developers.id),
  websiteId: integer("website_id").notNull().references(() => websites.id),
  month: text("month").notNull(), // format: YYYY-MM
  amount: integer("amount").notNull(), // Amount in cents
  premiumMinutes: integer("premium_minutes"), // Premium user time in minutes
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  developer: one(developers, {
    fields: [users.id],
    references: [developers.userId],
  }),
  timeTracking: many(timeTracking),
}));

export const developersRelations = relations(developers, ({ one, many }) => ({
  user: one(users, {
    fields: [developers.userId],
    references: [users.id],
  }),
  apiKeys: many(apiKeys),
  revenue: many(revenue),
  payouts: many(payouts),
  earnings: many(developerEarnings),
}));

export const apiKeysRelations = relations(apiKeys, ({ one, many }) => ({
  developer: one(developers, {
    fields: [apiKeys.developerId],
    references: [developers.id],
  }),
  websites: many(websites),
}));

export const websitesRelations = relations(websites, ({ one, many }) => ({
  apiKey: one(apiKeys, {
    fields: [websites.apiKeyId],
    references: [apiKeys.id],
  }),
  timeTracking: many(timeTracking),
  earnings: many(developerEarnings),
}));

export const timeTrackingRelations = relations(timeTracking, ({ one }) => ({
  user: one(users, {
    fields: [timeTracking.userId],
    references: [users.id],
  }),
  website: one(websites, {
    fields: [timeTracking.websiteId],
    references: [websites.id],
  }),
}));

export const revenueRelations = relations(revenue, ({ one }) => ({
  developer: one(developers, {
    fields: [revenue.developerId],
    references: [developers.id],
  }),
}));

export const payoutsRelations = relations(payouts, ({ one }) => ({
  developer: one(developers, {
    fields: [payouts.developerId],
    references: [developers.id],
  }),
}));

export const developerEarningsRelations = relations(developerEarnings, ({ one }) => ({
  developer: one(developers, {
    fields: [developerEarnings.developerId],
    references: [developers.id],
  }),
  website: one(websites, {
    fields: [developerEarnings.websiteId],
    references: [websites.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Developer = typeof developers.$inferSelect;
export type InsertDeveloper = z.infer<typeof insertDeveloperSchema>;

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

export type Website = typeof websites.$inferSelect;
export type InsertWebsite = z.infer<typeof insertWebsiteSchema>;

export type TimeTracking = typeof timeTracking.$inferSelect;
export type InsertTimeTracking = z.infer<typeof insertTimeTrackingSchema>;

export type Revenue = typeof revenue.$inferSelect;
export type InsertRevenue = z.infer<typeof insertRevenueSchema>;

export type Plan = typeof plans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;

export type RevenueSettings = typeof revenueSettings.$inferSelect;
export const insertRevenueSettingsSchema = createInsertSchema(revenueSettings).pick({
  platformFeePercentage: true,
  developerShare: true,
  minimumPayoutAmount: true,
  payoutSchedule: true,
  premiumSubscriptionPrice: true,
  platformFee: true,
  payoutThreshold: true,
  payoutDay: true,
  highPerformanceBonusThreshold: true,
  highPerformanceBonusMultiplier: true,
});
export type InsertRevenueSettings = z.infer<typeof insertRevenueSettingsSchema>;
