import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { DashboardStats } from "@shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Users, AlertCircle, LogOut, ChevronRight, Play, TrendingUp, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
const MOCK_CHART_DATA = [
  { name: 'Mon', volume: 42 }, { name: 'Tue', volume: 45 }, { name: 'Wed', volume: 38 },
  { name: 'Thu', volume: 51 }, { name: 'Fri', volume: 48 }, { name: 'Sat', volume: 55 }, { name: 'Sun', volume: 50 },
];
export default function DashboardPage() {
  const { data: stats, isLoading, isError, refetch } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: () => api<DashboardStats>("/api/dashboard/stats"),
    retry: 1,
  });
  const cards = stats ? [
    { title: "Current Census", value: stats.census, icon: Users, color: "text-medical-blue", trend: "+2.5% vs avg" },
    { title: "Urgent Care", value: stats.urgentCount, icon: AlertCircle, color: "text-medical-urgent", trend: "High Priority" },
    { title: "Flow Velocity", value: `${stats.volumeTrend}%`, icon: Activity, color: "text-medical-blue", trend: "Stability Index" },
    { title: "Discharged", value: stats.dischargedToday, icon: LogOut, color: "text-medical-stable", trend: "Processed" },
  ] : [];
  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="lg:col-span-2 h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }
  if (isError || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold">System Connection Interrupted</h2>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          We couldn't synchronize the clinical census. This may happen during initial system seeding.
        </p>
        <Button onClick={() => refetch()} className="mt-6 bg-medical-blue hover:bg-medical-blue/90 gap-2">
          <RefreshCcw className="w-4 h-4" /> Re-sync Dashboard
        </Button>
      </div>
    );
  }
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CLINICAL COMMAND</h1>
          <p className="text-muted-foreground">Facility status and real-time clinical throughput.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => refetch()} className="shadow-sm">Refresh Data</Button>
          <Button className="bg-medical-blue hover:bg-medical-blue/90 text-white shadow-primary">New Admission</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Card key={card.title} className="shadow-soft hover:shadow-md transition-shadow border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">{card.title}</CardTitle>
              <card.icon className={cn("w-4 h-4", card.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-medium">
                <TrendingUp className="w-3 h-3 text-medical-stable" /> {card.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-soft border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Facility Volume Trend</CardTitle>
            <Badge variant="secondary" className="text-2xs">ACTIVE WINDOW</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_CHART_DATA}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="volume" stroke="#0EA5E9" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft overflow-hidden border-border h-full">
          <CardHeader className="bg-medical-blue text-white pb-6">
            <CardTitle className="text-lg">Rapid Response</CardTitle>
            <p className="text-sm text-white/90">Critical protocols and shortcuts.</p>
          </CardHeader>
          <CardContent className="p-0 -mt-2">
            <div className="bg-white rounded-t-xl p-5 space-y-4">
              <Button variant="outline" className="w-full justify-between hover:bg-medical-blue/5 border-medical-blue/10">
                Emergency Triage <Play className="w-4 h-4 text-medical-urgent" />
              </Button>
              <Button variant="outline" className="w-full justify-between hover:bg-medical-blue/5 border-medical-blue/10">
                Census Audit <ChevronRight className="w-4 h-4 text-medical-blue" />
              </Button>
              <Button variant="outline" className="w-full justify-between hover:bg-medical-blue/5 border-medical-blue/10">
                Lab Review <Badge className="h-4 px-1 bg-medical-urgent text-white">2</Badge>
              </Button>
              <div className="pt-8 border-t border-slate-100">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-4 tracking-[0.15em]">Staff Presence</p>
                <div className="flex -space-x-2">
                  {['T', 'K', 'V', 'A', 'B'].map((initial, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-200">
                      {initial}
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-medical-blue text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    +4
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 shadow-soft border-border">
          <CardHeader>
            <CardTitle className="text-lg">Recent Clinical Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground italic">No recent flow activity recorded.</div>
            ) : (
              <div className="space-y-6">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 group hover:bg-slate-50 p-2 rounded-lg transition-colors">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-medical-blue group-hover:text-white transition-colors">
                      {activity.patientName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <Link to={`/patients/${activity.patientId}`} className="text-sm font-semibold hover:text-medical-blue hover:underline truncate">
                          {activity.patientName}
                        </Link>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold shrink-0">
                          {formatDistanceToNow(activity.timestamp)} ago
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase h-5 font-bold">
                      {activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}