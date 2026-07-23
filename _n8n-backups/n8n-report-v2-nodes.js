/* ============================================================================
   VTC POST-CALL — INTEGRACIÓN REPORTE v2 (ultra-detallado)
   ----------------------------------------------------------------------------
   PROBLEMA QUE RESUELVE:
   El flujo n8n actual ("Template HTML Render") mantiene una COPIA de 34KB del
   template + helpers y arma el email solo con los 25 campos del agente. NO
   incluye: Neurociencia (4 hormonas), Momento de Oro, Índice de Progreso ni el
   desglose de intervenciones — porque esos los calcula /api/report (OpenRouter).

   SOLUCIÓN (DRY): que n8n CONSUMA /api/report en vez de duplicar el render.
   Así el email y el reporte web/PDF quedan SIEMPRE idénticos y con las 9
   secciones. Un solo motor. Cero drift.

   CÓMO APLICAR (en el editor n8n, flujo "vtc-postcall"):
   1) Nodo "Template HTML Render"  → reemplaza TODO su código por STEP A.
   2) Nodo "Generate PDF" (HTTP)   → cambia la URL/params por STEP B.
   3) El resto del flujo (Merge, Send Email, Tracker) queda IGUAL: sigue leyendo
      {{ $json.html }} y el binario del PDF.
   ============================================================================ */

const SITE = 'https://vtc-capacitacion-deploy.vercel.app';

/* ─────────────────────────────────────────────────────────────────────────────
   STEP A — Nodo CODE "Template HTML Render" (reemplazo completo)
   Devuelve { conv, html } consumiendo el motor único /api/report.
   n8n expone fetch global; si tu versión no, usa this.helpers.httpRequest.
   ───────────────────────────────────────────────────────────────────────────── */
async function templateHtmlRender_v2(items) {
  const out = [];
  for (const item of items) {
    const j = item.json || {};
    // El conversation_id llega del webhook de ElevenLabs post-call.
    const conv =
      j.conversation_id || j.conversationId ||
      (j.data && j.data.conversation_id) ||
      (j.body && j.body.conversation_id) || '';

    if (!conv) { out.push({ json: { error: 'Sin conversation_id', html: '' } }); continue; }

    // Motor único — mismo HTML que verá el asesor en la web y en el PDF.
    const url = `${SITE}/api/report?conv=${encodeURIComponent(conv)}`;
    let html = '';
    try {
      const r = await fetch(url);          // en n8n Code node moderno
      html = await r.text();
    } catch (e) {
      // Fallback si fetch no está disponible en tu instancia de n8n:
      // html = await this.helpers.httpRequest({ method: 'GET', url, json: false });
      html = `<p>Error generando reporte: ${String(e && e.message || e)}</p>`;
    }
    out.push({ json: { conv, html, report_url: url, pdf_url: url + '&pdf=1' } });
  }
  return out;
}
// En el Code node de n8n el cuerpo final es simplemente:
//   return await templateHtmlRender_v2($input.all());

/* ─────────────────────────────────────────────────────────────────────────────
   STEP B — Nodo HTTP REQUEST "Generate PDF" (nueva config)
   Antes apuntaba a /api/pdf con el html en el body. Ahora el PDF lo genera el
   MISMO motor, garantizando paridad email ↔ PDF.

   Method:            GET
   URL:               {{ $json.pdf_url }}
                      (equivale a  {SITE}/api/report?conv={{conv}}&pdf=1 )
   Response Format:   File / Binary  (Puppeteer devuelve application/pdf)
   Binary Property:   data
   Options → Timeout: 60000  (coincide con vercel.json maxDuration=60)
   ───────────────────────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────────────────────
   NOTA CAMPOS ENV EN VERCEL (ya requeridos por /api/report):
     ELEVENLABS_API_KEY   → transcript + histórico (Índice de Progreso)
     OPENROUTER_API_KEY   → análisis IA (neurociencia, momento de oro, PNL, plan)
     VTC_AGENT_ID         → (opcional) default agent_0301ksvvm534ezwtraqfg0jyhwem
   Si OPENROUTER_API_KEY falta, el reporte degrada con elegancia (sin secciones IA).
   ───────────────────────────────────────────────────────────────────────────── */

module.exports = { templateHtmlRender_v2, SITE };