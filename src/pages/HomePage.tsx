import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { DashboardStats } from "@shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Users, AlertCircle, LogOut, ChevronRight, Play, TrendingUp, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import {
  Tooltip as ShadTooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
const MOCK_CHART_DATA = [
  { name: 'Mon', volume: 42 }, { name: 'Tue', volume: 45 }, { name: 'Wed', volume: 38 },
  { name: 'Thu', volume: 51 }, { name: 'Fri', volume: 48 }, { name: 'Sat', volume: 55 }, { name: 'Sun', volume: 50 },
];
const APP_VERSION = "1.0.0";
export function HomePage() {
  const { data: stats, isLoading, isFetching, isError, refetch } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: () => api<DashboardStats>("/api/dashboard/stats"),
    retry: 1,
  });
  const cards = stats ? [
    { title: "Current Census", value: stats.census, icon: Users, color: "text-medical-blue", trend: "+2.5% vs avg", pulse: true },
    { title: "Urgent Care", value: stats.urgentCount, icon: AlertCircle, color: "text-medical-urgent", trend: "High Priority", pulse: false },
    { title: "Flow Velocity", value: `${stats.volumeTrend}%`, icon: Activity, color: "text-medical-blue", trend: "Stability Index", pulse: false },
    { title: "Discharged", value: stats.dischargedToday, icon: LogOut, color: "text-medical-stable", trend: "Processed", pulse: false },
  ] : [];
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 animate-fade-in">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-64" />
            <div className="flex gap-2">
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
      </div>
    );
  }
  if (isError || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">System Connection Interrupted</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            We couldn't synchronize the clinical census with the v{APP_VERSION} backend.
          </p>
          <Button onClick={() => refetch()} className="mt-6 bg-medical-blue hover:bg-medical-blue/90 gap-2">
            <RefreshCcw className="w-4 h-4" /> Re-sync Dashboard
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 animate-fade-in">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tighter text-foreground uppercase">Clinical Command</h1>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-medical-stable animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">Aura v{APP_VERSION} • LIVE DATA</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <ShadTooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="shadow-sm active:scale-95 transition-transform bg-white min-w-[120px]"
                >
                  <RefreshCcw className={cn("w-4 h-4 mr-2", isFetching && "animate-spin")} />
                  {isFetching ? "Syncing..." : "Refresh Data"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-[10px] font-bold">Connected to EMR v{APP_VERSION}</p>
              </TooltipContent>
            </ShadTooltip>
            <Button className="bg-medical-blue hover:bg-medical-blue/90 text-white shadow-primary active:scale-95 transition-all">New Admission</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <Card key={card.title} className="shadow-soft hover:shadow-md hover:-translate-y-1 transition-all duration-300 border-border group bg-white relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{card.title}</CardTitle>
                <div className={cn("p-2 rounded-lg bg-slate-50 transition-colors group-hover:bg-white", card.color)}>
                  <card.icon className={cn("w-4 h-4", card.pulse && "animate-pulse")} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-extrabold tracking-tight">{card.value}</div>
                  {card.pulse && (
                    <div className="flex gap-1 items-end h-4 mb-1">
                      <div className="w-1 bg-medical-blue/40 h-1 animate-[bounce_1s_infinite_0ms]" />
                      <div className="w-1 bg-medical-blue/40 h-3 animate-[bounce_1s_infinite_200ms]" />
                      <div className="w-1 bg-medical-blue/40 h-2 animate-[bounce_1s_infinite_400ms]" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-semibold">
                  <TrendingUp className="w-3 h-3 text-medical-stable" /> {card.trend}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 shadow-soft border-border bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <CardTitle className="text-lg font-bold">Facility Volume Trend</CardTitle>
              <Badge variant="secondary" className="text-[9px] font-extrabold uppercase bg-medical-blue/10 text-medical-blue border-none tracking-widest px-2 py-0.5">
                v{APP_VERSION} Analysis
              </Badge>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_CHART_DATA}>
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                      dx={-10}
                    />
                    <RechartsTooltip
                      cursor={{ stroke: '#0EA5E9', strokeWidth: 1, strokeDasharray: '4 4' }}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                        padding: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(4px)'
                      }}
                      labelStyle={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}
                      formatter={(value) => [`${value} Patients`, 'Census Volume']}
                    />
                    <Area
                      type="basis"
                      dataKey="volume"
                      stroke="#0EA5E9"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorVolume)"
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft overflow-hidden border-border h-full bg-white flex flex-col">
            <CardHeader className="bg-medical-blue text-white pb-6 shrink-0">
              <CardTitle className="text-lg font-bold">Rapid Response</CardTitle>
              <p className="text-sm text-white/80 font-medium">Standard EMR Core {APP_VERSION}</p>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="bg-white rounded-t-2xl -mt-3 p-5 space-y-3 relative z-10 flex-1">
                <Button variant="outline" className="w-full justify-between hover:bg-red-50 hover:text-red-600 hover:border-red-200 border-slate-100 h-12 rounded-xl transition-all group active:scale-[0.98]">
                  <span className="font-bold text-sm">Emergency Triage</span>
                  <Play className="w-4 h-4 text-medical-urgent fill-current group-hover:scale-110 transition-transform" />
                </Button>
                <Button variant="outline" className="w-full justify-between hover:bg-medical-blue/5 hover:border-medical-blue/20 border-slate-100 h-12 rounded-xl transition-all group active:scale-[0.98]">
                  <span className="font-bold text-sm text-slate-700">Census Audit</span>
                  <ChevronRight className="w-4 h-4 text-medical-blue group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" className="w-full justify-between hover:bg-medical-blue/5 border-slate-100 h-12 rounded-xl transition-all active:scale-[0.98]">
                  <span className="font-bold text-sm text-slate-700">Lab Review</span>
                  <Badge className="h-5 px-1.5 bg-medical-urgent text-white border-none text-[10px] font-bold shadow-sm">2 NEW</Badge>
                </Button>
                <div className="pt-6 mt-4 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-4 tracking-[0.2em]">On-Call Staff</p>
                  <div className="flex -space-x-2.5">
                    {['T', 'K', 'V', 'A'].map((initial, i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-extrabold text-slate-600 shadow-sm ring-1 ring-slate-200">
                        {initial}
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-medical-blue text-white flex items-center justify-center text-[10px] font-extrabold shadow-primary">
                      +4
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-3 shadow-soft border-border bg-white">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg font-bold">Recent Clinical Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {!stats.recentActivity || stats.recentActivity.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground italic font-medium">No recent activity recorded.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-10 gap-y-6">
                  {stats.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 group p-3 rounded-2xl transition-all border border-transparent hover:bg-slate-50 hover:border-slate-200 hover:scale-[1.01] cursor-pointer"
                    >
                      <Avatar className="w-12 h-12 shadow-sm group-hover:shadow-primary/20 transition-all shrink-0 border-2 border-white">
                        <AvatarImage src={activity.patientAvatar} />
                        <AvatarFallback className="bg-slate-100 font-extrabold text-xs text-slate-500">
                          {activity.patientName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4 mb-0.5">
                          <Link to={`/patients/${activity.patientId}`} className="text-sm font-bold hover:text-medical-blue transition-colors truncate text-slate-900">
                            {activity.patientName}
                          </Link>
                          <span className="text-[10px] text-muted-foreground uppercase font-extrabold tracking-tighter shrink-0 bg-slate-100 px-1.5 py-0.5 rounded">
                            {formatDistanceToNow(activity.timestamp)} ago
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate font-medium mb-2">{activity.description}</p>
                        <Badge variant="outline" className="text-[9px] uppercase px-2 h-4 font-bold border-medical-blue/20 bg-medical-blue/5 text-medical-blue tracking-tighter">
                          {activity.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}