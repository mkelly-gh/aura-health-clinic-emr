import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Patient } from "@shared/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileText,
  Activity,
  Stethoscope,
  Clipboard,
  Upload,
  Download,
  Calendar,
  Phone,
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
export default function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: patient, isLoading, error } = useQuery<Patient>({
    queryKey: ["patient", id],
    queryFn: () => api<Patient>(`/api/patients/${id}`),
    enabled: !!id,
  });
  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-medical-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-medical-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium">Loading Comprehensive Record...</p>
      </div>
    </div>
  );
  if (error || !patient) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <h2 className="text-xl font-bold">Patient Not Found</h2>
      <p className="text-muted-foreground mt-2">The requested medical record could not be retrieved.</p>
      <Button onClick={() => navigate("/patients")} className="mt-6 bg-medical-blue hover:bg-medical-blue/90 text-white">
        Back to Registry
      </Button>
    </div>
  );
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Urgent': return 'bg-medical-urgent/10 text-medical-urgent border-medical-urgent/20';
      case 'Observation': return 'bg-medical-observation/10 text-medical-observation border-medical-observation/20';
      case 'Stable': return 'bg-medical-stable/10 text-medical-stable border-medical-stable/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };
  const birthYear = new Date().getFullYear() - patient.age;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 animate-fade-in">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-slate-200 hidden sm:inline-flex">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-white shadow-soft shrink-0">
              <AvatarImage src={patient.avatarUrl} alt={patient.name} />
              <AvatarFallback className="bg-medical-blue text-white font-bold text-xl">
                {patient.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{patient.name}</h1>
                <Badge variant="outline" className={cn("px-2 py-0.5 font-bold uppercase text-[10px]", getStatusColor(patient.status))}>
                  {patient.status}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-1 font-medium">
                <span className="font-mono text-medical-blue">{patient.mrn}</span>
                <span className="hidden sm:inline">•</span>
                <span>{patient.gender}, {patient.age}y</span>
                <span className="hidden sm:inline">•</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-600 uppercase tracking-tighter">DOB: Jan 15, {birthYear}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="shadow-sm">Schedule Visit</Button>
            <Button className="bg-medical-blue hover:bg-medical-blue/90 text-white shadow-primary">Edit Record</Button>
          </div>
        </div>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="bg-slate-100/80 p-1 border">
            <TabsTrigger value="summary" className="px-6">Summary</TabsTrigger>
            <TabsTrigger value="clinical" className="px-6">Clinical</TabsTrigger>
            <TabsTrigger value="diagnosis" className="px-6">Diagnosis</TabsTrigger>
            <TabsTrigger value="evidence" className="px-6">Evidence</TabsTrigger>
          </TabsList>
          <TabsContent value="summary" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-soft border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2 tracking-widest">
                    <Activity className="w-4 h-4 text-medical-blue" /> Vitals Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-sm font-medium text-slate-600">BP</span>
                    <span className="font-bold text-slate-900">120/80 mmHg</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-sm font-medium text-slate-600">Heart Rate</span>
                    <span className="font-bold text-slate-900">72 bpm</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-sm font-medium text-slate-600">SpO2</span>
                    <span className="font-bold text-medical-stable">98%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">Temp</span>
                    <span className="font-bold text-slate-900">98.6°F</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-soft md:col-span-2 border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border flex items-center justify-center">
                      <Phone className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Phone Number</p>
                      <p className="text-sm font-semibold text-slate-900">{patient.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border flex items-center justify-center">
                      <Mail className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Email Address</p>
                      <p className="text-sm font-semibold text-slate-900">{patient.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Last Admission</p>
                      <p className="text-sm font-semibold text-slate-900">{new Date(patient.lastVisit).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="clinical" className="mt-6">
            <Card className="shadow-soft border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Stethoscope className="w-5 h-5 text-medical-blue" /> Clinical Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">Subjective / Chief Complaint</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Patient presents for follow-up regarding {patient.primaryDiagnosis.description}. Reports mild discomfort in affected areas but overall stable management.
                  </p>
                </div>
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">Objective Observations</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    All systems reviewed. Physical examination shows stable vitals. Lungs clear to auscultation. Neurological status intact.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="diagnosis" className="mt-6">
            <Card className="shadow-soft border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clipboard className="w-5 h-5 text-medical-blue" /> ICD-10 Coding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-5 border rounded-xl bg-medical-blue/5 border-medical-blue/20 shadow-sm">
                  <div>
                    <p className="text-[10px] font-bold text-medical-blue uppercase tracking-widest mb-1">Primary Clinical Impression</p>
                    <p className="font-bold text-slate-900 text-lg">{patient.primaryDiagnosis.description}</p>
                  </div>
                  <Badge className="bg-medical-blue text-white px-3 py-1 text-sm font-mono shadow-md">
                    {patient.primaryDiagnosis.code}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="evidence" className="mt-6">
            <Card className="shadow-soft border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-medical-blue" /> Lab & Imaging Evidence
                </CardTitle>
                <Button size="sm" variant="outline" className="gap-2 border-medical-blue/20 text-medical-blue hover:bg-medical-blue/5">
                  <Upload className="w-4 h-4" /> Upload New
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">LAB_RESULTS_REV_0{i}.pdf</p>
                        <p className="text-xs text-muted-foreground font-medium">Uploaded by Dr. Thorne • 1.4 MB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="group-hover:text-medical-blue group-hover:bg-medical-blue/10">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}