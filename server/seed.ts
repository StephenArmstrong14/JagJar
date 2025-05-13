import { db } from "./db";
import { users, developers, apiKeys, websites, timeTracking, revenue, plans, revenueSettings, payouts, developerEarnings } from "@shared/schema";
import { hashPassword } from "./auth";
import { generateApiKeyString } from "./utils";
import { sql } from "drizzle-orm";

// Helper function to generate random date within range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to generate random number within range
function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Helper to generate fake paths
function generateRandomPath(): string {
  const paths = [
    '/',
    '/dashboard',
    '/profile',
    '/settings',
    '/analytics',
    '/features',
    '/pricing',
    '/docs',
    '/api',
    '/help',
    '/products',
    '/about',
    '/contact',
    '/login',
    '/register'
  ];
  return paths[Math.floor(Math.random() * paths.length)];
}

// Helper to format date as YYYY-MM
function formatYearMonth(date: Date): string {
  return date.toISOString().slice(0, 7); // YYYY-MM
}

// Force seed flag for development
const FORCE_SEED = false;

async function seedDatabase() {
  console.log("Seeding database...");
  
  try {
    // Check if users table already has data
    const existingUsers = await db.select({ count: sql`count(*)` }).from(users);
    
    if (parseInt(existingUsers[0].count as string) > 0 && !FORCE_SEED) {
      console.log("Database already has data. Skipping seed.");
      return;
    }
    
    if (FORCE_SEED) {
      console.log("Force seeding enabled. Clearing existing data...");
      // Clear existing data in reverse order of dependencies
      await db.delete(developerEarnings);
      await db.delete(payouts);
      await db.delete(revenueSettings);
      await db.delete(revenue);
      await db.delete(timeTracking);
      await db.delete(websites);
      await db.delete(apiKeys);
      await db.delete(developers);
      await db.delete(plans);
      await db.delete(users);
      console.log("Existing data cleared.");
    }
    
    // Create admin user
    const [adminUser] = await db.insert(users).values({
      username: "admin",
      email: "admin@jagjar.com",
      password: await hashPassword("admin123"),
      isSubscribed: true,
      subscriptionType: "premium",
      isAdmin: true
    }).returning();
    
    // Create developer user
    const [developerUser] = await db.insert(users).values({
      username: "developer",
      email: "developer@example.com",
      password: await hashPassword("password"),
      isSubscribed: false,
      subscriptionType: "free"
    }).returning();
    
    // Create premium users
    const premiumUsers = [];
    for (let i = 1; i <= 15; i++) {
      const [user] = await db.insert(users).values({
        username: `premium${i}`,
        email: `premium${i}@example.com`,
        password: await hashPassword("password"),
        isSubscribed: true,
        subscriptionType: "premium"
      }).returning();
      premiumUsers.push(user);
    }
    
    // Create free users
    const freeUsers = [];
    for (let i = 1; i <= 35; i++) {
      const [user] = await db.insert(users).values({
        username: `free${i}`,
        email: `free${i}@example.com`,
        password: await hashPassword("password"),
        isSubscribed: false,
        subscriptionType: "free"
      }).returning();
      freeUsers.push(user);
    }
    
    console.log(`Created ${1 + 1 + premiumUsers.length + freeUsers.length} users`);
    
    // Create developer profile
    const [developer1] = await db.insert(developers).values({
      userId: developerUser.id,
      companyName: "Example Dev Co",
      website: "https://example.com",
      paymentDetails: JSON.stringify({
        paypal: "developer@example.com",
        bankAccount: "XXXX-XXXX-XXXX-1234"
      })
    }).returning();
    
    console.log("Created developer profile");
    
    // Create API keys
    const [dashboardApiKey] = await db.insert(apiKeys).values({
      developerId: developer1.id,
      name: "Dashboard Application",
      key: generateApiKeyString(),
      active: true
    }).returning();
    
    const [ecommerceApiKey] = await db.insert(apiKeys).values({
      developerId: developer1.id,
      name: "E-commerce Platform",
      key: generateApiKeyString(),
      active: true
    }).returning();
    
    const [portfolioApiKey] = await db.insert(apiKeys).values({
      developerId: developer1.id,
      name: "Portfolio Website",
      key: generateApiKeyString(),
      active: true
    }).returning();
    
    const [blogApiKey] = await db.insert(apiKeys).values({
      developerId: developer1.id,
      name: "Blog Platform",
      key: generateApiKeyString(),
      active: true
    }).returning();
    
    console.log("Created API keys");
    
    // Create websites
    const [dashboardWebsite] = await db.insert(websites).values({
      apiKeyId: dashboardApiKey.id,
      name: "Analytics Dashboard",
      url: "https://dashboard.example.com"
    }).returning();
    
    const [ecommerceWebsite] = await db.insert(websites).values({
      apiKeyId: ecommerceApiKey.id,
      name: "Online Store",
      url: "https://store.example.com"
    }).returning();
    
    const [portfolioWebsite] = await db.insert(websites).values({
      apiKeyId: portfolioApiKey.id,
      name: "Developer Portfolio",
      url: "https://portfolio.example.com"
    }).returning();
    
    const [blogWebsite] = await db.insert(websites).values({
      apiKeyId: blogApiKey.id,
      name: "Developer Blog",
      url: "https://blog.example.com"
    }).returning();
    
    console.log("Created websites");
    
    // Create time tracking data - generate 6 months of data
    const allWebsites = [dashboardWebsite, ecommerceWebsite, portfolioWebsite, blogWebsite];
    const allUsers = [...premiumUsers, ...freeUsers];
    
    // Get current date
    const now = new Date();
    
    // Create dates for the last 6 months
    const monthDates = [];
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(now);
      monthDate.setMonth(now.getMonth() - i);
      monthDate.setDate(1); // First day of month
      monthDates.push(monthDate);
    }
    
    // Create timetracking data for each month
    const timeTrackingRecords = [];
    
    for (let monthIndex = 0; monthIndex < monthDates.length; monthIndex++) {
      const monthStart = monthDates[monthIndex];
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      // Create more entries for recent months
      const entriesCount = 500 - (monthIndex * 50); // More entries for recent months
      
      for (let i = 0; i < entriesCount; i++) {
        const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
        const randomWebsite = allWebsites[Math.floor(Math.random() * allWebsites.length)];
        const recordDate = randomDate(monthStart, monthEnd);
        
        // Duration between 5 minutes and 2 hours in seconds
        const duration = randomNumber(5 * 60, 2 * 60 * 60);
        
        timeTrackingRecords.push({
          userId: randomUser.id,
          websiteId: randomWebsite.id,
          duration: duration,
          date: recordDate,
          path: generateRandomPath(),
          isPremium: randomUser.isSubscribed
        });
      }
    }
    
    // Insert in batches to avoid overwhelming the database
    const batchSize = 100;
    for (let i = 0; i < timeTrackingRecords.length; i += batchSize) {
      const batch = timeTrackingRecords.slice(i, i + batchSize);
      await db.insert(timeTracking).values(batch);
    }
    
    console.log(`Created ${timeTrackingRecords.length} time tracking records`);
    
    // Create revenue settings
    await db.insert(revenueSettings).values({
      premiumSubscriptionPrice: 999, // $9.99
      developerShare: 70, // 70%
      platformFee: 30, // 30%
      payoutThreshold: 5000, // $50.00
      payoutDay: 15 // 15th of each month
    });
    
    console.log("Created revenue settings");
    
    // Create plans
    await db.insert(plans).values([
      {
        name: "Free",
        price: 0,
        timeLimit: 3600 * 8, // 8 hours per month
        description: "Basic access to JagJar enabled sites with time limits"
      },
      {
        name: "Premium",
        price: 999, // $9.99
        timeLimit: null, // Unlimited
        description: "Unlimited access to JagJar enabled sites"
      }
    ]);
    
    console.log("Created plans");
    
    // Generate revenue data for each month
    for (let monthIndex = 0; monthIndex < monthDates.length; monthIndex++) {
      const monthDate = monthDates[monthIndex];
      const formattedMonth = formatYearMonth(monthDate);
      
      // Earnings increase over time
      const baseAmount = 50000 + (monthIndex * 10000); // $500 + increasing amount each month
      const randomVariation = randomNumber(-5000, 10000); // Random variation between -$50 and +$100
      const amount = baseAmount + randomVariation;
      
      await db.insert(revenue).values({
        developerId: developer1.id,
        month: formattedMonth,
        amount: amount,
        premiumMinutes: randomNumber(2000, 5000),
        websitesCount: allWebsites.length,
        calculatedAt: new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 15) // 15th of next month
      });
      
      // Create developer earnings breakdown by website
      for (const website of allWebsites) {
        // Distribute total earnings among websites
        const websitePercentage = Math.random();
        const websiteAmount = Math.floor(amount * websitePercentage);
        
        await db.insert(developerEarnings).values({
          developerId: developer1.id,
          websiteId: website.id,
          month: formattedMonth,
          amount: websiteAmount,
          premiumMinutes: randomNumber(500, 2000),
          calculatedAt: new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 15)
        });
      }
      
      // Create payout record for months except the current one
      if (monthIndex > 0) {
        await db.insert(payouts).values({
          developerId: developer1.id,
          amount: amount,
          month: formattedMonth,
          status: 'completed',
          paymentMethod: Math.random() > 0.5 ? 'paypal' : 'bank_transfer',
          createdAt: new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 15),
          processedAt: new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 15)
        });
      } else {
        // Current month is pending
        await db.insert(payouts).values({
          developerId: developer1.id,
          amount: amount,
          month: formattedMonth,
          status: 'pending',
          paymentMethod: 'paypal',
          createdAt: new Date()
        });
      }
    }
    
    console.log(`Created revenue and payout data for ${monthDates.length} months`);
    
    console.log("Database seeding complete!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Export the function to be called from server startup
export { seedDatabase };