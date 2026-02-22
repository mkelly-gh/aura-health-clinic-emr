export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type PatientStatus = 'Urgent' | 'Observation' | 'Stable' | 'Discharged';
export interface Diagnosis {
  code: string; // ICD-10
  description: string;
}
export interface Treatment {
  id: string;
  name: string;
  startDate: string;
  dosage: string;
  status: 'Active' | 'Completed' | 'Discontinued';
}
export interface Vitals {
  bp: string;
  hr: number;
  temp: number;
  spo2: number;
  weight: number;
  recordedAt: string;
}
export interface MedicalHistoryItem {
  condition: string;
  date: string;
  status: 'Resolved' | 'Chronic' | 'Under Treatment';
}
export interface Evidence {
  id: string;
  name: string;
  type: string;
  url: string;
  date: string;
}
export interface ClinicalRecord {
  history: MedicalHistoryItem[];
  medications: Treatment[];
  vitals: Vitals[];
  evidence: Evidence[];
}
export interface Patient {
  id: string;
  mrn: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  status: PatientStatus;
  lastVisit: string;
  primaryDiagnosis: Diagnosis;
  ssn: string;
  email: string;
  phone: string;
  avatarUrl: string;
  clinicalRecord: ClinicalRecord;
}
export interface DashboardStats {
  census: number;
  urgentCount: number;
  dischargedToday: number;
  volumeTrend: number;
  recentActivity: Array<{
    id: string;
    patientId: string;
    patientName: string;
    patientAvatar?: string;
    type: 'Status Change' | 'New Diagnosis' | 'Treatment Started' | 'Lab Upload';
    description: string;
    timestamp: number;
  }>;
}
export interface User {
  id: string;
  name: string;
}
export interface Chat {
  id: string;
  title: string;
  patientId?: string; // Associated patient context for Q&A
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number;
}