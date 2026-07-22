// Builders compartidos para el chat y los graficos del reporte.
const { t } = require('./_i18n');
const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Limpia basura tecnica del mensaje del agente.
function clean(msg) {
  let s = String(msg == null ? '' : msg);
  s = s.replace(/<cliente>[\s\S]*?<\/cliente>/gi, ' ');
  s = s.replace(/<\/?[a-z][^>]*>/gi, ' ');
  s = s.replace(/\[[^\]\n]{1,40}\]/g, ' ');
  s = s.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');
  s = s.replace(/[ \t]{2,}/g, ' ').replace(/\s*\n\s*/g, ' ').trim();
  return s;
}

function fmtTime(secs) {
  secs = Math.max(0, parseInt(secs || 0, 10));
  const m = Math.floor(secs / 60), s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const has = (v) => v != null && String(v).trim() !== '';

// Formatea un numero 0-10 (o cualquiera) con UN decimal y coma española: 8.5 -> "8,5", 10 -> "10".
function fmtDec(n) {
  if (n == null || n === '') return '—';
  const x = Math.round(parseFloat(n) * 10) / 10;
  if (!isFinite(x)) return '—';
  return String(x).replace('.', ',');
}

// Burbujas de chat: Victor izquierda (oro) / Asesor derecha (morado).
function buildChatTable(turns, lang) {
  const rows = (Array.isArray(turns) ? turns : []).map((tn) => {
    const isAgent = (tn.role || '').toLowerCase() === 'agent';
    const text = clean(tn.message);
    if (!text) return '';
    const who = isAgent ? t('VÍCTOR', lang) : t('ASESOR', lang);
    const color = isAgent ? '#EAB308' : '#9b8cff';
    const bg = isAgent ? '#161410' : '#14131a';
    const bd = isAgent ? '#2a2620' : '#2a2740';
    const align = isAgent ? 'left' : 'right';
    return `<tr><td style="padding:0 0 12px 0;">
      <table role="presentation" width="82%" align="${align}" cellpadding="0" cellspacing="0" border="0" style="background:${bg};border:1px solid ${bd};border-radius:14px;">
        <tr><td style="padding:13px 17px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="font-family:Inter,sans-serif;font-size:10px;letter-spacing:2px;color:${color};font-weight:700;">${who}</td>
            <td align="right" style="font-family:Inter,sans-serif;font-size:10px;color:#5a5a62;letter-spacing:0.5px;">${fmtTime(tn.time_in_call_secs)}</td>
          </tr></table>
          <div style="height:6px;font-size:0;">&nbsp;</div>
          <div style="font-family:Inter,sans-serif;font-size:14px;line-height:22px;color:#dcdce2;">${esc(text)}</div>
        </td></tr>
      </table>
      <div style="clear:both;font-size:0;line-height:0;">&nbsp;</div>
    </td></tr>`;
  }).join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows || `<tr><td style="color:#8a8a8a;font-family:Inter,sans-serif;">${t('Sin transcripción disponible.', lang)}</td></tr>`}</table>`;
}

// Radar de competencias (QuickChart, dark). Se mantiene por compatibilidad, ya no se usa en el template.
function radarUrl(labels, values) {
  const chart = { type: 'radar', data: { labels, datasets: [{ data: values,
    backgroundColor: 'rgba(201,170,117,0.18)', borderColor: 'rgba(201,170,117,1)', borderWidth: 2,
    pointBackgroundColor: '#EAB308', pointRadius: 3 }] },
    options: { legend: { display: false }, scale: { ticks: { display: false, beginAtZero: true, max: 10, stepSize: 2 },
      gridLines: { color: 'rgba(255,255,255,0.08)' }, angleLines: { color: 'rgba(255,255,255,0.08)' },
      pointLabels: { fontColor: '#EAB308', fontSize: 13 } } } };
  return 'https://quickchart.io/chart?bkg=transparent&w=360&h=360&c=' + encodeURIComponent(JSON.stringify(chart));
}

// Radar de competencias — SVG inline (sin dependencia externa). 6 ejes, valores 0-10.
// Se renderiza igual en Puppeteer (PDF) y en clientes de correo modernos que soportan <svg> inline.
function radarSvg(labels, values, opts) {
  opts = opts || {};
  const size = opts.size || 360;      // tamaño visual (ancho/alto CSS del <svg>)
  const vb = Math.round(size * 1.3);  // lienzo interno mas grande que el tamaño visual, para
                                       // dejar espacio a las etiquetas largas ("Objeciones", "Leer la sala")
                                       // sin que se recorten contra el borde del viewBox.
  const cx = vb / 2, cy = vb / 2;
  const R = vb * 0.235;       // radio maximo (valor = 10)
  const labelR = vb * 0.335;  // radio de las etiquetas
  const n = labels.length || 1;
  const max = 10, rings = 5;
  const angleFor = (i) => (Math.PI * 2 * i / n) - Math.PI / 2;
  const fx = (n) => Math.round(n * 100) / 100;

  let gridSvg = '';
  for (let lvl = 1; lvl <= rings; lvl++) {
    const rr = R * (lvl / rings);
    const pts = [];
    for (let i = 0; i < n; i++) { const a = angleFor(i); pts.push(fx(cx + rr * Math.cos(a)) + ',' + fx(cy + rr * Math.sin(a))); }
    gridSvg += `<polygon points="${pts.join(' ')}" fill="none" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>`;
  }

  let axisSvg = '';
  for (let i = 0; i < n; i++) {
    const a = angleFor(i);
    axisSvg += `<line x1="${cx}" y1="${cy}" x2="${fx(cx + R * Math.cos(a))}" y2="${fx(cy + R * Math.sin(a))}" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>`;
  }

  const dataPts = (values.length ? values : labels.map(() => 0)).map((v, i) => {
    const a = angleFor(i);
    const r = (Math.max(0, Math.min(max, parseFloat(v) || 0)) / max) * R;
    return [fx(cx + r * Math.cos(a)), fx(cy + r * Math.sin(a))];
  });
  const dataPolyStr = dataPts.map((p) => p[0] + ',' + p[1]).join(' ');
  const dots = dataPts.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="#EAB308"/>`).join('');

  let labelsSvg = '';
  for (let i = 0; i < n; i++) {
    const a = angleFor(i);
    const x = fx(cx + labelR * Math.cos(a)), y = fx(cy + labelR * Math.sin(a));
    let anchor = 'middle';
    if (Math.cos(a) > 0.28) anchor = 'start';
    else if (Math.cos(a) < -0.28) anchor = 'end';
    labelsSvg += `<text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle" fill="#EAB308" font-family="Inter,sans-serif" font-size="13" letter-spacing="0.3">${esc(labels[i])}</text>`;
  }

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${vb} ${vb}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${t('Radar de competencias', opts.lang)}" style="display:block;margin:0 auto;width:100%;height:auto;max-width:${size}px;overflow:visible;">${gridSvg}${axisSvg}<polygon points="${dataPolyStr}" fill="rgba(234,179,8,0.20)" stroke="#EAB308" stroke-width="2"/>${dots}${labelsSvg}</svg>`;
}

// Barras de principios neurocientificos. pairs: [[name,pct],...]
function neuroBars(pairs) {
  if (!pairs || !pairs.length) return '<tr><td style="font-family:Inter,sans-serif;font-size:13px;color:#8a8a8a;">No registrado en esta sesión.</td></tr>';
  return pairs.map(([name, pct]) => {
    pct = Math.max(0, Math.min(100, parseInt(pct || 0, 10)));
    return `<tr><td style="padding:0 0 4px 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="font-family:Inter,sans-serif;font-size:13px;color:#E5E5E5;letter-spacing:0.3px;">${esc(name)}</td>
      <td align="right" style="font-family:Inter,sans-serif;font-size:12px;color:#EAB308;">${pct}%</td></tr></table></td></tr>
      <tr><td style="padding:0 0 13px 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#262626;border-radius:99px;"><tr>
      <td style="font-size:0;line-height:0;"><table width="${pct}%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td height="6" style="background:#EAB308;border-radius:99px;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr></table></td></tr>`;
  }).join('');
}

// Linea de tiempo. items: [[t,label],...]
function timeline(items) {
  if (!items || !items.length) return '<tr><td style="font-family:Inter,sans-serif;font-size:13px;color:#8a8a8a;">No registrada.</td></tr>';
  return items.map(([t, label]) =>
    `<tr><td width="66" valign="top" style="font-family:Inter,sans-serif;font-size:12px;color:#EAB308;letter-spacing:1px;padding:0 0 16px 0;">${esc(t)}</td>
     <td valign="top" style="padding:0 0 16px 14px;border-left:2px solid #3a3020;">
     <span style="font-family:Inter,sans-serif;font-size:14px;line-height:20px;color:#E5E5E5;">${esc(label)}</span></td></tr>`
  ).join('');
}

// ── Fila de métricas (Escenario + Módulos practicados). Módulos solo "si aplica". ──
function metricsRow(m, lang) {
  const hasModulos = has(m.modulos) && m.modulos !== '—';
  const escenarioCard = `
    <td class="stack stack-pad" width="${hasModulos ? '50%' : '100%'}" valign="top" style="padding:8px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#171717;border:1px solid #262626;border-radius:12px;"><tr><td style="padding:18px 20px;">
        <div style="font-family:Inter,sans-serif;font-size:10px;letter-spacing:2.5px;color:#A3A3A3;text-transform:uppercase;">${t('Escenario', lang)}</div>
        <div style="height:7px;font-size:0;">&nbsp;</div>
        <div class="metric-num" style="font-family:Montserrat,sans-serif;font-weight:700;font-size:19px;color:#FFFFFF;line-height:24px;">${esc(m.escenario || '—')}</div>
        <div style="font-family:Inter,sans-serif;font-size:12px;color:#8a8a8a;line-height:17px;margin-top:3px;">${esc(m.tipoCliente || '')}${m.tipoCliente ? ' · ' : ''}${esc(m.idioma || '')}</div>
      </td></tr></table></td>`;
  const modulosCard = hasModulos ? `
    <td class="stack stack-pad" width="50%" valign="top" style="padding:8px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#171717;border:1px solid #262626;border-radius:12px;"><tr><td style="padding:18px 20px;">
        <div style="font-family:Inter,sans-serif;font-size:10px;letter-spacing:2.5px;color:#A3A3A3;text-transform:uppercase;">${t('Módulos practicados', lang)}</div>
        <div style="height:7px;font-size:0;">&nbsp;</div>
        <div class="metric-num" style="font-family:Montserrat,sans-serif;font-weight:700;font-size:19px;color:#FFFFFF;line-height:24px;">${esc(m.modulos)}</div>
        <div style="font-family:Inter,sans-serif;font-size:12px;color:#8a8a8a;line-height:17px;margin-top:3px;">${esc(m.tipoActividad || '')}</div>
      </td></tr></table></td>` : '';
  return `<tr><td class="px" style="padding:16px 36px 8px 36px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${escenarioCard}${modulosCard}</tr></table>
  </td></tr>`;
}

// ── Tiempo hablado por rol (aprox. desde time_in_call_secs). ──
// ElevenLabs no da duración por turno; se estima como (inicio del siguiente turno − inicio de este).
// Devuelve { asesor, agente } en segundos.
function speakingTime(turns, totalSecs) {
  const arr = (Array.isArray(turns) ? turns : []).filter((t) => t && t.time_in_call_secs != null);
  const total = parseInt(totalSecs || 0, 10) || 0;
  // Cap por turno: evita que una pausa larga o la cola de la llamada (último turno → fin)
  // se atribuyan enteras a un solo hablante e inflen el "tiempo hablado".
  const CAP = 45;
  let asesor = 0, agente = 0;
  for (let i = 0; i < arr.length; i++) {
    const start = parseInt(arr[i].time_in_call_secs, 10) || 0;
    const isLast = i + 1 >= arr.length;
    const next = isLast ? (total || start) : (parseInt(arr[i + 1].time_in_call_secs, 10) || start);
    const dur = Math.min(CAP, Math.max(0, next - start));
    if ((arr[i].role || '').toLowerCase() === 'agent') agente += dur; else asesor += dur;
  }
  return { asesor, agente };
}

// ── Tabla 4 columnas (spec VTC): Tiempo hablado | Idioma | Sentimiento | Intervenciones ──
// Debajo, tira secundaria con Duración total · Tono · Dificultad · Hora inicio–fin.
function analyticsRow(m, lang) {
  const cell = (label, value) => `
    <td class="stack" width="25%" valign="top" style="padding:6px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#171717;border:1px solid #262626;border-radius:10px;"><tr><td align="center" style="padding:14px 8px;">
        <div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:20px;color:#FFFFFF;line-height:24px;">${esc(value == null || value === '' ? '—' : value)}</div>
        <div style="font-family:Inter,sans-serif;font-size:9px;letter-spacing:1.5px;color:#A3A3A3;text-transform:uppercase;margin-top:4px;">${esc(label)}</div>
      </td></tr></table></td>`;
  const chips = [
    m.duracionExacta ? [t('Duración', lang), m.duracionExacta + ' min'] : null,
    (m.tono && m.tono !== '—') ? [t('Tono', lang), m.tono] : null,
    (m.dificultad && m.dificultad !== '—') ? [t('Dificultad', lang), m.dificultad] : null,
    (m.horaInicio && m.horaFin) ? [t('Horario', lang), m.horaInicio + '–' + m.horaFin] : null,
  ].filter(Boolean).map(([k, v]) =>
    `<span style="display:inline-block;font-family:Inter,sans-serif;font-size:11px;color:#9a9a9a;background:#171717;border:1px solid #262626;border-radius:99px;padding:5px 12px;margin:0 5px 6px 0;letter-spacing:0.3px;"><span style="color:#A3A3A3;text-transform:uppercase;font-size:9px;letter-spacing:1px;">${esc(k)}</span>&nbsp;&nbsp;${esc(v)}</span>`
  ).join('');
  return `<tr><td class="px" style="padding:10px 40px 4px 40px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      ${cell(t('Tiempo hablado', lang), m.tiempoHablado)}
      ${cell(t('Idioma', lang), m.idioma)}
      ${cell(t('Sentimiento', lang), m.sentimiento)}
      ${cell(t('Intervenciones', lang), m.intervenciones)}
    </tr></table>
    ${chips ? `<div style="height:10px;font-size:0;">&nbsp;</div><div style="padding:0 6px;">${chips}</div>` : ''}
  </td></tr>`;
}

// Etiqueta legible de un modulo/seccion a partir del id o del parametro de la herramienta.
const MOD_LABELS = {
  'inicio': 'Inicio del curso', 'top': 'Inicio del curso', 'cero': 'Inicio del curso',
  'indice': 'Índice de módulos', 'modulos': 'Índice de módulos', 'todos': 'Índice de módulos',
  'bienvenida': 'Bienvenida', 'f': 'F · Fundamentos', 'fundamentos': 'F · Fundamentos',
  '0': '0 · Psicología', '1': '1 · Calificación', '2': '2 · El OPC', '3': '3 · Rapport y PNL',
  '4': '4 · El Tour', '5': '5 · Presentación', '6': '6 · El Cierre', '7': '7 · Objeciones',
  '8': '8 · TOC y Cierres', '9': '9 · Manager Close', '10': '10 · PNL Avanzado',
  '11': '11 · Nacionalidades', '12': '12 · Ética y Legal',
  'lvc': 'El Proceso VTC (12 etapas)', 'proceso': 'El Proceso VTC (12 etapas)',
  'vtc19': 'Pitch VTC (19 módulos)', '19': 'Pitch VTC (19 módulos)', 'fin': 'Cierre del curso',
};
function modLabel(raw, lang) {
  let k = String(raw == null ? '' : raw).toLowerCase().replace(/módulo|modulo-|modulo|paso|step|pitch/g, '').trim();
  const pm = k.match(/(\d{1,2})/);
  if (MOD_LABELS[k]) return t(MOD_LABELS[k], lang);
  if (pm && MOD_LABELS[pm[1]]) return t(MOD_LABELS[pm[1]], lang);
  return raw ? String(raw) : t('el curso', lang);
}
function paramOf(c) {
  try { const p = JSON.parse(c.params_as_json || '{}'); return p.modulo || p.module || p.id || ''; } catch (e) { return ''; }
}

// Reconstruye "lo que el usuario hizo" desde los tool_calls del transcript.
// Devuelve {items:[[mmss,texto],...], modulos:Set, videos:n, quizzes:n, resumen:string}
function extractActivity(turns, lang) {
  const items = [], mods = new Set(); let videos = 0, quizzes = 0, lastMod = '';
  (Array.isArray(turns) ? turns : []).forEach((tn) => {
    const tt = fmtTime(tn.time_in_call_secs);
    (tn.tool_calls || []).forEach((c) => {
      const nm = c.tool_name || c.name || ''; const arg = paramOf(c); const lab = modLabel(arg, lang);
      if (nm === 'ir_a_modulo') { if (lab !== lastMod) { items.push([tt, t('Entró a', lang) + ' ' + lab]); mods.add(lab); lastMod = lab; } }
      else if (nm === 'reproducir_video') { videos++; items.push([tt, t('▶ Vio el video de', lang) + ' ' + lab]); mods.add(lab); }
      else if (nm === 'ir_al_quiz') { quizzes++; items.push([tt, t('✓ Hizo el quiz de', lang) + ' ' + lab]); mods.add(lab); }
    });
  });
  const parts = [];
  if (mods.size) parts.push(mods.size + (mods.size === 1 ? ' sección' : ' secciones'));
  if (videos) parts.push(videos + (videos === 1 ? ' video' : ' videos'));
  if (quizzes) parts.push(quizzes + (quizzes === 1 ? ' quiz' : ' quizzes'));
  return { items, modulos: mods, videos, quizzes, resumen: parts.join(' · ') };
}

// Bloque HTML "Actividad de la sesion" para el reporte (email/PDF).
function activitySection(turns, lang) {
  const a = extractActivity(turns, lang);
  const rows = a.items.length
    ? a.items.map(([tt, label]) =>
        `<tr><td width="60" valign="top" style="font-family:Inter,sans-serif;font-size:12px;color:#EAB308;letter-spacing:1px;padding:0 0 13px 0;">${esc(tt)}</td>
         <td valign="top" style="padding:0 0 13px 14px;border-left:2px solid #3a3020;">
         <span style="font-family:Inter,sans-serif;font-size:14px;line-height:20px;color:#dcdce2;">${esc(label)}</span></td></tr>`).join('')
    : `<tr><td style="font-family:Inter,sans-serif;font-size:13px;color:#8a8a8a;">${t('Sesión de conversación libre (sin recorrido de módulos).', lang)}</td></tr>`;
  const chip = a.resumen ? `<div style="font-family:Inter,sans-serif;font-size:12px;color:#EAB308;letter-spacing:0.5px;margin:2px 0 16px;">${esc(a.resumen)}</div>` : '<div style="height:10px;font-size:0;">&nbsp;</div>';
  return `<tr><td class="px" style="padding:30px 44px 6px 44px;border-top:1px solid #262626;">
    <div style="font-family:Inter,sans-serif;font-size:11px;letter-spacing:3px;color:#A3A3A3;text-transform:uppercase;">${t('Actividad de la sesión', lang)}</div>
    <div style="height:6px;font-size:0;">&nbsp;</div>
    <div style="font-family:Inter,sans-serif;font-size:12px;line-height:18px;color:#5a5a62;letter-spacing:0.2px;">Lo que ${esc('el asesor')} hizo paso a paso durante la sesión.</div>
    <div style="height:14px;font-size:0;">&nbsp;</div>
    ${chip}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
  </td></tr>`;
}

// Extrae resultados de quiz del transcript (mensajes [QUIZ] enviados por la UI).
function extractQuizResults(turns) {
  const results = []; // [{mod, pregunta, respuesta, ok}]
  const modScores = {}; // {modulo: {ok:n, total:n}}
  (Array.isArray(turns) ? turns : []).forEach((t) => {
    const msg = t.message || '';
    // Formato: "[QUIZ] Modulo X: el asesor respondio "R" a la pregunta "P" — CORRECTO/INCORRECTO"
    const m = msg.match(/\[QUIZ\].*?(?:Modulo\s+([^:]+):)?.*?respondio\s+"([^"]+)".*?pregunta\s+"([^"]+)".*?—\s*(CORRECTO|INCORRECTO)/i);
    if (m) {
      const mod = (m[1] || '').trim() || 'general';
      const resp = m[2], preg = m[3], ok = m[4].toUpperCase() === 'CORRECTO';
      results.push({ mod, pregunta: preg, respuesta: resp, ok });
      if (!modScores[mod]) modScores[mod] = { ok: 0, total: 0 };
      modScores[mod].total++;
      if (ok) modScores[mod].ok++;
    }
  });
  return { results, modScores };
}

// Sección HTML "Análisis del Curso" para el reporte.
function courseReportSection(turns, ai, name, lang) {
  const { results, modScores } = extractQuizResults(turns);
  const act = extractActivity(turns, lang);
  const isCourse = act.modulos.size > 0 || results.length > 0;
  const tipoSesion = (ai && ai.tipo_sesion) || (isCourse ? 'curso_guiado' : 'consulta');
  const curso = (ai && ai.curso) || {};

  // ── Barra de progreso del curso ──
  const totalMods = 14; // F + 0-12 + proceso + vtc19
  const pct = Math.round((act.modulos.size / totalMods) * 100);
  const progressBar = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#262626;border-radius:99px;margin:8px 0 0;"><tr>
    <td style="font-size:0;line-height:0;"><table width="${pct}%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td height="8" style="background:linear-gradient(90deg,#EAB308,#EAB308);border-radius:99px;font-size:0;">&nbsp;</td></tr></table></td></tr></table>`;

  // ── Módulos cubiertos chips ──
  const modChips = act.modulos.size
    ? Array.from(act.modulos).map(m =>
        `<span style="display:inline-block;background:#1a1410;border:1px solid #262626;border-radius:4px;font-family:Inter,sans-serif;font-size:11px;color:#EAB308;padding:3px 9px;margin:0 4px 6px 0;">${esc(m)}</span>`
      ).join('')
    : '<span style="font-family:Inter,sans-serif;font-size:13px;color:#5a5a62;">—</span>';

  // ── Quiz por módulo ──
  const quizRows = Object.keys(modScores).length
    ? Object.entries(modScores).map(([mod, s]) => {
        const pctQ = Math.round((s.ok / s.total) * 100);
        const color = pctQ >= 80 ? '#5cc08a' : pctQ >= 60 ? '#EAB308' : '#e0836f';
        return `<tr>
          <td style="font-family:Inter,sans-serif;font-size:13px;color:#E5E5E5;padding:0 0 10px 0;">${esc(modLabel(mod.replace('modulo-', ''), lang))}</td>
          <td align="right" style="font-family:Inter,sans-serif;font-size:13px;color:${color};font-weight:700;padding:0 0 10px 12px;">${s.ok}/${s.total} · ${pctQ}%</td>
        </tr>`;
      }).join('')
    : `<tr><td style="font-family:Inter,sans-serif;font-size:13px;color:#5a5a62;" colspan="2">${t('Sin quizzes registrados en esta sesión.', lang)}</td></tr>`;

  // ── Detalle de preguntas incorrectas ──
  const wrongRows = results.filter(r => !r.ok).slice(0, 8).map(r =>
    `<tr><td style="padding:0 0 10px 0;">
      <div style="font-family:Inter,sans-serif;font-size:13px;color:#e0836f;margin-bottom:3px;">✗ ${esc(r.pregunta.slice(0, 80))}</div>
      <div style="font-family:Inter,sans-serif;font-size:12px;color:#8a8a8a;">Respondió: ${esc(r.respuesta)}</div>
    </td></tr>`
  ).join('');

  const label = tipoSesion === 'curso_guiado' ? t('Sesión de Curso', lang) : tipoSesion === 'roleplay' ? t('Sesión de Roleplay', lang) : t('Consulta', lang);
  const badge = tipoSesion === 'curso_guiado' ? '#5a7fbf' : tipoSesion === 'roleplay' ? '#7a5fbf' : '#5a8a72';

  return `
  <tr><td class="px" style="padding:30px 44px 6px 44px;border-top:1px solid #262626;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td><div style="font-family:Inter,sans-serif;font-size:11px;letter-spacing:3px;color:#A3A3A3;text-transform:uppercase;">${t('Análisis del Aprendizaje', lang)}</div></td>
      <td align="right"><span style="background:${badge};color:#fff;font-family:Inter,sans-serif;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;padding:3px 10px;border-radius:4px;">${label}</span></td>
    </tr></table>
    <div style="height:16px;font-size:0;">&nbsp;</div>

    ${isCourse ? `
    <!-- Progreso del curso -->
    <div style="font-family:Inter,sans-serif;font-size:12px;color:#A3A3A3;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;">${t('Cobertura del curso', lang)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="font-family:Montserrat,sans-serif;font-weight:700;font-size:2rem;color:#EAB308;">${act.modulos.size}</td>
      <td style="font-family:Inter,sans-serif;font-size:12px;color:#8a8a8a;padding-left:8px;">de ${totalMods} módulos<br>· ${act.videos} video${act.videos !== 1 ? 's' : ''} · ${Object.keys(modScores).length} quiz${Object.keys(modScores).length !== 1 ? 'zes' : ''}</td>
      <td align="right" style="font-family:Montserrat,sans-serif;font-weight:700;font-size:1.6rem;color:${pct >= 80 ? '#5cc08a' : '#EAB308'};">${pct}%</td>
    </tr></table>
    ${progressBar}
    <div style="height:18px;font-size:0;">&nbsp;</div>

    <!-- Módulos cubiertos -->
    <div style="font-family:Inter,sans-serif;font-size:11px;color:#A3A3A3;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;">${t('Módulos recorridos', lang)}</div>
    <div style="margin-bottom:18px;">${modChips}</div>
    ` : ''}

    ${curso.comprension_general != null ? `
    <!-- Comprensión general -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;"><tr>
      <td style="font-family:Inter,sans-serif;font-size:13px;color:#E5E5E5;">${t('Comprensión general', lang)}</td>
      <td align="right" style="font-family:Montserrat,sans-serif;font-weight:700;font-size:1.4rem;color:${curso.comprension_general >= 8 ? '#5cc08a' : curso.comprension_general >= 6 ? '#EAB308' : '#e0836f'};">${fmtDec(curso.comprension_general)}/10</td>
    </tr></table>
    ` : ''}

    ${curso.puntos_fuertes ? `
    <div style="font-family:Inter,sans-serif;font-size:11px;color:#5cc08a;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;">${t('Puntos fuertes', lang)}</div>
    <div style="font-family:Inter,sans-serif;font-size:14px;line-height:21px;color:#E5E5E5;margin-bottom:16px;">${esc(curso.puntos_fuertes)}</div>
    ` : ''}

    ${curso.brechas_aprendizaje ? `
    <div style="font-family:Inter,sans-serif;font-size:11px;color:#e0836f;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;">${t('Brechas de aprendizaje', lang)}</div>
    <div style="font-family:Inter,sans-serif;font-size:14px;line-height:21px;color:#E5E5E5;margin-bottom:16px;">${esc(curso.brechas_aprendizaje)}</div>
    ` : ''}

    ${curso.participacion ? `
    <div style="font-family:Inter,sans-serif;font-size:11px;color:#A3A3A3;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;">Participación</div>
    <div style="font-family:Inter,sans-serif;font-size:14px;line-height:21px;color:#E5E5E5;margin-bottom:${curso.participacion_score != null ? '6' : '16'}px;">${esc(curso.participacion)}</div>
    ${curso.participacion_score != null ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;"><tr>
      <td style="font-family:Inter,sans-serif;font-size:12px;color:#A3A3A3;">${t('Puntaje de participación', lang)}</td>
      <td align="right" style="font-family:Montserrat,sans-serif;font-weight:700;font-size:1.2rem;color:${curso.participacion_score >= 8 ? '#5cc08a' : curso.participacion_score >= 6 ? '#EAB308' : '#e0836f'};">${fmtDec(curso.participacion_score)}/10</td>
    </tr></table>
    ` : ''}
    ` : ''}

    ${curso.seguimiento != null ? `
    <!-- Seguimiento -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;"><tr>
      <td style="font-family:Inter,sans-serif;font-size:13px;color:#E5E5E5;">${t('Seguimiento', lang)}</td>
      <td align="right" style="font-family:Montserrat,sans-serif;font-weight:700;font-size:1.4rem;color:${curso.seguimiento >= 8 ? '#5cc08a' : curso.seguimiento >= 6 ? '#EAB308' : '#e0836f'};">${fmtDec(curso.seguimiento)}/10</td>
    </tr></table>
    ` : ''}

    ${Object.keys(modScores).length ? `
    <div style="font-family:Inter,sans-serif;font-size:11px;color:#A3A3A3;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;">${t('Quizzes por módulo', lang)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">${quizRows}</table>
    ` : ''}

    ${wrongRows ? `
    <div style="font-family:Inter,sans-serif;font-size:11px;color:#e0836f;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;">${t('Preguntas incorrectas a repasar', lang)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">${wrongRows}</table>
    ` : ''}

    ${curso.recomendacion_estudio ? `
    <div style="font-family:Inter,sans-serif;font-size:11px;color:#EAB308;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;">${t('Siguiente paso de estudio', lang)}</div>
    <div style="font-family:Inter,sans-serif;font-size:14px;line-height:21px;color:#E5E5E5;margin-bottom:16px;">${esc(curso.recomendacion_estudio)}</div>
    ` : ''}

    ${ai && ai.deep_learning ? `
    <div style="background:#0A0A0A;border:1px solid #2a2620;border-radius:8px;padding:16px 18px;margin-top:8px;">
      <div style="font-family:Inter,sans-serif;font-size:10px;letter-spacing:2px;color:#5a5a62;text-transform:uppercase;margin-bottom:10px;">${t('🧠 Nota Deep Learning — mejoras para Víctor', lang)}</div>
      ${ai.deep_learning.que_salio_bien ? `<div style="font-family:Inter,sans-serif;font-size:12px;color:#5cc08a;margin-bottom:4px;">✓ ${esc(ai.deep_learning.que_salio_bien)}</div>` : ''}
      ${ai.deep_learning.que_mejorar ? `<div style="font-family:Inter,sans-serif;font-size:12px;color:#e0836f;margin-bottom:4px;">△ ${esc(ai.deep_learning.que_mejorar)}</div>` : ''}
      ${ai.deep_learning.config_sugerida ? `<div style="font-family:Inter,sans-serif;font-size:12px;color:#EAB308;margin-bottom:0;">⚙ ${esc(ai.deep_learning.config_sugerida)}</div>` : ''}
    </div>
    ` : ''}
  </td></tr>`;
}

// ── Quiz de comprensión ──────────────────────────────────────────────────────
// Normaliza los datos del quiz desde la IA (preferido) o desde los mensajes
// [QUIZ] del transcript (fallback). Devuelve null si no hay quiz que mostrar.
function buildQuizData(ai, turns) {
  let raw = [];
  if (ai && Array.isArray(ai.quiz)) raw = ai.quiz;
  else if (ai && ai.quiz && Array.isArray(ai.quiz.questions)) raw = ai.quiz.questions;
  // Fallback: reconstruir desde los mensajes [QUIZ] del transcript.
  if (!raw.length) {
    const { results } = extractQuizResults(turns);
    raw = results.map((r, i) => ({
      id: i + 1, question: r.pregunta, user_answer: r.respuesta,
      correct_answer: r.ok ? r.respuesta : '', is_correct: r.ok, explanation: '', learning_tip: null,
    }));
  }
  const questions = raw.map((q, i) => {
    const ok = !!(q.is_correct != null ? q.is_correct : q.ok);
    const tip = q.learning_tip == null ? '' : String(q.learning_tip).trim();
    return {
      id: q.id != null ? q.id : i + 1,
      question: String(q.question || q.pregunta || '').trim(),
      user_answer: String(q.user_answer || q.respuesta || '').trim() || '—',
      correct_answer: String(q.correct_answer || '').trim(),
      is_correct: ok,
      explanation: String(q.explanation || '').trim(),
      learning_tip: (tip && tip.toLowerCase() !== 'null') ? tip : '',
    };
  }).filter((q) => q.question);
  if (!questions.length) return null;
  const total = questions.length;
  const correct = questions.filter((q) => q.is_correct).length;
  const incorrect = total - correct;
  const score10 = Math.round((correct / total) * 100) / 10; // 0-10, un decimal
  const pct = Math.round((correct / total) * 100);
  return { questions, total, correct, incorrect, score10, pct };
}

// Tarjeta de una pregunta del quiz (correcta o incorrecta).
function quizItem(q, ok, lang) {
  const bd = ok ? '#5cc08a' : '#e0836f';
  const badge = ok ? t('✅ Correcto', lang) : t('❌ Incorrecto', lang);
  const userMark = ok ? ' ✅' : ' ❌';
  let correctLine = '';
  if (!ok && q.correct_answer) {
    correctLine = `<div style="font-family:Inter,sans-serif;font-size:13px;line-height:20px;color:#E5E5E5;margin-bottom:8px;"><span style="color:#5cc08a;font-weight:700;">${t('Respuesta correcta:', lang)}</span> ${esc(q.correct_answer)} ✅</div>`;
  } else if (ok && q.correct_answer && q.correct_answer !== q.user_answer) {
    correctLine = `<div style="font-family:Inter,sans-serif;font-size:13px;line-height:20px;color:#E5E5E5;margin-bottom:8px;"><span style="color:#5cc08a;font-weight:700;">${t('Respuesta esperada:', lang)}</span> ${esc(q.correct_answer)} ✅</div>`;
  }
  const explanation = q.explanation
    ? `<div style="font-family:Inter,sans-serif;font-size:13px;line-height:20px;color:#A3A3A3;background:#0A0A0A;border-radius:6px;padding:9px 11px;">${esc(q.explanation)}</div>`
    : '';
  const tip = q.learning_tip
    ? `<div style="font-family:Inter,sans-serif;font-size:13px;line-height:20px;color:#EAB308;background:rgba(234,179,8,0.12);border-radius:6px;padding:10px 12px;margin-top:8px;">📚 <strong>${t('Consejo de aprendizaje:', lang)}</strong> ${esc(q.learning_tip)}</div>`
    : '';
  return `<tr><td style="padding:0 0 14px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#171717;border:1px solid #262626;border-left:3px solid ${bd};border-radius:10px;"><tr><td style="padding:15px 17px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td valign="top" style="font-family:Montserrat,sans-serif;font-weight:700;font-size:14px;line-height:20px;color:#FFFFFF;">${esc(String(q.id))}. ${esc(q.question)}</td>
        <td align="right" valign="top" style="font-family:Inter,sans-serif;font-size:11px;letter-spacing:0.5px;color:${bd};white-space:nowrap;padding-left:12px;">${badge}</td>
      </tr></table>
      <div style="height:9px;font-size:0;">&nbsp;</div>
      <div style="font-family:Inter,sans-serif;font-size:13px;line-height:20px;color:#E5E5E5;margin-bottom:${correctLine ? '6' : '8'}px;"><span style="color:#8a8a8a;">Tu respuesta:</span> ${esc(q.user_answer)}${userMark}</div>
      ${correctLine}
      ${explanation}
      ${tip}
    </td></tr></table>
  </td></tr>`;
}

// Sección HTML "Evaluación de comprensión — Quiz" para el reporte (email/PDF).
function quizSection(quizData, lang) {
  if (!quizData || !quizData.total) return '';
  const { questions, total, correct, incorrect, score10, pct } = quizData;
  const scoreColor = pct >= 80 ? '#5cc08a' : pct >= 60 ? '#EAB308' : '#e0836f';
  const scoreStr = String(score10).replace('.', ',');
  const correctQs = questions.filter((q) => q.is_correct);
  const incorrectQs = questions.filter((q) => !q.is_correct);
  const correctHdr = t('✅ Correcto', lang) === '✅ Correct' ? `✅ Correct Answers (${correctQs.length})` : `✅ Respuestas correctas (${correctQs.length})`;
  const incorrectHdr = t('❌ Incorrecto', lang) === '❌ Missed' ? `❌ Missed Answers (${incorrectQs.length})` : `❌ Respuestas incorrectas (${incorrectQs.length})`;

  const statCell = (label, value, color) => `
    <td class="stack" width="33%" valign="top" style="padding:6px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#171717;border:1px solid #262626;border-radius:10px;"><tr><td align="center" style="padding:14px 8px;">
        <div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:22px;color:${color};line-height:26px;">${esc(String(value))}</div>
        <div style="font-family:Inter,sans-serif;font-size:9px;letter-spacing:1.5px;color:#A3A3A3;text-transform:uppercase;margin-top:4px;">${label}</div>
      </td></tr></table></td>`;

  return `<tr><td class="px" style="padding:30px 44px 6px 44px;border-top:1px solid #262626;">
    <div style="font-family:Inter,sans-serif;font-size:11px;letter-spacing:3px;color:#A3A3A3;text-transform:uppercase;">${t('Evaluación de comprensión — Quiz', lang)}</div>
    <div style="height:6px;font-size:0;">&nbsp;</div>
    <div style="font-family:Inter,sans-serif;font-size:12px;line-height:18px;color:#5a5a62;">Mini-evaluación de lo que aprendiste en esta sesión.</div>
    <div style="height:16px;font-size:0;">&nbsp;</div>

    <!-- Puntuación del quiz -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#171717;border:1px solid #262626;border-radius:12px;"><tr><td align="center" style="padding:22px 20px;">
      <div style="font-family:Inter,sans-serif;font-size:10px;letter-spacing:2.5px;color:#A3A3A3;text-transform:uppercase;">${t('Puntuación del quiz', lang)}</div>
      <div style="height:8px;font-size:0;">&nbsp;</div>
      <div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:42px;line-height:46px;color:${scoreColor};letter-spacing:-1px;">${scoreStr}<span style="font-size:18px;color:#6a6a6a;">/10</span> <span style="font-size:20px;color:#8a8a8a;">(${pct}%)</span></div>
    </td></tr></table>
    <div style="height:12px;font-size:0;">&nbsp;</div>

    <!-- Estadísticas -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      ${statCell(t('Total preguntas', lang), total, '#FFFFFF')}
      ${statCell(t('Correctas', lang), correct, '#5cc08a')}
      ${statCell(t('Incorrectas', lang), incorrect, '#e0836f')}
    </tr></table>
    <div style="height:22px;font-size:0;">&nbsp;</div>

    ${correctQs.length ? `
    <div style="font-family:Inter,sans-serif;font-size:12px;color:#5cc08a;text-transform:uppercase;letter-spacing:1.5px;border-bottom:2px solid #223528;padding-bottom:8px;margin-bottom:14px;">${correctHdr}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${correctQs.map((q) => quizItem(q, true, lang)).join('')}</table>
    ` : ''}

    ${incorrectQs.length ? `
    <div style="font-family:Inter,sans-serif;font-size:12px;color:#e0836f;text-transform:uppercase;letter-spacing:1.5px;border-bottom:2px solid #3a2624;padding-bottom:8px;margin:${correctQs.length ? '18' : '0'}px 0 14px;">${incorrectHdr}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${incorrectQs.map((q) => quizItem(q, false, lang)).join('')}</table>
    ` : ''}
  </td></tr>`;
}

// ── Neurociencia: 4 neurotransmisores (dopamina, cortisol, oxitocina, amígdala) ──
// n4: {dopamina:{nivel,texto}, cortisol:{...}, oxitocina:{...}, amigdala:{...}}
function neuroscienceSection(n4) {
  if (!n4 || typeof n4 !== 'object') return '';
  const items = [
    ['dopamina',  'Dopamina',  'Anticipación de recompensa', '#EAB308'],
    ['oxitocina', 'Oxitocina', 'Confianza y vínculo',        '#5cc08a'],
    ['cortisol',  'Cortisol',  'Estrés ante objeciones',     '#e0a13a'],
    ['amigdala',  'Amígdala',  'Miedo y percepción de riesgo','#e0836f'],
  ];
  const cells = items.map(([k, label, sub, color]) => {
    const o = n4[k] || {};
    const nivel = Math.max(0, Math.min(100, parseInt(o.nivel != null ? o.nivel : 0, 10)));
    const txt = esc(o.texto || '—');
    return `<tr><td style="padding:0 0 14px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0A0A0A;border:1px solid #262626;border-radius:12px;"><tr><td style="padding:16px 18px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="font-family:Inter,sans-serif;font-size:14px;color:${color};font-weight:700;letter-spacing:0.4px;">${label}</td>
          <td align="right" style="font-family:Montserrat,sans-serif;font-weight:700;font-size:18px;color:${color};">${nivel}<span style="font-size:11px;color:#5a5a62;">%</span></td>
        </tr></table>
        <div style="font-family:Inter,sans-serif;font-size:10px;letter-spacing:1.5px;color:#A3A3A3;text-transform:uppercase;margin:2px 0 8px;">${sub}</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#262626;border-radius:99px;"><tr>
          <td style="font-size:0;line-height:0;"><table width="${nivel}%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td height="6" style="background:${color};border-radius:99px;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr></table>
        <div style="height:9px;font-size:0;">&nbsp;</div>
        <div style="font-family:Inter,sans-serif;font-size:13px;line-height:20px;color:#E5E5E5;">${txt}</div>
      </td></tr></table>
    </td></tr>`;
  }).join('');
  return `<tr><td class="px" style="padding:26px 44px 6px 44px;border-top:1px solid #262626;">
    <div style="font-family:Inter,sans-serif;font-size:11px;letter-spacing:3px;color:#A3A3A3;text-transform:uppercase;">🧠 Análisis Neurociencia</div>
    <div style="height:6px;font-size:0;">&nbsp;</div>
    <div style="font-family:Inter,sans-serif;font-size:12px;line-height:18px;color:#5a5a62;">Neurotransmisores que el asesor activó en el cliente durante la sesión.</div>
    <div style="height:16px;font-size:0;">&nbsp;</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${cells}</table>
  </td></tr>`;
}

// ── Momento de Oro: mejor intervención del asesor ──
function goldenMomentSection(gm) {
  if (!gm || !gm.cita) return '';
  return `<tr><td class="px" style="padding:26px 44px 6px 44px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#15140f;border:1px solid #262626;border-radius:14px;"><tr><td style="padding:24px 26px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="font-family:Inter,sans-serif;font-size:11px;letter-spacing:3px;color:#EAB308;text-transform:uppercase;font-weight:600;">✨ Momento de Oro</td>
        <td align="right" style="font-family:Inter,sans-serif;font-size:12px;color:#EAB308;letter-spacing:1px;">${esc(gm.t || '')}</td>
      </tr></table>
      <div style="height:12px;font-size:0;">&nbsp;</div>
      <div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:18px;line-height:28px;color:#FFFFFF;font-style:italic;border-left:2px solid #EAB308;padding-left:16px;">“${esc(gm.cita)}”</div>
      <div style="height:14px;font-size:0;">&nbsp;</div>
      <div style="font-family:Inter,sans-serif;font-size:11px;letter-spacing:2px;color:#A3A3A3;text-transform:uppercase;margin-bottom:5px;">Por qué fue efectiva</div>
      <div style="font-family:Inter,sans-serif;font-size:14px;line-height:22px;color:#E5E5E5;">${esc(gm.analisis || '')}</div>
    </td></tr></table>
  </td></tr>`;
}

// ── Nota para entrenador: apunte interno de coaching para el gerente/entrenador humano ──
function trainerNoteSection(nota, lang) {
  if (!has(nota)) return '';
  return `<tr><td class="px" style="padding:22px 44px 0 44px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#171717;border:1px solid #262626;border-radius:12px;"><tr><td style="padding:20px 22px;">
      <div style="font-family:Inter,sans-serif;font-size:11px;letter-spacing:2.5px;color:#EAB308;text-transform:uppercase;font-weight:600;">${t('📋 Nota para entrenador', lang)}</div>
      <div style="height:8px;font-size:0;">&nbsp;</div>
      <div style="font-family:Inter,sans-serif;font-size:14px;line-height:22px;color:#E5E5E5;letter-spacing:0.1px;">${esc(nota)}</div>
    </td></tr></table>
  </td></tr>`;
}

// ── Sparkline SVG inline (tendencia histórica) ──
function sparklineSvg(values, opts) {
  opts = opts || {};
  const w = opts.w || 180, h = opts.h || 40, pad = 4;
  const vals = (values || []).map(v => parseFloat(v) || 0);
  if (vals.length < 2) return '';
  const max = Math.max(10, ...vals), min = Math.min(0, ...vals);
  const span = (max - min) || 1;
  const step = (w - pad * 2) / (vals.length - 1);
  const pts = vals.map((v, i) => {
    const x = pad + i * step;
    const y = h - pad - ((v - min) / span) * (h - pad * 2);
    return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
  });
  const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
  const last = pts[pts.length - 1];
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;">
    <path d="${path}" fill="none" stroke="#EAB308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${last[0]}" cy="${last[1]}" r="3" fill="#EAB308"/></svg>`;
}

// ── Índice de Progreso: sesión actual vs histórico ──
// cur: {score, compAvg, durSecs, sentimiento}  hist: {scores:[], count, avgScore, avgCompAvg, avgDurSecs}
function progressSection(cur, hist) {
  hist = hist || {};
  const arrow = (now, prev, inv) => {
    if (prev == null || !isFinite(prev) || now == null || !isFinite(now)) return '<span style="color:#A3A3A3;">—</span>';
    const d = now - prev, up = inv ? d < 0 : d > 0;
    if (Math.abs(d) < 0.05) return '<span style="color:#A3A3A3;">→ estable</span>';
    const pct = prev ? Math.round((d / Math.abs(prev)) * 100) : 0;
    return `<span style="color:${up ? '#5cc08a' : '#e0836f'};font-weight:700;">${up ? '↑' : '↓'} ${Math.abs(pct)}%</span>`;
  };
  const fmtD = (s) => { s = parseInt(s || 0, 10); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const spark = sparklineSvg((hist.scores || []).concat(cur && cur.score != null ? [cur.score] : []));
  const isFirst = !hist.count;
  const rows = isFirst
    ? `<tr><td style="font-family:Inter,sans-serif;font-size:14px;line-height:22px;color:#E5E5E5;">Primera sesión registrada de este asesor. A partir de aquí se medirá su evolución sesión a sesión.</td></tr>`
    : `
    <tr>
      <td style="font-family:Inter,sans-serif;font-size:13px;color:#E5E5E5;padding:0 0 12px 0;">Desempeño</td>
      <td align="right" style="font-family:Montserrat,sans-serif;font-weight:700;font-size:16px;color:#FFFFFF;padding:0 0 12px 8px;">${cur.score != null ? cur.score : '—'} <span style="font-size:12px;color:#5a5a62;">vs ${hist.avgScore != null ? Math.round(hist.avgScore * 10) / 10 : '—'}</span></td>
      <td align="right" style="font-family:Inter,sans-serif;font-size:13px;padding:0 0 12px 10px;">${arrow(cur.score, hist.avgScore)}</td>
    </tr>
    <tr>
      <td style="font-family:Inter,sans-serif;font-size:13px;color:#E5E5E5;padding:0 0 12px 0;">Competencias (prom.)</td>
      <td align="right" style="font-family:Montserrat,sans-serif;font-weight:700;font-size:16px;color:#FFFFFF;padding:0 0 12px 8px;">${cur.compAvg != null ? Math.round(cur.compAvg * 10) / 10 : '—'} <span style="font-size:12px;color:#5a5a62;">vs ${hist.avgCompAvg != null ? Math.round(hist.avgCompAvg * 10) / 10 : '—'}</span></td>
      <td align="right" style="font-family:Inter,sans-serif;font-size:13px;padding:0 0 12px 10px;">${arrow(cur.compAvg, hist.avgCompAvg)}</td>
    </tr>
    <tr>
      <td style="font-family:Inter,sans-serif;font-size:13px;color:#E5E5E5;padding:0;">Duración</td>
      <td align="right" style="font-family:Montserrat,sans-serif;font-weight:700;font-size:16px;color:#FFFFFF;padding:0 0 0 8px;">${fmtD(cur.durSecs)} <span style="font-size:12px;color:#5a5a62;">vs ${fmtD(hist.avgDurSecs)}</span></td>
      <td align="right" style="font-family:Inter,sans-serif;font-size:13px;padding:0 0 0 10px;">${arrow(cur.durSecs, hist.avgDurSecs)}</td>
    </tr>`;
  return `<tr><td class="px" style="padding:26px 44px 6px 44px;border-top:1px solid #262626;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="font-family:Inter,sans-serif;font-size:11px;letter-spacing:3px;color:#A3A3A3;text-transform:uppercase;">📈 Índice de Progreso</td>
      <td align="right">${spark}</td>
    </tr></table>
    <div style="height:6px;font-size:0;">&nbsp;</div>
    <div style="font-family:Inter,sans-serif;font-size:12px;line-height:18px;color:#5a5a62;">${isFirst ? 'Sin historial previo.' : 'Comparado con el promedio de ' + hist.count + ' sesión' + (hist.count === 1 ? '' : 'es') + ' anterior' + (hist.count === 1 ? '' : 'es') + '.'}</div>
    <div style="height:14px;font-size:0;">&nbsp;</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
  </td></tr>`;
}

// ── Fila de 4 KPIs (Tiempo · Módulos · Score · Potencial) ──
// cells: [{value, label, color}] — se pinta con la paleta del rediseño.
function kpiRow(cells) {
  const list = (cells || []).slice(0, 4);
  if (!list.length) return '';
  const cell = (c) => `
    <td class="stack" width="25%" valign="top" style="padding:6px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#171717;border:1px solid #262626;border-radius:10px;"><tr><td align="center" style="padding:14px 8px;">
        <div class="metric-num" style="font-family:Montserrat,sans-serif;font-weight:700;font-size:20px;color:${c.color || '#FFFFFF'};line-height:24px;">${esc(c.value == null || c.value === '' ? '—' : c.value)}</div>
        <div style="font-family:Inter,sans-serif;font-size:9px;letter-spacing:1.5px;color:#A3A3A3;text-transform:uppercase;margin-top:4px;">${esc(c.label || '')}</div>
      </td></tr></table></td>`;
  return `<tr><td class="px" style="padding:10px 40px 4px 40px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${list.map(cell).join('')}</tr></table>
  </td></tr>`;
}

// ── Donut (pie) SVG inline — distribución de tiempo. ──
// slices: [{label, pct, sub, color}] (pct 0-100). centerTop/centerBot: texto del centro.
function pieChart(slices, centerTop, centerBot) {
  const data = (slices || []).filter(s => (parseFloat(s.pct) || 0) > 0);
  if (!data.length) return '';
  const cx = 120, cy = 95, r = 62, C = 2 * Math.PI * r; // circunferencia ≈ 389.557
  let off = 0; const arcs = []; const legend = [];
  const total = data.reduce((a, s) => a + (parseFloat(s.pct) || 0), 0) || 100;
  data.forEach((s) => {
    const pct = (parseFloat(s.pct) || 0);
    const frac = pct / total;
    const dash = frac * C;
    arcs.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.color}" stroke-width="20" stroke-dasharray="${dash.toFixed(3)} ${(C - dash).toFixed(3)}" stroke-dashoffset="${(-off).toFixed(3)}" transform="rotate(-90 ${cx} ${cy})"/>`);
    off += dash;
  });
  data.forEach((s, i) => {
    const y = 192 + i * 16;
    legend.push(`<circle cx="12" cy="${y - 4}" r="4" fill="${s.color}"/><text x="24" y="${y}" font-family="Inter,sans-serif" font-size="11" fill="#E5E5E5">${esc(s.label)} <tspan fill="#737373">— ${Math.round((parseFloat(s.pct) || 0))}%${s.sub ? ' (' + esc(s.sub) + ')' : ''}</tspan></text>`);
  });
  const legendH = 176 + data.length * 16;
  return `<svg width="240" height="${legendH + 8}" viewBox="0 0 240 ${legendH + 8}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Distribución de tiempo por actividad" style="display:block;margin:0 auto;">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#262626" stroke-width="20"/>${arcs.join('')}
    <text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="#FFFFFF" font-family="Montserrat,sans-serif" font-weight="700" font-size="22">${esc(centerTop || '')}</text>
    <text x="${cx}" y="${cy + 12}" text-anchor="middle" fill="#737373" font-family="Inter,sans-serif" font-size="9" letter-spacing="2">${esc(centerBot || 'TOTAL')}</text>
    ${legend.join('')}</svg>`;
}

// ── Barras "Frecuencia de temas" (heatmap). items: [{label, score10, color?}] score 0-10. ──
function heatmapBars(items) {
  const list = (items || []).filter(x => x && x.label);
  if (!list.length) return '';
  return list.map((x) => {
    const s = Math.max(0, Math.min(10, parseFloat(x.score10) || 0));
    const pct = Math.round(s * 10);
    const color = x.color || (s >= 7 ? '#EAB308' : s >= 5 ? '#b8860b' : '#6b5518');
    return `<tr><td style="padding:0 0 4px 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="font-family:Inter,sans-serif;font-size:13px;color:#E5E5E5;letter-spacing:0.3px;">${esc(x.label)}</td>
      <td align="right" style="font-family:Inter,sans-serif;font-size:12px;color:#EAB308;font-weight:600;">${s % 1 === 0 ? s : s.toFixed(1)}/10</td></tr></table></td></tr>
      <tr><td style="padding:0 0 13px 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#262626;border-radius:99px;"><tr>
      <td style="font-size:0;line-height:0;"><table width="${pct}%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td height="6" style="background:${color};border-radius:99px;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr></table></td></tr>`;
  }).join('');
}

// ── Sección de gráficos (pie + heatmap lado a lado). Se omite si no hay pie. ──
function chartsSection(pieSvg, heatRowsHtml) {
  if (!pieSvg) return '';
  const hasHeat = !!heatRowsHtml;
  const pieCard = `
    <td class="chart-half" style="width:${hasHeat ? '50%' : '100%'};padding:0 ${hasHeat ? '14px' : '0'} 0 0;vertical-align:top;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="card card-shadow" style="min-height:380px;background:#171717;border:1px solid #262626;border-radius:12px;">
        <tr><td align="center" style="padding:20px 16px;">
          <div class="heading body-text" style="font-size:10px;letter-spacing:2px;color:#A3A3A3;font-weight:600;margin-bottom:12px;">DISTRIBUCIÓN DE TIEMPO</div>
          <div style="width:240px;max-width:100%;margin:0 auto;">${pieSvg}</div>
        </td></tr>
      </table></td>`;
  const heatCard = hasHeat ? `
    <td class="chart-half" style="width:50%;padding:0 0 0 14px;vertical-align:top;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="card card-shadow" style="min-height:380px;background:#171717;border:1px solid #262626;border-radius:12px;">
        <tr><td style="padding:20px 16px;">
          <div class="heading body-text" style="font-size:10px;letter-spacing:2px;color:#A3A3A3;font-weight:600;margin-bottom:12px;">FRECUENCIA DE TEMAS</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${heatRowsHtml}</table>
        </td></tr>
      </table></td>` : '';
  return `<tr><td class="px" style="padding:26px 44px 8px 44px;">
    <div class="heading" style="font-size:11px;letter-spacing:3px;color:#A3A3A3;font-weight:600;">Distribución de actividades y frecuencia de temas</div>
    <div style="height:16px;font-size:0;">&nbsp;</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>${pieCard}${heatCard}</tr></table>
  </td></tr>`;
}

// ── Cuenta intervenciones por rol (asesor vs Víctor) ──
function countInterventions(turns) {
  let asesor = 0, agente = 0;
  (Array.isArray(turns) ? turns : []).forEach((t) => {
    if (!clean(t.message)) return;
    if ((t.role || '').toLowerCase() === 'agent') agente++; else asesor++;
  });
  return { asesor, agente, total: asesor + agente };
}

module.exports = { esc, clean, has, fmtTime, fmtDec, buildChatTable, radarUrl, radarSvg, neuroBars, timeline, metricsRow, analyticsRow, speakingTime, extractActivity, activitySection, extractQuizResults, buildQuizData, quizItem, quizSection, courseReportSection, neuroscienceSection, goldenMomentSection, trainerNoteSection, sparklineSvg, progressSection, countInterventions, kpiRow, pieChart, heatmapBars, chartsSection };
