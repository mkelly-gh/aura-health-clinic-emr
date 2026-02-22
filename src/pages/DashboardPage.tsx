import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { DashboardStats } from "@shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, AlertCircle, LogOut, ChevronRight, Play, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
const MOCK_CHART_DATA = [
  { name: 'Mon', volume: 42 },
  { name: 'Tue', volume: 45 },
  { name: 'Wed', volume: 38 },
  { name: 'Thu', volume: 51 },
  { name: 'Fri', volume: 48 },
  { name: 'Sat', volume: 55 },
  { name: 'Sun', volume: 50 },
];
export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: () => api<DashboardStats>("/api/dashboard/stats"),
  });
  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground animate-pulse text-lg font-medium">Synchronizing Clinical Systems...</p>
      </div>
    );
  }
  const cards = [
    { title: "Current Census", value: stats.census, icon: Users, color: "text-medical-blue", trend: "+2.5% from peak" },
    { title: "Urgent Care", value: stats.urgentCount, icon: AlertCircle, color: "text-medical-urgent", trend: "High Priority" },
    { title: "Flow Velocity", value: `${stats.volumeTrend}%`, icon: Activity, color: "text-medical-blue", trend: "Daily Capacity" },
    { title: "Discharged", value: stats.dischargedToday, icon: LogOut, color: "text-medical-stable", trend: "Processed Today" },
  ];
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CLINICAL COMMAND</h1>
          <p className="text-muted-foreground">Real-time facility status and patient metrics.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="shadow-sm">Export Census</Button>
          <Button className="bg-medical-blue hover:bg-medical-blue/90 text-white shadow-primary">Add Admission</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Card key={card.title} className="shadow-soft hover:scale-[1.02] transition-transform cursor-default">
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
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Facility Volume Trend</CardTitle>
            <Badge variant="secondary" className="text-2xs">LAST 7 DAYS</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_CHART_DATA}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#888' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#888' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#0EA5E9" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorVolume)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft overflow-hidden">
          <CardHeader className="bg-medical-blue text-white pb-6">
            <CardTitle className="text-lg">Clinical Actions</CardTitle>
            <p className="text-sm text-white/80">Active protocols & triage shortcuts.</p>
          </CardHeader>
          <CardContent className="p-0 -mt-2">
            <div className="bg-white rounded-t-xl p-4 space-y-3">
              <Button variant="outline" className="w-full justify-between hover:bg-medical-blue/5 border-medical-blue/20">
                Emergency Triage <Play className="w-4 h-4 text-medical-urgent" />
              </Button>
              <Button variant="outline" className="w-full justify-between hover:bg-medical-blue/5 border-medical-blue/20">
                Census Review <ChevronRight className="w-4 h-4 text-medical-blue" />
              </Button>
              <Button variant="outline" className="w-full justify-between hover:bg-medical-blue/5 border-medical-blue/20">
                Laboratory Inbox <Badge className="h-4 px-1 bg-medical-urgent">2</Badge>
              </Button>
              <div className="pt-6 border-t mt-4">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-3 tracking-widest">Active Staff On-Duty</p>
                <div className="flex -space-x-3">
                  {['T', 'K', 'V', 'A'].map((initial, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground shadow-sm">
                      {initial}
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-4 border-white bg-medical-blue text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    +3
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Patient Flow Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-medical-blue group-hover:text-white transition-colors">
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
                  <Badge variant="outline" className="text-[10px] uppercase h-5">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}