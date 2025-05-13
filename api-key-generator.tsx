import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const apiKeyFormSchema = z.object({
  name: z.string().min(3, "API key name must be at least 3 characters"),
  website: z.string().refine(
    val => val === "" || /^https?:\/\/\w+/.test(val), 
    "Please enter a valid URL starting with http:// or https://"
  ),
});

type ApiKeyFormValues = z.infer<typeof apiKeyFormSchema>;

export function ApiKeyGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: apiKeys = [], isLoading } = useQuery({
    queryKey: ["/api/keys"],
  });

  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeyFormSchema),
    defaultValues: {
      name: "",
      website: "",
    },
  });

  const createApiKeyMutation = useMutation({
    mutationFn: async (data: ApiKeyFormValues) => {
      const res = await apiRequest("POST", "/api/keys", data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      setNewApiKey(data.key);
      toast({
        title: "API key created",
        description: "Your new API key has been created successfully.",
      });
      form.reset();
    },
    onError: (error: any) => {
      console.error("API Key creation error:", error);
      
      // Try to extract a readable error message
      let errorMessage = "Unknown error occurred";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response && error.response.data) {
        errorMessage = typeof error.response.data === 'object' 
          ? JSON.stringify(error.response.data) 
          : String(error.response.data);
      } else if (typeof error === 'object') {
        errorMessage = JSON.stringify(error);
      }
      
      toast({
        title: "Failed to create API key",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
  
  const deleteApiKeyMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/keys/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      toast({
        title: "API key deleted",
        description: "The API key has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete API key",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ApiKeyFormValues) => {
    setIsGenerating(true);
    createApiKeyMutation.mutate(data);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The API key has been copied to your clipboard.",
    });
  };

  const confirmDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
      deleteApiKeyMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Generate New API Key
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription>
              Fill out the form below to generate a new API key for your application.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Web App" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive name to identify this API key
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      The URL of the website where this API key will be used (leave empty or enter a valid URL starting with http:// or https://)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={createApiKeyMutation.isPending}>
                  {createApiKeyMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate API Key"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
          
          {newApiKey && (
            <Alert className="mt-4">
              <AlertDescription className="break-all">
                <div className="font-semibold mb-2">Your new API key:</div>
                <div className="bg-muted p-2 rounded text-sm font-mono mb-2">
                  {newApiKey}
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  Copy this key now. For security reasons, you won't be able to see it again.
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyToClipboard(newApiKey)}
                  className="mt-2"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to Clipboard
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            Manage the API keys for your applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading your API keys...</p>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8 border rounded-md">
              <p className="text-muted-foreground mb-4">You don't have any API keys yet</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First API Key
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New API Key</DialogTitle>
                    <DialogDescription>
                      Fill out the form below to generate a new API key for your application.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Key Name</FormLabel>
                            <FormControl>
                              <Input placeholder="My Web App" {...field} />
                            </FormControl>
                            <FormDescription>
                              A descriptive name to identify this API key
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website URL (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              The URL of the website where this API key will be used (leave empty or enter a valid URL starting with http:// or https://)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button type="submit" disabled={createApiKeyMutation.isPending}>
                          {createApiKeyMutation.isPending ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            "Generate API Key"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                  
                  {newApiKey && (
                    <Alert className="mt-4">
                      <AlertDescription className="break-all">
                        <div className="font-semibold mb-2">Your new API key:</div>
                        <div className="bg-muted p-2 rounded text-sm font-mono mb-2">
                          {newApiKey}
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Copy this key now. For security reasons, you won't be able to see it again.
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => copyToClipboard(newApiKey)}
                          className="mt-2"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy to Clipboard
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key: any) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{key.website || "-"}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${key.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {key.active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => confirmDelete(key.id)}
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
