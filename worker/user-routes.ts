import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ChatBoardEntity, PatientEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/dashboard/stats', async (c) => {
    try {
      await PatientEntity.ensureSeed(c.env);
      const stats = await PatientEntity.getStats(c.env);
      return ok(c, stats);
    } catch (e) {
      return bad(c, "Failed to retrieve clinical metrics");
    }
  });
  app.get('/api/patients', async (c) => {
    try {
      await PatientEntity.ensureSeed(c.env);
      const cq = c.req.query('cursor');
      const page = await PatientEntity.list(c.env, cq ?? null, 40);
      return ok(c, page);
    } catch (e) {
      return bad(c, "Failed to retrieve patient registry");
    }
  });
  app.get('/api/patients/:id', async (c) => {
    const patient = new PatientEntity(c.env, c.req.param('id'));
    if (!await patient.exists()) return notFound(c, 'Patient not found');
    return ok(c, await patient.getState());
  });
  app.put('/api/patients/:id/evidence', async (c) => {
    const id = c.req.param('id');
    const { name, type } = (await c.req.json()) as { name: string; type: string };
    const patient = new PatientEntity(c.env, id);
    if (!await patient.exists()) return notFound(c, 'Patient not found');
    await patient.mutate(s => ({
      ...s,
      clinicalRecord: {
        ...s.clinicalRecord,
        evidence: [
          ...s.clinicalRecord.evidence,
          { id: crypto.randomUUID(), name, type, url: "#", date: new Date().toISOString() }
        ]
      }
    }));
    return ok(c, { success: true });
  });
  app.get('/api/chats', async (c) => {
    await ChatBoardEntity.ensureSeed(c.env);
    const page = await ChatBoardEntity.list(c.env, null, 10);
    return ok(c, page);
  });
  app.get('/api/chats/:chatId/messages', async (c) => {
    const chat = new ChatBoardEntity(c.env, c.req.param('chatId'));
    if (!await chat.exists()) return notFound(c, 'chat not found');
    const state = await chat.getState();
    return ok(c, state.messages ?? []);
  });
  app.post('/api/chats/:chatId/messages', async (c) => {
    const chatId = c.req.param('chatId');
    const { userId, text } = (await c.req.json()) as { userId?: string; text?: string };
    if (!isStr(userId) || !text?.trim()) return bad(c, 'userId and text required');
    const chatEntity = new ChatBoardEntity(c.env, chatId);
    if (!await chatEntity.exists()) return notFound(c, 'chat not found');
    const userMsg = await chatEntity.sendMessage(userId, text.trim());
    // Trigger AI response simulation
    const chatState = await chatEntity.getState();
    const patientContextId = chatState.patientId || 'p-1';
    const aiResponseText = await PatientEntity.generateRecordAwareResponse(c.env, patientContextId, text);
    const aiMsg = await chatEntity.sendMessage('aura-bot', aiResponseText);
    return ok(c, { userMsg, aiMsg });
  });
}