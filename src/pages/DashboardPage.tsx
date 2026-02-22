import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { DashboardStats } from "@shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, AlertCircle, LogOut, ChevronRight, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: () => api<DashboardStats>("/api/dashboard/stats"),
  });
  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground animate-pulse">Synchronizing Clinical Data...</p>
      </div>
    );
  }
  const cards = [
    { title: "Current Census", value: stats.census, icon: Users, color: "text-medical-blue", trend: "+2.5%" },
    { title: "Urgent Interventions", value: stats.urgentCount, icon: AlertCircle, color: "text-medical-urgent", trend: "Needs Attention" },
    { title: "Today's Volume", value: stats.dischargedToday + stats.census, icon: Activity, color: "text-medical-blue", trend: `${stats.volumeTrend}%` },
    { title: "Discharged Today", value: stats.dischargedToday, icon: LogOut, color: "text-medical-stable", trend: "On Track" },
  ];
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CLINICAL COMMAND</h1>
          <p className="text-muted-foreground">Real-time facility status and census metrics.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Download Report</Button>
          <Button className="bg-medical-blue hover:bg-medical-blue/90">Add Patient</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Card key={card.title} className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={cn("w-4 h-4", card.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-xs">
                    {activity.patientName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{activity.patientName}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(activity.timestamp)} ago
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                  <Badge variant="outline" className="text-2xs uppercase">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft bg-medical-blue text-white border-none">
          <CardHeader>
            <CardTitle className="text-lg text-white">Direct Protocols</CardTitle>
            <p className="text-sm text-white/80">Quick actions for active clinic management.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="secondary" className="w-full justify-between bg-white/10 hover:bg-white/20 border-none text-white">
              Emergency Admission <Play className="w-4 h-4" />
            </Button>
            <Button variant="secondary" className="w-full justify-between bg-white/10 hover:bg-white/20 border-none text-white">
              Triage Assessment <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="secondary" className="w-full justify-between bg-white/10 hover:bg-white/20 border-none text-white">
              Telehealth Link <ChevronRight className="w-4 h-4" />
            </Button>
            <div className="pt-4 mt-4 border-t border-white/10">
              <p className="text-xs font-medium mb-2 opacity-80 uppercase">Duty Roster</p>
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-medical-blue bg-white flex items-center justify-center text-medical-blue font-bold text-xs">
                    {i}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}