import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function migrate() {
  console.log("Running database migrations...");
  
  try {
    // Add isAdmin column to users table
    console.log("Adding isAdmin column to users table...");
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE
    `);
    
    // Add paymentDetails column to developers table
    console.log("Adding paymentDetails column to developers table...");
    await db.execute(sql`
      ALTER TABLE developers 
      ADD COLUMN IF NOT EXISTS payment_details TEXT
    `);
    
    // Add path and isPremium columns to time_tracking table
    console.log("Adding path and isPremium columns to time_tracking table...");
    await db.execute(sql`
      ALTER TABLE time_tracking 
      ADD COLUMN IF NOT EXISTS path TEXT,
      ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE
    `);
    
    // Add premiumMinutes and websitesCount columns to revenue table
    console.log("Adding premiumMinutes and websitesCount columns to revenue table...");
    await db.execute(sql`
      ALTER TABLE revenue 
      ADD COLUMN IF NOT EXISTS premium_minutes INTEGER,
      ADD COLUMN IF NOT EXISTS websites_count INTEGER
    `);
    
    // Update developer_earnings table to use amount instead of earnings
    console.log("Updating developer_earnings table...");
    // Check if the table exists first
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'developer_earnings'
      )
    `);
    
    if (tableExists.rows[0].exists) {
      // Check if earnings column exists
      const earningsColumnExists = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'developer_earnings' AND column_name = 'earnings'
        )
      `);
      
      if (earningsColumnExists.rows[0].exists) {
        await db.execute(sql`
          ALTER TABLE developer_earnings 
          ADD COLUMN IF NOT EXISTS amount INTEGER
        `);
        
        // Copy data from earnings to amount
        await db.execute(sql`
          UPDATE developer_earnings 
          SET amount = earnings 
          WHERE amount IS NULL AND earnings IS NOT NULL
        `);
        
        // Update other columns
        await db.execute(sql`
          ALTER TABLE developer_earnings 
          ADD COLUMN IF NOT EXISTS premium_minutes INTEGER,
          DROP COLUMN IF EXISTS total_time,
          DROP COLUMN IF EXISTS premium_time,
          DROP COLUMN IF EXISTS earnings
        `);
      }
    }
    
    // Add new columns to revenue_settings
    console.log("Updating revenue_settings table...");
    // Check if the table exists first
    const revSettingsExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'revenue_settings'
      )
    `);
    
    if (revSettingsExists.rows[0].exists) {
      await db.execute(sql`
        ALTER TABLE revenue_settings 
        ADD COLUMN IF NOT EXISTS premium_subscription_price INTEGER DEFAULT 999,
        ADD COLUMN IF NOT EXISTS developer_share INTEGER DEFAULT 70,
        ADD COLUMN IF NOT EXISTS platform_fee INTEGER DEFAULT 30,
        ADD COLUMN IF NOT EXISTS payout_threshold INTEGER DEFAULT 5000,
        ADD COLUMN IF NOT EXISTS payout_day INTEGER DEFAULT 15
      `);
    } else {
      // Create the revenue_settings table if it doesn't exist
      await db.execute(sql`
        CREATE TABLE revenue_settings (
          id SERIAL PRIMARY KEY,
          platform_fee_percentage DECIMAL(5,2) DEFAULT 30.00 NOT NULL,
          minimum_payout_amount INTEGER DEFAULT 1000 NOT NULL,
          payout_schedule TEXT DEFAULT 'monthly' NOT NULL,
          premium_subscription_price INTEGER DEFAULT 999,
          developer_share INTEGER DEFAULT 70,
          platform_fee INTEGER DEFAULT 30,
          payout_threshold INTEGER DEFAULT 5000,
          payout_day INTEGER DEFAULT 15,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        )
      `);
    }
    
    // Add month column to payouts if it exists
    console.log("Updating payouts table...");
    const payoutsExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'payouts'
      )
    `);
    
    if (payoutsExists.rows[0].exists) {
      await db.execute(sql`
        ALTER TABLE payouts 
        ADD COLUMN IF NOT EXISTS month TEXT
      `);
    }
    
    console.log("Database migrations completed successfully!");
  } catch (error) {
    console.error("Error during migration:", error);
  }
}

// Run the migration
migrate().catch(console.error);