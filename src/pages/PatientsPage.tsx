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
import { Search, Filter, MoreHorizontal, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { data: patientPage, isLoading } = useQuery<{ items: Patient[] }>({
    queryKey: ["patients"],
    queryFn: () => api<{ items: Patient[] }>("/api/patients"),
  });
  const filteredPatients = patientPage?.items.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.mrn.toLowerCase().includes(search.toLowerCase()) ||
    p.primaryDiagnosis.description.toLowerCase().includes(search.toLowerCase()) ||
    p.primaryDiagnosis.code.toLowerCase().includes(search.toLowerCase())
  );
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Urgent': return 'bg-medical-urgent/10 text-medical-urgent border-medical-urgent/20';
      case 'Observation': return 'bg-medical-observation/10 text-medical-observation border-medical-observation/20';
      case 'Stable': return 'bg-medical-stable/10 text-medical-stable border-medical-stable/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Patient Registry</h1>
          <p className="text-muted-foreground">Comprehensive census of all active and historical patients.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Filter by name, MRN, diagnosis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
          <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
          <Button className="bg-medical-blue hover:bg-medical-blue/90 text-white gap-2">
            <UserPlus className="w-4 h-4" /> New Patient
          </Button>
        </div>
      </div>
      <div className="bg-white rounded-lg border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[120px] font-bold">MRN</TableHead>
                <TableHead className="font-bold">Patient Name</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold">Primary Diagnosis</TableHead>
                <TableHead className="font-bold">Last Visit</TableHead>
                <TableHead className="text-right font-bold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-medical-blue border-t-transparent rounded-full animate-spin" />
                      <p className="text-muted-foreground text-sm font-medium">Accessing Medical Records...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredPatients?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                    No patients matching "{search}" found in clinical census.
                  </TableCell>
                </TableRow>
              ) : filteredPatients?.map((patient) => (
                <TableRow 
                  key={patient.id} 
                  className="cursor-pointer hover:bg-medical-blue/5 transition-colors group"
                  onClick={() => navigate(`/patients/${patient.id}`)}
                >
                  <TableCell className="font-mono text-xs font-bold text-medical-blue group-hover:underline">
                    {patient.mrn}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground">{patient.name}</span>
                      <span className="text-xs text-muted-foreground">{patient.gender}, {patient.age}y</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("px-2 py-0.5 font-bold uppercase text-[10px]", getStatusColor(patient.status))}>
                      {patient.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col max-w-[250px]">
                      <span className="text-sm font-medium truncate">{patient.primaryDiagnosis.description}</span>
                      <span className="text-[10px] text-muted-foreground font-bold tracking-tight uppercase">{patient.primaryDiagnosis.code}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(patient.lastVisit).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); }} className="hover:text-medical-blue">
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
  );
}