// Reporte de sesion completo. GET /api/report?conv=ID  (&pdf=1 para PDF)
// Fuente unica: conversacion ElevenLabs + analisis IA (OpenRouter) -> reporte completo siempre.
const TEMPLATE = require('./_template');
const { htmlToPdf } = require('./_render');
const { esc, clean, buildChatTable, radarUrl, neuroBars, timeline, activitySection, courseReportSection } = require('./_chat');
const { analyze } = require('./_analyze');

const SITE = 'https://vtc-capacitacion-deploy.vercel.app';
const MESES = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];

function dcv(dc, k) {
  const o = dc[k] != null ? dc[k] : (dc[k + '  '] != null ? dc[k + '  '] : dc[k + ' ']);
  if (o == null) return '';
  return (typeof o === 'object' && 'value' in o) ? o.value : o;
}
const has = (v) => v != null && String(v).trim() !== '';
function fmtMMSS(s) { s = parseInt(s || 0, 10); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function langName(l) { l = (l || '').toLowerCase(); if (l.indexOf('es') === 0) return 'Español'; if (l.indexOf('en') === 0) return 'Inglés'; return l || '—'; }
function sentName(s) { s = (s || '').toLowerCase(); if (s.indexOf('pos') >= 0) return 'Positivo'; if (s.indexOf('neg') >= 0) return 'Negativo'; if (s.indexOf('neu') >= 0) return 'Neutral'; return s ? s[0].toUpperCase() + s.slice(1) : '—'; }
function parsePairs(str) { return String(str || '').split('|').map(x => x.trim()).filter(Boolean).map(x => { const i = x.lastIndexOf(':'); return i < 0 ? null : [x.slice(0, i).trim(), x.slice(i + 1).trim()]; }).filter(Boolean); }
function parseTL(str) { return String(str || '').split('|').map(x => x.trim()).filter(Boolean).map(x => { const m = x.match(/^(\d{1,2}:\d{2})\s*(.*)$/); return m ? [m[1], m[2]] : ['', x]; }); }

function planList(steps) {
  if (!steps || !steps.length) return '<tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#8a8a92;">—</td></tr>';
  return steps.map((s, i) =>
    `<tr><td valign="top" width="30" style="font-family:Georgia,serif;font-size:16px;color:#5fbf86;padding:0 0 12px 0;">${i + 1}.</td>
     <td valign="top" style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:21px;color:#cfd8d2;padding:0 0 12px 0;">${esc(s)}</td></tr>`
  ).join('');
}

async function buildReport(conv) {
  const id = conv.conversation_id || '';
  const a = conv.analysis || {};
  const meta = conv.metadata || {};
  const dc = a.data_collection_results || {};
  const dv = (conv.conversation_initiation_client_data && conv.conversation_initiation_client_data.dynamic_variables) || {};
  const turns = Array.isArray(conv.transcript) ? conv.transcript : [];

  // Texto del transcript para la IA
  const tText = turns.map(t => `${(t.role || '').toLowerCase() === 'agent' ? 'Víctor' : 'Asesor'}: ${clean(t.message)}`).filter(x => x.length > 8).join('\n');
  const ai = await analyze(tText, { dur: fmtMMSS(meta.call_duration_secs), lang: langName(meta.main_language) }) || {};

  // helpers de merge: primero lo que extrajo el agente, si no, la IA
  const pick = (dcKey, aiVal) => { const v = dcv(dc, dcKey); return has(v) ? v : (has(aiVal) ? aiVal : ''); };

  const name = dcv(dc, 'user_name') || dv.user_name || [dcv(dc, 'first_name'), dcv(dc, 'last_name')].filter(Boolean).join(' ') || 'Asesor';
  let score = parseFloat(dcv(dc, 'desempeno_score'));
  if (!isFinite(score) && ai.desempeno_score != null) score = parseFloat(ai.desempeno_score);
  const hasScore = isFinite(score);
  const scoreStr = hasScore ? (Math.round(score * 10) / 10) : '—';
  const scorePct = hasScore ? Math.max(0, Math.min(100, Math.round(score * 10))) : 0;

  // competencias: dc pipe -> sino ai.competencias
  let compMap = {}; parsePairs(dcv(dc, 'scores_competencias')).forEach(([k, v]) => compMap[k.toLowerCase()] = parseFloat(v) || 0);
  if (!Object.keys(compMap).length && ai.competencias) compMap = ai.competencias;
  const order = [['rapport', 'Rapport'], ['postura', 'Postura'], ['objeciones', 'Objeciones'], ['sala', 'Leer la sala'], ['cierre', 'Cierre'], ['pnl', 'PNL']];
  const values = order.map(o => { const v = compMap[o[0]]; return v != null ? Math.round(v) : (hasScore ? Math.round(score) : 0); });

  // neuro: dc pipe -> sino ai array
  let neuro = parsePairs(dcv(dc, 'principios_neuro'));
  if (!neuro.length && Array.isArray(ai.principios_neuro)) neuro = ai.principios_neuro.map(p => [p.nombre || p.name, p.intensidad != null ? p.intensidad : p.intensity]);

  // timeline: dc -> sino ai array
  let tl = parseTL(dcv(dc, 'momentos_clave'));
  if (!tl.length && Array.isArray(ai.momentos_clave)) tl = ai.momentos_clave.map(m => [m.t || '', m.label || '']);

  const start = meta.start_time_unix_secs || meta.accepted_time_unix_secs;
  const dt = start ? new Date(start * 1000) : null;
  const fecha = dt ? `${dt.getDate()} ${MESES[dt.getMonth()]} ${dt.getFullYear()}` : '';
  const tipoAct = pick('tipo_actividad', 'Sesión') || 'Sesión';
  const veredicto = has(ai.veredicto) ? ai.veredicto
    : !hasScore ? 'Sesión de repaso.' : score >= 8.5 ? 'Excelente ejecución. Vas a piso con esto.' : score >= 7 ? 'Buen nivel. Pulir los detalles de abajo.' : score >= 5 ? 'Vas bien, refuerza los puntos clave.' : 'Más reps en lo básico antes de piso.';

  const tokens = {
    USER_NAME: esc(name),
    EMP_NUM: esc(dcv(dc, 'employee_number') || dv.employee_number || '—'),
    DEPARTAMENTO: esc(dcv(dc, 'departamento') || dv.departamento || '—'),
    USER_ROLE: esc(dcv(dc, 'user_role') || '—'),
    FECHA: esc(fecha),
    TIPO_ACTIVIDAD: esc(tipoAct.charAt(0).toUpperCase() + tipoAct.slice(1)),
    DURACION: fmtMMSS(meta.call_duration_secs) + ' min',
    SCORE: scoreStr, SCORE_PCT: scorePct,
    VEREDICTO: esc(veredicto),
    RESUMEN: esc(a.transcript_summary || dcv(dc, 'call_summary') || '(sin resumen)'),
    ESCENARIO: esc(pick('escenario_roleplay', ai.escenario) || tipoAct),
    TIPO_CLIENTE: esc(pick('tipo_cliente', ai.tipo_cliente) || '—'),
    IDIOMA: esc(langName(meta.main_language)),
    MODULOS: esc(pick('modulos_practicados', ai.modulos) || '—'),
    DURACION_EXACTA: fmtMMSS(meta.call_duration_secs),
    SENTIMIENTO: esc(sentName((a.sentiment_analysis && (a.sentiment_analysis.overall_sentiment || a.sentiment_analysis.sentiment)) || ai.sentimiento)),
    NUM_TURNOS: turns.length,
    RADAR_URL: radarUrl(order.map(o => o[1]), values),
    NEURO_BARS: neuroBars(neuro),
    TIMELINE_HTML: timeline(tl),
    FORTALEZAS: esc(pick('fortalezas', ai.fortalezas) || '—'),
    AREAS_MEJORA: esc(pick('areas_mejora', ai.areas_mejora) || '—'),
    OBJECIONES: esc(pick('objeciones_trabajadas', ai.objeciones_trabajadas) || '—'),
    ANALISIS_PNL: esc(pick('analisis_pnl', ai.analisis_pnl) || '—'),
    RECOMENDACION: esc(pick('recomendacion_siguiente', ai.recomendacion) || '—'),
    PLAN_ACCION: planList(ai.plan_accion),
    CTA_URL: SITE + '/',
    AUDIO_URL: SITE + '/api/audio?conv=' + encodeURIComponent(id),
    TRANSCRIPT_CHAT: buildChatTable(turns),
    CONV_ID: esc(id),
  };
  let html = TEMPLATE;
  for (const k in tokens) html = html.split('{{' + k + '}}').join(tokens[k]);
  // Inyecta análisis del curso + actividad justo antes de la transcripción.
  try {
    const COURSE = courseReportSection(turns, ai, name).replace(/\$/g, '$$$$');
    const ACT = activitySection(turns).replace(/\$/g, '$$$$').replace('el asesor', esc(name));
    html = html.replace(/(<tr><td class="px"[^>]*>\s*<div[^>]*>\s*Transcripción completa)/, COURSE + ACT + '$1');
  } catch (e) {}
  return { html, name, id };
}

module.exports = async (req, res) => {
  try {
    const conv = (req.query && req.query.conv) || '';
    if (!conv) { res.status(400).send('Falta ?conv=ID'); return; }
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) { res.status(500).send('Falta ELEVENLABS_API_KEY'); return; }
    const r = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${encodeURIComponent(conv)}`, { headers: { 'xi-api-key': key } });
    if (!r.ok) { res.status(r.status).send('No se encontró la conversación'); return; }
    const data = await r.json();
    const { html, name } = await buildReport(data);

    if (req.query && (req.query.pdf === '1' || req.query.format === 'pdf')) {
      const buf = await htmlToPdf(html);
      const safe = ('Reporte-VTC_' + (name || 'asesor') + '_' + conv).replace(/[^a-zA-Z0-9_-]/g, '_');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${safe}.pdf"`);
      res.setHeader('Content-Length', buf.length);
      res.status(200).end(buf);
      return;
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (e) {
    res.status(500).send('Error: ' + String((e && e.message) || e));
  }
};
