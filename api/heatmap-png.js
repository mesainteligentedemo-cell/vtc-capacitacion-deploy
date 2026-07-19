// GET /api/heatmap-png?site=vtc-capacitacion&user=Pablo&session=s_xxx
// Genera PNG del heatmap de comportamiento de un usuario usando Puppeteer (ya instalado).
// Devuelve la imagen PNG directamente, o URL de data: para adjuntar en emails.
// Navegador Chromium compartido/concurrency-safe (ver comentario detallado en _browser.js):
// lanzar puppeteer.launch()+chromium.executablePath() por request aquí causaba "spawn ETXTBSY"
// cuando dos requests a ESTE MISMO endpoint caían casi a la vez en el mismo contenedor cálido
// (Vercel Fluid Compute) y ambas intentaban extraer /tmp/chromium en paralelo.
const { withPage } = require('./_browser');

const ANALYTICS = 'https://n8n.srv1013903.hstgr.cloud/webhook/analytics';
const SHOT_BASE  = 'https://victor-ia-brain-tracker.vercel.app/heatmaps';
const HEATMAP_JS = 'https://cdn.jsdelivr.net/npm/heatmap.js@2.0.5/build/heatmap.min.js';

function fmtTime(ms){ const s=Math.round((ms||0)/1000); return s<60? s+'s' : Math.floor(s/60)+'m '+(s%60)+'s'; }
function sanitize(s){ return (s||'').replace(/[^a-zA-Z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,60)||'root'; }

module.exports = async (req, res) => {
  const { site='vtc-capacitacion', user='', session='' } = req.query || {};

  // 1. Fetch analytics
  let analytics = { sessions:[] };
  try {
    const r = await fetch(ANALYTICS + '?t=' + Date.now());
    analytics = await r.json();
  } catch(e) { return res.status(500).send('analytics error: '+e.message); }

  // 2. Encontrar sesión del usuario (por nombre o session id, más reciente primero)
  const sessions = (analytics.sessions||[])
    .filter(s => s.site === site)
    .filter(s => {
      if (session) return s.sessionId === session;
      if (user) return (s.user && (s.user.name||'').toLowerCase().includes(user.toLowerCase())) || s.sessionId.includes(user) || s.visitorId.includes(user);
      return true;
    })
    .sort((a,b) => (b.lastSeen||0)-(a.lastSeen||0));

  const sess = sessions[0];
  if (!sess) return res.status(404).send('session not found for user: '+user);

  // 3. Extraer datos
  const slug = '/';
  const pageData = (sess.pages && sess.pages[slug]) || Object.values(sess.pages||{})[0] || {};
  const clicks   = pageData.clicks || [];
  const videos   = sess.videos || [];
  const userName = (sess.user && sess.user.name) || sess.visitorId;
  const totalMs  = (sess.session && sess.session.totalMs) || sess.totalActiveMs || 0;
  const revisits = (sess.session && sess.session.revisits) || 1;
  const scroll   = pageData.maxScroll || 0;

  // 4. URL del screenshot
  const shotFile  = sanitize(site) + '__' + sanitize(slug) + '.png';
  const shotUrl   = SHOT_BASE + '/' + shotFile;

  // 5. Generar HTML con heatmap auto-renderizado
  const clicksJson = JSON.stringify(clicks.map(c=>({x:c.px,y:c.py,value:1})));
  const videosHtml = videos.length ? videos.map(v =>
    `<tr><td>${v.title||v.id||'Video'}</td><td>${fmtTime(v.watchedMs)}</td>` +
    `<td>${v.maxPct||0}%</td><td>${v.completed?'✅ Completo':'⏸ Parcial'}</td>` +
    `<td>${v.plays||0} veces</td></tr>`).join('') :
    '<tr><td colspan="5" style="color:#888">Sin videos detectados</td></tr>';

  const html = `<!doctype html><html><head><meta charset="utf-8">
  <style>
    body{margin:0;background:#0a0a0f;font-family:Inter,Arial,sans-serif;color:#e8eaf0}
    .wrap{width:1440px}
    .stats{display:flex;gap:16px;padding:20px 24px;background:#101019;border-bottom:1px solid rgba(255,255,255,.08)}
    .stat{background:#16161f;border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:14px 18px;min-width:120px}
    .stat .v{font-size:26px;font-weight:800;background:linear-gradient(135deg,#3B82F6,#8B5CF6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .stat .k{font-size:11px;color:#888;margin-top:2px}
    .stage{position:relative;width:1440px}
    .stage img{display:block;width:1440px}
    .stage .hm{position:absolute;left:0;top:0;pointer-events:none}
    .videos{padding:20px 24px;background:#101019}
    .videos h3{font-size:13px;letter-spacing:.12em;color:#888;margin-bottom:10px}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th{text-align:left;color:#888;padding:6px 10px;border-bottom:1px solid rgba(255,255,255,.06)}
    td{padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.04)}
    .footer{padding:14px 24px;font-size:11px;color:#555;border-top:1px solid rgba(255,255,255,.06)}
  </style>
  </head><body><div class="wrap">
  <div class="stats">
    <div class="stat"><div class="v">${userName}</div><div class="k">Usuario</div></div>
    <div class="stat"><div class="v">${clicks.length}</div><div class="k">Clics</div></div>
    <div class="stat"><div class="v">${fmtTime(totalMs)}</div><div class="k">Tiempo total</div></div>
    <div class="stat"><div class="v">${scroll}%</div><div class="k">Scroll</div></div>
    <div class="stat"><div class="v">${revisits}</div><div class="k">Visitas</div></div>
    <div class="stat"><div class="v">${videos.length}</div><div class="k">Videos</div></div>
  </div>
  <div class="stage" id="stage">
    <img id="shot" src="${shotUrl}" width="1440" crossorigin="anonymous" onerror="this.style.display='none'">
    <div class="hm" id="hm" style="width:1440px;height:900px"></div>
  </div>
  ${videos.length ? `<div class="videos"><h3>VIDEOS VISTOS</h3><table>
    <tr><th>Video</th><th>Tiempo visto</th><th>% completado</th><th>Estado</th><th>Reproducciones</th></tr>
    ${videosHtml}</table></div>` : ''}
  <div class="footer">Victor IA · Heatmap generado ${new Date().toLocaleString('es-MX')} · victor-ia.xyz</div>
  </div>
  <script src="${HEATMAP_JS}"></script>
  <script>
  var img = document.getElementById('shot');
  function paint(){
    var w = img.naturalWidth || 1440, h = img.naturalHeight || 900;
    document.getElementById('stage').style.height = h + 'px';
    var hm = document.getElementById('hm');
    hm.style.width = w + 'px'; hm.style.height = h + 'px';
    var pts = ${clicksJson}.map(function(c){ return {x:Math.round(c.x*w), y:Math.round(c.y*h), value:1}; });
    if(pts.length && window.h337){
      var inst = h337.create({container:hm,radius:Math.max(32,Math.round(w*0.035)),maxOpacity:.75,minOpacity:0,blur:.82,
        gradient:{'.3':'#1e3a8a','.55':'#3B82F6','.75':'#a855f7','.9':'#f59e0b','1':'#ef4444'}});
      inst.setData({max:Math.max(2,Math.round(pts.length/5)),data:pts});
    }
  }
  if(img.complete && img.naturalWidth) paint(); else img.onload = paint;
  </script></body></html>`;

  // 6. Puppeteer: screenshot del HTML
  try {
    const png = await withPage(async (page) => {
      await page.setViewport({ width: 1440, height: 900 });
      await page.setContent(html, { waitUntil: 'networkidle0', timeout: 25000 });
      await new Promise(r => setTimeout(r, 1500)); // esperar heatmap.js render

      // capturar toda la página (stats + heatmap + videos)
      return page.screenshot({ fullPage: true, type: 'png' });
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="heatmap-${sanitize(userName)}.png"`);
    res.setHeader('Cache-Control', 'no-store');
    res.send(Buffer.from(png));
  } catch(e) {
    res.status(500).send('render error: '+e.message);
  }
};
