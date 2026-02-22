import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Settings,
  Search,
  Bell,
  User as UserIcon,
  ShieldCheck,
  RefreshCw,
  Menu,
  X
} from "lucide-react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useIsFetching } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { format } from "date-fns";
import { TooltipProvider } from "@/components/ui/tooltip";
const NAV_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Patient Registry', icon: Users, path: '/patients' },
  { name: 'Patient Portal', icon: MessageSquare, path: '/portal' },
  { name: 'Clinic Settings', icon: Settings, path: '/settings' },
];
const APP_VERSION = "1.0.0";
interface SidebarProps {
  onItemClick?: () => void;
  className?: string;
}
export function SidebarContent({ onItemClick, className }: SidebarProps) {
  const { pathname } = useLocation();
  return (
    <div className={cn("flex flex-col h-full shrink-0 relative z-40", className)}>
      <div className="p-8">
        <Link to="/" className="flex items-center gap-3 group" onClick={onItemClick}>
          <div className="w-10 h-10 bg-medical-blue rounded-xl flex items-center justify-center shadow-primary group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">Aura Health</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group relative overflow-hidden",
                isActive
                  ? "bg-medical-blue text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-50 hover:text-medical-blue"
              )}
            >
              <item.icon className={cn("w-5 h-5 relative z-10", isActive ? "text-white" : "group-hover:text-medical-blue")} />
              <span className="relative z-10">{item.name}</span>
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-6 border-t bg-slate-50/50 mt-auto">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-medical-stable animate-pulse" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">Clinical Node: LIVE</span>
        </div>
        <p className="text-[10px] text-muted-foreground font-bold opacity-60">EMR Core v{APP_VERSION} • SECURE</p>
      </div>
    </div>
  );
}
export function AppLayout() {
  const isFetching = useIsFetching();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentDate = format(new Date(), "yyyy-MM-dd");
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen bg-slate-50/50 overflow-hidden font-sans">
        <div className="hidden lg:block w-64 border-r bg-white shadow-sm shrink-0">
          <SidebarContent />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 border-b bg-white flex items-center justify-between px-4 sm:px-8 z-30 shadow-sm shrink-0">
            <div className="flex items-center gap-4 flex-1 max-w-md">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden shrink-0">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Navigation Menu</SheetTitle>
                  </SheetHeader>
                  <SidebarContent onItemClick={() => setIsMobileMenuOpen(false)} />
                </SheetContent>
              </Sheet>
              <div className="relative group flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-medical-blue transition-all duration-300" />
                <Input
                  placeholder="Search clinician database..."
                  className="pl-10 bg-slate-50/80 border-transparent focus:bg-white focus:border-medical-blue/30 focus-visible:ring-4 focus-visible:ring-medical-blue/10 h-10 text-sm rounded-xl transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className={cn(
                "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border bg-slate-50 transition-all duration-500",
                isFetching ? "opacity-100 border-medical-blue/30 translate-y-0" : "opacity-0 invisible -translate-y-1"
              )}>
                <RefreshCw className="w-3.5 h-3.5 text-medical-blue animate-spin" />
                <span className="text-[10px] font-bold text-medical-blue uppercase tracking-tighter">Syncing</span>
              </div>
              <Badge variant="outline" className="hidden md:flex bg-medical-blue/5 border-medical-blue/20 text-medical-blue text-[10px] font-bold px-2.5 py-1 tracking-tight shrink-0">
                v{APP_VERSION} • {currentDate}
              </Badge>
              <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-colors shrink-0">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-medical-urgent rounded-full border-2 border-white" />
              </Button>
              <div className="hidden sm:block w-px h-6 bg-slate-200 mx-1" />
              <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 leading-none group-hover:text-medical-blue transition-colors">Dr. Thorne</p>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Chief Surgeon</p>
                </div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shadow-sm group-hover:border-medical-blue group-hover:bg-white transition-all">
                  <UserIcon className="w-5 h-5 text-slate-600 group-hover:text-medical-blue" />
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto bg-slate-50/40">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}