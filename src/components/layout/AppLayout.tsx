import React from "react";
import { LayoutDashboard, Users, MessageSquare, Settings, Search, Bell, User as UserIcon, ShieldCheck, RefreshCw } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useIsFetching } from "@tanstack/react-query";
const NAV_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Patient Registry', icon: Users, path: '/patients' },
  { name: 'Patient Portal', icon: MessageSquare, path: '/portal' },
  { name: 'Clinic Settings', icon: Settings, path: '/settings' },
];
export function AppSidebar() {
  const { pathname } = useLocation();
  return (
    <div className="w-64 border-r bg-sidebar flex flex-col h-full shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-medical-blue rounded-xl flex items-center justify-center shadow-primary">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">Aura Health</span>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive ? "bg-medical-blue text-white shadow-md" : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "group-hover:text-medical-blue")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-6 border-t bg-slate-50/50">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-medical-stable animate-pulse" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Clinical Node: US-WEST</span>
        </div>
        <p className="text-[10px] text-muted-foreground font-medium">v2.4.0 • Aura EMR Core</p>
      </div>
    </div>
  );
}
export function AppLayout({ children }: { children: React.ReactNode }) {
  const isFetching = useIsFetching();
  return (
    <div className="flex h-screen bg-medical-bg overflow-hidden font-sans">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-white flex items-center justify-between px-8 z-30 shadow-sm shrink-0">
          <div className="flex-1 max-w-md">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-medical-blue transition-colors" />
              <Input
                placeholder="Search clinician database..."
                className="pl-10 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-medical-blue"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full border bg-slate-50 transition-all duration-300",
              isFetching ? "opacity-100 border-medical-blue/30" : "opacity-0 invisible"
            )}>
              <RefreshCw className="w-3 h-3 text-medical-blue animate-spin" />
              <span className="text-[10px] font-bold text-medical-blue uppercase tracking-tighter">Syncing Census</span>
            </div>
            <Button variant="ghost" size="icon" className="relative hover:bg-slate-100">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-medical-urgent rounded-full border-2 border-white" />
            </Button>
            <div className="w-px h-6 bg-slate-200 mx-2" />
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-none">Dr. Thorne</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Chief Surgeon</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shadow-sm">
                <UserIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-50/30">
          {children}
        </main>
      </div>
    </div>
  );
}