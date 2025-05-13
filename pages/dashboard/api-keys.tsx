import { DashboardLayout } from "@/layouts/dashboard-layout";
import { ApiKeyGenerator } from "@/components/api-key-generator";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApiKeys() {
  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ["/api/keys"],
  });

  return (
    <DashboardLayout>
      <Helmet>
        <title>API Keys - JagJar</title>
        <meta name="description" content="Generate and manage your JagJar API keys for your web applications." />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-muted-foreground">Generate and manage API keys for your applications</p>
        </div>

        <ApiKeyGenerator />

        <Card>
          <CardHeader>
            <CardTitle>API Key Security Best Practices</CardTitle>
            <CardDescription>Follow these guidelines to keep your API keys secure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">Treat API keys like passwords</h3>
              <p className="text-sm text-muted-foreground">Never share your API keys in publicly accessible areas such as GitHub, client-side code, or forums.</p>
            </div>
            
            <div>
              <h3 className="font-semibold">Rotate API keys regularly</h3>
              <p className="text-sm text-muted-foreground">Generate new API keys periodically and deprecate old ones to limit the damage if a key is compromised.</p>
            </div>
            
            <div>
              <h3 className="font-semibold">Restrict API key usage</h3>
              <p className="text-sm text-muted-foreground">Use different API keys for different websites to minimize impact if a key is compromised.</p>
            </div>
            
            <div>
              <h3 className="font-semibold">Monitor API key usage</h3>
              <p className="text-sm text-muted-foreground">Regularly check the Analytics section to monitor usage patterns and detect potential unauthorized use.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
