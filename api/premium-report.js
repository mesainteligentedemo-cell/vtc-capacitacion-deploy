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

const { radarSvg } = require('./_chat');
const { htmlToPdf } = require('./_render');

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

/* ── Barra de progreso genérica (relleno dorado progresivo) ── */
function progressBar(pct, opts) {
  opts = opts || {};
  pct = clamp(Math.round(num(pct) || 0), 0, 100);
  const h = opts.h || 10;
  const fill = opts.fill || `linear-gradient(90deg,${C.goldDk},${C.gold})`;
  return `<div style="background:${C.track};border-radius:99px;height:${h}px;overflow:hidden;width:100%;">
    <div style="width:${pct}%;height:100%;background:${fill};border-radius:99px;"></div></div>`;
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
  };
}

/* ── Documento HTML premium ── */
function buildHtml(p) {
  const m = normalize(p);
  const scoreStr = m.score != null ? (Math.round(m.score * 10) / 10).toString().replace('.', ',') : '—';
  const scorePct = m.score != null ? clamp(Math.round(m.score * 10), 0, 100) : 0;
  const sem = semaforo(m.score);
  const durPct = clamp(Math.round((m.durSecs / m.durTargetSecs) * 100), 0, 100);

  const RADAR = radarSvg(['Rapport', 'PNL', 'Postura', 'Objeciones', 'Lectura', 'Cierre'], m.compValues, { size: 360, lang: 'es' });

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

  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="dark">
<title>Reporte Premium · ${esc(m.nombre)} · VTC</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  html,body{background:${C.bg};color:${C.text};font-family:${FB};-webkit-font-smoothing:antialiased;}
  .container{width:640px;max-width:640px;margin:0 auto;background:${C.bg};padding:32px;}
  .stack{display:flex;flex-direction:column;gap:16px;}
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

    <!-- ══ PLAN DE ACCIÓN (borde dorado sutil) ══ -->
    <div style="padding:26px 40px 30px;">
      ${sectionHead('◆ Plan de acción')}
      ${card(planHtml, `border-color:${C.gold};background:${C.panel2};`)}
    </div>

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

    const buf = await htmlToPdf(html);
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