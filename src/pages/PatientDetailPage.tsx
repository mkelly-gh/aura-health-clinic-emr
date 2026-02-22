import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Patient } from "@shared/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, FileText, Activity, Stethoscope, Clipboard, Upload, Download, Calendar, Phone, Mail, Pill, Heart, Thermometer, Weight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
export default function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: patient, isLoading, error } = useQuery<Patient>({
    queryKey: ["patient", id],
    queryFn: () => api<Patient>(`/api/patients/${id}`),
    enabled: !!id,
  });
  const uploadMutation = useMutation({
    mutationFn: (data: { name: string, type: string }) => 
      api(`/api/patients/${id}/evidence`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success("Document uploaded to secure clinical vault");
      queryClient.invalidateQueries({ queryKey: ["patient", id] });
    }
  });
  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-slate-50/50">
      <div className="flex flex-col items-center gap-4">
        <Activity className="w-10 h-10 text-medical-blue animate-pulse" />
        <p className="text-muted-foreground font-bold text-sm tracking-widest uppercase">Initializing Record Context...</p>
      </div>
    </div>
  );
  if (error || !patient) return (
    <div className="max-w-7xl mx-auto px-4 py-24 text-center">
      <h2 className="text-xl font-bold">Record Access Denied</h2>
      <Button onClick={() => navigate("/patients")} className="mt-6 bg-medical-blue">Back to Registry</Button>
    </div>
  );
  const latestVitals = patient.clinicalRecord.vitals[0];
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 animate-fade-in">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-slate-200">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 flex items-center gap-4">
            <Avatar className="w-16 h-16 border-4 border-white shadow-soft">
              <AvatarImage src={patient.avatarUrl} />
              <AvatarFallback className="bg-medical-blue text-white font-bold">{patient.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold tracking-tighter text-slate-900 uppercase">{patient.name}</h1>
                <Badge variant="outline" className="bg-medical-blue/10 text-medical-blue border-none font-bold">{patient.status}</Badge>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                <span className="text-medical-blue font-mono">{patient.mrn}</span>
                <span>{patient.gender} • {patient.age}Y</span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1 border-border shadow-soft bg-white">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-medical-blue" /> Core Vitals
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center"><Heart className="w-4 h-4 text-red-600" /></div>
                  <span className="text-sm font-bold text-slate-600">Blood Pressure</span>
                </div>
                <span className="font-mono font-extrabold text-slate-900">{latestVitals?.bp}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center"><Thermometer className="w-4 h-4 text-orange-600" /></div>
                  <span className="text-sm font-bold text-slate-600">Temperature</span>
                </div>
                <span className="font-mono font-extrabold text-slate-900">{latestVitals?.temp}°F</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-medical-blue/10 flex items-center justify-center"><Activity className="w-4 h-4 text-medical-blue" /></div>
                  <span className="text-sm font-bold text-slate-600">Heart Rate</span>
                </div>
                <span className="font-mono font-extrabold text-slate-900">{latestVitals?.hr} BPM</span>
              </div>
            </CardContent>
          </Card>
          <div className="lg:col-span-3 space-y-6">
            <Tabs defaultValue="clinical" className="w-full">
              <TabsList className="bg-slate-100/80 p-1 border h-12">
                <TabsTrigger value="clinical" className="px-8 font-bold text-xs uppercase">Clinical Records</TabsTrigger>
                <TabsTrigger value="history" className="px-8 font-bold text-xs uppercase">Medical History</TabsTrigger>
                <TabsTrigger value="evidence" className="px-8 font-bold text-xs uppercase">Evidence Vault</TabsTrigger>
              </TabsList>
              <TabsContent value="clinical" className="mt-6 space-y-6">
                <Card className="shadow-soft border-border">
                  <CardHeader className="bg-slate-50/50 border-b">
                    <CardTitle className="text-sm font-bold flex items-center gap-2"><Pill className="w-4 h-4 text-medical-blue" /> Current Medications</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                      {patient.clinicalRecord.medications.map(med => (
                        <div key={med.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div>
                            <p className="text-sm font-extrabold text-slate-900">{med.name}</p>
                            <p className="text-[11px] font-bold text-muted-foreground uppercase">{med.dosage} • Started {med.startDate}</p>
                          </div>
                          <Badge className="bg-medical-stable/10 text-medical-stable border-none font-bold text-[9px]">{med.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="history" className="mt-6">
                <Card className="shadow-soft border-border">
                  <CardHeader className="bg-slate-50/50 border-b">
                    <CardTitle className="text-sm font-bold flex items-center gap-2"><Calendar className="w-4 h-4 text-medical-blue" /> Longitudinal History</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                      {patient.clinicalRecord.history.map((item, idx) => (
                        <div key={idx} className="relative flex items-center justify-between pl-10">
                          <div className="absolute left-0 w-10 h-10 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-medical-blue rounded-full" />
                          </div>
                          <div>
                            <p className="text-sm font-extrabold text-slate-900">{item.condition}</p>
                            <p className="text-[11px] font-bold text-muted-foreground uppercase">{item.date}</p>
                          </div>
                          <Badge variant="outline" className="text-[9px] font-bold uppercase">{item.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="evidence" className="mt-6">
                <Card className="shadow-soft border-border">
                  <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50">
                    <CardTitle className="text-sm font-bold flex items-center gap-2"><FileText className="w-4 h-4 text-medical-blue" /> Clinical Evidence</CardTitle>
                    <Button 
                      size="sm" 
                      className="bg-medical-blue font-bold text-[10px] uppercase gap-2"
                      onClick={() => uploadMutation.mutate({ name: `LAB_REV_${Date.now()}.pdf`, type: 'PDF' })}
                      disabled={uploadMutation.isPending}
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload Document
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {patient.clinicalRecord.evidence.map(doc => (
                        <div key={doc.id} className="p-4 border rounded-xl hover:shadow-md transition-all group flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-red-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate text-slate-900">{doc.name}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{doc.date.split('T')[0]}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="group-hover:text-medical-blue"><Download className="w-4 h-4" /></Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}