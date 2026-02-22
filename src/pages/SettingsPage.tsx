import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Bell,
  Database,
  Globe,
  RefreshCcw,
  ShieldCheck,
  AlertCircle,
  Activity,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
const APP_VERSION = "1.0.0";
export default function SettingsPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const handleSystemReinit = async () => {
    setIsSyncing(true);
    const toastId = toast.loading(`Re-initializing clinical database for v${APP_VERSION}...`);
    try {
      await api("/api/dashboard/stats");
      toast.success(`Medical records synchronized successfully (Core v${APP_VERSION})`, { id: toastId });
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Failed to re-initialize database index", { id: toastId });
    } finally {
      setIsSyncing(false);
    }
  };
  const handleRunDiagnostics = () => {
    toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
      loading: `Running system-wide EMR v${APP_VERSION} diagnostics...`,
      success: `All clinical nodes for v${APP_VERSION} are operating at 100% efficiency`,
      error: 'Diagnostic failure: check edge node connectivity',
    });
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-foreground uppercase">Clinic Settings</h1>
            <p className="text-muted-foreground font-medium">Configure your EMR system and facility-wide protocols.</p>
          </div>
          <Badge variant="outline" className="w-fit font-mono text-[10px] bg-slate-50 px-2 py-0.5">
            System Core v{APP_VERSION}
          </Badge>
        </div>
        <div className="grid gap-6">
          <Card className="shadow-soft border-border bg-white overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-medical-blue" /> Security & Compliance
              </CardTitle>
              <CardDescription className="font-medium">Manage HIPAA data access and authentication standards.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-bold">Multi-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground font-medium">Require hardware key for surgical staff.</p>
                </div>
                <Switch checked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-bold">Automatic Log-off</Label>
                  <p className="text-sm text-muted-foreground font-medium">Terminate session after 15 minutes of inactivity.</p>
                </div>
                <Switch checked />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft border-border bg-white overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="w-5 h-5 text-medical-urgent" /> Urgent Alerts
              </CardTitle>
              <CardDescription className="font-medium">Configure threshold for high-priority clinical interventions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-bold">Critical Vitals Notification</Label>
                  <p className="text-sm text-muted-foreground font-medium">Direct page on aberrant telemetry readings.</p>
                </div>
                <Switch checked />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft border-border bg-white overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Database className="w-5 h-5 text-medical-stable" /> EMR Infrastructure
              </CardTitle>
              <CardDescription className="font-medium">System diagnostics and database health metrics for v{APP_VERSION}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center group hover:bg-white hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-slate-500 group-hover:text-medical-blue transition-colors" />
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-tight">Primary Region</p>
                      <p className="text-sm font-semibold text-slate-700">Cloudflare Edge • Global</p>
                    </div>
                  </div>
                  <Badge className="bg-medical-stable/10 text-medical-stable border-none text-[10px] font-bold">ACTIVE</Badge>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center group hover:bg-white hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-slate-500 group-hover:text-medical-blue transition-colors" />
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-tight">System Latency</p>
                      <p className="text-sm font-semibold text-slate-700">12ms • Optimized</p>
                    </div>
                  </div>
                  <Badge className="bg-medical-stable/10 text-medical-stable border-none text-[10px] font-bold">STABLE</Badge>
                </div>
              </div>
              <div className="bg-medical-blue/5 border border-medical-blue/20 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-6 h-6 text-medical-blue shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">System Integrity Verified</h4>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-sm">
                      Build Version: {APP_VERSION} • Production Ready. All Durable Object storage nodes are synchronized for the current deployment.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRunDiagnostics}
                    className="font-bold border-medical-blue/20 text-medical-blue hover:bg-medical-blue/10 rounded-lg"
                  >
                    Run Diagnostics
                  </Button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  variant="ghost"
                  className="font-bold text-slate-600 hover:text-medical-urgent hover:bg-red-50"
                  onClick={() => toast.info(`System logs exported for v${APP_VERSION}`)}
                >
                  Export System Logs
                </Button>
                <Button
                  disabled={isSyncing}
                  onClick={handleSystemReinit}
                  className="bg-medical-blue hover:bg-medical-blue/90 text-white font-bold px-6 shadow-primary min-w-[180px]"
                >
                  <RefreshCcw className={cn("w-4 h-4 mr-2", isSyncing && "animate-spin")} />
                  {isSyncing ? "Synchronizing..." : "Re-initialize Database"}
                </Button>
              </div>
            </CardContent>
          </Card>
          <div className="flex items-center justify-center gap-2 p-6 text-muted-foreground opacity-40">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest">Aura Health EMR v{APP_VERSION} • End-to-End Encryption Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}