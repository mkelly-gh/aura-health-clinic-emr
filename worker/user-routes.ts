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
      console.error("Dashboard stats error:", e);
      return bad(c, "Failed to retrieve clinical metrics");
    }
  });
  app.get('/api/patients', async (c) => {
    try {
      await PatientEntity.ensureSeed(c.env);
      const cq = c.req.query('cursor');
      const lq = c.req.query('limit');
      // Limit to 40 to stay well within 50-subrequest threshold
      const limit = lq ? Math.min(40, Math.max(1, Number(lq) | 0)) : 40;
      const page = await PatientEntity.list(c.env, cq ?? null, limit);
      return ok(c, page);
    } catch (e) {
      console.error("Patients list error:", e);
      return bad(c, "Failed to retrieve patient registry");
    }
  });
  app.get('/api/patients/:id', async (c) => {
    const id = c.req.param('id');
    const patient = new PatientEntity(c.env, id);
    if (!await patient.exists()) return notFound(c, 'Patient not found');
    return ok(c, await patient.getState());
  });
  app.get('/api/users', async (c) => {
    await UserEntity.ensureSeed(c.env);
    const page = await UserEntity.list(c.env, null, 10);
    return ok(c, page);
  });
  app.get('/api/chats', async (c) => {
    await ChatBoardEntity.ensureSeed(c.env);
    const page = await ChatBoardEntity.list(c.env, null, 10);
    return ok(c, page);
  });
  app.get('/api/chats/:chatId/messages', async (c) => {
    const chat = new ChatBoardEntity(c.env, c.req.param('chatId'));
    if (!await chat.exists()) return notFound(c, 'chat not found');
    return ok(c, await chat.listMessages());
  });
  app.post('/api/chats/:chatId/messages', async (c) => {
    const chatId = c.req.param('chatId');
    const { userId, text } = (await c.req.json()) as { userId?: string; text?: string };
    if (!isStr(userId) || !text?.trim()) return bad(c, 'userId and text required');
    const chat = new ChatBoardEntity(c.env, chatId);
    if (!await chat.exists()) return notFound(c, 'chat not found');
    return ok(c, await chat.sendMessage(userId, text.trim()));
  });
}