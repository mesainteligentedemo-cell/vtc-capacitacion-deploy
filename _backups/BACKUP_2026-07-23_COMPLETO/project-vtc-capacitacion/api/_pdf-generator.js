// _pdf-generator.js — Documento Técnico Profesional VTC ELITE (Coach VÍCTOR)
// Motor único: genera UN documento HTML corporativo (crema/oro/tinta, Cormorant+Inter)
// que sirve a la vez como cuerpo del correo Y como fuente del PDF (Chromium real).
// El PDF añade encabezado/pie por página (metadatos + Página X de Y) vía header/footerTemplate.
//
// 16 secciones integradas · 5 gráficos SVG inline · 5 tablas de auditoría · flujo continuo.
// Sin dependencias nuevas: reutiliza @sparticuz/chromium + puppeteer-core ya instalados.

const { esc, clean, countInterventions } = require('./_chat');

/* ─────────────────────────── PALETA CORPORATIVA ─────────────────────────── */
const C = {
  bg:      '#F5F5F0',  // crema
  sheet:   '#FCFCF9',  // hoja (casi blanco)
  ink:     '#070708',  // tinta principal
  body:    '#2A2824',  // gris oscuro texto
  soft:    '#6B6862',  // gris medio
  faint:   '#9A968E',  // gris claro texto
  gold:    '#B89A6A',  // oro
  goldDk:  '#8C7343',  // oro oscuro
  headBg:  '#0F0F12',  // encabezado tablas
  ok:      '#27AE60',  // éxito
  warn:    '#F39C12',  // alerta
  risk:    '#C0392B',  // riesgo
  line:    '#D4D4D0',  // líneas
  panel:   '#FFFFFF',  // paneles
};
const FS = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";      // serif títulos
const FB = "'Inter', 'Helvetica Neue', Arial, sans-serif";                  // sans body
const FM = "'IBM Plex Mono', 'Courier New', ui-monospace, monospace";       // mono tablas

/* ─────────────────────────── HELPERS BÁSICOS ─────────────────────────── */
const num = (v) => { const n = parseFloat(v); return isFinite(n) ? n : null; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const r1 = (n) => Math.round(n * 10) / 10;
const has = (v) => v != null && String(v).trim() !== '';
function fx(n) { return Math.round(n * 100) / 100; }
function fmtMMSS(s) { s = Math.max(0, parseInt(s || 0, 10)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function fmtHMS(s) { s = Math.max(0, parseInt(s || 0, 10)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60; return [h, m, ss].map(x => String(x).padStart(2, '0')).join(':'); }
function secsOf(mmss) { const m = String(mmss || '').match(/(\d{1,2}):(\d{2})/); return m ? (+m[1] * 60 + +m[2]) : null; }
// Banda de color por score 0-10
function band(v) { v = num(v) || 0; return v >= 7 ? C.ok : v >= 4 ? C.warn : C.risk; }
// Flecha de tendencia con % (inv=true → bajar es bueno)
function trend(now, prev, inv) {
  now = num(now); prev = num(prev);
  if (now == null || prev == null) return { sym: '—', pct: '', color: C.soft, txt: 'sin dato' };
  const d = now - prev, up = inv ? d < 0 : d > 0;
  if (Math.abs(d) < 0.001) return { sym: '→', pct: '0%', color: C.soft, txt: 'sin cambio' };
  const pct = prev ? Math.round((d / Math.abs(prev)) * 100) : 0;
  return { sym: up ? '↑' : '↓', pct: (d > 0 ? '+' : '') + pct + '%', color: up ? C.ok : C.risk, txt: up ? 'mejora' : 'baja' };
}

/* ─────────────────────────── A · HEATMAP COMPETENCIAS (SVG) ───────────────────────────
   6 competencias, barra segmentada 10 celdas, color por banda (rojo/amarillo/verde). */
function heatmapSvg(comps) {
  const rowH = 30, padT = 6, w = 520, labelW = 150, cellsW = 250, cell = cellsW / 10;
  const h = padT * 2 + comps.length * rowH;
  let rows = '';
  comps.forEach((c, idx) => {
    const y = padT + idx * rowH;
    const score = clamp(Math.round(num(c.score) || 0), 0, 10);
    const col = band(c.score);
    let cells = '';
    for (let i = 0; i < 10; i++) {
      const x = labelW + i * cell;
      const on = i < score;
      cells += `<rect x="${fx(x)}" y="${y + 6}" width="${fx(cell - 3)}" height="13" rx="2" fill="${on ? col : '#EDEBE4'}" stroke="${on ? 'none' : C.line}" stroke-width="0.6"/>`;
    }
    rows += `<g>
      <text x="0" y="${y + 16}" font-family="${FB}" font-size="12" font-weight="500" fill="${C.body}">${esc(c.label)}</text>
      ${cells}
      <text x="${labelW + cellsW + 14}" y="${y + 16}" font-family="${FM}" font-size="12" font-weight="700" fill="${col}">${score}/10</text>
    </g>`;
  });
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${w}px;display:block;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mapa de calor de competencias">${rows}</svg>`;
}

/* ─────────────────────────── B · SPARKLINE HISTÓRICO (SVG) ───────────────────────────
   Últimas N sesiones. Eje Y 0-100%, X sesiones. Línea dorada + puntos verdes. */
function sparklineSvg(scores) {
  const vals = (scores || []).map(v => clamp((num(v) || 0) * 10, 0, 100)); // score(0-10)→%
  const w = 520, h = 150, padL = 34, padR = 16, padT = 14, padB = 26;
  const iw = w - padL - padR, ih = h - padT - padB;
  // Grid Y
  let grid = '';
  [0, 25, 50, 75, 100].forEach(g => {
    const y = padT + ih - (g / 100) * ih;
    grid += `<line x1="${padL}" y1="${fx(y)}" x2="${w - padR}" y2="${fx(y)}" stroke="${C.line}" stroke-width="0.6"/>`;
    grid += `<text x="${padL - 6}" y="${fx(y + 3)}" text-anchor="end" font-family="${FM}" font-size="8" fill="${C.faint}">${g}</text>`;
  });
  if (vals.length < 2) {
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${w}px;display:block;" xmlns="http://www.w3.org/2000/svg">${grid}
      <text x="${w / 2}" y="${h / 2}" text-anchor="middle" font-family="${FB}" font-size="12" fill="${C.faint}">Historial insuficiente — se construye sesión a sesión.</text></svg>`;
  }
  const step = iw / (vals.length - 1);
  const pts = vals.map((v, i) => [padL + i * step, padT + ih - (v / 100) * ih]);
  const path = pts.map((p, i) => (i ? 'L' : 'M') + fx(p[0]) + ' ' + fx(p[1])).join(' ');
  const area = `M ${fx(pts[0][0])} ${fx(padT + ih)} ` + pts.map(p => 'L ' + fx(p[0]) + ' ' + fx(p[1])).join(' ') + ` L ${fx(pts[pts.length - 1][0])} ${fx(padT + ih)} Z`;
  const dots = pts.map((p, i) => `<circle cx="${fx(p[0])}" cy="${fx(p[1])}" r="3.5" fill="${C.ok}" stroke="#fff" stroke-width="1"/>
     <text x="${fx(p[0])}" y="${h - 8}" text-anchor="middle" font-family="${FM}" font-size="8" fill="${C.soft}">S${i + 1}</text>`).join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${w}px;display:block;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sparkline histórico">
    ${grid}
    <path d="${area}" fill="${C.gold}" fill-opacity="0.10"/>
    <path d="${path}" fill="none" stroke="${C.gold}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    ${dots}</svg>`;
}

/* ─────────────────────────── C · GAUGE NEUROCIENCIA (SVG semicircular) ───────────────────────────
   pct 0-100, aguja. goodHigh=true → verde arriba; false → rojo arriba (cortisol/amígdala). */
function polar(cx, cy, r, deg) { const a = deg * Math.PI / 180; return [cx + r * Math.cos(a), cy - r * Math.sin(a)]; }
function semiPolyline(cx, cy, r, fromDeg, toDeg, n) {
  const pts = []; n = n || 24;
  for (let i = 0; i <= n; i++) { const d = fromDeg + (toDeg - fromDeg) * (i / n); const p = polar(cx, cy, r, d); pts.push(fx(p[0]) + ',' + fx(p[1])); }
  return pts.join(' ');
}
function gaugeSvg(label, pct, sub, goodHigh) {
  pct = clamp(Math.round(num(pct) || 0), 0, 100);
  const w = 150, h = 108, cx = w / 2, cy = 92, r = 58;
  const valDeg = 180 - (pct / 100) * 180;               // 180=izq(0%), 0=der(100%)
  // Salud del valor
  const healthy = goodHigh ? pct >= 60 : pct <= 40;
  const alert = goodHigh ? (pct >= 40 && pct < 60) : (pct > 40 && pct <= 60);
  const vcol = healthy ? C.ok : alert ? C.warn : C.risk;
  // Bandas del track (verde/amarillo/rojo). Para goodHigh se invierte el orden.
  const bands = goodHigh
    ? [[180, 108, C.risk], [108, 72, C.warn], [72, 0, C.ok]]
    : [[180, 108, C.ok], [108, 72, C.warn], [72, 0, C.risk]];
  let track = bands.map(b => `<polyline points="${semiPolyline(cx, cy, r, b[0], b[1], 16)}" fill="none" stroke="${b[2]}" stroke-width="9" stroke-linecap="butt" opacity="0.30"/>`).join('');
  const needle = polar(cx, cy, r - 6, valDeg);
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${w}px;display:block;margin:0 auto;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(label)} ${pct}%">
    ${track}
    <line x1="${cx}" y1="${cy}" x2="${fx(needle[0])}" y2="${fx(needle[1])}" stroke="${C.ink}" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy}" r="4.5" fill="${C.ink}"/>
    <text x="${cx}" y="${cy - 20}" text-anchor="middle" font-family="${FS}" font-size="26" font-weight="700" fill="${vcol}">${pct}<tspan font-size="12" fill="${C.faint}">%</tspan></text>
    <text x="${cx}" y="${h - 2}" text-anchor="middle" font-family="${FB}" font-size="11" font-weight="600" fill="${C.body}" letter-spacing="0.4">${esc(label)}</text>
  </svg>`;
}

/* ─────────────────────────── E · TIMELINE VISUAL (SVG) ───────────────────────────
   Línea horizontal 0:00→fin. Puntos coloreados por tipo (éxito/neutro/dificultad). */
function tlColor(label) {
  const s = String(label || '').toLowerCase();
  if (/objec|dificult|duda|error|fall|estr[eé]s|resist/.test(s)) return C.risk;
  if (/cierre|cerr|logr|[ée]xito|excelente|ok|acuerdo|rapport|vend/.test(s)) return C.ok;
  return C.gold;
}
function timelineSvg(items, durSecs) {
  const w = 520, h = 118, padL = 30, padR = 24, y = 40;
  const iw = w - padL - padR;
  const total = durSecs && durSecs > 0 ? durSecs : (items.reduce((mx, it) => Math.max(mx, secsOf(it[0]) || 0), 0) || 1);
  if (!items || !items.length) {
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${w}px;display:block;" xmlns="http://www.w3.org/2000/svg">
      <line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="${C.line}" stroke-width="2"/>
      <text x="${w / 2}" y="${y + 30}" text-anchor="middle" font-family="${FB}" font-size="12" fill="${C.faint}">Sin hitos registrados en esta sesión.</text></svg>`;
  }
  let dots = '';
  items.slice(0, 8).forEach((it, i) => {
    const t = clamp((secsOf(it[0]) || 0) / total, 0, 1);
    const x = padL + t * iw;
    const col = tlColor(it[1]);
    const above = i % 2 === 0;
    const ly = above ? y - 14 : y + 20;
    const lyText = above ? y - 18 : y + 34;
    dots += `<line x1="${fx(x)}" y1="${y}" x2="${fx(x)}" y2="${fx(ly)}" stroke="${col}" stroke-width="1" opacity="0.5"/>
      <circle cx="${fx(x)}" cy="${y}" r="5" fill="${col}" stroke="#fff" stroke-width="1.5"/>
      <text x="${fx(x)}" y="${fx(lyText)}" text-anchor="middle" font-family="${FM}" font-size="8" font-weight="700" fill="${col}">${esc(it[0])}</text>
      <text x="${fx(x)}" y="${fx(lyText + (above ? -10 : 11))}" text-anchor="middle" font-family="${FB}" font-size="8" fill="${C.soft}">${esc(String(it[1]).slice(0, 22))}</text>`;
  });
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${w}px;display:block;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Línea de tiempo de la conversación">
    <line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="${C.line}" stroke-width="2"/>
    <text x="${padL}" y="${y + 3}" text-anchor="middle" font-family="${FM}" font-size="8" fill="${C.faint}">▏</text>
    <text x="${w - padR}" y="${y + 3}" text-anchor="middle" font-family="${FM}" font-size="8" fill="${C.faint}">▕</text>
    <text x="${padL}" y="${h - 4}" font-family="${FM}" font-size="8" fill="${C.faint}">0:00</text>
    <text x="${w - padR}" y="${h - 4}" text-anchor="end" font-family="${FM}" font-size="8" fill="${C.faint}">${fmtMMSS(total)}</text>
    ${dots}</svg>`;
}

/* ─────────────────────────── COMPONENTES DE MAQUETA ─────────────────────────── */
// Título de sección con número
function sectionTitle(n, title, sub) {
  return `<div class="sec-head">
    <span class="sec-num">${String(n).padStart(2, '0')}</span>
    <div><h2 class="sec-title">${esc(title)}</h2>${sub ? `<div class="sec-sub">${esc(sub)}</div>` : ''}</div>
  </div>`;
}
// Tabla genérica de auditoría (clave/valor o filas)
function kvTable(caption, rows) {
  const body = rows.map(([k, v, cls]) =>
    `<tr><th class="kvk">${esc(k)}</th><td class="kvv ${cls || ''}">${v}</td></tr>`).join('');
  return `<table class="audit"><caption>${esc(caption)}</caption><tbody>${body}</tbody></table>`;
}

/* ─────────────────────────── DOCUMENTO COMPLETO ─────────────────────────── */
function buildTechDoc(m) {
  const site = m.site || 'https://vtc-capacitacion-deploy.vercel.app';
  // Metadatos de generación (America/Mexico_City = UTC-6, sin DST desde 2022)
  const now = new Date(Date.now() - 6 * 3600 * 1000);
  const pad = (x) => String(x).padStart(2, '0');
  const genDate = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`;
  const genTime = `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
  const genISO = `${genDate}T${genTime}-06:00`;

  const iv = m.interventions || { asesor: 0, agente: 0, total: 0 };
  const score = m.score;
  const scoreStr = score != null ? r1(score) : '—';
  const comps = m.comps || [];
  const compAvg = comps.length ? comps.reduce((a, c) => a + (num(c.score) || 0), 0) / comps.length : null;
  const hist = m.hist || { count: 0, scores: [] };

  /* ── KPIs con variación histórica ── */
  const durMin = r1((m.durSecs || 0) / 60);
  const histDurMin = hist.avgDurSecs != null ? r1(hist.avgDurSecs / 60) : null;
  const tDur = trend(durMin, histDurMin);
  const tComp = trend(compAvg, hist.avgCompAvg);
  const ratioNow = score != null ? Math.round(score * 10) : null;
  const ratioHist = hist.avgScore != null ? Math.round(hist.avgScore * 10) : null;
  const tRatio = trend(ratioNow, ratioHist);
  const tScore = trend(score, hist.avgScore);

  /* ── Tabla objeciones (heurística sobre texto libre) ── */
  function objRows() {
    const raw = String(m.objeciones || '').trim();
    if (!raw || raw === '—') return [['—', 'Sin objeciones registradas en esta sesión.', '—', C.soft]];
    const chunks = raw.split(/(?<=[.;])\s+|(?:\s·\s)|\n+/).map(s => s.trim()).filter(s => s.length > 8).slice(0, 5);
    if (!chunks.length) return [['General', raw.slice(0, 140), '⚠ Parcial', C.warn]];
    return chunks.map(s => {
      const low = s.toLowerCase();
      let ef = '⚠ Parcial', ec = C.warn;
      if (/resuel|resolv|super|convert|cerr|logr|efectiv|bien/.test(low)) { ef = '✅ Resuelta'; ec = C.ok; }
      else if (/no\s|fall|perd|no logr|d[ée]bil|floj/.test(low)) { ef = '✗ No resuelta'; ec = C.risk; }
      // Extraer "objeción" vs "manejo" si hay ":" o "—"
      const sp = s.split(/[:—–-]\s?/);
      const obj = sp[0].slice(0, 40);
      const man = (sp.slice(1).join(' ') || s).slice(0, 80);
      return [obj, man, ef, ec];
    });
  }

  /* ── Transcripción abreviada: 3 primeras + última ── */
  function transcriptRows() {
    const turns = (m.turns || []).filter(t => clean(t.message)).map(t => ({
      t: fmtMMSS(t.time_in_call_secs),
      who: (t.role || '').toLowerCase() === 'agent' ? 'Coach VÍCTOR' : (m.name || 'Asesor'),
      isAgent: (t.role || '').toLowerCase() === 'agent',
      txt: clean(t.message),
    }));
    if (!turns.length) return '<tr><td colspan="3" class="mono" style="color:' + C.faint + '">Sin transcripción disponible.</td></tr>';
    const pick = turns.slice(0, 3);
    const last = turns[turns.length - 1];
    let rows = pick.map(x => trRow(x)).join('');
    if (turns.length > 4) rows += `<tr><td colspan="3" class="mono tr-ell">··· ${turns.length - 4} intervenciones intermedias ···</td></tr>`;
    if (turns.length > 3) rows += trRow(last);
    return rows;
    function trRow(x) {
      return `<tr>
        <td class="mono tr-t">${esc(x.t)}</td>
        <td class="mono tr-s" style="color:${x.isAgent ? C.goldDk : C.body}">${esc(x.who)}</td>
        <td class="tr-x">${esc(x.txt.slice(0, 120))}${x.txt.length > 120 ? '…' : ''}</td>
      </tr>`;
    }
  }

  /* ── Listas ── */
  const bullets = (txt, color) => {
    const raw = String(txt || '').trim();
    if (!raw || raw === '—') return `<li style="color:${C.faint}">Sin datos registrados.</li>`;
    const items = raw.split(/(?<=[.;])\s+|\s·\s|\n+/).map(s => s.trim()).filter(s => s.length > 3).slice(0, 4);
    return (items.length ? items : [raw]).map(s => `<li${color ? ` style="--mk:${color}"` : ''}>${esc(s)}</li>`).join('');
  };
  const planItems = (arr) => (Array.isArray(arr) && arr.length)
    ? arr.map((s, i) => `<li><span class="pl-n">${i + 1}</span>${esc(s)}</li>`).join('')
    : `<li style="color:${C.faint}">Sin plan de acción registrado.</li>`;

  /* ── Neurociencia 4 gauges ── */
  const n4 = m.neuro4 || {};
  const gv = (k) => (n4[k] && n4[k].nivel != null) ? n4[k].nivel : 0;
  const gt = (k) => (n4[k] && n4[k].texto) ? n4[k].texto : '—';

  /* ── Principios neuro (barras) ── */
  const principios = (m.principios || []).slice(0, 6);
  const principiosHtml = principios.length
    ? principios.map(([nm, pct]) => {
      pct = clamp(parseInt(pct || 0, 10), 0, 100);
      return `<div class="prow"><div class="plabel">${esc(nm)}</div>
        <div class="ptrack"><div class="pfill" style="width:${pct}%"></div></div>
        <div class="ppct">${pct}%</div></div>`;
    }).join('')
    : `<div style="color:${C.faint};font-family:${FB};font-size:11px">No registrado en esta sesión.</div>`;

  /* ══════════════════════════ HTML ══════════════════════════ */
  const css = `
  *{box-sizing:border-box}
  html,body{margin:0;padding:0;background:${C.bg};color:${C.body};font-family:${FB};font-size:10.5pt;line-height:1.5;-webkit-font-smoothing:antialiased;}
  a{color:${C.goldDk};text-decoration:none}
  .sheet{max-width:820px;margin:0 auto;background:${C.sheet};position:relative;}
  .pad{padding:26px 40px;}
  h1,h2,h3{font-family:${FS};margin:0;color:${C.ink};font-weight:700}
  .mono{font-family:${FM}}
  /* Marca de agua sutil, solo impresión */
  .wm{display:none}
  @media print{
    .wm{display:block;position:fixed;top:42%;left:0;right:0;text-align:center;transform:rotate(-24deg);
        font-family:${FB};font-size:52px;letter-spacing:8px;color:${C.gold};opacity:0.05;font-weight:700;
        z-index:0;pointer-events:none;white-space:nowrap;}
    .sheet{max-width:none;box-shadow:none;background:${C.sheet}}
    .no-print{display:none!important}
    section,.card,.audit,.gauge,.svg-wrap,.momento{break-inside:avoid;page-break-inside:avoid}
    p,li{orphans:3;widows:3}
  }
  /* Portada */
  .cover{background:${C.ink};color:#fff;padding:40px 40px 34px;position:relative;overflow:hidden}
  .cover:before{content:'';position:absolute;top:-40px;right:-40px;width:220px;height:220px;border:1px solid ${C.gold};opacity:.18;border-radius:50%}
  .cover:after{content:'';position:absolute;bottom:-60px;left:-30px;width:180px;height:180px;border:1px solid ${C.gold};opacity:.10;border-radius:50%}
  .eyebrow{font-family:${FB};font-size:10px;letter-spacing:4px;text-transform:uppercase;color:${C.gold};font-weight:600}
  .cover h1{font-size:34px;line-height:1.08;color:#fff;margin:14px 0 4px;letter-spacing:.2px}
  .cover .sub{font-family:${FB};font-size:12px;color:#B9B6AE;letter-spacing:.3px}
  .cover-meta{margin-top:24px;display:flex;flex-wrap:wrap;gap:18px 34px;font-family:${FM};font-size:10.5px;color:#CFCCC4}
  .cover-meta b{display:block;font-family:${FB};font-size:8.5px;letter-spacing:2px;text-transform:uppercase;color:${C.gold};margin-bottom:3px;font-weight:600}
  .conf{position:absolute;top:18px;right:40px;font-family:${FB};font-size:8px;letter-spacing:2.5px;color:${C.gold};border:1px solid ${C.goldDk};border-radius:3px;padding:4px 9px}
  /* Franja metadatos (repetida visualmente arriba en email) */
  .metabar{display:flex;justify-content:space-between;align-items:center;background:#EFEDE6;border-bottom:1px solid ${C.line};padding:8px 40px;font-family:${FM};font-size:9px;color:${C.soft};letter-spacing:.3px}
  .metabar .gold{color:${C.goldDk};font-weight:700}
  /* Secciones */
  section{padding:24px 40px;border-top:1px solid ${C.line};position:relative;z-index:1}
  .sec-head{display:flex;align-items:flex-start;gap:14px;margin-bottom:16px}
  .sec-num{font-family:${FS};font-size:26px;font-weight:700;color:${C.gold};line-height:1;min-width:34px}
  .sec-title{font-size:19px;letter-spacing:.2px}
  .sec-sub{font-family:${FB};font-size:10px;color:${C.faint};letter-spacing:.3px;margin-top:3px}
  /* Score hero */
  .hero{display:flex;align-items:center;gap:28px;flex-wrap:wrap}
  .hero-score{font-family:${FS};font-size:76px;font-weight:700;color:${C.gold};line-height:.9}
  .hero-score small{font-size:26px;color:${C.faint}}
  .hero-txt{flex:1;min-width:220px}
  .hero-verdict{font-family:${FS};font-size:19px;color:${C.ink};font-style:italic;line-height:1.35}
  .hero-bar{height:7px;background:#E7E4DC;border-radius:99px;margin-top:12px;overflow:hidden}
  .hero-bar i{display:block;height:100%;background:linear-gradient(90deg,${C.goldDk},${C.gold});border-radius:99px}
  .lead{font-family:${FB};font-size:11.5px;line-height:1.7;color:${C.body}}
  /* Tablas auditoría */
  .audit{width:100%;border-collapse:collapse;font-family:${FM};font-size:10px;margin:2px 0 4px}
  .audit caption{caption-side:top;text-align:left;font-family:${FB};font-size:8.5px;letter-spacing:2px;text-transform:uppercase;color:${C.goldDk};font-weight:700;padding-bottom:8px}
  .audit th,.audit td{border:1px solid ${C.line};padding:7px 11px;text-align:left;vertical-align:top}
  .audit thead th{background:${C.headBg};color:${C.gold};font-family:${FB};font-size:8.5px;letter-spacing:1px;text-transform:uppercase;font-weight:600;border-color:${C.headBg}}
  .audit .kvk{background:#F1EFE8;color:${C.soft};width:210px;font-family:${FB};font-size:9px;letter-spacing:.4px;text-transform:uppercase;font-weight:600}
  .audit .kvv{color:${C.ink};font-weight:500}
  .audit tbody tr:nth-child(even) td{background:#FBFAF6}
  .tcell-ok{color:${C.ok};font-weight:700}.tcell-risk{color:${C.risk};font-weight:700}.tcell-soft{color:${C.soft}}
  /* Grids */
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:18px}
  .grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
  .card{background:${C.panel};border:1px solid ${C.line};border-radius:10px;padding:16px 18px}
  .card-k{font-family:${FB};font-size:8.5px;letter-spacing:1.5px;text-transform:uppercase;color:${C.faint};font-weight:600}
  .card-v{font-family:${FS};font-size:22px;color:${C.ink};margin-top:5px;line-height:1.1}
  .card-d{font-family:${FB};font-size:9.5px;color:${C.soft};margin-top:3px}
  .svg-wrap{background:${C.panel};border:1px solid ${C.line};border-radius:10px;padding:16px 18px;margin-top:6px}
  .svg-cap{font-family:${FB};font-size:8.5px;letter-spacing:1.5px;text-transform:uppercase;color:${C.goldDk};font-weight:700;margin-bottom:10px}
  .legend{display:flex;gap:16px;flex-wrap:wrap;margin-top:10px;font-family:${FB};font-size:9px;color:${C.soft}}
  .legend i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:5px;vertical-align:middle}
  /* Gauges */
  .gauges{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
  .gauge{background:${C.panel};border:1px solid ${C.line};border-radius:10px;padding:12px 8px 10px;text-align:center}
  .gauge .gsub{font-family:${FB};font-size:8px;color:${C.faint};letter-spacing:.5px;margin-top:2px;line-height:1.3;padding:0 4px}
  /* Barras principios */
  .prow{display:flex;align-items:center;gap:12px;margin-bottom:9px}
  .plabel{font-family:${FB};font-size:10.5px;color:${C.body};width:180px;flex-shrink:0}
  .ptrack{flex:1;height:6px;background:#E7E4DC;border-radius:99px;overflow:hidden}
  .pfill{height:100%;background:${C.gold};border-radius:99px}
  .ppct{font-family:${FM};font-size:10px;color:${C.goldDk};width:38px;text-align:right;font-weight:700}
  /* Bloques narrativos */
  .block{margin-top:14px}
  .block-k{font-family:${FB};font-size:9px;letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-bottom:7px;display:flex;align-items:center;gap:7px}
  ul.ticks{list-style:none;margin:0;padding:0}
  ul.ticks li{position:relative;padding:0 0 7px 18px;font-family:${FB};font-size:11px;line-height:1.55;color:${C.body}}
  ul.ticks li:before{content:'';position:absolute;left:2px;top:7px;width:7px;height:7px;border-radius:50%;background:var(--mk,${C.gold})}
  ol.plan{list-style:none;margin:0;padding:0;counter-reset:p}
  ol.plan li{position:relative;padding:0 0 10px 34px;font-family:${FB};font-size:11px;line-height:1.55;color:${C.body}}
  .pl-n{position:absolute;left:0;top:-1px;width:22px;height:22px;border-radius:50%;background:${C.ink};color:${C.gold};font-family:${FM};font-size:10px;font-weight:700;display:inline-flex;align-items:center;justify-content:center}
  /* Momento de oro */
  .momento{background:#FBF7EE;border:1px solid ${C.gold};border-left:4px solid ${C.gold};border-radius:10px;padding:20px 24px}
  .momento .q{font-family:${FS};font-size:19px;font-style:italic;color:${C.ink};line-height:1.4;margin:8px 0 12px}
  .momento .a{font-family:${FB};font-size:11px;color:${C.body};line-height:1.6}
  /* PNL / Neuro texto */
  .neuro-txt{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}
  .nt{background:#FBFAF6;border:1px solid ${C.line};border-radius:8px;padding:11px 13px}
  .nt-h{font-family:${FB};font-size:9px;letter-spacing:1px;text-transform:uppercase;font-weight:700;margin-bottom:4px}
  .nt-b{font-family:${FB};font-size:10px;color:${C.body};line-height:1.5}
  /* CTAs */
  .ctas{display:flex;flex-wrap:wrap;gap:10px;margin-top:8px}
  .btn{display:inline-block;font-family:${FB};font-size:10.5px;font-weight:700;letter-spacing:.6px;padding:12px 20px;border-radius:99px;border:1px solid ${C.ink}}
  .btn-gold{background:${C.gold};color:${C.ink};border-color:${C.gold}}
  .btn-ghost{background:transparent;color:${C.ink}}
  /* Deep learning */
  .dl{background:#F1EFE8;border:1px solid ${C.line};border-radius:10px;padding:18px 20px;margin-top:6px}
  .dl-row{font-family:${FB};font-size:10.5px;line-height:1.55;margin-bottom:8px;padding-left:20px;position:relative}
  .dl-row:before{position:absolute;left:0;top:0;font-size:11px}
  /* Footer del documento */
  .docfoot{background:${C.ink};color:#8C897F;padding:22px 40px;font-family:${FB};font-size:9px;display:flex;justify-content:space-between;align-items:center;letter-spacing:.3px}
  .docfoot .gold{color:${C.gold};font-weight:700;letter-spacing:1px}
  @page{size:A4;margin:24mm 16mm 18mm 16mm}
  `;

  const escName = esc(m.name || 'Asesor');
  const idioma = esc(m.idioma || '—');

  const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<title>Reporte Técnico de Capacitación · ${escName} · VTC ELITE</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>${css}</style></head>
<body>
<div class="wm">DOCUMENTO TÉCNICO CONFIDENCIAL</div>
<div class="sheet">

  <!-- Franja metadatos (visible en email; en PDF se repite vía header/footer del render) -->
  <div class="metabar">
    <span><span class="gold">${escName}</span> · Emp Nº ${esc(m.empNum || '—')} · ${esc(m.departamento || '—')}</span>
    <span>${esc(m.fechaISO || genDate)} · ${esc(m.horaInicio || '—')} → ${esc(m.horaFin || '—')}</span>
  </div>

  <!-- ══ 01 · PORTADA + METADATOS ══ -->
  <div class="cover">
    <div class="conf">CONFIDENCIAL</div>
    <div class="eyebrow">Victorious Travelers Club · Coach VÍCTOR</div>
    <h1>Reporte Técnico<br>de Capacitación</h1>
    <div class="sub">Análisis de desempeño asistido por IA · Sesión ${esc(m.tipoActividad || 'de entrenamiento')}</div>
    <div class="cover-meta">
      <div><b>Empleado</b>${escName}</div>
      <div><b>Nº / Depto.</b>${esc(m.empNum || '—')} · ${esc(m.departamento || '—')}</div>
      <div><b>Fecha sesión</b>${esc(m.fechaISO || genDate)}</div>
      <div><b>Horario</b>${esc(m.horaInicio || '—')} – ${esc(m.horaFin || '—')}</div>
      <div><b>Duración</b>${fmtHMS(m.durSecs)}</div>
      <div><b>Generado</b>${genISO}</div>
    </div>
  </div>

  <!-- ══ 02 · RESUMEN EJECUTIVO + SCORE ══ -->
  <section>
    ${sectionTitle(2, 'Resumen ejecutivo', 'Síntesis del desempeño y veredicto de la sesión')}
    <div class="hero">
      <div class="hero-score">${scoreStr}<small>/10</small></div>
      <div class="hero-txt">
        <div class="hero-verdict">“${esc(m.veredicto || 'Sesión de repaso.')}”</div>
        <div class="hero-bar"><i style="width:${score != null ? clamp(Math.round(score * 10), 0, 100) : 0}%"></i></div>
      </div>
    </div>
    <p class="lead" style="margin-top:16px">${esc((m.resumen || '(sin resumen)').slice(0, 900))}</p>
  </section>

  <!-- ══ 03 · TABLA RESUMEN DE SESIÓN ══ -->
  <section>
    ${sectionTitle(3, 'Información de sesión', 'Tabla 1 · Datos de trazabilidad')}
    ${kvTable('Tabla 1 — Resumen de sesión', [
      ['Empleado', escName],
      ['Número de empleado', esc(m.empNum || '—')],
      ['Departamento', esc(m.departamento || '—')],
      ['Rol', esc(m.userRole || '—')],
      ['Fecha (ISO 8601)', esc(m.fechaISO || genDate)],
      ['Hora inicio', esc(m.horaInicio || '—')],
      ['Hora cierre', esc(m.horaFin || '—')],
      ['Duración total', fmtHMS(m.durSecs)],
      ['Agente', 'Coach VÍCTOR · <span class="mono" style="color:' + C.soft + '">' + esc(m.agentId || '—') + '</span>'],
      ['Idioma', idioma],
      ['Escenario practicado', esc(m.escenario || m.tipoActividad || '—')],
      ['Tipo de cliente', esc(m.tipoCliente || '—')],
    ])}
  </section>

  <!-- ══ 04 · DASHBOARD VISUAL (SVG) ══ -->
  <section>
    ${sectionTitle(4, 'Dashboard visual', 'Mapa de calor · sparkline · gauges · timeline · tendencias')}

    <div class="svg-wrap">
      <div class="svg-cap">A · Mapa de calor de competencias (escala 1–10)</div>
      ${heatmapSvg(comps.length ? comps : [{ label: 'Sin datos', score: 0 }])}
      <div class="legend">
        <span><i style="background:${C.risk}"></i>Crítico 1–3</span>
        <span><i style="background:${C.warn}"></i>En desarrollo 4–6</span>
        <span><i style="background:${C.ok}"></i>Dominio 7–10</span>
      </div>
    </div>

    <div class="grid2" style="margin-top:14px">
      <div class="svg-wrap" style="margin-top:0">
        <div class="svg-cap">B · Histórico de desempeño (últimas sesiones)</div>
        ${sparklineSvg((hist.scores || []).concat(score != null ? [score] : []))}
      </div>
      <div class="svg-wrap" style="margin-top:0">
        <div class="svg-cap">C · Indicadores de tendencia</div>
        <div style="font-family:${FB};font-size:11px;line-height:2.1;color:${C.body}">
          <div>Desempeño: <b>${scoreStr}/10</b> <span style="color:${tScore.color};font-weight:700">(${tScore.pct} ${tScore.sym})</span> <span style="color:${C.faint}">vs histórico</span></div>
          <div>Competencias: <b>${compAvg != null ? r1(compAvg) : '—'}/10</b> <span style="color:${tComp.color};font-weight:700">(${tComp.pct} ${tComp.sym})</span></div>
          <div>Duración: <b>${fmtMMSS(m.durSecs)}</b> <span style="color:${tDur.color};font-weight:700">(${tDur.pct} ${tDur.sym})</span></div>
          <div>Ratio de éxito: <b>${ratioNow != null ? ratioNow + '%' : '—'}</b> <span style="color:${tRatio.color};font-weight:700">(${tRatio.pct} ${tRatio.sym})</span></div>
        </div>
      </div>
    </div>

    <div class="svg-wrap">
      <div class="svg-cap">D · Neurociencia — 4 medidores de activación</div>
      <div class="gauges">
        <div class="gauge">${gaugeSvg('Dopamina', gv('dopamina'), '', true)}<div class="gsub">Anticipación de recompensa</div></div>
        <div class="gauge">${gaugeSvg('Oxitocina', gv('oxitocina'), '', true)}<div class="gsub">Confianza y vínculo</div></div>
        <div class="gauge">${gaugeSvg('Cortisol', gv('cortisol'), '', false)}<div class="gsub">Estrés ante objeciones</div></div>
        <div class="gauge">${gaugeSvg('Amígdala', gv('amigdala'), '', false)}<div class="gsub">Percepción de riesgo</div></div>
      </div>
    </div>

    <div class="svg-wrap">
      <div class="svg-cap">E · Línea de tiempo de la conversación</div>
      ${timelineSvg(m.timeline || [], m.durSecs)}
      <div class="legend">
        <span><i style="background:${C.ok}"></i>Éxito</span>
        <span><i style="background:${C.gold}"></i>Neutro</span>
        <span><i style="background:${C.risk}"></i>Dificultad</span>
      </div>
    </div>
  </section>

  <!-- ══ 05 · MÉTRICAS CLAVE (KPIs) ══ -->
  <section>
    ${sectionTitle(5, 'Métricas clave', 'Tabla 2 · KPIs con variación histórica')}
    <table class="audit"><caption>Tabla 2 — Métricas clave (KPIs)</caption>
      <thead><tr><th>Métrica</th><th>Actual</th><th>Histórico</th><th>Variación</th></tr></thead>
      <tbody>
        <tr><td>Duración (min)</td><td>${durMin}</td><td>${histDurMin != null ? histDurMin : '—'}</td><td style="color:${tDur.color};font-weight:700">${tDur.pct} ${tDur.sym}</td></tr>
        <tr><td>Competencias (prom.)</td><td>${compAvg != null ? r1(compAvg) : '—'}</td><td>${hist.avgCompAvg != null ? r1(hist.avgCompAvg) : '—'}</td><td style="color:${tComp.color};font-weight:700">${tComp.pct} ${tComp.sym}</td></tr>
        <tr><td>Desempeño global</td><td>${scoreStr}</td><td>${hist.avgScore != null ? r1(hist.avgScore) : '—'}</td><td style="color:${tScore.color};font-weight:700">${tScore.pct} ${tScore.sym}</td></tr>
        <tr><td>Sentimiento</td><td>${esc(m.sentimiento || '—')}</td><td>—</td><td class="tcell-soft">${esc(m.sentimiento || '—')}</td></tr>
        <tr><td>Intervenciones</td><td>${iv.total}</td><td>—</td><td class="tcell-soft">${iv.asesor} asesor · ${iv.agente} Víctor</td></tr>
        <tr><td>Ratio de éxito</td><td>${ratioNow != null ? ratioNow + '%' : '—'}</td><td>${ratioHist != null ? ratioHist + '%' : '—'}</td><td style="color:${tRatio.color};font-weight:700">${tRatio.pct} ${tRatio.sym}</td></tr>
      </tbody>
    </table>
  </section>

  <!-- ══ 06 · ANÁLISIS DE PERFORMANCE ══ -->
  <section>
    ${sectionTitle(6, 'Análisis de performance', 'Tabla 3 · Competencias detalladas + intervenciones')}
    <table class="audit"><caption>Tabla 3 — Competencias detalladas</caption>
      <thead><tr><th>Competencia</th><th>Score</th><th>Histórico</th><th>Tendencia</th></tr></thead>
      <tbody>
        ${comps.map(c => {
          const h = hist.avgCompAvg; // no hay histórico por-competencia → usar prom global como referencia
          const t = trend(c.score, h);
          return `<tr><td>${esc(c.label)}</td><td style="color:${band(c.score)};font-weight:700">${Math.round(num(c.score) || 0)}/10</td><td class="tcell-soft">${h != null ? r1(h) + '/10' : '—'}</td><td style="color:${t.color};font-weight:700">${t.sym} ${t.pct}</td></tr>`;
        }).join('') || `<tr><td colspan="4" class="tcell-soft">Sin competencias registradas (sesión de curso/consulta).</td></tr>`}
      </tbody>
    </table>
    <div class="grid4" style="margin-top:14px">
      <div class="card"><div class="card-k">Tiempo hablado</div><div class="card-v">${fmtMMSS(m.durSecs)}</div><div class="card-d">min:seg</div></div>
      <div class="card"><div class="card-k">Sentimiento</div><div class="card-v">${esc(m.sentimiento || '—')}</div><div class="card-d">tono global</div></div>
      <div class="card"><div class="card-k">Intervenciones</div><div class="card-v">${iv.total}</div><div class="card-d">${iv.asesor} · ${iv.agente}</div></div>
      <div class="card"><div class="card-k">Idioma</div><div class="card-v" style="font-size:18px">${idioma}</div><div class="card-d">detectado</div></div>
    </div>
  </section>

  <!-- ══ 07 · ANÁLISIS PNL ══ -->
  <section>
    ${sectionTitle(7, 'Análisis PNL', 'Rapport, patrones lingüísticos y anclajes')}
    <p class="lead">${esc(m.analisisPnl || '—')}</p>
    <div class="block">
      <div class="block-k" style="color:${C.goldDk}">Principios neurocientíficos activados</div>
      ${principiosHtml}
    </div>
  </section>

  <!-- ══ 08 · ANÁLISIS NEUROCIENCIA ══ -->
  <section>
    ${sectionTitle(8, 'Insights de neurociencia', 'Dopamina · Cortisol · Oxitocina · Amígdala')}
    <div class="neuro-txt">
      <div class="nt"><div class="nt-h" style="color:${C.goldDk}">Dopamina · ${gv('dopamina')}%</div><div class="nt-b">${esc(gt('dopamina'))}</div></div>
      <div class="nt"><div class="nt-h" style="color:${C.ok}">Oxitocina · ${gv('oxitocina')}%</div><div class="nt-b">${esc(gt('oxitocina'))}</div></div>
      <div class="nt"><div class="nt-h" style="color:${C.warn}">Cortisol · ${gv('cortisol')}%</div><div class="nt-b">${esc(gt('cortisol'))}</div></div>
      <div class="nt"><div class="nt-h" style="color:${C.risk}">Amígdala · ${gv('amigdala')}%</div><div class="nt-b">${esc(gt('amigdala'))}</div></div>
    </div>
  </section>

  <!-- ══ 09 · TIMELINE + OBJECIONES ══ -->
  <section>
    ${sectionTitle(9, 'Objeciones enfrentadas', 'Tabla 4 · Cómo se manejaron y su efectividad')}
    <table class="audit"><caption>Tabla 4 — Análisis de objeciones enfrentadas</caption>
      <thead><tr><th>Objeción</th><th>Cómo se manejó</th><th>Efectividad</th></tr></thead>
      <tbody>
        ${objRows().map(([o, man, ef, ec]) => `<tr><td>${esc(o)}</td><td>${esc(man)}</td><td style="color:${ec};font-weight:700">${ef}</td></tr>`).join('')}
      </tbody>
    </table>
  </section>

  <!-- ══ 10 · FORTALEZAS + OPORTUNIDADES + ACCIONES ══ -->
  <section>
    ${sectionTitle(10, 'Fortalezas y oportunidades', 'Lo que funcionó, lo que hay que pulir y acciones de alto impacto')}
    <div class="grid2">
      <div class="block" style="margin-top:0">
        <div class="block-k" style="color:${C.ok}">✓ Fortalezas</div>
        <ul class="ticks">${bullets(m.fortalezas, C.ok)}</ul>
      </div>
      <div class="block" style="margin-top:0">
        <div class="block-k" style="color:${C.warn}">△ Oportunidades de mejora</div>
        <ul class="ticks">${bullets(m.areasMejora, C.warn)}</ul>
      </div>
    </div>
    <div class="block">
      <div class="block-k" style="color:${C.goldDk}">◆ Acciones de alto impacto</div>
      <ol class="plan">${planItems((m.planAccion || []).slice(0, 3))}</ol>
    </div>
  </section>

  <!-- ══ 11 · MOMENTO DE ORO ══ -->
  <section>
    ${sectionTitle(11, 'Momento de oro', 'La mejor intervención del asesor')}
    ${m.golden && m.golden.cita ? `<div class="momento">
      <div class="block-k" style="color:${C.goldDk}">✨ ${esc(m.golden.t || '')} · Mejor intervención</div>
      <div class="q">“${esc(m.golden.cita)}”</div>
      <div class="a"><b>Por qué fue efectiva:</b> ${esc(m.golden.analisis || '')}</div>
    </div>` : `<p class="lead" style="color:${C.faint}">No se identificó un momento de oro destacado en esta sesión.</p>`}
  </section>

  <!-- ══ 12 · ÍNDICE DE PROGRESO ══ -->
  <section>
    ${sectionTitle(12, 'Índice de progreso', 'Evolución del asesor sesión a sesión')}
    <div class="svg-wrap" style="margin-top:0">
      <div class="svg-cap">Curva de desempeño histórico ${hist.count ? '· ' + hist.count + ' sesión(es) previa(s)' : '· primera sesión'}</div>
      ${sparklineSvg((hist.scores || []).concat(score != null ? [score] : []))}
    </div>
    <table class="audit" style="margin-top:14px"><caption>Comparativo vs promedio histórico</caption>
      <thead><tr><th>Indicador</th><th>Sesión actual</th><th>Promedio histórico</th><th>Variación</th></tr></thead>
      <tbody>
        <tr><td>Desempeño</td><td>${scoreStr}</td><td>${hist.avgScore != null ? r1(hist.avgScore) : '—'}</td><td style="color:${tScore.color};font-weight:700">${tScore.pct} ${tScore.sym}</td></tr>
        <tr><td>Competencias (prom.)</td><td>${compAvg != null ? r1(compAvg) : '—'}</td><td>${hist.avgCompAvg != null ? r1(hist.avgCompAvg) : '—'}</td><td style="color:${tComp.color};font-weight:700">${tComp.pct} ${tComp.sym}</td></tr>
        <tr><td>Duración</td><td>${fmtMMSS(m.durSecs)}</td><td>${hist.avgDurSecs != null ? fmtMMSS(hist.avgDurSecs) : '—'}</td><td style="color:${tDur.color};font-weight:700">${tDur.pct} ${tDur.sym}</td></tr>
      </tbody>
    </table>
  </section>

  <!-- ══ 13 · PLAN PARA EL GERENTE ══ -->
  <section>
    ${sectionTitle(13, 'Plan para el gerente', 'Pasos concretos para llevar a este asesor a la excelencia')}
    <ol class="plan">${planItems(m.planAccion)}</ol>
    <div class="card" style="margin-top:14px;background:#FBF7EE;border-color:${C.gold}">
      <div class="card-k" style="color:${C.goldDk}">▶ Próximo drill recomendado</div>
      <div class="card-v" style="font-size:19px">${esc(m.siguienteModulo || m.recomendacion || 'Repaso general')}</div>
      <div class="ctas no-print" style="margin-top:12px">
        <a class="btn btn-gold" href="${site}/?modulo=${encodeURIComponent(m.siguienteModulo || '')}">📚 Ir al módulo siguiente</a>
      </div>
    </div>
  </section>

  <!-- ══ 14 · TRANSCRIPCIÓN ABREVIADA ══ -->
  <section>
    ${sectionTitle(14, 'Transcripción abreviada', 'Tabla 5 · Primeras intervenciones + cierre')}
    <table class="audit"><caption>Tabla 5 — Transcripción abreviada</caption>
      <thead><tr><th style="width:52px">Time</th><th style="width:120px">Speaker</th><th>Excerpt</th></tr></thead>
      <tbody>${transcriptRows()}</tbody>
    </table>
    <div class="no-print" style="margin-top:10px;font-family:${FB};font-size:9.5px;color:${C.faint}">
      Transcripción completa disponible en el reporte interactivo.
    </div>
  </section>

  <!-- ══ 15 · DEEP LEARNING DEL AGENTE ══ -->
  <section>
    ${sectionTitle(15, 'Deep Learning — optimización del agente', 'Aprendizaje continuo del Coach VÍCTOR')}
    <div class="dl">
      ${m.deepLearning && m.deepLearning.que_salio_bien ? `<div class="dl-row" style="color:${C.body}"><span style="color:${C.ok};position:absolute;left:0">✓</span>${esc(m.deepLearning.que_salio_bien)}</div>` : ''}
      ${m.deepLearning && m.deepLearning.que_mejorar ? `<div class="dl-row"><span style="color:${C.warn};position:absolute;left:0">△</span>${esc(m.deepLearning.que_mejorar)}</div>` : ''}
      ${m.deepLearning && m.deepLearning.config_sugerida ? `<div class="dl-row"><span style="color:${C.goldDk};position:absolute;left:0">⚙</span>${esc(m.deepLearning.config_sugerida)}</div>` : ''}
      ${!m.deepLearning ? `<div class="dl-row" style="color:${C.faint}">Sin notas de deep learning en esta sesión.</div>` : ''}
    </div>
  </section>

  <!-- ══ 16 · CTAs FINALES ══ -->
  <section class="no-print">
    ${sectionTitle(16, 'Acciones', 'Recursos de la sesión')}
    <div class="ctas">
      <a class="btn btn-gold" href="${site}/api/report?conv=${encodeURIComponent(m.convId || '')}">📊 Ver reporte interactivo</a>
      <a class="btn btn-ghost" href="${site}/api/report?conv=${encodeURIComponent(m.convId || '')}&pdf=1">📥 Descargar PDF</a>
      <a class="btn btn-ghost" href="${site}/api/audio?conv=${encodeURIComponent(m.convId || '')}">🎙️ Escuchar grabación</a>
      <a class="btn btn-ghost" href="${site}/?modulo=${encodeURIComponent(m.siguienteModulo || '')}">📚 Módulo siguiente</a>
    </div>
  </section>

  <!-- Footer documento -->
  <div class="docfoot">
    <div><span class="gold">VÍCTOR</span> · Coach de IA del piso · Generado por Victor IA</div>
    <div class="mono">${genISO} · Sesión ${esc(m.convId || '—')}</div>
  </div>

</div>
</body></html>`;

  return { html, meta: { name: m.name || 'Asesor', empNum: m.empNum || '', fechaISO: m.fechaISO || genDate, genISO, convId: m.convId || '' } };
}

/* ─────────────────────────── RENDER PDF (Chromium real, header/footer por página) ───────────────────────────
   Usa el navegador compartido de ./_browser.js (concurrency-safe) en vez de lanzar Chromium por
   request: evita la condición de carrera "spawn ETXTBSY" al extraer el binario (ver _browser.js). */
async function renderPdf(html, meta) {
  const { withPage } = require('./_browser');
  meta = meta || {};
  return withPage(async (page) => {
    await page.setViewport({ width: 820, height: 1160, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 45000 });
    try { await page.evaluateHandle('document.fonts.ready'); } catch (_) {}

    const hf = (s) => String(s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const header = `<div style="width:100%;font-size:7px;font-family:Arial,Helvetica,sans-serif;color:#9A968E;padding:4px 16mm 0;-webkit-print-color-adjust:exact;">
      <table style="width:100%;border-collapse:collapse"><tr>
        <td style="text-align:left;font-weight:700;color:#8C7343">${hf(meta.name)} · Emp Nº ${hf(meta.empNum)}</td>
        <td style="text-align:right">${hf(meta.fechaISO)} · DOCUMENTO TÉCNICO CONFIDENCIAL</td>
      </tr></table></div>`;
    const footer = `<div style="width:100%;font-size:7px;font-family:Arial,Helvetica,sans-serif;color:#9A968E;padding:0 16mm 4px;-webkit-print-color-adjust:exact;">
      <table style="width:100%;border-collapse:collapse"><tr>
        <td style="text-align:left">VTC ELITE · Coach VÍCTOR</td>
        <td style="text-align:center">Página <span class="pageNumber"></span> de <span class="totalPages"></span></td>
        <td style="text-align:right">Generado ${hf(meta.genISO)}</td>
      </tr></table></div>`;

    const pdf = await page.pdf({
      printBackground: true,
      format: 'A4',
      displayHeaderFooter: true,
      headerTemplate: header,
      footerTemplate: footer,
      margin: { top: '22mm', bottom: '16mm', left: '0', right: '0' },
    });
    return Buffer.from(pdf);
  });
}

module.exports = { buildTechDoc, renderPdf, heatmapSvg, sparklineSvg, gaugeSvg, timelineSvg };