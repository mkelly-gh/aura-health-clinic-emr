import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, Users, MessageSquare, Settings, Search, Bell, User as UserIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
const NAV_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Patient Registry', icon: Users, path: '/patients' },
  { name: 'Patient Portal', icon: MessageSquare, path: '/portal' },
  { name: 'Clinic Settings', icon: Settings, path: '/settings' },
];
export function AppSidebar() {
  const { pathname } = useLocation();
  return (
    <div className="w-64 border-r bg-sidebar flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-medical-blue rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
          </div>
          <span className="font-bold text-xl tracking-tight">Aura Health</span>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive ? "bg-medical-blue text-white" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t text-xs text-muted-foreground text-center">
        Clinical v2.4.0
      </div>
    </div>
  );
}
export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-medical-bg overflow-hidden">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-white flex items-center justify-between px-8 z-10">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Quick search patients (MRN, Name)..." 
                className="pl-10 bg-secondary border-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-medical-urgent rounded-full" />
            </Button>
            <div className="w-px h-6 bg-border mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">Dr. Thorne</p>
                <p className="text-2xs text-muted-foreground uppercase tracking-wider">Chief Surgeon</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8 md:py-10 lg:py-12">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}