import { db } from "../db";
import { 
  developers, 
  websites, 
  timeTracking, 
  users,
  revenue,
  developerEarnings,
  revenueSettings,
  revenueDistributionLogs,
  payouts,
  apiKeys
} from "@shared/schema";
import { eq, and, lt, sum, gt, gte, lte, count, desc } from "drizzle-orm";
import { format, subMonths, parse } from "date-fns";

// Type for earnings calculation result
interface EarningsResult {
  developerId: number;
  websiteId: number;
  websiteName: string;
  totalTime: number;
  premiumTime: number;
  amount: number;          // renamed from earnings for consistency with schema
  premiumMinutes: number;  // premium time in minutes for reporting
  percentage: number;      // percentage of total premium time
  bonusMultiplier: number; // bonus multiplier for high-performing websites
}

// Type for revenue settings
interface RevenueSettings {
  platformFeePercentage: number;
  developerShare: number;
  minimumPayoutAmount: number;
  payoutSchedule: string;
  premiumSubscriptionPrice: number;
  highPerformanceBonusThreshold: number; // minutes per month for bonus
  highPerformanceBonusMultiplier: number; // multiplier for high-performance websites
}

/**
 * Calculate revenue distribution for a specific month
 * 
 * @param month - Month in YYYY-MM format (default: previous month)
 * @returns Summary of the distribution process
 */
export async function calculateMonthlyRevenue(month?: string) {
  // Default to previous month if not specified
  if (!month) {
    const previousMonth = subMonths(new Date(), 1);
    month = format(previousMonth, 'yyyy-MM');
  }

  // Parse month to get start and end dates
  const startDate = parse(`${month}-01`, 'yyyy-MM-dd', new Date());
  const nextMonth = format(new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1), 'yyyy-MM');
  const endDate = parse(`${nextMonth}-01`, 'yyyy-MM-dd', new Date());
  
  // Get revenue settings
  const [dbSettings] = await db.select().from(revenueSettings).limit(1);
  
  // Default settings if none exist
  const settings: RevenueSettings = {
    platformFeePercentage: dbSettings?.platformFeePercentage ? Number(dbSettings.platformFeePercentage) : 30,
    developerShare: dbSettings?.developerShare || 70,
    minimumPayoutAmount: dbSettings?.minimumPayoutAmount || 1000, // $10 in cents
    payoutSchedule: dbSettings?.payoutSchedule || 'monthly',
    premiumSubscriptionPrice: dbSettings?.premiumSubscriptionPrice || 999, // $9.99 in cents
    highPerformanceBonusThreshold: 3000, // 50 hours in minutes
    highPerformanceBonusMultiplier: 1.1 // 10% bonus for high-performing websites
  };
  
  // 1. Calculate total premium user time for the month
  const timeResults = await db
    .select({
      totalPremiumTime: sum(timeTracking.duration).mapWith(Number)
    })
    .from(timeTracking)
    .innerJoin(users, eq(timeTracking.userId, users.id))
    .where(
      and(
        gte(timeTracking.date, startDate),
        lt(timeTracking.date, endDate),
        eq(users.isSubscribed, true)
      )
    );
  
  const totalPremiumTime = timeResults[0]?.totalPremiumTime || 0;
  const totalPremiumMinutes = Math.round(totalPremiumTime / 60); // Convert seconds to minutes
  
  if (totalPremiumTime === 0) {
    // No premium usage this month
    return {
      month,
      totalRevenue: 0,
      totalDistributed: 0,
      platformFee: 0,
      developerCount: 0,
      status: 'completed',
      notes: 'No premium usage recorded for this period'
    };
  }
  
  // 2. Get total subscription revenue for the month (from actual premium user count)
  const premiumUserCount = await db
    .select({
      count: count()
    })
    .from(users)
    .where(eq(users.isSubscribed, true));
  
  const totalRevenue = premiumUserCount[0]?.count * settings.premiumSubscriptionPrice || 0;
  const platformFeeAmount = Math.floor(totalRevenue * (settings.platformFeePercentage / 100));
  const distributableAmount = totalRevenue - platformFeeAmount;
  
  // 3. Calculate time spent on each developer's websites by premium users
  const websiteUsage = await db
    .select({
      developerId: developers.id,
      websiteId: websites.id,
      websiteName: websites.name,
      totalTime: sum(timeTracking.duration).mapWith(Number),
    })
    .from(timeTracking)
    .innerJoin(websites, eq(timeTracking.websiteId, websites.id))
    .innerJoin(users, eq(timeTracking.userId, users.id))
    .innerJoin(apiKeys, eq(websites.apiKeyId, apiKeys.id))
    .innerJoin(developers, eq(apiKeys.developerId, developers.id))
    .where(
      and(
        gte(timeTracking.date, startDate),
        lt(timeTracking.date, endDate),
        eq(users.isSubscribed, true)
      )
    )
    .groupBy(developers.id, websites.id, websites.name);
  
  // 4. Calculate earnings for each developer based on their proportion of usage
  // with bonus multipliers for high-performing websites
  const earnings: EarningsResult[] = websiteUsage.map(usage => {
    const premiumTime = usage.totalTime; // All this time is from premium users
    const premiumMinutes = Math.round(premiumTime / 60); // Convert to minutes
    const percentage = usage.totalTime / totalPremiumTime;
    
    // Apply bonus for high-performing websites
    const bonusMultiplier = premiumMinutes >= settings.highPerformanceBonusThreshold 
      ? settings.highPerformanceBonusMultiplier 
      : 1.0;
    
    // Calculate earnings with bonus
    const baseAmount = Math.floor(distributableAmount * percentage);
    const amount = Math.floor(baseAmount * bonusMultiplier);
    
    return {
      developerId: usage.developerId,
      websiteId: usage.websiteId,
      websiteName: usage.websiteName,
      totalTime: usage.totalTime,
      premiumTime: premiumTime,
      amount: amount,
      premiumMinutes: premiumMinutes,
      percentage: percentage,
      bonusMultiplier: bonusMultiplier
    };
  });

  // 5. Store the earnings data
  for (const earning of earnings) {
    await db.insert(developerEarnings).values({
      developerId: earning.developerId,
      websiteId: earning.websiteId,
      month: month,
      amount: earning.amount,
      premiumMinutes: earning.premiumMinutes,
      calculatedAt: new Date()
    });
  }
  
  // 6. Aggregate earnings by developer
  const developerTotals = earnings.reduce((acc, curr) => {
    if (!acc[curr.developerId]) {
      acc[curr.developerId] = {
        amount: 0,
        premiumMinutes: 0,
        websitesCount: 0
      };
    }
    acc[curr.developerId].amount += curr.amount;
    acc[curr.developerId].premiumMinutes += curr.premiumMinutes;
    acc[curr.developerId].websitesCount++;
    return acc;
  }, {} as Record<number, { amount: number, premiumMinutes: number, websitesCount: number }>);
  
  // 7. Store total revenue for each developer and create payout records
  for (const [developerId, data] of Object.entries(developerTotals)) {
    const devId = parseInt(developerId);
    
    // Store total revenue
    await db.insert(revenue).values({
      developerId: devId,
      amount: data.amount,
      month: month,
      premiumMinutes: data.premiumMinutes,
      websitesCount: data.websitesCount,
      calculatedAt: new Date()
    });
    
    // Get developer payment details
    const [developer] = await db
      .select({
        paymentDetails: developers.paymentDetails
      })
      .from(developers)
      .where(eq(developers.id, devId));
    
    // Determine default payment method from developer preferences
    let defaultPaymentMethod = 'bank_transfer';
    if (developer?.paymentDetails) {
      try {
        const paymentDetails = JSON.parse(developer.paymentDetails as string);
        if (paymentDetails.paypal) {
          defaultPaymentMethod = 'paypal';
        }
      } catch (err) {
        console.error("Failed to parse payment details:", err);
      }
    }
    
    // Create a payout record if amount is above minimum threshold
    if (data.amount >= settings.minimumPayoutAmount) {
      await db.insert(payouts).values({
        developerId: devId,
        amount: data.amount,
        month: month,
        status: 'pending',
        paymentMethod: defaultPaymentMethod,
        notes: `Automatic payout for ${month}`,
        createdAt: new Date()
      });
    }
  }
  
  // 8. Log the distribution
  const [distributionLog] = await db.insert(revenueDistributionLogs).values({
    month: month,
    totalRevenue: totalRevenue,
    totalDistributed: distributableAmount,
    platformFee: platformFeeAmount,
    developerCount: Object.keys(developerTotals).length,
    status: 'completed',
    notes: `Processed on ${new Date().toISOString()}`,
    runAt: new Date()
  }).returning();
  
  return distributionLog;
}

/**
 * Get earnings breakdown for a developer
 * 
 * @param developerId - Developer ID
 * @param limit - Number of months to retrieve
 * @returns Array of monthly earnings
 */
export async function getDeveloperEarnings(developerId: number, limit = 12) {
  return db
    .select({
      month: revenue.month,
      amount: revenue.amount,
      premiumMinutes: revenue.premiumMinutes,
      websitesCount: revenue.websitesCount,
      calculatedAt: revenue.calculatedAt,
    })
    .from(revenue)
    .where(eq(revenue.developerId, developerId))
    .orderBy(desc(revenue.month))
    .limit(limit);
}

/**
 * Get detailed earnings breakdown by website for a developer
 * 
 * @param developerId - Developer ID
 * @param month - Month in YYYY-MM format
 * @returns Detailed earnings breakdown by website
 */
export async function getDeveloperEarningsDetails(developerId: number, month: string) {
  return db
    .select({
      websiteId: developerEarnings.websiteId,
      websiteName: websites.name,
      websiteUrl: websites.url,
      premiumMinutes: developerEarnings.premiumMinutes,
      amount: developerEarnings.amount,
      calculatedAt: developerEarnings.calculatedAt
    })
    .from(developerEarnings)
    .innerJoin(websites, eq(developerEarnings.websiteId, websites.id))
    .where(
      and(
        eq(developerEarnings.developerId, developerId),
        eq(developerEarnings.month, month)
      )
    )
    .orderBy(desc(developerEarnings.amount));
}

/**
 * Get payout history for a developer
 * 
 * @param developerId - Developer ID
 * @param limit - Number of payouts to retrieve
 * @returns Array of payout records
 */
export async function getDeveloperPayouts(developerId: number, limit = 10) {
  return db
    .select()
    .from(payouts)
    .where(eq(payouts.developerId, developerId))
    .orderBy(desc(payouts.createdAt))
    .limit(limit);
}

/**
 * Get revenue stats by month for the platform
 * 
 * @param months - Number of months to retrieve
 * @returns Array of monthly revenue stats
 */
export async function getPlatformRevenueStats(months = 12) {
  return db
    .select()
    .from(revenueDistributionLogs)
    .orderBy(desc(revenueDistributionLogs.month))
    .limit(months);
}

/**
 * Get top earning developers for a specific month
 * 
 * @param month - Month in YYYY-MM format
 * @param limit - Number of developers to retrieve
 * @returns Array of top earning developers
 */
export async function getTopEarningDevelopers(month: string, limit = 10) {
  return db
    .select({
      developerId: revenue.developerId,
      developerName: developers.companyName,
      amount: revenue.amount,
      premiumMinutes: revenue.premiumMinutes,
      websitesCount: revenue.websitesCount,
      paymentDetails: developers.paymentDetails,
      calculatedAt: revenue.calculatedAt
    })
    .from(revenue)
    .innerJoin(developers, eq(revenue.developerId, developers.id))
    .where(eq(revenue.month, month))
    .orderBy(desc(revenue.amount))
    .limit(limit);
}

/**
 * Get platform revenue settings
 * 
 * @returns Current revenue settings
 */
export async function getRevenueSettings() {
  const [dbSettings] = await db.select().from(revenueSettings).limit(1);
  
  // Construct a complete settings object with defaults for missing values
  const settings: RevenueSettings = {
    platformFeePercentage: dbSettings?.platformFeePercentage ? Number(dbSettings.platformFeePercentage) : 30,
    developerShare: dbSettings?.developerShare || 70,
    minimumPayoutAmount: dbSettings?.minimumPayoutAmount || 1000, // $10 in cents
    payoutSchedule: dbSettings?.payoutSchedule || 'monthly',
    premiumSubscriptionPrice: dbSettings?.premiumSubscriptionPrice || 999, // $9.99 in cents
    highPerformanceBonusThreshold: dbSettings?.highPerformanceBonusThreshold || 120, // 2 hours in minutes
    highPerformanceBonusMultiplier: dbSettings?.highPerformanceBonusMultiplier ? Number(dbSettings.highPerformanceBonusMultiplier) : 1.5
  };
  
  return settings;
}

/**
 * Update platform revenue settings
 * 
 * @param newSettings - Updated settings
 * @returns Updated settings
 */
export async function updateRevenueSettings(newSettings: Partial<typeof revenueSettings.$inferInsert>) {
  const [existingSettings] = await db.select().from(revenueSettings).limit(1);
  
  // Include all possible settings fields from the schema
  const validSettings = {
    platformFeePercentage: newSettings.platformFeePercentage,
    minimumPayoutAmount: newSettings.minimumPayoutAmount,
    payoutSchedule: newSettings.payoutSchedule,
    developerShare: newSettings.developerShare,
    premiumSubscriptionPrice: newSettings.premiumSubscriptionPrice,
    highPerformanceBonusThreshold: newSettings.highPerformanceBonusThreshold, 
    highPerformanceBonusMultiplier: newSettings.highPerformanceBonusMultiplier,
    updatedAt: new Date()
  };
  
  if (existingSettings) {
    const [updated] = await db
      .update(revenueSettings)
      .set(validSettings)
      .where(eq(revenueSettings.id, existingSettings.id))
      .returning();
    
    return updated;
  } else {
    const [created] = await db
      .insert(revenueSettings)
      .values(validSettings)
      .returning();
    
    return created;
  }
}