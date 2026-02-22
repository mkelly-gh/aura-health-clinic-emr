import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Patient } from "@shared/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div className="flex items-center justify-center h-screen">
      <p className="text-muted-foreground animate-pulse">Loading Comprehensive Record...</p>
    </div>
  );
  if (error || !patient) return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-bold">Patient Not Found</h2>
      <Button onClick={() => navigate("/patients")} className="mt-4">Back to Registry</Button>
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
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{patient.name}</h1>
            <Badge variant="outline" className={cn("px-2 py-0.5", getStatusColor(patient.status))}>
              {patient.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <span className="font-mono font-bold text-foreground/80">{patient.mrn}</span>
            <span>•</span>
            <span>{patient.gender}, {patient.age}y</span>
            <span>•</span>
            <span>DOB: 19XX-XX-XX</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Schedule Visit</Button>
          <Button className="bg-medical-blue hover:bg-medical-blue/90 text-white">Edit Record</Button>
        </div>
      </div>
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="clinical">Clinical</TabsTrigger>
          <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
        </TabsList>
        <TabsContent value="summary" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-soft">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                  <Activity className="w-4 h-4 text-medical-blue" /> Vitals Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">BP</span>
                  <span className="font-bold">120/80 mmHg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Heart Rate</span>
                  <span className="font-bold">72 bpm</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">SpO2</span>
                  <span className="font-bold">98%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Temp</span>
                  <span className="font-bold">98.6°F</span>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-soft md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Phone</p>
                    <p className="text-sm font-medium">{patient.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Email</p>
                    <p className="text-sm font-medium">{patient.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Last Visit</p>
                    <p className="text-sm font-medium">{new Date(patient.lastVisit).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="clinical" className="mt-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-medical-blue" /> Clinical Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-secondary/30 rounded-lg border">
                <h4 className="font-semibold text-sm mb-2">Subjective / Chief Complaint</h4>
                <p className="text-sm text-muted-foreground">
                  Patient presents for follow-up regarding {patient.primaryDiagnosis.description}. Reports mild discomfort in affected areas but overall stable management. 
                </p>
              </div>
              <div className="p-4 bg-secondary/30 rounded-lg border">
                <h4 className="font-semibold text-sm mb-2">Objective Observations</h4>
                <p className="text-sm text-muted-foreground">
                  All systems reviewed. Physical examination shows stable vitals. Lungs clear to auscultation. Neurological status intact.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="diagnosis" className="mt-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clipboard className="w-5 h-5 text-medical-blue" /> ICD-10 Coding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-medical-blue/5 border-medical-blue/20">
                <div>
                  <p className="text-xs font-bold text-medical-blue uppercase">Primary Diagnosis</p>
                  <p className="font-semibold">{patient.primaryDiagnosis.description}</p>
                </div>
                <Badge className="bg-medical-blue text-white">{patient.primaryDiagnosis.code}</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="evidence" className="mt-6">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-medical-blue" /> Lab & Imaging Evidence
              </CardTitle>
              <Button size="sm" variant="outline" className="gap-2">
                <Upload className="w-4 h-4" /> Upload New
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded hover:bg-accent/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-red-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">LAB_RESULTS_REV_{i}.pdf</p>
                      <p className="text-xs text-muted-foreground">Uploaded 12 days ago ��� 1.4 MB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon"><Download className="w-4 h-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}