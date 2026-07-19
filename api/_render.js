// Modulo compartido: HTML -> PDF con Chromium real. (archivo _ = no es ruta en Vercel)
// UNA sola página de altura DINÁMICA: mide la altura real renderizada del documento y genera
// el PDF con ese ancho/alto exactos. Sin @page A4, sin format fijo, sin headerTemplate/footerTemplate
// por página -> no hay saltos de página forzados ni cortes de "Página X de Y". Sesión corta = página
// corta; sesión larga (transcripción larga) = página muy alta, pero sigue siendo UNA sola, en flujo
// continuo, igual que el correo.
//
// El navegador Chromium se obtiene de ./_browser.js (singleton compartido y concurrency-safe):
// lanzar puppeteer.launch()+chromium.executablePath() por request aquí causaba "spawn ETXTBSY"
// cuando dos requests a /api/report?pdf=1 (o /api/pdf, /api/transcript) caían casi a la vez en
// el mismo contenedor cálido (ver comentario detallado en _browser.js). Solo se abre/cierra una
// `page` por request; el browser se queda tibio para el siguiente.
const { withPage } = require('./_browser');

const PAGE_WIDTH_PX = 640;   // igual al ancho del .container del template
const OUTER_PAD_PX = 32;     // padding vertical del wrapper (arriba+abajo, ver _template.js)
const SAFETY_PX = 8;         // margen de seguridad para evitar recortar el último pixel

async function htmlToPdf(html) {
  return withPage(async (page) => {
    await page.setViewport({ width: PAGE_WIDTH_PX + OUTER_PAD_PX * 2, height: 1200, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 45000 });
    try { await page.evaluateHandle('document.fonts.ready'); } catch (_) {}
    // Evita que las tarjetas/tablas internas se corten a la mitad si algún visor SÍ pagina
    // (ej. al imprimir desde el navegador); en el PDF generado aquí no aplica, porque es 1 sola página.
    await page.addStyleTag({ content: `
      .container { width: ${PAGE_WIDTH_PX}px !important; max-width: ${PAGE_WIDTH_PX}px !important; }
      .container td > table { break-inside: avoid !important; page-break-inside: avoid !important; }
      img, svg { break-inside: avoid !important; page-break-inside: avoid !important; }
    ` });

    // Mide la altura REAL del documento ya renderizado (con fuentes cargadas) para que el PDF
    // sea exactamente esa altura -> una sola página, sin recortes ni espacio de sobra.
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
  });
}

module.exports = { htmlToPdf };