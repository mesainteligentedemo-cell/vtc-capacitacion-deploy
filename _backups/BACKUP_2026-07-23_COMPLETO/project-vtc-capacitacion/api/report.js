// Reporte de sesion completo. GET /api/report?conv=ID  (&pdf=1 para PDF)
// Fuente unica: conversacion ElevenLabs + analisis IA (OpenRouter) -> reporte completo siempre.
// Motor: api/_template.js (documento único de flujo continuo, email + PDF) + api/_chat.js (builders)
//        + api/_render.js (PDF de una sola página, altura dinámica — sin saltos forzados).
const TEMPLATE = require('./_template');
const { htmlToPdf } = require('./_render');
const {
  esc, clean, fmtDec, has, buildChatTable, radarSvg, radarSection, neuroSection,
  timelineSection, drillSection,
  metricsRow, analyticsRow, speakingTime, activitySection, courseReportSection, trainerNoteSection,
  countInterventions, buildQuizData, quizSection,
  kpiRow, pieChart, heatmapBars, chartsSection, progressSection,
} = require('./_chat');
const { historyAgg } = require('./_history_agg');
const { analyze } = require('./_analyze');
const { t, translations } = require('./_i18n');
const { cancunParts, cancunHHMM, sanitizeFileBase, buildFileBase } = require('./_naming');

const SITE = 'https://vtc-capacitacion-deploy.vercel.app';
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MESES_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Traduce el TEMPLATE estático (encabezados, botones, etiquetas fijas) ANTES de inyectar
// los tokens dinámicos ({{RESUMEN}}, {{FORTALEZAS}}, transcripción, etc.). Como corre antes
// de la sustitución de tokens, nunca puede tocar contenido dinámico generado por la IA —
// en este punto el string solo contiene la plantilla fija + los placeholders {{...}}.
function translateTemplate(tpl, lang) {
  if (String(lang || '').toLowerCase().indexOf('en') !== 0) return tpl;
  // Shield {{TOKEN}} placeholders first: a dictionary key can appear as a substring of a
  // token name (e.g. "PNL" inside "{{ANALISIS_PNL}}") and must never rewrite the token itself,
  // or the later token-substitution loop in buildReport() would silently fail to fill it in.
  const shields = [];
  let out = tpl.replace(/\{\{[A-Z0-9_]+\}\}/g, (m) => { shields.push(m); return `${shields.length - 1}`; });
  const keys = Object.keys(translations).sort((a, b) => b.length - a.length);
  for (const es of keys) {
    const en = translations[es];
    if (out.indexOf(es) !== -1) out = out.split(es).join(en);
    const esNbsp = es.replace(/ /g, '&nbsp;');
    if (esNbsp !== es && out.indexOf(esNbsp) !== -1) out = out.split(esNbsp).join(en.replace(/ /g, '&nbsp;'));
  }
  out = out.replace(/(\d+)/g, (_, i) => shields[+i]);
  return out;
}

// Categoría de la sesión en el lenguaje del piso (CIERRE / PROSPECTO / REPASO / CURSO / ROLEPLAY).
function categoria(tipoSesion, escenario, tipoAct) {
  const s = (String(tipoSesion || '') + ' ' + String(escenario || '') + ' ' + String(tipoAct || '')).toLowerCase();
  if (/cierre|close|manager close|toc/.test(s)) return 'CIERRE';
  if (/prospec|opc|liner|abordaje|contacto|invit/.test(s)) return 'PROSPECTO';
  if (/objec|objeci/.test(s)) return 'OBJECIONES';
  if (/roleplay|práctica|practica|simul/.test(s)) return 'ROLEPLAY';
  if (/curso|módulo|modulo|quiz|repas|consulta/.test(s)) return 'REPASO';
  return 'SESIÓN';
}
// hh:mm en 24h a partir de un Date, SIEMPRE en hora de Cancún (UTC-5) — ElevenLabs entrega
// start_time_unix_secs en UTC; el servidor (Vercel) corre en UTC, así que usar
// dt.getHours()/getMinutes() mostraba la hora UTC disfrazada de "hora de inicio", no la
// hora real de Cancún. cancunHHMM() convierte el instante absoluto a America/Cancún siempre,
// sin importar la zona horaria del proceso que ejecuta este código.
function hhmm(dt) { return dt ? cancunHHMM(dt) : '—'; }

function dcv(dc, k) {
  const o = dc[k] != null ? dc[k] : (dc[k + '  '] != null ? dc[k + '  '] : dc[k + ' ']);
  if (o == null) return '';
  return (typeof o === 'object' && 'value' in o) ? o.value : o;
}
function fmtMMSS(s) { s = parseInt(s || 0, 10); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function langName(l) { l = (l || '').toLowerCase(); if (l.indexOf('es') === 0) return 'Español'; if (l.indexOf('en') === 0) return 'Inglés'; return l || '—'; }
function sentName(s) { s = (s || '').toLowerCase(); if (s.indexOf('pos') >= 0) return 'Positivo'; if (s.indexOf('neg') >= 0) return 'Negativo'; if (s.indexOf('neu') >= 0) return 'Neutral'; return s ? s[0].toUpperCase() + s.slice(1) : '—'; }
function parsePairs(str) { return String(str || '').split('|').map(x => x.trim()).filter(Boolean).map(x => { const i = x.lastIndexOf(':'); return i < 0 ? null : [x.slice(0, i).trim(), x.slice(i + 1).trim()]; }).filter(Boolean); }
function parseTL(str) { return String(str || '').split('|').map(x => x.trim()).filter(Boolean).map(x => { const m = x.match(/^(\d{1,2}:\d{2})\s*(.*)$/); return m ? [m[1], m[2]] : ['', x]; }); }

function planList(steps) {
  if (!steps || !steps.length) return '<tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#8a8a92;">—</td></tr>';
  return steps.map((s, i) =>
    `<tr><td valign="top" width="30" style="font-family:Georgia,serif;font-size:16px;color:#5cc08a;padding:0 0 12px 0;">${i + 1}.</td>
     <td valign="top" style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:21px;color:#cfd8d2;padding:0 0 12px 0;">${esc(s)}</td></tr>`
  ).join('');
}

async function buildReport(conv, lang) {
  lang = String(lang || 'es').toLowerCase();
  const id = conv.conversation_id || '';
  const a = conv.analysis || {};
  const meta = conv.metadata || {};
  const dc = a.data_collection_results || {};
  const dv = (conv.conversation_initiation_client_data && conv.conversation_initiation_client_data.dynamic_variables) || {};
  const turns = Array.isArray(conv.transcript) ? conv.transcript : [];

  // Texto del transcript para la IA
  const tText = turns.map(tn => `${(tn.role || '').toLowerCase() === 'agent' ? 'Víctor' : 'Asesor'}: ${clean(tn.message)}`).filter(x => x.length > 8).join('\n');
  const ai = await analyze(tText, { dur: fmtMMSS(meta.call_duration_secs), lang: langName(meta.main_language) }) || {};

  // Quiz de comprensión: preferimos el generado/evaluado por la IA; si no, lo
  // reconstruimos desde los mensajes [QUIZ] del transcript (buildQuizData).
  const quizData = buildQuizData(ai, turns);

  // helpers de merge: primero lo que extrajo el agente (data_collection), si no, la IA
  const pick = (dcKey, aiVal) => { const v = dcv(dc, dcKey); return has(v) ? v : (has(aiVal) ? aiVal : ''); };

  const name = dcv(dc, 'user_name') || dv.user_name || [dcv(dc, 'first_name'), dcv(dc, 'last_name')].filter(Boolean).join(' ') || 'Asesor';
  let score = parseFloat(dcv(dc, 'desempeno_score'));
  if (!isFinite(score) && ai.desempeno_score != null) score = parseFloat(ai.desempeno_score);
  const hasScore = isFinite(score);
  const scoreStr = hasScore ? fmtDec(score) : '—';
  const scorePct = hasScore ? Math.max(0, Math.min(100, Math.round(score * 10))) : 0;

  // Competencias del hexágono — 6 ejes exactos (spec VTC): Rapport, PNL, Postura, Objeciones, Cierre, Leer la Sala.
  let compMap = {}; parsePairs(dcv(dc, 'scores_competencias')).forEach(([k, v]) => compMap[k.toLowerCase()] = parseFloat(v) || 0);
  const aiComp = (ai.roleplay && ai.roleplay.competencias) || ai.competencias;
  if (!Object.keys(compMap).length && aiComp) compMap = aiComp;
  // alias: si el modelo devolvió "empatia" en vez de "pnl", lo mapeamos.
  if (compMap.pnl == null && compMap.empatia != null) compMap.pnl = compMap.empatia;
  // hasCompData: hay datos REALES de competencias (no el relleno sintético de abajo,
  // que solo existe para poder seguir comparando el "Índice de Progreso" sesión a
  // sesión aunque falte el detalle por eje). El radar solo se dibuja si esto es true.
  const hasCompData = Object.keys(compMap).length > 0;
  const order = [['rapport', 'Rapport'], ['pnl', 'PNL'], ['postura', 'Postura'], ['objeciones', 'Objeciones'], ['cierre', 'Cierre'], ['sala', 'Leer la Sala']];
  const compValues = order.map(o => { const v = compMap[o[0]]; return v != null ? Math.round(v) : (hasScore ? Math.round(score) : 0); });
  const compAvg = compValues.length ? compValues.reduce((a, b) => a + b, 0) / compValues.length : 0;

  // Principios neurocientíficos: dc pipe -> si no, ai array
  let neuro = parsePairs(dcv(dc, 'principios_neuro'));
  const aiNeuro = Array.isArray(ai.principios_neuro) ? ai.principios_neuro : ((ai.roleplay && Array.isArray(ai.roleplay.principios_neuro)) ? ai.roleplay.principios_neuro : null);
  if (!neuro.length && aiNeuro) neuro = aiNeuro.map(p => [p.nombre || p.name, p.intensidad != null ? p.intensidad : p.intensity]);

  // Línea de la conversación: dc -> si no, ai array
  let tl = parseTL(dcv(dc, 'momentos_clave'));
  if (!tl.length && Array.isArray(ai.momentos_clave)) tl = ai.momentos_clave.map(m => [m.t || '', m.label || '']);

  const durSecs = parseInt(meta.call_duration_secs || 0, 10) || 0;
  const start = meta.start_time_unix_secs || meta.accepted_time_unix_secs;
  const dt = start ? new Date(start * 1000) : null;
  const dtEnd = dt ? new Date(dt.getTime() + durSecs * 1000) : null;
  const mesesArr = lang.indexOf('en') === 0 ? MESES_EN : MESES;
  // Fecha del reporte también en hora de Cancún (mismo motivo que hhmm(), ver arriba).
  const fecha = dt ? (() => { const p = cancunParts(dt); return `${parseInt(p.d, 10)} ${mesesArr[parseInt(p.mo, 10) - 1]} ${p.y}`; })() : '';
  const horaInicio = hhmm(dt);
  const horaFin = hhmm(dtEnd);
  const tipoAct = pick('tipo_actividad', 'Sesión') || 'Sesión';

  // Tiempo hablado por el asesor (aprox.) + sentimiento + intervenciones.
  const spk = speakingTime(turns, durSecs);
  const tiempoHablado = fmtMMSS(spk.asesor);
  const sentimiento = sentName(dcv(dc, 'sentimiento') || ai.sentimiento);
  const interv = countInterventions(turns);
  const cat = categoria(ai.tipo_sesion, pick('escenario_roleplay', ai.escenario), tipoAct);
  const catTranslated = t(cat, lang);
  const veredicto = has(ai.veredicto) ? ai.veredicto
    : !hasScore ? 'Sesión de repaso.' : score >= 8.5 ? 'Excelente ejecución. Vas a piso con esto.' : score >= 7 ? 'Buen nivel. Pulir los detalles de abajo.' : score >= 5 ? 'Vas bien, refuerza los puntos clave.' : 'Más reps en lo básico antes de piso.';
  const duracionStr = fmtMMSS(meta.call_duration_secs) + ' min';

  const modelForRows = {
    escenario: pick('escenario_roleplay', ai.escenario) || tipoAct,
    tipoCliente: pick('tipo_cliente', ai.tipo_cliente) || '',
    idioma: t(langName(meta.main_language), lang),
    modulos: pick('modulos_practicados', ai.modulos) || '—',
    tipoActividad: (tipoAct.charAt(0).toUpperCase() + tipoAct.slice(1)),
    duracionExacta: fmtMMSS(meta.call_duration_secs),
    tono: t(pick('tono', ai.tono) || '—', lang),
    dificultad: t(pick('dificultad', ai.dificultad) || '—', lang),
    tiempoHablado,
    sentimiento: t(sentimiento, lang),
    intervenciones: String(interv.total || 0),
    horaInicio,
    horaFin,
  };

  // KPIs resumidos (4 tarjetas): tiempo · módulos · score · potencial de mejora.
  const modStr = String(modelForRows.modulos || '');
  const modCount = (Array.isArray(ai.curso && ai.curso.modulos_completados) ? ai.curso.modulos_completados.length : 0)
    || (has(modStr) && modStr !== '—' ? modStr.split(/[·|,]/).map(s => s.trim()).filter(Boolean).length : 0);
  const potencial = hasScore ? '+' + Math.max(0, Math.round((10 - score) * 10)) + '%' : '—';
  const kpiRowHtml = kpiRow([
    { value: fmtMMSS(meta.call_duration_secs), label: t('Tiempo total', lang) },
    { value: modCount ? modCount + '/6' : '—', label: t('Módulos', lang) },
    { value: hasScore ? scoreStr + '/10' : '—', label: t('Score promedio', lang), color: '#EAB308' },
    { value: potencial, label: t('Potencial mejora', lang), color: '#5cc08a' },
  ]);

  // Distribución de tiempo (pie real desde tiempo hablado) + frecuencia de temas (si la IA la provee).
  const silencio = Math.max(0, durSecs - spk.asesor - spk.agente);
  const pieSlices = [
    { label: t('Asesor', lang), pct: durSecs ? (spk.asesor / durSecs) * 100 : 0, sub: fmtMMSS(spk.asesor), color: '#EAB308' },
    { label: 'Víctor', pct: durSecs ? (spk.agente / durSecs) * 100 : 0, sub: fmtMMSS(spk.agente), color: '#5cc08a' },
    { label: t('Silencio', lang), pct: durSecs ? (silencio / durSecs) * 100 : 0, sub: fmtMMSS(silencio), color: '#b8860b' },
  ].filter((s) => s.pct >= 1);
  const pieSvg = durSecs ? pieChart(pieSlices, fmtMMSS(durSecs), 'TOTAL') : '';
  const freq = Array.isArray(ai.frecuencia_temas)
    ? ai.frecuencia_temas.map((x) => ({ label: x.tema || x.label || x.nombre, score10: x.score != null ? x.score : (x.valor != null ? x.valor : x.intensidad) })).filter((x) => x.label)
    : [];
  const chartsHtml = chartsSection(pieSvg, heatmapBars(freq));

  // Progreso histórico: compara esta sesión con el promedio de sesiones anteriores
  // del mismo empleado (best-effort; si falla o es la 1ª sesión, muestra estado inicial).
  const empNum = dcv(dc, 'employee_number') || dv.employee_number || '';
  let progresoHtml = '';
  try {
    const hist = await historyAgg(empNum, id, process.env.ELEVENLABS_API_KEY);
    progresoHtml = progressSection(
      { score: hasScore ? Math.round(score * 10) / 10 : null, compAvg: Math.round(compAvg * 10) / 10, durSecs, sentimiento },
      hist
    );
  } catch (_) { progresoHtml = ''; }

  const sessionLine = lang.indexOf('en') === 0
    ? `Coaching session for <strong style="color:#e0e0e0;">${esc(name)}</strong> with Victor · ${esc(catTranslated)} · ${duracionStr}`
    : `Sesión de <strong style="color:#e0e0e0;">${esc(name)}</strong> con Víctor · ${esc(cat)} · ${duracionStr}`;

  const ctaUrl = 'https://victor-ia-training.vercel.app/';
  // Recomendación real (si no hay, "Tu próximo drill" se oculta — ver drillSection).
  const recomendacionText = pick('recomendacion_siguiente', ai.recomendacion) || '';
  // Nombre base de archivo (PDF/MP3): {nombre-slug}_{YYYYMMDD}_{HHMM}, siempre en hora
  // de Cancún — usado por el handler de abajo (PDF) y expuesto para que n8n/el link
  // de audio puedan reusarlo sin recalcular nada.
  const fileBase = buildFileBase(name, dt || new Date());
  // Página con reproductor de audio inline (play/pause/volumen) — NO fuerza descarga.
  // El botón "🎧 Escuchar conversación" del reporte apunta aquí, no directo al mp3.
  const listenUrl = SITE + '/audio-player.html?conv=' + encodeURIComponent(id) + '&name=' + encodeURIComponent(fileBase);

  const tokens = {
    USER_NAME: esc(name),
    EMP_NUM: esc(dcv(dc, 'employee_number') || dv.employee_number || '—'),
    DEPARTAMENTO: esc(t(dcv(dc, 'departamento') || dv.departamento || '—', lang)),
    USER_ROLE: esc(dcv(dc, 'user_role') || '—'),
    CATEGORIA: esc(catTranslated),
    SESSION_LINE: sessionLine,
    FECHA: esc(fecha),
    FECHA_UPPER: esc(fecha.toUpperCase()),
    HORA_RANGO: esc(dt ? `${horaInicio}–${horaFin}` : '—'),
    TIPO_ACTIVIDAD: esc(modelForRows.tipoActividad),
    DURACION: duracionStr,
    SCORE: scoreStr, SCORE_PCT: scorePct,
    VEREDICTO: esc(veredicto),
    RESUMEN: esc(a.transcript_summary || dcv(dc, 'call_summary') || '(sin resumen)'),
    RADAR_SECTION: radarSection(hasCompData, radarSvg(order.map(o => t(o[1], lang)), compValues, { lang }), lang),
    NEURO_SECTION: neuroSection(neuro.map(([n, v]) => [t(n, lang), v]), lang),
    TIMELINE_SECTION: timelineSection(tl, lang),
    FORTALEZAS: esc(pick('fortalezas', ai.fortalezas || (ai.roleplay && ai.roleplay.fortalezas)) || '—'),
    AREAS_MEJORA: esc(pick('areas_mejora', ai.areas_mejora || (ai.roleplay && ai.roleplay.areas_mejora)) || '—'),
    OBJECIONES: esc(pick('objeciones_trabajadas', ai.objeciones_trabajadas || (ai.roleplay && ai.roleplay.objeciones_trabajadas)) || '—'),
    ANALISIS_PNL: esc(pick('analisis_pnl', ai.analisis_pnl || (ai.roleplay && ai.roleplay.analisis_pnl)) || '—'),
    DRILL_SECTION: drillSection(recomendacionText, ctaUrl, lang),
    PLAN_ACCION: planList(ai.plan_accion),
    KPI_ROW: kpiRowHtml,
    CHARTS_SECTION: chartsHtml,
    PROGRESO: progresoHtml,
    CTA_URL: ctaUrl,
    AUDIO_URL: SITE + '/api/audio?conv=' + encodeURIComponent(id),
    LISTEN_URL: listenUrl,
    TRANSCRIPT_CHAT: buildChatTable(turns, lang),
    CONV_ID: esc(id),
    METRICS_ROW: metricsRow(modelForRows, lang),
    ANALYTICS_ROW: analyticsRow(modelForRows, lang),
    QUIZ_SECTION: quizSection(quizData, lang),
    COURSE_ANALYSIS: courseReportSection(turns, ai, name, lang),
    TRAINER_NOTE: trainerNoteSection(pick('nota_entrenador', ai.nota_entrenador), lang),
    SESSION_ACTIVITY: activitySection(turns, lang).replace('el asesor', esc(name)),
  };

  let html = translateTemplate(TEMPLATE, lang);
  for (const k in tokens) html = html.split('{{' + k + '}}').join(tokens[k]);
  return { html, name, id, fileBase };
}

const handler = async (req, res) => {
  try {
    const conv = (req.query && req.query.conv) || '';
    if (!conv) { res.status(400).send('Falta ?conv=ID'); return; }
    const lang = String((req.query && req.query.lang) || 'es').toLowerCase();
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) { res.status(500).send('Falta ELEVENLABS_API_KEY'); return; }
    const r = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${encodeURIComponent(conv)}`, { headers: { 'xi-api-key': key } });
    if (!r.ok) { res.status(r.status).send('No se encontró la conversación'); return; }
    const data = await r.json();
    const { html, name, fileBase } = await buildReport(data, lang);

    if (req.query && (req.query.pdf === '1' || req.query.format === 'pdf')) {
      const buf = await htmlToPdf(html);
      // Nombre dinámico: {nombre-asesor}_{YYYYMMDD}_{HHMM} en hora de Cancún (ej.
      // carlos-lopez_20260723_1435.pdf). Si n8n (u otro caller) manda ?name=... ya
      // resuelto, se usa tal cual (sanitizado); si no, se usa el que ya calculó
      // buildReport() a partir de la fecha/hora real de la conversación.
      const base = sanitizeFileBase(req.query && req.query.name) || fileBase;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${base}.pdf"`);
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

module.exports = handler;
module.exports.buildReport = buildReport; // export interno, útil para tests locales