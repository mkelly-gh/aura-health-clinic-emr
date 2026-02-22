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
  /** Build a short context string from patient state for use in AI prompts. */
  static formatPatientContext(state: Patient): string {
    const v = state.clinicalRecord?.vitals?.[0];
    const vitals = v ? `BP ${v.bp}, HR ${v.hr}, SpO2 ${v.spo2}, temp ${v.temp}°F` : "No vitals on file";
    const meds = state.clinicalRecord?.medications?.map(m => m.name).join(", ") || "None";
    const history = state.clinicalRecord?.history?.map(h => h.condition).join("; ") || "None";
    return `Patient: ${state.name}, ${state.age}y, ${state.gender}. Status: ${state.status}. Primary diagnosis: ${state.primaryDiagnosis?.description ?? "N/A"}. Vitals: ${vitals}. Medications: ${meds}. History: ${history}.`;
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
    // Create stable timestamps based on current hour to prevent jittering on refresh
    const baseTime = new Date().setMinutes(0, 0, 0);
    const activity = patients.slice(0, 8).map((p, index) => {
      // Deterministic ID based on patient and index
      const stableId = `act-${p.id}-${index}`;
      return {
        id: stableId,
        patientId: p.id,
        patientName: p.name,
        patientAvatar: p.avatarUrl,
        type: 'Status Change' as const,
        description: `Confirmed status: ${p.status} for ${p.primaryDiagnosis.description}`,
        timestamp: baseTime - (index * 1000 * 60 * 15) // Spread out by 15 mins
      };
    });
    return {
      census: patients.length,
      urgentCount: patients.filter(p => p.status === 'Urgent').length,
      dischargedToday: patients.filter(p => p.status === 'Discharged').length,
      volumeTrend: 12,
      recentActivity: activity
    };
  }

  /** Append an evidence item to this patient's clinical record. */
  async addEvidence(item: Evidence): Promise<void> {
    await this.mutate(s => ({
      ...s,
      clinicalRecord: {
        ...s.clinicalRecord,
        evidence: [...(s.clinicalRecord?.evidence ?? []), item],
      },
    }));
  }

  /** Store evidence image blob (base64) in this patient's DO. */
  async storeEvidenceImage(evidenceId: string, base64: string): Promise<void> {
    await (this.stub as unknown as { putBlob(key: string, value: string): Promise<void> }).putBlob(`evimg:${evidenceId}`, base64);
  }

  /** Retrieve stored evidence image base64, or null. */
  async getEvidenceImage(evidenceId: string): Promise<string | null> {
    return (this.stub as unknown as { getBlob(key: string): Promise<string | null> }).getBlob(`evimg:${evidenceId}`);
  }

  /** Remove stored evidence image blob. */
  async deleteEvidenceImage(evidenceId: string): Promise<boolean> {
    return (this.stub as unknown as { del(key: string): Promise<boolean> }).del(`evimg:${evidenceId}`);
  }

  /** Remove an evidence item by id from this patient's clinical record. */
  async removeEvidence(evidenceId: string): Promise<boolean> {
    const state = await this.getState();
    const evidence = state.clinicalRecord?.evidence ?? [];
    const idx = evidence.findIndex((e) => e.id === evidenceId);
    if (idx === -1) return false;
    const next = evidence.filter((e) => e.id !== evidenceId);
    await this.mutate(s => ({
      ...s,
      clinicalRecord: { ...s.clinicalRecord, evidence: next },
    }));
    return true;
  }

  /** Update an evidence item by id (e.g. analysis, name). */
  async updateEvidence(evidenceId: string, patch: Partial<Evidence>): Promise<boolean> {
    const state = await this.getState();
    const evidence = state.clinicalRecord?.evidence ?? [];
    const idx = evidence.findIndex((e) => e.id === evidenceId);
    if (idx === -1) return false;
    const next = [...evidence];
    next[idx] = { ...next[idx], ...patch };
    await this.mutate(s => ({
      ...s,
      clinicalRecord: { ...s.clinicalRecord, evidence: next },
    }));
    return true;
  }
}

/** Format evidence image name: FirstInitial_LastName_YYYY-MM-DD_HH-mm-ss */
export function formatEvidenceImageName(patientName: string, date: Date): string {
  const parts = (patientName || 'Unknown').trim().split(/\s+/);
  const first = parts[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]! : first;
  const initial = first[0]?.toUpperCase() ?? 'X';
  const lastClean = last.replace(/[^a-zA-Z0-9]/g, '') || 'Unknown';
  const d = date;
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const timeStr = `${String(d.getHours()).padStart(2, '0')}-${String(d.getMinutes()).padStart(2, '0')}-${String(d.getSeconds()).padStart(2, '0')}`;
  return `${initial}_${lastClean}_${dateStr}_${timeStr}`;
}
export type ChatBoardState = Chat & { messages: ChatMessage[] };
const SEED_CHAT_BOARDS: ChatBoardState[] = MOCK_CHATS.map(c => ({
  ...c,
  patientId: 'p-1',
  messages: MOCK_CHAT_MESSAGES.filter(m => m.chatId === c.id),
}));
export class ChatBoardEntity extends IndexedEntity<ChatBoardState> {
  static readonly entityName = "chat";
  static readonly indexName = "chats";
  static readonly initialState: ChatBoardState = { id: "", title: "", messages: [] };
  static seedData = SEED_CHAT_BOARDS;

  async listMessages(): Promise<ChatMessage[]> {
    const state = await this.getState();
    return state.messages ?? [];
  }

  async sendMessage(userId: string, text: string): Promise<{ userMsg: ChatMessage; aiMsg: ChatMessage }> {
    const userMsg: ChatMessage = { id: crypto.randomUUID(), chatId: this.id, userId, text, ts: Date.now() };
    const state = await this.getState();
    const patientId = state.patientId ?? 'p-1';

    let botText: string;
    if (this.env.AI) {
      const patient = new PatientEntity(this.env, patientId);
      const context = (await patient.exists())
        ? PatientEntity.formatPatientContext(await patient.getState())
        : "No specific patient context for this chat.";
      const prompt = `You are Aura, a clinical assistant for the EMR. Use only the following patient context to answer. Be concise and professional. Do not make up data.\n\nContext: ${context}\n\nUser: ${text}\n\nAssistant:`;
      try {
        const out = (await this.env.AI.run("@cf/meta/llama-3.1-8b-instruct", { prompt, max_tokens: 512 })) as { response?: string; result?: { response?: string } };
        const raw = out?.response ?? out?.result?.response ?? "";
        botText = raw.trim() || "I couldn't generate a response. Please try rephrasing.";
      } catch (e) {
        console.error("Workers AI error:", e);
        botText = await PatientEntity.generateRecordAwareResponse(this.env, patientId, text);
      }
    } else {
      botText = await PatientEntity.generateRecordAwareResponse(this.env, patientId, text);
    }

    const aiMsg: ChatMessage = {
      id: crypto.randomUUID(),
      chatId: this.id,
      userId: 'aura-bot',
      text: botText,
      ts: Date.now(),
    };
    await this.mutate(s => ({ ...s, messages: [...(s.messages ?? []), userMsg, aiMsg] }));
    return { userMsg, aiMsg };
  }
}