// Modulo compartido: HTML -> PDF con Chromium real. (archivo _ = no es ruta en Vercel)
const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

async function htmlToPdf(html) {
  let browser = null;
  try {
    browser = await puppeteer.launch({
      args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 820, height: 1160, deviceScaleFactor: 2 },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 45000 });
    // Usar el ancho de la hoja + evitar que las TARJETAS se corten entre paginas.
    await page.addStyleTag({ content: `
      .container { width: 764px !important; max-width: 764px !important; }
      .container td > table { display: block !important; break-inside: avoid !important; page-break-inside: avoid !important; }
      img { break-inside: avoid !important; page-break-inside: avoid !important; }
    ` });
    const pdf = await page.pdf({
      printBackground: true,
      format: 'A4',
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
    });
    return Buffer.from(pdf);
  } finally {
    if (browser) { try { await browser.close(); } catch (_) {} }
  }
}

module.exports = { htmlToPdf };
