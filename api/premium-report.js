// api/premium-report.js — Reporte PDF PREMIUM (dark mode, Coach VÍCTOR · VTC)
// ─────────────────────────────────────────────────────────────────────────────
// Endpoint autónomo que recibe un payload PLANO (n8n / post-call) y genera un
// PDF premium en modo oscuro, listo para descargar. Reutiliza:
//   · radarSvg()  de ./_chat.js   → gráfico radar 6 ejes (relleno dorado 30%)
//   · htmlToPdf() de ./_render.js → Chromium real, 1 página de altura dinámica.
// Sin dependencias nuevas (usa @sparticuz/chromium + puppeteer-core ya instalados).
//
// USO:
//   POST /api/premium-report          body JSON con el payload → application/pdf
//   GET  /api/premium-report?preview=1&nombre_usuario=...      → HTML (debug/screenshot)
//   GET  /api/premium-report?...&pdf=1                          → application/pdf
//
// PAYLOAD (todas las variables son dinámicas):
//   nombre_usuario, id_empleado, session_id, score (0-10),
//   duration_seconds, timestamp (ISO o epoch; se muestra en hora Cancún),
//   performance_summary, silencio_percent, habla_percent,
//   analisis_pnl?, fortalezas?, plan_accion? (array|string),
//   competencias? { rapport, pnl, postura, objeciones, lectura, cierre } (0-10)
// ─────────────────────────────────────────────────────────────────────────────

const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

/* ── Paleta premium (spec de la misión) ── */
const C = {
  bg:     '#1a1a1c',  // fondo
  panel:  '#202024',  // paneles / tarjetas
  panel2: '#161618',  // paneles hundidos
  gold:   '#D4AF37',  // acento dorado
  goldDk: '#8C7343',  // dorado oscuro
  text:   '#f4f1ea',  // texto principal
  soft:   '#b9b6ae',  // texto secundario
  faint:  '#7c7c84',  // texto tenue
  border: '#333',     // bordes
  ok:     '#5cc08a',  // verde (semáforo)
  warn:   '#e0a13a',  // amarillo (semáforo)
  risk:   '#e07a6a',  // rojo (semáforo)
  track:  '#2a2a2e',  // pista de barras
};
const FS = 'Georgia, "Times New Roman", serif';                 // serif títulos/números
const FB = '"Helvetica Neue", Helvetica, Arial, sans-serif';    // sans body

/* ── Helpers ── */
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const num = (v) => { const n = parseFloat(v); return isFinite(n) ? n : null; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const has = (v) => v != null && String(v).trim() !== '' && String(v).trim() !== '—';
function fmtMMSS(s) { s = Math.max(0, parseInt(s || 0, 10)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function fmtHMS(s) {
  s = Math.max(0, parseInt(s || 0, 10));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return (h ? h + 'h ' : '') + (m || h ? m + 'm ' : '') + ss + 's';
}

// Fecha/hora en horario de Cancún (America/Cancun = UTC-5, sin horario de verano).
function cancunStamp(ts) {
  let d;
  if (ts == null || ts === '') d = new Date();
  else if (/^\d{10}$/.test(String(ts))) d = new Date(parseInt(ts, 10) * 1000);
  else if (/^\d{13}$/.test(String(ts))) d = new Date(parseInt(ts, 10));
  else { d = new Date(ts); if (isNaN(d.getTime())) d = new Date(); }
  const c = new Date(d.getTime() - 5 * 3600 * 1000); // UTC-5
  const pad = (x) => String(x).padStart(2, '0');
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const fecha = `${c.getUTCDate()} ${MESES[c.getUTCMonth()]} ${c.getUTCFullYear()}`;
  const hora = `${pad(c.getUTCHours())}:${pad(c.getUTCMinutes())}`;
  return { fecha, hora, iso: `${c.getUTCFullYear()}-${pad(c.getUTCMonth() + 1)}-${pad(c.getUTCDate())}T${hora}:00-05:00`, label: `${fecha} · ${hora} h (Cancún)` };
}

// Semáforo según score 0-10.
function semaforo(score) {
  const s = num(score);
  if (s == null) return { emoji: '⚪', color: C.faint, label: 'Sin evaluar' };
  if (s >= 7) return { emoji: '🟢', color: C.ok, label: 'En verde · listo para piso' };
  if (s >= 4) return { emoji: '🟡', color: C.warn, label: 'En ámbar · reforzar puntos clave' };
  return { emoji: '🔴', color: C.risk, label: 'En rojo · más reps antes de piso' };
}

// Convierte texto libre o array a items de lista.
function toItems(val) {
  if (Array.isArray(val)) return val.map((s) => String(s).trim()).filter(Boolean);
  const raw = String(val == null ? '' : val).trim();
  if (!raw || raw === '—') return [];
  return raw.split(/(?<=[.;])\s+|\s·\s|\n+|\s\|\s/).map((s) => s.trim()).filter((s) => s.length > 2);
}

/* ── Barra de progreso genérica (relleno dorado progresivo, borde blanco) ── */
function progressBar(pct, opts) {
  opts = opts || {};
  pct = clamp(Math.round(num(pct) || 0), 0, 100);
  const h = opts.h || 10;
  const fill = opts.fill || `linear-gradient(90deg,${C.goldDk},${C.gold})`;
  // Borde blanco fino para que la barra resalte sobre el fondo oscuro.
  return `<div style="background:${C.track};border:1px solid rgba(255,255,255,0.85);border-radius:99px;height:${h}px;overflow:hidden;width:100%;box-sizing:border-box;">
    <div style="width:${pct}%;height:100%;background:${fill};border-radius:99px;"></div></div>`;
}

/* ── Radar de competencias PREMIUM — SVG inline con LÍNEAS BLANCAS que resaltan ──
   Grid + ejes en blanco, relleno dorado translúcido 30%, polígono de datos en blanco
   grueso, vértices y etiquetas en dorado. Round caps/joins + crispEdges para nitidez. */
function premiumRadarSvg(labels, values, size) {
  size = size || 360;
  const vb = Math.round(size * 1.3);
  const cx = vb / 2, cy = vb / 2;
  const R = vb * 0.235;        // radio máximo (valor = 10)
  const labelR = vb * 0.335;   // radio de las etiquetas
  const n = labels.length || 1;
  const max = 10, rings = 5;
  const angleFor = (i) => (Math.PI * 2 * i / n) - Math.PI / 2;
  const fx = (x) => Math.round(x * 100) / 100;

  let gridSvg = '';
  for (let lvl = 1; lvl <= rings; lvl++) {
    const rr = R * (lvl / rings);
    const pts = [];
    for (let i = 0; i < n; i++) { const a = angleFor(i); pts.push(fx(cx + rr * Math.cos(a)) + ',' + fx(cy + rr * Math.sin(a))); }
    // Grid en BLANCO (más tenue hacia el centro, más marcado en el anillo exterior).
    const op = lvl === rings ? 0.9 : 0.4;
    gridSvg += `<polygon points="${pts.join(' ')}" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-opacity="${op}" stroke-linejoin="round"/>`;
  }

  let axisSvg = '';
  for (let i = 0; i < n; i++) {
    const a = angleFor(i);
    axisSvg += `<line x1="${cx}" y1="${cy}" x2="${fx(cx + R * Math.cos(a))}" y2="${fx(cy + R * Math.sin(a))}" stroke="#FFFFFF" stroke-width="2" stroke-opacity="0.6" stroke-linecap="round"/>`;
  }

  const dataPts = (values.length ? values : labels.map(() => 0)).map((v, i) => {
    const a = angleFor(i);
    const r = (Math.max(0, Math.min(max, parseFloat(v) || 0)) / max) * R;
    return [fx(cx + r * Math.cos(a)), fx(cy + r * Math.sin(a))];
  });
  const dataPolyStr = dataPts.map((p) => p[0] + ',' + p[1]).join(' ');
  const dots = dataPts.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#D4AF37" stroke="#FFFFFF" stroke-width="1.5"/>`).join('');

  let labelsSvg = '';
  for (let i = 0; i < n; i++) {
    const a = angleFor(i);
    const x = fx(cx + labelR * Math.cos(a)), y = fx(cy + labelR * Math.sin(a));
    let anchor = 'middle';
    if (Math.cos(a) > 0.28) anchor = 'start';
    else if (Math.cos(a) < -0.28) anchor = 'end';
    labelsSvg += `<text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle" fill="#D4AF37" font-family="${FB}" font-size="13" font-weight="600" letter-spacing="0.5">${esc(labels[i])}</text>`;
  }

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${vb} ${vb}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Radar de competencias" style="display:block;margin:0 auto;width:100%;height:auto;max-width:${size}px;overflow:visible;image-rendering:-webkit-optimize-contrast;shape-rendering:geometricPrecision;">${gridSvg}${axisSvg}<polygon points="${dataPolyStr}" fill="rgba(212,175,55,0.30)" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>${dots}${labelsSvg}</svg>`;
}

/* ── Normaliza el payload plano ── */
function normalize(p) {
  p = p || {};
  const score = num(p.score);
  const dur = parseInt(p.duration_seconds != null ? p.duration_seconds : p.durSecs || 0, 10) || 0;

  // Silencio vs habla — completar el que falte a partir del otro.
  let hablaPct = num(p.habla_percent);
  let silPct = num(p.silencio_percent);
  if (hablaPct == null && silPct != null) hablaPct = clamp(100 - silPct, 0, 100);
  if (silPct == null && hablaPct != null) silPct = clamp(100 - hablaPct, 0, 100);

  // Competencias del radar (6 ejes). Si no vienen, se derivan del score global.
  const comp = p.competencias || {};
  const base = score != null ? score : 0;
  const val = (k) => { const v = num(comp[k]); return v != null ? clamp(v, 0, 10) : Math.round(base * 10) / 10; };
  const compValues = [val('rapport'), val('pnl'), val('postura'), val('objeciones'), val('lectura'), val('cierre')];

  return {
    nombre: p.nombre_usuario || p.nombre || p.user_name || 'Asesor',
    empNum: p.id_empleado || p.employee_number || p.empNum || '—',
    sessionId: p.session_id || p.conversation_id || p.session || '—',
    score,
    durSecs: dur,
    stamp: cancunStamp(p.timestamp != null ? p.timestamp : (p.timestamp_cancun || p.fecha)),
    resumen: p.performance_summary || p.resumen || p.summary || '',
    silPct, hablaPct,
    analisisPnl: p.analisis_pnl || p.pnl || '',
    fortalezas: p.fortalezas || p.lo_que_hiciste_bien || p.strengths || '',
    planAccion: p.plan_accion || p.plan || p.action_plan || [],
    durTargetSecs: parseInt(p.duration_target_seconds || 900, 10) || 900, // 15 min ideal por defecto
    compValues,
    quizz: normalizeQuizz(p),
    deepLearning: p.deep_learning || p.deepLearning || null,
  };
}

/* ── Normaliza el estado del quizz ──
   Devuelve { realizado:boolean, questions:[{pregunta,respuesta,correcta:boolean}], correct, total, pct } */
function normalizeQuizz(p) {
  // Fuentes posibles de preguntas: p.quizz (array), p.quizz.questions, p.quizz_scores
  // (se aceptan también las variantes legacy con una sola z por compatibilidad de payload).
  let raw = [];
  const arr = p.quizz || p.quiz;
  const scores = p.quizz_scores || p.quiz_scores;
  if (Array.isArray(arr)) raw = arr;
  else if (arr && Array.isArray(arr.questions)) raw = arr.questions;
  else if (Array.isArray(scores)) raw = scores;

  const questions = raw.map((q, i) => ({
    id: q.id != null ? q.id : i + 1,
    pregunta: String(q.pregunta || q.question || '').trim(),
    respuesta: String(q.respuesta || q.user_answer || q.answer || '').trim() || '—',
    correcta: !!(q.correcta != null ? q.correcta : (q.is_correct != null ? q.is_correct : q.ok)),
  })).filter((q) => q.pregunta);

  // ¿Se realizó? boolean explícito (quizz_realizado), o inferido por existencia de datos de quizz.
  const flag = p.quizz_realizado != null ? p.quizz_realizado : p.quiz_realizado;
  let realizado;
  if (flag != null) realizado = (flag === true || flag === 'true' || flag === 1 || flag === '1');
  else realizado = questions.length > 0 || (scores != null && !Array.isArray(scores));

  const total = questions.length;
  const correct = questions.filter((q) => q.correcta).length;
  const pct = total ? Math.round((correct / total) * 100) : null;
  return { realizado, questions, total, correct, pct };
}

/* ── Documento HTML premium ── */
function buildHtml(p) {
  const m = normalize(p);
  const scoreStr = m.score != null ? (Math.round(m.score * 10) / 10).toString().replace('.', ',') : '—';
  const scorePct = m.score != null ? clamp(Math.round(m.score * 10), 0, 100) : 0;
  const sem = semaforo(m.score);
  const durPct = clamp(Math.round((m.durSecs / m.durTargetSecs) * 100), 0, 100);

  const RADAR = premiumRadarSvg(['Rapport', 'PNL', 'Postura', 'Objeciones', 'Lectura', 'Cierre'], m.compValues, 360);

  const PENDIENTE = 'Análisis pendiente para sesiones cortas.';
  const pnlItems = toItems(m.analisisPnl);
  const fortItems = toItems(m.fortalezas);
  const planItems = toItems(m.planAccion);

  // Kerning global de títulos/nombres = 0.05em (spec).
  const KERN = 'letter-spacing:0.05em;';

  const sectionHead = (label) =>
    `<div style="font-family:${FB};font-size:11px;${KERN}letter-spacing:0.18em;color:${C.gold};text-transform:uppercase;font-weight:600;margin-bottom:12px;">${esc(label)}</div>`;

  // Métricas: silencio vs habla (barras) — muestra ambos porcentajes.
  const habla = m.hablaPct, sil = m.silPct;
  const metricsBlock = (habla != null || sil != null) ? `
    <div style="display:flex;flex-direction:column;gap:14px;">
      <div>
        <div style="display:flex;justify-content:space-between;font-family:${FB};font-size:12px;color:${C.soft};margin-bottom:6px;">
          <span>🗣️ Tiempo de habla</span><span style="color:${C.gold};font-weight:700;">${habla != null ? habla + '%' : '—'}</span>
        </div>${progressBar(habla != null ? habla : 0, { h: 9, fill: `linear-gradient(90deg,${C.goldDk},${C.gold})` })}
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;font-family:${FB};font-size:12px;color:${C.soft};margin-bottom:6px;">
          <span>🤫 Tiempo de silencio</span><span style="color:${C.soft};font-weight:700;">${sil != null ? sil + '%' : '—'}</span>
        </div>${progressBar(sil != null ? sil : 0, { h: 9, fill: `linear-gradient(90deg,#3a3a40,#6a6a72)` })}
      </div>
    </div>` : `<div style="font-family:${FB};font-size:12px;color:${C.faint};">Distribución de tiempo no disponible para esta sesión.</div>`;

  const listHtml = (items, fallback, mark) =>
    items.length
      ? `<ul style="list-style:none;margin:0;padding:0;">${items.slice(0, 6).map((s) =>
          `<li style="position:relative;padding:0 0 9px 20px;font-family:${FB};font-size:14px;line-height:1.55;color:${C.text};">
            <span style="position:absolute;left:0;top:1px;color:${mark || C.gold};">›</span>${esc(s)}</li>`).join('')}</ul>`
      : `<div style="font-family:${FB};font-size:13px;color:${C.faint};font-style:italic;">${esc(fallback)}</div>`;

  const planHtml = planItems.length
    ? `<ol style="list-style:none;margin:0;padding:0;counter-reset:pl;">${planItems.slice(0, 6).map((s, i) =>
        `<li style="position:relative;padding:0 0 12px 36px;font-family:${FB};font-size:14px;line-height:1.55;color:${C.text};">
          <span style="position:absolute;left:0;top:-2px;width:24px;height:24px;border-radius:50%;background:${C.bg};border:1px solid ${C.gold};color:${C.gold};font-family:${FS};font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;">${i + 1}</span>${esc(s)}</li>`).join('')}</ol>`
    : `<div style="font-family:${FB};font-size:13px;color:${C.faint};font-style:italic;">Sin plan de acción registrado para esta sesión.</div>`;

  const card = (inner, extra) =>
    `<div style="background:${C.panel};border:1px solid ${C.border};border-radius:14px;padding:24px 26px;${extra || ''}">${inner}</div>`;

  // ── Sección QUIZZ (condicional según quizz_realizado) ──
  const q = m.quizz;
  let quizzBlock;
  if (q.realizado && q.total) {
    const rows = q.questions.slice(0, 10).map((it) => {
      const col = it.correcta ? C.ok : C.risk;
      const mark = it.correcta ? '✅' : '❌';
      return `<div style="background:${C.panel2};border:1px solid ${C.border};border-left:3px solid ${col};border-radius:10px;padding:13px 15px;margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;gap:12px;">
          <div style="font-family:${FS};font-size:14px;line-height:1.4;color:${C.text};">${esc(it.pregunta)}</div>
          <div style="font-family:${FB};font-size:13px;color:${col};white-space:nowrap;">${mark}</div>
        </div>
        <div style="font-family:${FB};font-size:13px;color:${C.soft};margin-top:6px;"><span style="color:${C.faint};">Respondió:</span> ${esc(it.respuesta)}</div>
      </div>`;
    }).join('');
    const scoreCol = q.pct >= 80 ? C.ok : q.pct >= 60 ? C.gold : C.risk;
    quizzBlock = `
      <div style="display:flex;align-items:center;justify-content:space-between;background:${C.panel2};border:1px solid ${C.border};border-radius:12px;padding:16px 20px;margin-bottom:14px;">
        <div style="font-family:${FB};font-size:12px;${KERN}letter-spacing:0.15em;color:${C.faint};text-transform:uppercase;">Aciertos</div>
        <div style="font-family:${FS};font-size:26px;color:${scoreCol};${KERN}">${q.correct}/${q.total} <span style="font-size:15px;color:${C.faint};">· ${q.pct}%</span></div>
      </div>
      ${rows}`;
  } else {
    quizzBlock = `<div style="background:${C.panel2};border:1px dashed ${C.warn};border-radius:12px;padding:18px 20px;font-family:${FB};font-size:14px;color:${C.warn};${KERN}">
      ⚠️ El usuario no realizó ningún quizz en esta sesión.</div>`;
  }

  // ── Bloque NOTA DE DEEP LEARNING (CSS mejorado: espaciado + borde dorado) ──
  const dl = m.deepLearning;
  const dlRow = (mark, color, txt) => txt
    ? `<div style="margin-left:16px;line-height:1.8;letter-spacing:0.3px;padding:12px 16px;font-family:${FB};font-size:13px;color:${C.text};"><span style="color:${color};font-weight:700;">${mark}</span> ${esc(txt)}</div>`
    : '';
  const deepLearningBlock = dl ? `
    <div style="padding:26px 40px;border-bottom:1px solid ${C.border};">
      ${sectionHead('🧠 Nota de Deep Learning — mejoras para VÍCTOR')}
      <div style="background:#252529;border-left:3px solid ${C.gold};border-radius:8px;padding:6px 4px;">
        ${dlRow('✓', C.ok, dl.que_salio_bien || dl.bien)}
        ${dlRow('△', C.warn, dl.que_mejorar || dl.mejorar)}
        ${dlRow('⚙', C.gold, dl.config_sugerida || dl.config)}
        ${!(dl.que_salio_bien || dl.bien || dl.que_mejorar || dl.mejorar || dl.config_sugerida || dl.config)
          ? `<div style="margin-left:16px;line-height:1.8;letter-spacing:0.3px;padding:12px 16px;font-family:${FB};font-size:13px;color:${C.faint};font-style:italic;">Sin notas de deep learning en esta sesión.</div>` : ''}
      </div>
    </div>` : '';

  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="dark">
<title>Reporte Premium · ${esc(m.nombre)} · VTC</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility;}
  html,body{background:${C.bg};color:${C.text};font-family:${FB};-webkit-font-smoothing:antialiased;}
  .container{width:640px;max-width:640px;margin:0 auto;background:${C.bg};padding:32px;}
  .stack{display:flex;flex-direction:column;gap:16px;}
  svg{image-rendering:-webkit-optimize-contrast;shape-rendering:geometricPrecision;}
  svg text{text-rendering:geometricPrecision;}
</style></head>
<body>
<div class="container">
  <div style="background:${C.panel};border:1px solid ${C.border};border-radius:18px;overflow:hidden;">

    <!-- ══ HEADER ══ -->
    <div style="padding:36px 40px 28px;border-bottom:1px solid ${C.border};position:relative;">
      <div style="font-family:${FB};font-size:11px;${KERN}letter-spacing:0.22em;color:${C.gold};text-transform:uppercase;font-weight:600;">Victorious Travelers Club · Coach VÍCTOR</div>
      <div style="height:16px;"></div>
      <div style="font-family:${FS};font-size:32px;line-height:1.15;color:${C.text};${KERN}">Reporte de entrenamiento</div>
      <div style="height:10px;"></div>
      <div style="font-family:${FB};font-size:15px;color:${C.soft};${KERN}">${esc(m.nombre)} · Empleado Nº ${esc(m.empNum)}</div>
      <div style="height:4px;"></div>
      <div style="font-family:${FB};font-size:12px;color:${C.faint};${KERN}">${esc(m.stamp.label)} · Duración ${esc(fmtHMS(m.durSecs))}</div>
      <div style="height:14px;"></div>
      <div style="display:inline-block;font-family:${FB};font-size:11px;${KERN}letter-spacing:0.1em;color:${C.gold};background:#241f14;border:1px solid ${C.goldDk};border-radius:6px;padding:6px 12px;">SESIÓN ${esc(m.sessionId)}</div>
    </div>

    <!-- ══ SCORE HERO + SEMÁFORO ══ -->
    <div style="padding:34px 40px 30px;text-align:center;border-bottom:1px solid ${C.border};">
      <div style="font-family:${FB};font-size:11px;${KERN}letter-spacing:0.2em;color:${C.faint};text-transform:uppercase;">Desempeño global</div>
      <div style="height:8px;"></div>
      <div style="font-family:${FS};font-size:80px;line-height:1;color:${C.gold};${KERN}">${scoreStr}<span style="font-size:28px;color:${C.faint};">/10</span></div>
      <div style="height:16px;"></div>
      <div style="max-width:340px;margin:0 auto;">${progressBar(scorePct, { h: 8 })}</div>
      <div style="height:16px;"></div>
      <div style="display:inline-flex;align-items:center;gap:8px;font-family:${FB};font-size:14px;color:${sem.color};font-weight:600;${KERN}">
        <span style="font-size:18px;">${sem.emoji}</span> ${esc(sem.label)}
      </div>
    </div>

    <!-- ══ BARRA DE PROGRESO — DURACIÓN ══ -->
    <div style="padding:24px 40px;border-bottom:1px solid ${C.border};">
      ${sectionHead('Duración de la sesión')}
      <div style="display:flex;justify-content:space-between;font-family:${FB};font-size:13px;color:${C.soft};margin-bottom:8px;">
        <span>Tiempo total invertido</span>
        <span style="color:${C.gold};font-family:${FS};font-size:16px;">${esc(fmtMMSS(m.durSecs))} <span style="color:${C.faint};font-size:12px;">min</span></span>
      </div>
      ${progressBar(durPct, { h: 12 })}
      <div style="font-family:${FB};font-size:11px;color:${C.faint};margin-top:6px;">${durPct}% de una sesión objetivo de ${Math.round(m.durTargetSecs / 60)} min</div>
    </div>

    <!-- ══ RESUMEN GENERAL ══ -->
    <div style="padding:26px 40px;border-bottom:1px solid ${C.border};">
      ${sectionHead('Resumen general')}
      <div style="font-family:${FB};font-size:15px;line-height:1.6;color:${C.text};">${esc(m.resumen || 'Sin resumen disponible para esta sesión.')}</div>
    </div>

    <!-- ══ RADAR DE COMPETENCIAS ══ -->
    <div style="padding:28px 40px 20px;border-bottom:1px solid ${C.border};text-align:center;">
      ${sectionHead('Mapa de competencias')}
      <div style="width:360px;max-width:100%;margin:0 auto;">${RADAR}</div>
      <div style="font-family:${FB};font-size:11px;color:${C.faint};margin-top:10px;">Escala 0–10 · Rapport · PNL · Postura · Objeciones · Lectura · Cierre</div>
    </div>

    <!-- ══ MÉTRICAS: SILENCIO vs HABLA ══ -->
    <div style="padding:26px 40px;border-bottom:1px solid ${C.border};">
      ${sectionHead('Métricas · Distribución de tiempo')}
      ${metricsBlock}
    </div>

    <!-- ══ ANÁLISIS PNL ══ -->
    <div style="padding:26px 40px;border-bottom:1px solid ${C.border};">
      ${sectionHead('🧠 Análisis PNL')}
      ${listHtml(pnlItems, PENDIENTE, C.gold)}
    </div>

    <!-- ══ LO QUE HICISTE BIEN ══ -->
    <div style="padding:26px 40px;border-bottom:1px solid ${C.border};">
      ${sectionHead('✓ Lo que hiciste bien')}
      ${listHtml(fortItems, PENDIENTE, C.ok)}
    </div>

    <!-- ══ VALIDACIÓN DE APRENDIZAJE (QUIZZ, condicional) ══ -->
    <div style="padding:26px 40px;border-bottom:1px solid ${C.border};">
      ${sectionHead('🎓 Validación de aprendizaje')}
      ${quizzBlock}
    </div>

    <!-- ══ PLAN DE ACCIÓN (borde dorado sutil) ══ -->
    <div style="padding:26px 40px 30px;border-bottom:${dl ? '1px solid ' + C.border : 'none'};">
      ${sectionHead('◆ Plan de acción')}
      ${card(planHtml, `border-color:${C.gold};background:${C.panel2};`)}
    </div>

    <!-- ══ NOTA DE DEEP LEARNING (condicional) ══ -->
    ${deepLearningBlock}

    <!-- ══ FOOTER ══ -->
    <div style="padding:22px 40px;background:${C.bg};border-top:1px solid ${C.border};display:flex;justify-content:space-between;align-items:center;">
      <div style="font-family:${FB};font-size:12px;color:${C.faint};${KERN}"><span style="color:${C.gold};font-weight:600;">VÍCTOR</span> · Coach de IA del piso · Generado por Victor IA</div>
      <div style="font-family:${FB};font-size:10px;color:${C.faint};">${esc(m.stamp.iso)}</div>
    </div>

  </div>
  <div style="font-family:${FB};font-size:10px;color:${C.faint};text-align:center;padding-top:16px;${KERN}">Documento confidencial interno del equipo VTC · Sólo lectura</div>
</div>
</body></html>`;
}

/* ── Render PDF de alta nitidez (Chromium real, deviceScaleFactor 3 ≈ 288 DPI) ──
   Reproduce el enfoque de _render.js (1 sola página de altura dinámica) pero con
   mayor densidad de píxeles para que gráficos y texto se vean nítidos, no borrosos. */
const PAGE_WIDTH_PX = 640, OUTER_PAD_PX = 32, SAFETY_PX = 8;
async function renderPremiumPdf(html) {
  let browser = null;
  try {
    browser = await puppeteer.launch({
      args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb', '--font-render-hinting=none'],
      defaultViewport: { width: PAGE_WIDTH_PX + OUTER_PAD_PX * 2, height: 1200, deviceScaleFactor: 3 },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 45000 });
    try { await page.evaluateHandle('document.fonts.ready'); } catch (_) {}
    await page.addStyleTag({ content: `
      .container{width:${PAGE_WIDTH_PX}px !important;max-width:${PAGE_WIDTH_PX}px !important;}
      .container > div > div{break-inside:avoid !important;page-break-inside:avoid !important;}
      img,svg{break-inside:avoid !important;page-break-inside:avoid !important;}
    ` });
    const contentHeightPx = await page.evaluate(() => Math.ceil(
      Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
    ));
    const pdf = await page.pdf({
      printBackground: true,
      width: (PAGE_WIDTH_PX + OUTER_PAD_PX * 2) + 'px',
      height: (contentHeightPx + SAFETY_PX) + 'px',
      pageRanges: '1',
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
    });
    return Buffer.from(pdf);
  } finally {
    if (browser) { try { await browser.close(); } catch (_) {} }
  }
}

/* ── Handler ── */
module.exports = async (req, res) => {
  try {
    let data = {};
    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') { try { body = JSON.parse(body || '{}'); } catch (_) { body = {}; } }
      data = body || {};
    } else {
      data = (req.query || {});
      // competencias puede venir como JSON string en query
      if (typeof data.competencias === 'string') { try { data.competencias = JSON.parse(data.competencias); } catch (_) {} }
    }

    const html = buildHtml(data);
    const wantPdf = req.method === 'POST'
      ? !(req.query && req.query.preview === '1')          // POST → PDF por defecto
      : (req.query && (req.query.pdf === '1' || req.query.format === 'pdf')); // GET → PDF sólo si se pide

    if (!wantPdf) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(html);
      return;
    }

    const buf = await renderPremiumPdf(html);
    const m = normalize(data);
    const safe = ('Reporte-Premium-VTC_' + (m.nombre || 'asesor') + '_' + (m.sessionId || '')).replace(/[^a-zA-Z0-9_-]/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safe}.pdf"`);
    res.setHeader('Content-Length', buf.length);
    // PDF plano de sólo lectura (render estático de Chromium: sin campos de formulario editables).
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.status(200).end(buf);
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
};

module.exports.buildHtml = buildHtml;
module.exports.normalize = normalize;