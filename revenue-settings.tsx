import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Loader2, Save, RefreshCw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Validation schema
const revenueSettingsSchema = z.object({
  platformFeePercentage: z.coerce.number().min(1).max(99),
  developerShare: z.coerce.number().min(1).max(99),
  minimumPayoutAmount: z.coerce.number().min(100).max(10000),
  payoutSchedule: z.enum(["weekly", "biweekly", "monthly"]),
  premiumSubscriptionPrice: z.coerce.number().min(100).max(10000),
  highPerformanceBonusThreshold: z.coerce.number().min(60).max(10000),
  highPerformanceBonusMultiplier: z.coerce.number().min(1).max(5),
});

type RevenueSettingsFormValues = z.infer<typeof revenueSettingsSchema>;

export default function RevenueSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // State to hold the settings
  const [settings, setSettings] = useState<RevenueSettingsFormValues | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  
  // Direct fetch function that bypasses react-query
  const fetchSettings = async () => {
    try {
      setIsLoadingSettings(true);
      console.log("🔄 Directly fetching settings...");
      
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/admin/revenue/settings?_nocache=${timestamp}`, {
        credentials: "include",
        headers: {
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch revenue settings");
      }
      
      const data = await response.json();
      console.log("📥 Received settings data:", data);
      setSettings(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Error",
        description: "Failed to load revenue settings",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSettings(false);
    }
  };
  
  // Initial fetch on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  // Default values for the form
  const defaultValues: RevenueSettingsFormValues = {
    platformFeePercentage: 30,
    developerShare: 70,
    minimumPayoutAmount: 1000,
    payoutSchedule: "monthly",
    premiumSubscriptionPrice: 2500,
    highPerformanceBonusThreshold: 120,
    highPerformanceBonusMultiplier: 1.5,
  };

  // Create form with react-hook-form
  const form = useForm<RevenueSettingsFormValues>({
    resolver: zodResolver(revenueSettingsSchema),
    defaultValues: settings || defaultValues,
  });

  // Reset form when settings are loaded
  useEffect(() => {
    if (settings) {
      console.log("Resetting form with new settings:", settings);
      form.reset({
        platformFeePercentage: settings.platformFeePercentage,
        developerShare: settings.developerShare,
        minimumPayoutAmount: settings.minimumPayoutAmount,
        payoutSchedule: settings.payoutSchedule,
        premiumSubscriptionPrice: settings.premiumSubscriptionPrice,
        highPerformanceBonusThreshold: settings.highPerformanceBonusThreshold,
        highPerformanceBonusMultiplier: settings.highPerformanceBonusMultiplier,
      });
    }
  }, [settings, form]);

  // Direct mutation function (replaces react-query mutation)
  const updateSettings = async (data: RevenueSettingsFormValues) => {
    try {
      setIsLoading(true);
      console.log("🔄 Submitting data directly:", data);
      
      // Ensure numeric values
      const formattedData = {
        ...data,
        platformFeePercentage: Number(data.platformFeePercentage),
        developerShare: Number(data.developerShare),
        minimumPayoutAmount: Number(data.minimumPayoutAmount),
        premiumSubscriptionPrice: Number(data.premiumSubscriptionPrice),
        highPerformanceBonusThreshold: Number(data.highPerformanceBonusThreshold),
        highPerformanceBonusMultiplier: Number(data.highPerformanceBonusMultiplier),
      };
      
      // Make the API call directly
      const response = await fetch("/api/admin/revenue/settings", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store",
          "Pragma": "no-cache"
        },
        body: JSON.stringify(formattedData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update revenue settings");
      }
      
      const responseData = await response.json();
      console.log("✅ Update successful, received:", responseData);
      
      // Show success message
      toast({
        title: "Settings updated",
        description: "Revenue settings have been successfully updated.",
      });
      
      // Immediately fetch fresh data
      await fetchSettings();
      
      return responseData;
    } catch (error) {
      console.error("❌ Update error:", error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update revenue settings.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Form submission handler
  async function onSubmit(data: RevenueSettingsFormValues) {
    console.log("Form submitted with values:", data);
    
    try {
      // Use our direct update function instead of react-query mutation
      await updateSettings(data);
      
      // Update form with latest data after successful update
      if (settings) {
        form.reset(settings);
      }
    } catch (error) {
      console.error("Submit error:", error);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Revenue Settings</h2>
        <p className="text-muted-foreground">
          Configure platform revenue sharing and payout settings
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Platform Fee and Revenue Sharing</CardTitle>
              <CardDescription>
                Configure how revenue is split between the platform and developers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="platformFeePercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform Fee Percentage</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Slider
                            value={[field.value]}
                            min={1}
                            max={99}
                            step={1}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            {...field}
                            className="w-20"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                          <span>%</span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Percentage of revenue retained by the platform
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="developerShare"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Developer Share</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Slider
                            value={[field.value]}
                            min={1}
                            max={99}
                            step={1}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            {...field}
                            className="w-20"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                          <span>%</span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Percentage of revenue distributed to developers
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="premiumSubscriptionPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Premium Subscription Price</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <span>$</span>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Monthly price for premium subscriptions (in cents)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payouts Configuration</CardTitle>
              <CardDescription>
                Set payout schedules and minimum thresholds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="minimumPayoutAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Payout Amount</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <span>$</span>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Minimum earnings required for payout (in cents)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payoutSchedule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payout Schedule</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a schedule" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How often payouts are processed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Bonuses</CardTitle>
              <CardDescription>
                Configure bonuses for high-performing websites
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="highPerformanceBonusThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>High Performance Threshold</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                          <span className="text-muted-foreground">minutes</span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Minutes per month required to qualify for bonus
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="highPerformanceBonusMultiplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bonus Multiplier</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Slider
                            value={[field.value]}
                            min={1}
                            max={5}
                            step={0.1}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            {...field}
                            className="w-20"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                          <span>x</span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Revenue multiplier for high-performing websites
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4 sm:flex-row sm:gap-2">
            <Button
              type="submit"
              disabled={isLoading || isLoadingSettings}
              className="flex-1 sm:flex-initial"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => settings && form.reset(settings)}
              disabled={isLoading || isLoadingSettings}
              className="flex-1 sm:flex-initial"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}