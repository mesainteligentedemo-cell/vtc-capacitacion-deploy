// Agrega el histórico de sesiones de un empleado para el Índice de Progreso.
// Best-effort: recorre las conversaciones recientes del agente VTC y promedia
// score, competencias y duración de las sesiones ANTERIORES del mismo empleado.
const AGENT = process.env.VTC_AGENT_ID || 'agent_0301ksvvm534ezwtraqfg0jyhwem';

function dcv(dc, k) { const o = dc[k]; if (o == null) return ''; return (typeof o === 'object' && 'value' in o) ? o.value : o; }
function parsePairs(str) { return String(str || '').split('|').map(x => x.trim()).filter(Boolean).map(x => { const i = x.lastIndexOf(':'); return i < 0 ? null : [x.slice(0, i).trim(), parseFloat(x.slice(i + 1).trim()) || 0]; }).filter(Boolean); }

// Devuelve {count, scores:[], avgScore, avgCompAvg, avgDurSecs}
async function historyAgg(emp, currentConvId, key) {
  const empty = { count: 0, scores: [], avgScore: null, avgCompAvg: null, avgDurSecs: null };
  if (!key || !emp) return empty;
  try {
    const H = { 'xi-api-key': key };
    const list = await fetch(`https://api.elevenlabs.io/v1/convai/conversations?agent_id=${AGENT}&page_size=30`, { headers: H });
    if (!list.ok) return empty;
    const data = await list.json();
    const convs = (data.conversations || data.data || []);
    const sessions = []; let checked = 0;
    for (const c of convs) {
      if (checked >= 14 || sessions.length >= 6) break;
      const id = c.conversation_id || c.id;
      if (!id || id === currentConvId) continue;
      checked++;
      const dr = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${id}`, { headers: H });
      if (!dr.ok) continue;
      const det = await dr.json();
      const dc = (det.analysis && det.analysis.data_collection_results) || {};
      const dv = (det.conversation_initiation_client_data && det.conversation_initiation_client_data.dynamic_variables) || {};
      const e = String(dcv(dc, 'employee_number') || dv.employee_number || '').trim();
      if (e !== String(emp).trim()) continue;
      const score = parseFloat(dcv(dc, 'desempeno_score'));
      const comps = parsePairs(dcv(dc, 'scores_competencias'));
      const compAvg = comps.length ? comps.reduce((a, b) => a + b[1], 0) / comps.length : null;
      const durSecs = (det.metadata && det.metadata.call_duration_secs) || null;
      const start = (det.metadata && det.metadata.start_time_unix_secs) || 0;
      sessions.push({ score: isFinite(score) ? score : null, compAvg, durSecs, start });
    }
    if (!sessions.length) return empty;
    sessions.sort((a, b) => a.start - b.start); // cronológico para sparkline
    const scores = sessions.map(s => s.score).filter(v => v != null);
    const comps = sessions.map(s => s.compAvg).filter(v => v != null);
    const durs = sessions.map(s => s.durSecs).filter(v => v != null);
    const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
    return { count: sessions.length, scores, avgScore: avg(scores), avgCompAvg: avg(comps), avgDurSecs: avg(durs) };
  } catch (e) {
    return empty;
  }
}

module.exports = { historyAgg };