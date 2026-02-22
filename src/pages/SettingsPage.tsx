import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, Bell, Users, Database, Globe } from "lucide-react";
export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clinic Settings</h1>
        <p className="text-muted-foreground">Configure your EMR system and facility-wide protocols.</p>
      </div>
      <div className="grid gap-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-medical-blue" /> Security & Compliance
            </CardTitle>
            <CardDescription>Manage HIPAA data access and authentication standards.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Multi-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Require hardware key for surgical staff.</p>
              </div>
              <Switch checked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Automatic Log-off</Label>
                <p className="text-sm text-muted-foreground">Terminate session after 15 minutes of inactivity.</p>
              </div>
              <Switch checked />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-medical-urgent" /> Urgent Alerts
            </CardTitle>
            <CardDescription>Configure threshold for high-priority clinical interventions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Critical Vitals Notification</Label>
                <p className="text-sm text-muted-foreground">Direct page on aberrant telemetry readings.</p>
              </div>
              <Switch checked />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-medical-stable" /> EMR Infrastructure
            </CardTitle>
            <CardDescription>System diagnostics and database health metrics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-secondary/30 rounded-lg border flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold">Primary Region</p>
                  <p className="text-xs text-muted-foreground">Cloudflare Edge - West 1</p>
                </div>
              </div>
              <Badge className="bg-medical-stable text-white">OPERATIONAL</Badge>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline">Run Diagnostics</Button>
              <Button className="bg-medical-blue hover:bg-medical-blue/90 text-white">Update Core</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}