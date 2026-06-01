const d = $input.first().json;
const id = d.conversation_id;
const a = d.analysis || {};
const meta = d.metadata || {};
const dur = meta.call_duration_secs || 0;
const durStr = Math.floor(dur/60) + ':' + String(dur%60).padStart(2,'0');
const title = a.call_summary_title || 'Llamada';
const summary = a.transcript_summary || '(sin resumen)';
const sentiment = (a.sentiment_analysis && (a.sentiment_analysis.overall_sentiment||a.sentiment_analysis.sentiment)) || '';
const dc = a.data_collection_results || {};
function dcv(k){ const o = dc[k]; if(o==null) return ''; return (typeof o==='object' && 'value' in o)? o.value : o; }
const name = dcv('name') || dcv('nombre') || 'Usuario';
const email = dcv('email') || dcv('correo') || '';
const phone = dcv('phone') || dcv('telefono') || '';
const agent = d.agent_name || d.agent_id || 'Agente';
const esc = s => (s||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;');
const transcriptHtml = (d.transcript||[]).map(t=>{const role=t.role==='agent'?'Agente':'Usuario';const col=t.role==='agent'?'#3B82F6':'#22c55e';return '<div style="margin:8px 0;padding:8px 12px;background:rgba(255,255,255,.03);border-left:3px solid '+col+';border-radius:6px"><b style="color:'+col+'">'+role+':</b> <span style="color:#cfd3dc">'+esc(t.message)+'</span></div>';}).join('');
const base = 'https://n8n.srv1013903.hstgr.cloud/webhook';
const playerUrl = base + '/call?id=' + id;
const sd = $getWorkflowStaticData('global');
sd.calls = sd.calls || {};
sd.calls[id] = { id, title, summary, durStr, name, email, phone, agent, sentiment, transcriptHtml, ts: Date.now() };
const ks = Object.keys(sd.calls); if(ks.length>60){ ks.sort((x,y)=>sd.calls[x].ts-sd.calls[y].ts).slice(0,ks.length-60).forEach(k=>delete sd.calls[k]); }
const subject = '📞 Llamada · ' + agent + ' · ' + name;
const resumen = summary.slice(0,200);
const tg = '📞 <b>Nueva llamada</b>\n📋 <b>Resumen:</b> ' + resumen + '\n\n<b>Agente:</b> ' + agent + '\n<b>Usuario:</b> ' + name + (email?('\n<b>Email:</b> '+email):'') + '\n<b>Duración:</b> ' + durStr + (sentiment?('\n<b>Sentimiento:</b> '+sentiment):'') + '\n\n▶️ Escuchar + transcripción: ' + playerUrl;
const html = '<div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;background:#0a0a0f;color:#e8eaf0;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.08)">'
 + '<div style="background:linear-gradient(135deg,#3B82F6,#8B5CF6);padding:22px 26px"><div style="font-size:13px;letter-spacing:.18em;opacity:.85">VICTOR IA · LLAMADA</div><div style="font-size:22px;font-weight:800;margin-top:4px">📞 ' + esc(title) + '</div></div>'
 + '<div style="padding:24px 26px">'
 + '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px">'
 + '<span style="background:rgba(59,130,246,.15);color:#93c5fd;padding:5px 12px;border-radius:20px;font-size:12px">👤 ' + esc(name) + '</span>'
 + '<span style="background:rgba(255,255,255,.06);padding:5px 12px;border-radius:20px;font-size:12px">⏱ ' + durStr + '</span>'
 + (sentiment?('<span style="background:rgba(34,197,94,.15);color:#86efac;padding:5px 12px;border-radius:20px;font-size:12px">😊 ' + esc(sentiment) + '</span>'):'')
 + '<span style="background:rgba(255,255,255,.06);padding:5px 12px;border-radius:20px;font-size:12px">🤖 ' + esc(agent) + '</span></div>'
 + '<div style="background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.2);border-radius:12px;padding:16px;margin-bottom:20px"><div style="font-size:12px;letter-spacing:.1em;color:#93c5fd;margin-bottom:6px">RESUMEN</div><div style="font-size:15px;line-height:1.6">' + esc(summary) + '</div></div>'
 + '<a href="' + playerUrl + '" style="display:block;text-align:center;background:linear-gradient(135deg,#3B82F6,#8B5CF6);color:#fff;text-decoration:none;padding:14px;border-radius:12px;font-weight:700;font-size:15px;margin-bottom:22px">▶ Escuchar grabación + transcripción completa</a>'
 + '<div style="font-size:12px;letter-spacing:.1em;color:#888;margin-bottom:8px">TRANSCRIPCIÓN</div>' + transcriptHtml
 + '</div>'
 + '<div style="padding:16px 26px;border-top:1px solid rgba(255,255,255,.06);font-size:12px;color:#777">Victor IA · info@victor-ia.com.mx · victor-ia.com.mx</div></div>';
return [{ json: { id, subject, resumen, tg, html, name, email, playerUrl } }];