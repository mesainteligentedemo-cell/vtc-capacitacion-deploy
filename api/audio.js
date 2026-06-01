// Audio de la conversacion. GET /api/audio?conv=ID  -> mp3 descargable.
// La API key vive server-side (env var), nunca se expone.
module.exports = async (req, res) => {
  try {
    const conv = (req.query && req.query.conv) || '';
    if (!conv) { res.status(400).send('Falta ?conv=ID'); return; }
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) { res.status(500).send('Falta ELEVENLABS_API_KEY'); return; }

    const r = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${encodeURIComponent(conv)}/audio`, {
      headers: { 'xi-api-key': key },
    });
    if (!r.ok) { res.status(r.status).send('No se encontró el audio de la conversación'); return; }
    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="conversacion-${conv}.mp3"`);
    res.setHeader('Content-Length', buf.length);
    res.status(200).end(buf);
  } catch (e) {
    res.status(500).send('Error: ' + String((e && e.message) || e));
  }
};