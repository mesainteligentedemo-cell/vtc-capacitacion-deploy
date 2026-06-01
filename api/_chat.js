// Builders compartidos para el chat y los graficos del reporte.
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

// Burbujas de chat: Victor izquierda (oro) / Asesor derecha (morado).
function buildChatTable(turns) {
  const rows = (Array.isArray(turns) ? turns : []).map((t) => {
    const isAgent = (t.role || '').toLowerCase() === 'agent';
    const text = clean(t.message);
    if (!text) return '';
    const who = isAgent ? 'VÍCTOR' : 'ASESOR';
    const color = isAgent ? '#c9aa75' : '#9b8cff';
    const bg = isAgent ? '#161410' : '#14131a';
    const bd = isAgent ? '#2a2620' : '#2a2740';
    const align = isAgent ? 'left' : 'right';
    return `<tr><td style="padding:0 0 12px 0;">
      <table role="presentation" width="82%" align="${align}" cellpadding="0" cellspacing="0" border="0" style="background:${bg};border:1px solid ${bd};border-radius:14px;">
        <tr><td style="padding:13px 17px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:2px;color:${color};font-weight:700;">${who}</td>
            <td align="right" style="font-family:Helvetica,Arial,sans-serif;font-size:10px;color:#5a5a62;letter-spacing:0.5px;">${fmtTime(t.time_in_call_secs)}</td>
          </tr></table>
          <div style="height:6px;font-size:0;">&nbsp;</div>
          <div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#dcdce2;">${esc(text)}</div>
        </td></tr>
      </table>
      <div style="clear:both;font-size:0;line-height:0;">&nbsp;</div>
    </td></tr>`;
  }).join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows || '<tr><td style="color:#8a8a92;font-family:Helvetica,Arial,sans-serif;">Sin transcripción disponible.</td></tr>'}</table>`;
}

// Radar de competencias (QuickChart, dark).
function radarUrl(labels, values) {
  const chart = { type: 'radar', data: { labels, datasets: [{ data: values,
    backgroundColor: 'rgba(201,170,117,0.18)', borderColor: 'rgba(201,170,117,1)', borderWidth: 2,
    pointBackgroundColor: '#c9aa75', pointRadius: 3 }] },
    options: { legend: { display: false }, scale: { ticks: { display: false, beginAtZero: true, max: 10, stepSize: 2 },
      gridLines: { color: 'rgba(255,255,255,0.08)' }, angleLines: { color: 'rgba(255,255,255,0.08)' },
      pointLabels: { fontColor: '#c9aa75', fontSize: 13 } } } };
  return 'https://quickchart.io/chart?bkg=transparent&w=360&h=360&c=' + encodeURIComponent(JSON.stringify(chart));
}

// Barras de principios neurocientificos. pairs: [[name,pct],...]
function neuroBars(pairs) {
  if (!pairs || !pairs.length) return '<tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#8a8a92;">No registrado en esta sesión.</td></tr>';
  return pairs.map(([name, pct]) => {
    pct = Math.max(0, Math.min(100, parseInt(pct || 0, 10)));
    return `<tr><td style="padding:0 0 4px 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#cfcfd6;letter-spacing:0.3px;">${esc(name)}</td>
      <td align="right" style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#c9aa75;">${pct}%</td></tr></table></td></tr>
      <tr><td style="padding:0 0 13px 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1e1e22;border-radius:99px;"><tr>
      <td style="font-size:0;line-height:0;"><table width="${pct}%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td height="6" style="background:#c9aa75;border-radius:99px;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr></table></td></tr>`;
  }).join('');
}

// Linea de tiempo. items: [[t,label],...]
function timeline(items) {
  if (!items || !items.length) return '<tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#8a8a92;">No registrada.</td></tr>';
  return items.map(([t, label]) =>
    `<tr><td width="66" valign="top" style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#c9aa75;letter-spacing:1px;padding:0 0 16px 0;">${esc(t)}</td>
     <td valign="top" style="padding:0 0 16px 14px;border-left:2px solid #2a2620;">
     <span style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:20px;color:#cfcfd6;">${esc(label)}</span></td></tr>`
  ).join('');
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
function modLabel(raw) {
  let k = String(raw == null ? '' : raw).toLowerCase().replace(/módulo|modulo-|modulo|paso|step|pitch/g, '').trim();
  const pm = k.match(/(\d{1,2})/);
  if (MOD_LABELS[k]) return MOD_LABELS[k];
  if (pm && MOD_LABELS[pm[1]]) return MOD_LABELS[pm[1]];
  return raw ? String(raw) : 'el curso';
}
function paramOf(c) {
  try { const p = JSON.parse(c.params_as_json || '{}'); return p.modulo || p.module || p.id || ''; } catch (e) { return ''; }
}

// Reconstruye "lo que el usuario hizo" desde los tool_calls del transcript.
// Devuelve {items:[[mmss,texto],...], modulos:Set, videos:n, quizzes:n, resumen:string}
function extractActivity(turns) {
  const items = [], mods = new Set(); let videos = 0, quizzes = 0, lastMod = '';
  (Array.isArray(turns) ? turns : []).forEach((t) => {
    const tt = fmtTime(t.time_in_call_secs);
    (t.tool_calls || []).forEach((c) => {
      const nm = c.tool_name || c.name || ''; const arg = paramOf(c); const lab = modLabel(arg);
      if (nm === 'ir_a_modulo') { if (lab !== lastMod) { items.push([tt, 'Entró a ' + lab]); mods.add(lab); lastMod = lab; } }
      else if (nm === 'reproducir_video') { videos++; items.push([tt, '▶ Vio el video de ' + lab]); mods.add(lab); }
      else if (nm === 'ir_al_quiz') { quizzes++; items.push([tt, '✓ Hizo el quiz de ' + lab]); mods.add(lab); }
    });
  });
  const parts = [];
  if (mods.size) parts.push(mods.size + (mods.size === 1 ? ' sección' : ' secciones'));
  if (videos) parts.push(videos + (videos === 1 ? ' video' : ' videos'));
  if (quizzes) parts.push(quizzes + (quizzes === 1 ? ' quiz' : ' quizzes'));
  return { items, modulos: mods, videos, quizzes, resumen: parts.join(' · ') };
}

// Bloque HTML "Actividad de la sesion" para el reporte (email/PDF).
function activitySection(turns) {
  const a = extractActivity(turns);
  const rows = a.items.length
    ? a.items.map(([t, label]) =>
        `<tr><td width="60" valign="top" style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#c9aa75;letter-spacing:1px;padding:0 0 13px 0;">${esc(t)}</td>
         <td valign="top" style="padding:0 0 13px 14px;border-left:2px solid #2a2620;">
         <span style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:20px;color:#dcdce2;">${esc(label)}</span></td></tr>`).join('')
    : '<tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#8a8a92;">Sesión de conversación libre (sin recorrido de módulos).</td></tr>';
  const chip = a.resumen ? `<div style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#c9aa75;letter-spacing:0.5px;margin:2px 0 16px;">${esc(a.resumen)}</div>` : '<div style="height:10px;font-size:0;">&nbsp;</div>';
  return `<tr><td class="px" style="padding:30px 44px 6px 44px;border-top:1px solid #1c1c20;">
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:3px;color:#7c7c84;text-transform:uppercase;">Actividad de la sesión</div>
    <div style="height:6px;font-size:0;">&nbsp;</div>
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;line-height:18px;color:#5a5a62;letter-spacing:0.2px;">Lo que ${esc('el asesor')} hizo paso a paso durante la sesión.</div>
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
function courseReportSection(turns, ai, name) {
  const { results, modScores } = extractQuizResults(turns);
  const act = extractActivity(turns);
  const isCourse = act.modulos.size > 0 || results.length > 0;
  const tipoSesion = (ai && ai.tipo_sesion) || (isCourse ? 'curso_guiado' : 'consulta');
  const curso = (ai && ai.curso) || {};

  // ── Barra de progreso del curso ──
  const totalMods = 14; // F + 0-12 + proceso + vtc19
  const pct = Math.round((act.modulos.size / totalMods) * 100);
  const progressBar = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1e1e22;border-radius:99px;margin:8px 0 0;"><tr>
    <td style="font-size:0;line-height:0;"><table width="${pct}%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td height="8" style="background:linear-gradient(90deg,#c9aa75,#e8d4a0);border-radius:99px;font-size:0;">&nbsp;</td></tr></table></td></tr></table>`;

  // ── Módulos cubiertos chips ──
  const modChips = act.modulos.size
    ? Array.from(act.modulos).map(m =>
        `<span style="display:inline-block;background:#1a1812;border:1px solid #3a3326;border-radius:4px;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#c9aa75;padding:3px 9px;margin:0 4px 6px 0;">${esc(m)}</span>`
      ).join('')
    : '<span style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#5a5a62;">—</span>';

  // ── Quiz por módulo ──
  const quizRows = Object.keys(modScores).length
    ? Object.entries(modScores).map(([mod, s]) => {
        const pctQ = Math.round((s.ok / s.total) * 100);
        const color = pctQ >= 80 ? '#5fbf86' : pctQ >= 60 ? '#c9aa75' : '#e89a92';
        return `<tr>
          <td style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#cfcfd6;padding:0 0 10px 0;">${esc(modLabel(mod.replace('modulo-', '')))}</td>
          <td align="right" style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:${color};font-weight:700;padding:0 0 10px 12px;">${s.ok}/${s.total} · ${pctQ}%</td>
        </tr>`;
      }).join('')
    : `<tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#5a5a62;" colspan="2">Sin quizzes registrados en esta sesión.</td></tr>`;

  // ── Detalle de preguntas incorrectas ──
  const wrongRows = results.filter(r => !r.ok).slice(0, 8).map(r =>
    `<tr><td style="padding:0 0 10px 0;">
      <div style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#e89a92;margin-bottom:3px;">✗ ${esc(r.pregunta.slice(0, 80))}</div>
      <div style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#8a8a92;">Respondió: ${esc(r.respuesta)}</div>
    </td></tr>`
  ).join('');

  const label = tipoSesion === 'curso_guiado' ? 'Sesión de Curso' : tipoSesion === 'roleplay' ? 'Sesión de Roleplay' : 'Consulta';
  const badge = tipoSesion === 'curso_guiado' ? '#5a7fbf' : tipoSesion === 'roleplay' ? '#7a5fbf' : '#5a8a72';

  return `
  <tr><td class="px" style="padding:30px 44px 6px 44px;border-top:1px solid #1c1c20;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td><div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:3px;color:#7c7c84;text-transform:uppercase;">Análisis del Aprendizaje</div></td>
      <td align="right"><span style="background:${badge};color:#fff;font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;padding:3px 10px;border-radius:4px;">${label}</span></td>
    </tr></table>
    <div style="height:16px;font-size:0;">&nbsp;</div>

    ${isCourse ? `
    <!-- Progreso del curso -->
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#7c7c84;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;">Cobertura del curso</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="font-family:'Cormorant Garamond',serif;font-size:2rem;color:#c9aa75;">${act.modulos.size}</td>
      <td style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#8a8a92;padding-left:8px;">de ${totalMods} módulos<br>· ${act.videos} video${act.videos !== 1 ? 's' : ''} · ${Object.keys(modScores).length} quiz${Object.keys(modScores).length !== 1 ? 'zes' : ''}</td>
      <td align="right" style="font-family:'Cormorant Garamond',serif;font-size:1.6rem;color:${pct >= 80 ? '#5fbf86' : '#c9aa75'};">${pct}%</td>
    </tr></table>
    ${progressBar}
    <div style="height:18px;font-size:0;">&nbsp;</div>

    <!-- Módulos cubiertos -->
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#7c7c84;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;">Módulos recorridos</div>
    <div style="margin-bottom:18px;">${modChips}</div>
    ` : ''}

    ${curso.comprension_general != null ? `
    <!-- Comprensión general -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;"><tr>
      <td style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#cfcfd6;">Comprensión general</td>
      <td align="right" style="font-family:'Cormorant Garamond',serif;font-size:1.4rem;color:${curso.comprension_general >= 8 ? '#5fbf86' : curso.comprension_general >= 6 ? '#c9aa75' : '#e89a92'};">${curso.comprension_general}/10</td>
    </tr></table>
    ` : ''}

    ${curso.puntos_fuertes ? `
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#5fbf86;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;">Puntos fuertes</div>
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:21px;color:#cfcfd6;margin-bottom:16px;">${esc(curso.puntos_fuertes)}</div>
    ` : ''}

    ${curso.brechas_aprendizaje ? `
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#e89a92;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;">Brechas de aprendizaje</div>
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:21px;color:#cfcfd6;margin-bottom:16px;">${esc(curso.brechas_aprendizaje)}</div>
    ` : ''}

    ${curso.participacion ? `
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#7c7c84;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;">Participación</div>
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:21px;color:#cfcfd6;margin-bottom:16px;">${esc(curso.participacion)}</div>
    ` : ''}

    ${Object.keys(modScores).length ? `
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#7c7c84;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;">Quizzes por módulo</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">${quizRows}</table>
    ` : ''}

    ${wrongRows ? `
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#e89a92;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;">Preguntas incorrectas a repasar</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">${wrongRows}</table>
    ` : ''}

    ${curso.recomendacion_estudio ? `
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#c9aa75;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;">Siguiente paso de estudio</div>
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:21px;color:#cfcfd6;margin-bottom:16px;">${esc(curso.recomendacion_estudio)}</div>
    ` : ''}

    ${ai && ai.deep_learning ? `
    <div style="background:#0f0f12;border:1px solid #2a2620;border-radius:8px;padding:16px 18px;margin-top:8px;">
      <div style="font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:2px;color:#5a5a62;text-transform:uppercase;margin-bottom:10px;">🧠 Nota Deep Learning — mejoras para Víctor</div>
      ${ai.deep_learning.que_salio_bien ? `<div style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#5fbf86;margin-bottom:4px;">✓ ${esc(ai.deep_learning.que_salio_bien)}</div>` : ''}
      ${ai.deep_learning.que_mejorar ? `<div style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#e89a92;margin-bottom:4px;">△ ${esc(ai.deep_learning.que_mejorar)}</div>` : ''}
      ${ai.deep_learning.config_sugerida ? `<div style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#c9aa75;margin-bottom:0;">⚙ ${esc(ai.deep_learning.config_sugerida)}</div>` : ''}
    </div>
    ` : ''}
  </td></tr>`;
}

module.exports = { esc, clean, fmtTime, buildChatTable, radarUrl, neuroBars, timeline, extractActivity, activitySection, extractQuizResults, courseReportSection };
