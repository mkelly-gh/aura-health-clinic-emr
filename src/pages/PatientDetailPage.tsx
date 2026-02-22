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
  ArrowLeft, FileText, Activity, Stethoscope, Clipboard, Upload, Calendar, Phone, Mail, Pill, Heart, Thermometer, Weight, ImagePlus, Trash2, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/** Parse structured analysis text (e.g. "Location: x\nType: y") into { label, value } rows. */
function parseStructuredAnalysis(text: string): { label: string; value: string }[] {
  return text
    .split(/\n+/)
    .map((line) => {
      const i = line.indexOf(":");
      if (i === -1) return null;
      const label = line.slice(0, i).trim();
      const value = line.slice(i + 1).trim();
      return label && value ? { label, value } : null;
    })
    .filter((r): r is { label: string; value: string } => r != null);
}

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
    },
  });
  const uploadImageMutation = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("image", file);
      return fetch(`/api/patients/${id}/evidence/image`, { method: "POST", body: form }).then(async (r) => {
        const json = await r.json();
        if (!r.ok || !json?.success) throw new Error(json?.error ?? "Upload failed");
        return json.data;
      });
    },
    onSuccess: () => {
      toast.success("Image uploaded and analyzed for injury evidence");
      queryClient.invalidateQueries({ queryKey: ["patient", id] });
    },
    onError: (e: Error) => toast.error(e.message || "Image upload failed"),
  });
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const deleteEvidenceMutation = useMutation({
    mutationFn: (evidenceId: string) =>
      fetch(`/api/patients/${id}/evidence/${evidenceId}`, { method: "DELETE" }).then(async (r) => {
        const json = await r.json();
        if (!r.ok || !json?.success) throw new Error(json?.error ?? "Delete failed");
        return json.data;
      }),
    onSuccess: () => {
      toast.success("Evidence removed");
      queryClient.invalidateQueries({ queryKey: ["patient", id] });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to delete evidence"),
  });
  const reanalyzeMutation = useMutation({
    mutationFn: (evidenceId: string) =>
      fetch(`/api/patients/${id}/evidence/${evidenceId}/reanalyze`, { method: "POST" }).then(async (r) => {
        const json = await r.json();
        if (!r.ok || !json?.success) throw new Error(json?.error ?? "Reanalyze failed");
        return json.data;
      }),
    onSuccess: () => {
      toast.success("Evidence reanalyzed and expanded");
      queryClient.invalidateQueries({ queryKey: ["patient", id] });
    },
    onError: (e: Error) => toast.error(e.message || "Reanalyze failed"),
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
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-medical-blue" />
                        Clinical Evidence
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">Documents and injury images with AI analysis</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadImageMutation.mutate(file);
                          e.target.value = '';
                        }}
                      />
                      <Button
                        variant="outline"
                        className="font-semibold text-sm gap-2 border-medical-blue/50 text-medical-blue hover:bg-medical-blue/10 hover:border-medical-blue"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={uploadImageMutation.isPending}
                      >
                        <ImagePlus className="w-4 h-4" /> Upload Image
                      </Button>
                      <Button
                        className="bg-medical-blue hover:bg-medical-blue/90 font-semibold text-sm gap-2"
                        onClick={() => uploadMutation.mutate({ name: `LAB_REV_${Date.now()}.pdf`, type: 'PDF' })}
                        disabled={uploadMutation.isPending}
                      >
                        <Upload className="w-4 h-4" /> Upload Document
                      </Button>
                    </div>
                  </div>

                  {patient.clinicalRecord.evidence.length === 0 ? (
                    <Card className="shadow-soft border-border border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                          <FileText className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">No evidence on file</p>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">Upload an image for injury analysis or add a document to the vault.</p>
                        <div className="flex gap-3 mt-6">
                          <Button variant="outline" className="gap-2" onClick={() => imageInputRef.current?.click()}>
                            <ImagePlus className="w-4 h-4" /> Add Image
                          </Button>
                          <Button className="bg-medical-blue hover:bg-medical-blue/90 gap-2" onClick={() => uploadMutation.mutate({ name: `LAB_REV_${Date.now()}.pdf`, type: 'PDF' })}>
                            <Upload className="w-4 h-4" /> Add Document
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      {patient.clinicalRecord.evidence.map((doc) => {
                        const structured = doc.analysis ? parseStructuredAnalysis(doc.analysis) : [];
                        const hasStructured = structured.length > 0;
                        const diagnosisEntry = structured.find(({ label }) => label.toLowerCase() === 'diagnosis');
                        const restStructured = structured.filter(({ label }) => label.toLowerCase() !== 'diagnosis');
                        return (
                          <Card key={doc.id} className="shadow-soft border-border overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                              <div className="md:w-56 shrink-0 bg-slate-50/80 p-4 flex items-center justify-center min-h-[200px] md:min-h-0 md:min-w-[220px]">
                                {doc.type === 'image' && doc.url ? (
                                  <div className="w-full max-w-[220px] aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                                    <img
                                      src={doc.url}
                                      alt={doc.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-20 h-20 rounded-xl border-2 border-slate-200 bg-white flex items-center justify-center">
                                    <FileText className="w-10 h-10 text-slate-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 p-6 flex flex-col gap-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div>
                                    <h4 className="text-base font-bold text-slate-900">{doc.name}</h4>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
                                      {doc.date.split('T')[0]}
                                      {doc.date.includes('T') && (
                                        <span className="text-slate-400 font-normal"> · {doc.date.split('T')[1]?.slice(0, 5)}</span>
                                      )}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {doc.type === 'image' && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 text-medical-blue border-medical-blue/40 hover:bg-medical-blue/10"
                                        onClick={() => reanalyzeMutation.mutate(doc.id)}
                                        disabled={reanalyzeMutation.isPending}
                                      >
                                        <RefreshCw className={cn("w-4 h-4", reanalyzeMutation.isPending && "animate-spin")} />
                                        Reanalyze & expand
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                                      onClick={() => deleteEvidenceMutation.mutate(doc.id)}
                                      disabled={deleteEvidenceMutation.isPending}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                                {doc.analysis && (
                                  <div className="border-t border-slate-100 pt-4 space-y-4">
                                    {diagnosisEntry && (
                                      <div className="rounded-lg bg-medical-blue/5 border border-medical-blue/20 p-3">
                                        <span className="text-xs font-bold text-medical-blue uppercase tracking-wider">Diagnosis</span>
                                        <p className="text-sm font-semibold text-slate-900 mt-1">{diagnosisEntry.value}</p>
                                      </div>
                                    )}
                                    {hasStructured ? (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                                        {restStructured.map(({ label, value }) => (
                                          <div key={label} className="flex flex-col gap-0.5">
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
                                            <span className="font-medium text-slate-800">{value}</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : !diagnosisEntry && (
                                      <p className="text-sm text-slate-600 leading-relaxed">{doc.analysis}</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}