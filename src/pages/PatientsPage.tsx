import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api-client";
import { Patient } from "@shared/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, AlertTriangle, UserPlus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { data: patientPage, isLoading, isError, refetch } = useQuery<{ items: Patient[] }>({
    queryKey: ["patients"],
    queryFn: () => api<{ items: Patient[] }>("/api/patients"),
    retry: 1,
  });
  const filteredPatients = patientPage?.items.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.mrn.toLowerCase().includes(search.toLowerCase()) ||
    p.primaryDiagnosis.description.toLowerCase().includes(search.toLowerCase())
  );
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Urgent': return 'bg-red-50 text-red-700 border-red-100';
      case 'Observation': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Stable': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 animate-fade-in">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Patient Registry</h1>
            <p className="text-muted-foreground">Comprehensive clinical census and history.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search MRN, Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white border-input"
                disabled={isLoading}
              />
            </div>
            <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} /></Button>
            <Button className="bg-medical-blue hover:bg-medical-blue/90 text-white gap-2">
              <UserPlus className="w-4 h-4" /> Admission
            </Button>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-[140px] font-bold text-xs uppercase tracking-wider text-muted-foreground">MRN</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Patient</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Clinical Status</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Primary Diagnosis</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Last Visit</TableHead>
                  <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-24">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-medical-blue border-t-transparent rounded-full animate-spin" />
                        <p className="text-muted-foreground text-sm font-medium">Accessing medical records storage...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-24">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-3 bg-red-50 rounded-full text-red-600">
                          <AlertTriangle className="w-8 h-8" />
                        </div>
                        <p className="text-red-600 font-semibold">Registry Retrieval Failed</p>
                        <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">Retry Sync</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredPatients?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-24">
                      <div className="max-w-xs mx-auto text-muted-foreground">
                        <p className="text-sm font-medium">No records found matching your query.</p>
                        {search === "" && <p className="text-xs mt-1">If this is the first run, the system may still be seeding the database.</p>}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredPatients?.map((patient) => (
                  <TableRow
                    key={patient.id}
                    className="cursor-pointer hover:bg-slate-50/80 transition-colors group"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    <TableCell className="font-mono text-xs font-bold text-medical-blue">
                      {patient.mrn}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 group-hover:text-medical-blue transition-colors">{patient.name}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">{patient.gender.charAt(0)} • {patient.age}Y</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("px-2 py-0 font-bold uppercase text-[9px] tracking-tight", getStatusColor(patient.status))}>
                        {patient.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col max-w-[280px]">
                        <span className="text-sm font-medium text-slate-700 truncate">{patient.primaryDiagnosis.description}</span>
                        <span className="text-[10px] text-muted-foreground font-mono font-bold">{patient.primaryDiagnosis.code}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(patient.lastVisit).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); }} className="h-8 w-8 hover:bg-medical-blue/10 hover:text-medical-blue">
                        <MoreHorizontal className="w-4 h-4" />
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