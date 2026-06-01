// Render HTML -> PDF (gratis, Chromium real). POST { html, filename? } -> application/pdf
const { htmlToPdf } = require('./_render');

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Usa POST con { html }' }); return; }
  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body || '{}');
    const html = body && body.html;
    if (!html) { res.status(400).json({ error: 'Falta el campo "html"' }); return; }

    const buf = await htmlToPdf(html);
    const fname = ((body.filename || 'reporte-vtc') + '').replace(/[^a-zA-Z0-9_-]/g, '_') + '.pdf';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fname}"`);
    res.setHeader('Content-Length', buf.length);
    res.status(200).end(buf);
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
};