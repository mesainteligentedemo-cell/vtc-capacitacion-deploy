// Audio de la conversacion. GET /api/audio?conv=ID
//   - Por defecto: Content-Disposition INLINE -> se puede reproducir directo en un
//     <audio controls src="/api/audio?conv=ID"> (public/audio-player.html lo usa asi).
//   - ?download=1  -> fuerza descarga (Content-Disposition attachment), para links
//     de "descargar mp3" explicitos si algún día se necesitan.
//   - ?name=...    -> nombre de archivo (sin extensión) para el header; si no viene,
//     usa "conversacion-{conv}". Sanitizado, sin puntos, sin path traversal.
// La API key vive server-side (env var), nunca se expone.
const { sanitizeFileBase } = require('./_naming');

module.exports = async (req, res) => {
  try {
    const conv = (req.query && req.query.conv) || '';
    if (!conv) { res.status(400).send('Falta ?conv=ID'); return; }
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) { res.status(500).send('Falta ELEVENLABS_API_KEY'); return; }

    const upstreamHeaders = { 'xi-api-key': key };
    // Passthrough best-effort de Range para permitir "seek" del reproductor (si
    // ElevenLabs no soporta ranges, simplemente devuelve el archivo completo (200) y
    // el navegador hace buffering normal — el play/pause/volumen siguen funcionando).
    if (req.headers && req.headers.range) upstreamHeaders.range = req.headers.range;

    const r = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${encodeURIComponent(conv)}/audio`, {
      headers: upstreamHeaders,
    });
    if (!r.ok) { res.status(r.status).send('No se encontró el audio de la conversación'); return; }
    const buf = Buffer.from(await r.arrayBuffer());

    const rawName = (req.query && req.query.name) || '';
    const fname = sanitizeFileBase(rawName) || `conversacion-${conv}`;
    const disposition = (req.query && req.query.download === '1') ? 'attachment' : 'inline';

    res.status(r.status === 206 ? 206 : 200);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Disposition', `${disposition}; filename="${fname}.mp3"`);
    res.setHeader('Content-Length', buf.length);
    const contentRange = r.headers && r.headers.get && r.headers.get('content-range');
    if (r.status === 206 && contentRange) res.setHeader('Content-Range', contentRange);
    res.end(buf);
  } catch (e) {
    res.status(500).send('Error: ' + String((e && e.message) || e));
  }
};