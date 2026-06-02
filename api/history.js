// Memoria entre sesiones. GET /api/history?emp=12345
// Busca en las conversaciones pasadas del agente la ultima del empleado y devuelve su resumen.
const AGENT = 'agent_9501k3vkt6svekjs6y0qe5xzcek1';

function dcv(dc, k) { const o = dc[k]; if (o == null) return ''; return (typeof o === 'object' && 'value' in o) ? o.value : o; }

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
    const emp = String((req.query && (req.query.emp || req.query.employee_number)) || '').trim();
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) { res.status(200).json({ found: false, message: 'Sin acceso a memoria.' }); return; }
    const H = { 'xi-api-key': key };

    const list = await fetch(`https://api.elevenlabs.io/v1/convai/conversations?agent_id=${AGENT}&page_size=30`, { headers: H });
    if (!list.ok) { res.status(200).json({ found: false, message: 'Primera sesión.' }); return; }
    const data = await list.json();
    const convs = (data.conversations || data.data || []).filter(c => (c.status || '').toLowerCase() === 'done' || c.call_successful || true);

    // revisar las mas recientes y encontrar la del empleado
    let match = null, checked = 0;
    for (const c of convs) {
      if (checked >= 12) break; checked++;
      const id = c.conversation_id || c.id; if (!id) continue;
      const dr = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${id}`, { headers: H });
      if (!dr.ok) continue;
      const det = await dr.json();
      const dc = (det.analysis && det.analysis.data_collection_results) || {};
      const dv = (det.conversation_initiation_client_data && det.conversation_initiation_client_data.dynamic_variables) || {};
      const e = String(dcv(dc, 'employee_number') || dv.employee_number || '').trim();
      const nm = dcv(dc, 'user_name') || dv.user_name || '';
      if (emp && e && e === emp) { match = { det, dc, nm }; break; }
      if (!emp && !match) match = { det, dc, nm }; // sin emp: toma la mas reciente
    }
    if (!match) { res.status(200).json({ found: false, message: 'No hay sesiones previas de este asesor. Trátalo como primera sesión.' }); return; }

    const { det, dc, nm } = match;
    const start = det.metadata && det.metadata.start_time_unix_secs;
    const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const fecha = start ? (() => { const dt = new Date(start * 1000); return dt.getDate() + ' de ' + MESES[dt.getMonth()]; })() : '';
    const resumen = {
      found: true,
      nombre: nm || '',
      fecha,
      modulos: dcv(dc, 'modulos_practicados') || '',
      hizo_bien: dcv(dc, 'fortalezas') || '',
      a_mejorar: dcv(dc, 'areas_mejora') || '',
      recomendacion: dcv(dc, 'recomendacion_siguiente') || '',
      escenario: dcv(dc, 'escenario_roleplay') || '',
      score: dcv(dc, 'desempeno_score') || '',
      resumen: (det.analysis && det.analysis.transcript_summary) || '',
    };
    // texto listo para que el agente lo lea
    resumen.texto = `Última sesión${fecha ? ' (' + fecha + ')' : ''}: ` +
      (resumen.modulos ? `practicaste ${resumen.modulos}` : '');
    res.status(200).json(resumen);
  } catch (e) {
    res.status(200).json({ found: false, message: 'Sin memoria disponible.' });
  }
};