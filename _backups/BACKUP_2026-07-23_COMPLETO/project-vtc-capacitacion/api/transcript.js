// Conversacion completa de una sesion.
//   GET /api/transcript?conv=ID            -> pagina HTML de lujo (chat)
//   GET /api/transcript?conv=ID&format=rows-> solo el bloque <table> del chat (para incrustar en el reporte)
//   GET /api/transcript?conv=ID&pdf=1      -> descarga PDF
// La API key vive server-side (env var), nunca se expone al cliente.
const { htmlToPdf } = require('./_render');

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Limpia basura tecnica: <Cliente>...</Cliente> (eco), [Excited]/[Patient] (audio tags), asteriscos.
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

// Bloque <table> con las burbujas de chat (Victor izquierda / Asesor derecha).
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

function buildPage(conv) {
  const dur = conv.metadata && conv.metadata.call_duration_secs;
  const lang = (conv.metadata && conv.metadata.main_language) || '—';
  const n = Array.isArray(conv.transcript) ? conv.transcript.length : 0;
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="color-scheme" content="dark">
<title>Conversación completa · ${esc(conv.conversation_id)}</title></head>
<body style="margin:0;padding:0;background:#0a0a0b;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0b;"><tr><td align="center" style="padding:32px 16px;">
<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#101012;border:1px solid #1e1e22;border-radius:18px;overflow:hidden;">
  <tr><td style="padding:34px 40px 22px 40px;border-bottom:1px solid #1c1c20;">
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:3.5px;color:#c9aa75;text-transform:uppercase;font-weight:600;">VICTORIOUS TRAVELERS CLUB</div>
    <div style="height:14px;font-size:0;">&nbsp;</div>
    <div style="font-family:Georgia,serif;font-size:28px;color:#f4f1ea;letter-spacing:-0.3px;">Conversación completa</div>
    <div style="height:8px;font-size:0;">&nbsp;</div>
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#8a8a92;letter-spacing:0.3px;">Duración ${dur != null ? fmtTime(dur) + ' min' : '—'} · Idioma: ${esc(lang)} · ${n} intervenciones</div>
  </td></tr>
  <tr><td style="padding:24px 40px 34px 40px;">${buildChatTable(conv.transcript)}</td></tr>
</table>
<div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#3a3a42;letter-spacing:0.5px;padding:18px 0 0 0;">Víctor · Coach de IA del piso — VTC · ${esc(conv.conversation_id)}</div>
</td></tr></table></body></html>`;
}

module.exports = async (req, res) => {
  try {
    const conv = (req.query && req.query.conv) || '';
    if (!conv) { res.status(400).send('Falta ?conv=ID'); return; }
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) { res.status(500).send('Falta ELEVENLABS_API_KEY'); return; }

    const r = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${encodeURIComponent(conv)}`, {
      headers: { 'xi-api-key': key },
    });
    if (!r.ok) { res.status(r.status).send('No se encontró la conversación'); return; }
    const data = await r.json();

    if (req.query && req.query.format === 'rows') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(buildChatTable(data.transcript));
      return;
    }
    const html = buildPage(data);
    if (req.query && (req.query.pdf === '1' || req.query.format === 'pdf')) {
      const buf = await htmlToPdf(html);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="conversacion-${conv}.pdf"`);
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