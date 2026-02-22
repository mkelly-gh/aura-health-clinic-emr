import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ChatBoardEntity, PatientEntity, formatEvidenceImageName } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';

const EVIDENCE_IMAGE_PROMPT = `For this medical or injury image, respond with exactly these lines, one per line. Use short phrases.
Location: [body area or site]
Type: [injury or condition type]
Diagnosis: [brief clinical diagnosis]
Findings: [visible findings, e.g. swelling, discoloration]
Severity: [mild / moderate / severe]
Recommended action: [what the clinician should do next]
AI confidence: [low / medium / high or approximate percentage]`;

async function runEvidenceImageAnalysis(env: Env, imageBytes: number[]): Promise<string> {
  if (!env.AI || imageBytes.length === 0) return 'AI analysis not configured.';
  try {
    const out = (await env.AI.run('@cf/llava-hf/llava-1.5-7b-hf', {
      image: imageBytes,
      prompt: EVIDENCE_IMAGE_PROMPT,
      max_tokens: 320,
    })) as { description?: string };
    return (out?.description ?? '').trim() || 'No analysis generated.';
  } catch (e) {
    console.error('LLaVA analysis error:', e);
    return 'AI analysis unavailable.';
  }
}

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
  app.put('/api/patients/:id/evidence', async (c) => {
    const id = c.req.param('id');
    const patient = new PatientEntity(c.env, id);
    if (!await patient.exists()) return notFound(c, 'Patient not found');
    const body = (await c.req.json()) as { name?: string; type?: string };
    const name = isStr(body?.name) ? body.name : `DOC_${Date.now()}`;
    const type = isStr(body?.type) ? body.type : 'PDF';
    const item = {
      id: crypto.randomUUID(),
      name,
      type,
      url: '',
      date: new Date().toISOString(),
    };
    await patient.addEvidence(item);
    return ok(c, item);
  });
  app.post('/api/patients/:id/evidence/image', async (c) => {
    const id = c.req.param('id');
    const patient = new PatientEntity(c.env, id);
    if (!await patient.exists()) return notFound(c, 'Patient not found');
    let imageBytes: number[];
    let mediaType = 'image/jpeg';
    try {
      const form = await c.req.formData();
      const file = form.get('image') ?? form.get('file');
      if (!file || typeof file === 'string') return bad(c, 'Missing image file in form (field: image or file)');
      const blob = file as Blob;
      if (blob.type && /^image\//.test(blob.type)) mediaType = blob.type;
      const ab = await blob.arrayBuffer();
      imageBytes = [...new Uint8Array(ab)];
    } catch (e) {
      console.error('Evidence image parse error:', e);
      return bad(c, 'Invalid form data or image');
    }
    const now = new Date();
    const state = await patient.getState();
    const analysis = await runEvidenceImageAnalysis(c.env, imageBytes);
    const evidenceId = crypto.randomUUID();
    const item = {
      id: evidenceId,
      name: formatEvidenceImageName(state.name, now),
      type: 'image',
      url: `/api/patients/${id}/evidence/${evidenceId}/image`,
      date: now.toISOString(),
      analysis,
      mediaType,
    };
    let binary = '';
    for (let i = 0; i < imageBytes.length; i += 8192) {
      const chunk = imageBytes.slice(i, i + 8192);
      binary += String.fromCharCode(...chunk);
    }
    const base64 = btoa(binary);
    await patient.addEvidence(item);
    await patient.storeEvidenceImage(evidenceId, base64);
    return ok(c, item);
  });
  app.get('/api/patients/:id/evidence/:evidenceId/image', async (c) => {
    const id = c.req.param('id');
    const evidenceId = c.req.param('evidenceId');
    const patient = new PatientEntity(c.env, id);
    if (!await patient.exists()) return notFound(c, 'Patient not found');
    const state = await patient.getState();
    const evidence = state.clinicalRecord?.evidence?.find((e) => e.id === evidenceId);
    if (!evidence || evidence.type !== 'image') return notFound(c, 'Evidence not found');
    const base64 = await patient.getEvidenceImage(evidenceId);
    if (!base64) return notFound(c, 'Image artifact not found');
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Response(bytes, {
      headers: { 'Content-Type': evidence.mediaType || 'image/jpeg' },
    });
  });
  app.post('/api/patients/:id/evidence/:evidenceId/reanalyze', async (c) => {
    const id = c.req.param('id');
    const evidenceId = c.req.param('evidenceId');
    const patient = new PatientEntity(c.env, id);
    if (!await patient.exists()) return notFound(c, 'Patient not found');
    const state = await patient.getState();
    const evidence = state.clinicalRecord?.evidence?.find((e) => e.id === evidenceId);
    if (!evidence || evidence.type !== 'image') return notFound(c, 'Evidence not found');
    const base64 = await patient.getEvidenceImage(evidenceId);
    if (!base64) return notFound(c, 'Image artifact not found');
    const binary = atob(base64);
    const imageBytes = new Array<number>(binary.length);
    for (let i = 0; i < binary.length; i++) imageBytes[i] = binary.charCodeAt(i);
    const analysis = await runEvidenceImageAnalysis(c.env, imageBytes);
    const updated = await patient.updateEvidence(evidenceId, { analysis });
    if (!updated) return bad(c, 'Failed to update evidence');
    return ok(c, { analysis });
  });
  app.delete('/api/patients/:id/evidence/:evidenceId', async (c) => {
    const id = c.req.param('id');
    const evidenceId = c.req.param('evidenceId');
    const patient = new PatientEntity(c.env, id);
    if (!await patient.exists()) return notFound(c, 'Patient not found');
    const state = await patient.getState();
    const evidence = state.clinicalRecord?.evidence?.find((e) => e.id === evidenceId);
    if (!evidence) return notFound(c, 'Evidence not found');
    const removed = await patient.removeEvidence(evidenceId);
    if (!removed) return bad(c, 'Failed to remove evidence');
    if (evidence.type === 'image') await patient.deleteEvidenceImage(evidenceId);
    return ok(c, { deleted: true });
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