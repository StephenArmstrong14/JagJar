import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Check, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function RevenueTrigger() {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(
    // Default to previous month since you typically calculate after a month ends
    (() => {
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      return date.toISOString().slice(0, 7); // YYYY-MM format
    })()
  );
  
  // Generate months for dropdown (6 months back)
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStr = date.toISOString().slice(0, 7);
    const label = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    return { value: monthStr, label };
  });

  // Mutation for triggering revenue calculation
  const calculateMutation = useMutation({
    mutationFn: async (month: string) => {
      const response = await apiRequest(
        "POST",
        "/api/admin/revenue/calculate",
        { month }
      );
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Revenue calculation completed",
        description: `Successfully processed revenue for ${data.month}. ${data.developerCount} developers received payouts.`,
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Revenue calculation failed",
        description: error.message || "An error occurred while calculating revenue",
        variant: "destructive",
      });
    },
  });

  // Handle trigger calculation
  const handleCalculate = () => {
    if (window.confirm(`Are you sure you want to calculate revenue for ${selectedMonth}? This process cannot be undone.`)) {
      calculateMutation.mutate(selectedMonth);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Revenue Calculation</h2>
        <p className="text-muted-foreground">
          Trigger the revenue calculation process for a specific month
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Calculation</CardTitle>
          <CardDescription>
            This will calculate earnings for all developers based on premium usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end">
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Select Month
              </label>
              <Select
                value={selectedMonth}
                onValueChange={setSelectedMonth}
                disabled={calculateMutation.isPending}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Choose the month for which to calculate developer revenue
              </p>
            </div>
            <Button
              onClick={handleCalculate}
              disabled={calculateMutation.isPending || !selectedMonth}
              className="md:w-auto"
              size="lg"
            >
              {calculateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>Calculate Revenue</>
              )}
            </Button>
          </div>

          {calculateMutation.isSuccess && (
            <div className="p-4 border rounded-md bg-green-50 text-green-800 flex items-center">
              <Check className="h-5 w-5 mr-2" />
              <div>
                <p className="font-medium">Revenue calculation completed successfully</p>
                <p className="text-sm">
                  The calculation for {calculateMutation.data?.month} has been processed.
                  {calculateMutation.data?.developerCount} developers received payouts.
                </p>
              </div>
            </div>
          )}

          {calculateMutation.isError && (
            <div className="p-4 border rounded-md bg-red-50 text-red-800 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <div>
                <p className="font-medium">Revenue calculation failed</p>
                <p className="text-sm">
                  {calculateMutation.error instanceof Error
                    ? calculateMutation.error.message
                    : "An unknown error occurred"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Important Information</CardTitle>
          <CardDescription>
            About the revenue calculation process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-md bg-blue-50 text-blue-800">
              <h3 className="font-medium mb-1">What happens during calculation?</h3>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Premium user engagement time is tallied for each website</li>
                <li>Revenue is distributed based on engagement time percentages</li>
                <li>High-performing websites receive bonus multipliers</li>
                <li>Developer earnings records are created in the database</li>
                <li>Payout records are prepared for processing</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-md bg-amber-50 text-amber-800">
              <h3 className="font-medium mb-1">Warning</h3>
              <p className="text-sm">
                This process should only be run once per month. Running it multiple
                times for the same month may result in duplicate earnings records.
                Ensure all user activity data has been collected before triggering.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}