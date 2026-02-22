import { IndexedEntity } from "./core-utils";
import type { User, Chat, ChatMessage, Patient, DashboardStats } from "@shared/types";
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
    id: "",
    mrn: "",
    name: "",
    age: 0,
    gender: "Other",
    status: "Stable",
    lastVisit: "",
    primaryDiagnosis: { code: "", description: "" },
    ssn: "",
    email: "",
    phone: ""
  };
  static seedData = generateMockPatients(50);
  static async getStats(env: any): Promise<DashboardStats> {
    const { items: patients } = await this.list(env, null, 100);
    const urgentCount = patients.filter(p => p.status === 'Urgent').length;
    const observationCount = patients.filter(p => p.status === 'Observation').length;
    const dischargedToday = patients.filter(p => p.status === 'Discharged').length; // Mock simplified
    const activity = patients.slice(0, 5).map(p => ({
      id: crypto.randomUUID(),
      patientId: p.id,
      patientName: p.name,
      type: 'Status Change' as const,
      description: `Patient status updated to ${p.status}`,
      timestamp: Date.now() - Math.random() * 1000 * 60 * 60 * 2
    }));
    return {
      census: patients.length - dischargedToday,
      urgentCount,
      dischargedToday,
      volumeTrend: 12,
      recentActivity: activity
    };
  }
}
export type ChatBoardState = Chat & { messages: ChatMessage[] };
const SEED_CHAT_BOARDS: ChatBoardState[] = MOCK_CHATS.map(c => ({
  ...c,
  messages: MOCK_CHAT_MESSAGES.filter(m => m.chatId === c.id),
}));
export class ChatBoardEntity extends IndexedEntity<ChatBoardState> {
  static readonly entityName = "chat";
  static readonly indexName = "chats";
  static readonly initialState: ChatBoardState = { id: "", title: "", messages: [] };
  static seedData = SEED_CHAT_BOARDS;
  async listMessages(): Promise<ChatMessage[]> {
    const { messages } = await this.getState();
    return messages;
  }
  async sendMessage(userId: string, text: string): Promise<ChatMessage> {
    const msg: ChatMessage = { id: crypto.randomUUID(), chatId: this.id, userId, text, ts: Date.now() };
    await this.mutate(s => ({ ...s, messages: [...s.messages, msg] }));
    return msg;
  }
}