import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Search, Filter, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const { data: patientPage, isLoading } = useQuery<{ items: Patient[] }>({
    queryKey: ["patients"],
    queryFn: () => api<{ items: Patient[] }>("/api/patients"),
  });
  const filteredPatients = patientPage?.items.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.mrn.toLowerCase().includes(search.toLowerCase())
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
          <p className="text-muted-foreground">Comprehensive census of all active and past patients.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Filter patients..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
        </div>
      </div>
      <div className="bg-white rounded-lg border shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">MRN</TableHead>
              <TableHead>Patient Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Primary Diagnosis</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  Loading patient records...
                </TableCell>
              </TableRow>
            ) : filteredPatients?.map((patient) => (
              <TableRow key={patient.id} className="cursor-pointer hover:bg-accent/5 transition-colors">
                <TableCell className="font-mono text-xs font-semibold">{patient.mrn}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{patient.name}</span>
                    <span className="text-xs text-muted-foreground">{patient.gender}, {patient.age}y</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("px-2 py-0.5", getStatusColor(patient.status))}>
                    {patient.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col max-w-[200px]">
                    <span className="text-sm truncate">{patient.primaryDiagnosis.description}</span>
                    <span className="text-2xs text-muted-foreground uppercase">{patient.primaryDiagnosis.code}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(patient.lastVisit).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}