// api/_browser.js — Navegador Chromium COMPARTIDO para toda la carpeta api/ (serverless).
//
// PROBLEMA (ETXTBSY): @sparticuz/chromium extrae su binario a /tmp/chromium con un patrón
// check-then-write que NO es atómico (ver node_modules/@sparticuz/chromium/build/lambdafs.js):
// existsSync(output) -> si no existe, createWriteStream(output) ya CREA el archivo en disco
// aunque la descompresión Brotli siga en curso; la promesa solo se resuelve cuando el stream
// emite 'close'. Cada api/*.js se despliega en Vercel como una función serverless AISLADA (su
// propio contenedor/proceso/tmp), pero DENTRO de un mismo endpoint (p.ej. /api/report?pdf=1)
// Vercel puede procesar varias invocaciones concurrentes en el mismo contenedor cálido (Fluid
// Compute), o dos cold starts casi simultáneos pueden coexistir brevemente. Antes de este fix,
// cada request llamaba a SU PROPIO puppeteer.launch()+chromium.executablePath() de forma
// independiente: si dos caían casi a la vez en el mismo contenedor, la segunda veía /tmp/chromium
// ya creado por la primera (aunque seguía abierto para escritura) y Puppeteer intentaba spawnear
// un binario todavía no cerrado -> "Error: spawn /tmp/chromium ETXTBSY".
//
// FIX: un único navegador Chromium por contenedor/función, cacheado en este módulo y reutilizado
// entre invocaciones cálidas (nunca se cierra al final de cada request; solo se cierra la `page`).
// El lanzamiento se serializa en UNA sola promesa en vuelo (`browserPromise`): si N requests
// concurrentes llegan al mismo contenedor mientras el navegador aún se está extrayendo/lanzando,
// TODAS esperan esa misma promesa en lugar de disparar N llamadas paralelas a
// chromium.executablePath(). Esto elimina la condición de carrera de raíz (nunca hay 2
// extracciones simultáneas dentro del mismo contenedor) y de paso evita relanzar Chromium
// (costoso, ~1-2s) en cada PDF -> respuestas más rápidas en contenedores tibios.
//
// Este módulo se importa por separado desde _render.js (report.js/pdf.js/transcript.js),
// premium-report.js, heatmap-png.js y _pdf-generator.js; como cada api/*.js es una función
// Vercel independiente, cada una obtiene su PROPIA copia aislada de este singleton -> el mismo
// patrón de fix aplica de forma idéntica y autocontenida en cada endpoint.
const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

let browserPromise = null;

async function launchBrowser() {
  const browser = await puppeteer.launch({
    args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb', '--font-render-hinting=none'],
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });
  // Si el navegador compartido se cae (crash/OOM/reciclaje), invalida el cache para que la
  // SIGUIENTE llamada relance uno nuevo en vez de devolver siempre un browser muerto.
  browser.once('disconnected', () => { browserPromise = null; });
  return browser;
}

/**
 * Devuelve el navegador Chromium compartido de este contenedor (lo lanza si aún no existe).
 * Concurrency-safe: cualquier llamada mientras el lanzamiento está en curso espera la MISMA
 * promesa en vez de disparar un puppeteer.launch()/chromium.executablePath() en paralelo
 * -> nunca hay dos extracciones simultáneas del binario -> nunca más ETXTBSY.
 */
async function getBrowser() {
  if (!browserPromise) {
    browserPromise = launchBrowser().catch((err) => {
      browserPromise = null; // permite reintentar en la próxima llamada si el lanzamiento falla
      throw err;
    });
  }
  const browser = await browserPromise;
  if (!browser.isConnected()) {
    browserPromise = null;
    return getBrowser();
  }
  return browser;
}

/**
 * Abre una page nueva en el navegador compartido y garantiza que se cierre siempre
 * (éxito o error), sin cerrar nunca el browser -> lo deja listo/tibio para el próximo request.
 */
async function withPage(fn) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    return await fn(page);
  } finally {
    try { await page.close(); } catch (_) {}
  }
}

module.exports = { getBrowser, withPage };