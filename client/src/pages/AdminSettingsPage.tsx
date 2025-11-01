import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold" data-testid="admin-settings-title">
            Platform Settings
          </h2>
          <p className="text-muted-foreground mt-2">
            Configure platform-wide settings and preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              <CardTitle>Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Platform settings configuration coming soon. This page will allow you to manage:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Email notification settings</li>
              <li>Content moderation rules</li>
              <li>Payment gateway configuration</li>
              <li>Platform branding and customization</li>
              <li>Security and privacy settings</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
