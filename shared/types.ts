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
}
export interface Patient {
  id: string;
  mrn: string; // Medical Record Number
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
}
export interface DashboardStats {
  census: number;
  urgentCount: number;
  dischargedToday: number;
  volumeTrend: number; // percentage change
  recentActivity: Array<{
    id: string;
    patientId: string;
    patientName: string;
    patientAvatar?: string;
    type: 'Status Change' | 'New Diagnosis' | 'Treatment Started';
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
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number;
}