import { IndexedEntity, Index } from "./core-utils";
import type { User, Chat, ChatMessage, Patient, DashboardStats, ClinicalRecord, Evidence } from "@shared/types";
import { MOCK_CHAT_MESSAGES, MOCK_CHATS, MOCK_USERS } from "@shared/mock-data";
import { generateMockPatients } from "../src/lib/mock-generator";
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "" };
  static seedData = MOCK_USERS;
}
export class PatientEntity extends IndexedEntity<Patient> {
  static readonly entityName = "patient";
  static readonly indexName = "patients";
  static readonly initialState: Patient = {
    id: "", mrn: "", name: "", age: 0, gender: "Other", status: "Stable",
    lastVisit: "", primaryDiagnosis: { code: "", description: "" }, ssn: "", email: "", phone: "", avatarUrl: "",
    clinicalRecord: { history: [], medications: [], vitals: [], evidence: [] }
  };
  static seedData = generateMockPatients(50);
  static async ensureSeed(env: any): Promise<void> {
    const idx = new Index<string>(env, this.indexName);
    const ids = await idx.list();
    if (ids.length === 0 && this.seedData && this.seedData.length > 0) {
      for (const s of this.seedData) {
        const id = (this as any).keyOf(s);
        await new this(env, id).save(s);
        await idx.add(id);
      }
    }
  }
  static async generateRecordAwareResponse(env: any, patientId: string, query: string): Promise<string> {
    const patient = new PatientEntity(env, patientId);
    if (!await patient.exists()) return "I don't have access to that patient's record currently.";
    const state = await patient.getState();
    const q = query.toLowerCase();
    const diagnosis = state.primaryDiagnosis.description;
    const latestVitals = state.clinicalRecord.vitals[0];
    const meds = state.clinicalRecord.medications.map(m => m.name).join(", ");
    if (q.includes("vitals") || q.includes("bp") || q.includes("heart")) {
      return `[Clinical Insight] Patient ${state.name} has a current BP of ${latestVitals.bp} and HR of ${latestVitals.hr}. Given the ${diagnosis} diagnosis, these readings are ${latestVitals.hr > 90 ? 'elevated' : 'within stable parameters'}.`;
    }
    if (q.includes("meds") || q.includes("medication") || q.includes("treatment")) {
      return `[Aura Intelligence] Active medications for ${state.name} include: ${meds}. Reviewing for contraindications with ${diagnosis} protocol. No immediate risks flagged in the clinical node.`;
    }
    if (q.includes("history") || q.includes("surgical")) {
      const history = state.clinicalRecord.history.map(h => h.condition).join(", ");
      return `[History Review] Significant history includes ${history}. This context is being integrated into the current care plan for ${diagnosis}.`;
    }
    return `I've analyzed ${state.name}'s record. Clinical Status: ${state.status}. Primary Diagnosis: ${diagnosis}. The patient is currently managed with ${meds}. How would you like to proceed with the intervention?`;
  }
  static async getStats(env: any): Promise<DashboardStats> {
    const { items: patients } = await this.list(env, null, 40);
    const activity = patients.slice(0, 8).map(p => ({
      id: crypto.randomUUID(),
      patientId: p.id,
      patientName: p.name,
      patientAvatar: p.avatarUrl,
      type: 'Status Change' as const,
      description: `Confirmed status: ${p.status} for ${p.primaryDiagnosis.description}`,
      timestamp: Date.now() - Math.random() * 1000 * 60 * 60 * 2
    }));
    return {
      census: patients.length,
      urgentCount: patients.filter(p => p.status === 'Urgent').length,
      dischargedToday: patients.filter(p => p.status === 'Discharged').length,
      volumeTrend: 12,
      recentActivity: activity
    };
  }
}
export type ChatBoardState = Chat & { messages: ChatMessage[] };
const SEED_CHAT_BOARDS: ChatBoardState[] = MOCK_CHATS.map(c => ({
  ...c,
  patientId: 'p-1', // Default to Jill Valentine for demo
  messages: MOCK_CHAT_MESSAGES.filter(m => m.chatId === c.id),
}));
export class ChatBoardEntity extends IndexedEntity<ChatBoardState> {
  static readonly entityName = "chat";
  static readonly indexName = "chats";
  static readonly initialState: ChatBoardState = { id: "", title: "", messages: [] };
  static seedData = SEED_CHAT_BOARDS;
  async sendMessage(userId: string, text: string): Promise<ChatMessage> {
    const msg: ChatMessage = { id: crypto.randomUUID(), chatId: this.id, userId, text, ts: Date.now() };
    await this.mutate(s => ({ ...s, messages: [...(s.messages ?? []), msg] }));
    return msg;
  }
}