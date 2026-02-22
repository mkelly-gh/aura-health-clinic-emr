import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api-client";
import { Patient, PatientStatus } from "@shared/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, AlertTriangle, UserPlus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const navigate = useNavigate();
  const { data: patientPage, isLoading, isError, refetch } = useQuery<{ items: Patient[] }>({
    queryKey: ["patients"],
    queryFn: () => api<{ items: Patient[] }>("/api/patients"),
    retry: 1,
  });
  const filteredPatients = patientPage?.items.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.mrn.toLowerCase().includes(search.toLowerCase()) ||
      p.primaryDiagnosis.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Urgent': return 'bg-red-600 text-white border-transparent shadow-sm';
      case 'Observation': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Stable': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Discharged': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 animate-fade-in">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-foreground uppercase">Patient Registry</h1>
            <p className="text-muted-foreground font-medium">Comprehensive clinical census and records.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => refetch()} className="bg-white"><RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} /></Button>
            <Button className="bg-medical-blue hover:bg-medical-blue/90 text-white gap-2 shadow-primary active:scale-95 transition-all">
              <UserPlus className="w-4 h-4" /> New Admission
            </Button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Filter by name, MRN, or diagnosis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 bg-white border-slate-200 focus-visible:ring-medical-blue h-11 rounded-xl shadow-sm"
              disabled={isLoading}
            />
          </div>
          <Tabs defaultValue="All" className="w-full md:w-auto" onValueChange={setStatusFilter}>
            <TabsList className="bg-white border shadow-sm p-1 h-11 rounded-xl">
              {["All", "Urgent", "Observation", "Stable"].map((v) => (
                <TabsTrigger key={v} value={v} className="text-xs px-5 font-bold tracking-tight rounded-lg data-[state=active]:bg-medical-blue data-[state=active]:text-white transition-all duration-200">
                  {v === "Observation" ? "Obs" : v}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div className="bg-white rounded-2xl border border-border shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b">
                <TableRow>
                  <TableHead className="w-[140px] font-bold text-[10px] uppercase tracking-widest text-slate-500 py-4 pl-6">MRN</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-500 py-4 px-6">Patient Profile</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-500 py-4 px-6">Status</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-500 py-4 px-6">Clinical Diagnosis</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-500 py-4 px-6">Last Evaluation</TableHead>
                  <TableHead className="text-right font-bold text-[10px] uppercase tracking-widest text-slate-500 py-4 pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-32">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-medical-blue border-t-transparent rounded-full animate-spin" />
                        <p className="text-muted-foreground text-sm font-bold tracking-tight animate-pulse">Accessing secure medical storage...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-32">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-red-50 rounded-2xl text-red-600 border border-red-100">
                          <AlertTriangle className="w-8 h-8" />
                        </div>
                        <p className="text-red-700 font-bold text-lg">Registry Retrieval Failed</p>
                        <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2 font-bold px-6 border-red-200 text-red-700 hover:bg-red-50">Retry Sync</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredPatients?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-32">
                      <div className="max-w-sm mx-auto">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">No matching records</p>
                        <p className="text-muted-foreground text-xs font-medium italic">Refine your search parameters or check your filters.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredPatients?.map((patient) => (
                  <TableRow
                    key={patient.id}
                    className="cursor-pointer hover:bg-slate-50/80 transition-all group border-b last:border-0"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    <TableCell className="font-mono text-[11px] font-extrabold text-medical-blue py-5 pl-6">
                      {patient.mrn}
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex items-center gap-4 py-1">
                        <Avatar className="w-11 h-11 border-2 border-white shadow-sm ring-1 ring-slate-100 transition-transform group-hover:scale-105">
                          <AvatarImage src={patient.avatarUrl} alt={patient.name} />
                          <AvatarFallback className="bg-slate-100 text-slate-500 font-extrabold text-[10px]">
                            {patient.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-900 group-hover:text-medical-blue transition-colors text-sm truncate">{patient.name}</span>
                          <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-tighter">{patient.gender.charAt(0)} • {patient.age} YEARS</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6">
                      <Badge variant="outline" className={cn("px-2.5 py-0.5 font-extrabold uppercase text-[9px] tracking-widest", getStatusStyle(patient.status))}>
                        {patient.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex flex-col max-w-[300px]">
                        <span className="text-sm font-bold text-slate-700 truncate mb-0.5">{patient.primaryDiagnosis.description}</span>
                        <span className="text-[10px] text-muted-foreground font-mono font-extrabold bg-slate-100 w-fit px-1.5 rounded">{patient.primaryDiagnosis.code}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[11px] text-slate-500 font-bold px-6">
                      {new Date(patient.lastVisit).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); }} className="h-9 w-9 rounded-xl hover:bg-medical-blue/10 hover:text-medical-blue transition-all">
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}