// @ts-nocheck  — ملف Deno (Supabase Edge Function): تجاهل أخطاء المحرر العادي مثل "Cannot find name Deno"
// AI chatbot for the website — keeps the Anthropic key on the server (never in the browser).
// Deploy:   supabase functions deploy chat
// Secrets:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-... \
//             KNOWLEDGE_URL=https://smartvisiongcs.com/assets/sv-knowledge.json \
//             ALLOWED_ORIGIN=https://smartvisiongcs.com
// Optional: ANTHROPIC_MODEL (default claude-haiku-5-5), WHATSAPP_URL
import { createClient } from 'npm:@supabase/supabase-js@2';

const ALLOWED = (Deno.env.get('ALLOWED_ORIGIN') || '*').split(',').map((s) => s.trim());
const MODEL = Deno.env.get('ANTHROPIC_MODEL') || 'claude-haiku-5-5';
const WA = Deno.env.get('WHATSAPP_URL') || 'https://wa.me/201021501250';
let cache: { t: number; k: any } | null = null;
const hits = new Map<string, number[]>();

function cors(req: Request) {
  const o = req.headers.get('origin') || '';
  const ok = ALLOWED.includes('*') ? '*' : ALLOWED.includes(o) ? o : ALLOWED[0];
  return { 'Access-Control-Allow-Origin': ok, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Vary': 'Origin' };
}
async function knowledge() {
  if (cache && Date.now() - cache.t < 600000) return cache.k;
  try {
    const r = await fetch(Deno.env.get('KNOWLEDGE_URL')!, { headers: { 'cache-control': 'no-cache' } });
    const k = await r.json(); cache = { t: Date.now(), k }; return k;
  } catch { return cache?.k || null; }
}
const cut = (s: unknown, n: number) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n);

Deno.serve(async (req) => {
  const h = cors(req), json = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...h, 'Content-Type': 'application/json' } });
  if (req.method === 'OPTIONS') return new Response('ok', { headers: h });
  try {
    // simple per-IP rate limit (25 messages / minute)
    const ip = (req.headers.get('x-forwarded-for') || 'x').split(',')[0].trim(), now = Date.now();
    const list = (hits.get(ip) || []).filter((t) => now - t < 60000); list.push(now); hits.set(ip, list);
    if (list.length > 25) return json({ error: 'rate limit' }, 429);

    const body = await req.json();
    let msgs = (Array.isArray(body.messages) ? body.messages : []).slice(-10)
      .filter((m: any) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .map((m: any) => ({ role: m.role, content: cut(m.content, 1200) }));
    while (msgs.length && msgs[0].role !== 'user') msgs.shift();
    if (!msgs.length || msgs[msgs.length - 1].role !== 'user') return json({ error: 'bad request' }, 400);

    const K = await knowledge();
    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const [n, p, t, pr] = await Promise.all([
      db.from('news').select('title,category,body,created_at').eq('published', true).order('created_at', { ascending: false }).limit(6),
      db.from('partners').select('name').eq('published', true).order('sort'),
      db.from('team').select('name,role,bio,tier').eq('published', true).order('sort'),
      db.from('projects').select('category').eq('published', true).limit(1000),
    ]);
    const counts: Record<string, number> = {}; (pr.data || []).forEach((x: any) => { counts[x.category] = (counts[x.category] || 0) + 1; });
    const team = (t.data && t.data.length ? t.data : K?.team || []).map((m: any) => `- ${m.name} — ${m.role}: ${cut(m.bio, 420)}`).join('\n');
    const news = (n.data || []).map((x: any) => `- [${String(x.created_at).slice(0, 10)}] ${x.title} (${x.category || 'News'}): ${cut(x.body, 300)}`).join('\n');
    const partners = (p.data && p.data.length ? p.data.map((x: any) => x.name).join(', ') : K?.facts?.partners) || '';
    const pages = Object.entries(K?.pages || {}).map(([k, v]) => `## page: ${k}\n${cut(v, 3500)}`).join('\n\n');

    const system = `${String(K?.persona || 'You are the SMART VISION website assistant. Always be helpful and never say you do not know.').replaceAll('{{WA}}', WA)}

=== COMPANY KNOWLEDGE (single source of truth) ===
${JSON.stringify(K?.facts || {}, null, 1)}

Team:
${team}

Partners: ${partners}

Portfolio (published projects by sector): ${JSON.stringify(Object.keys(counts).length ? counts : K?.facts?.portfolio_counts || {})}

Latest news:
${news || '(see News page)'}

Website content:
${pages}

User interface language hint: ${cut(body.lang, 4)}`;

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: 600, system, messages: msgs }),
    });
    const j = await r.json();
    if (!r.ok) return json({ error: j?.error?.message || 'upstream' }, 502);
    const reply = (j.content || []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('').trim();
    return json({ reply });
  } catch (e) { return json({ error: String(e) }, 500); }
});
