# -*- coding: utf-8 -*-
import json, urllib.request
KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMGUxNzJlNy1mYzM2LTQ3ODItYWFmYi05ZDAzOWFiNzk4NmEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiYzMyNWNhM2YtYjNhOS00MWQxLWFjYjktODE3ZmQ4MjExZDU4IiwiaWF0IjoxNzg0NDU4OTQwfQ.n_J5__rEkQnw_dT-3CR4KWLGWBaJMUAW3dZpCBzy9ZU'
WF='zCtqHc9Pj8ZbtVp1'; B='https://n8n.srv1013903.hstgr.cloud'
AGENT='agent_5701kr0h5gg6eetb69tv6c5hwfj1'
SITE='https://vtc-capacitacion-deploy.vercel.app'
def api(m,p,d=None):
    body=json.dumps(d).encode('utf-8') if d is not None else None
    r=urllib.request.Request(B+p,data=body,method=m,headers={'X-N8N-API-KEY':KEY,'Content-Type':'application/json'})
    with urllib.request.urlopen(r,timeout=30) as x: return json.loads(x.read().decode())

wf=api('GET','/api/v1/workflows/'+WF)
N={n['name']:n for n in wf['nodes']}

# 1) Procesar llamada -> filtro por agente + subject + telegram slick
N['Procesar llamada']['parameters']['jsCode'] = r'''const d = $input.first().json;
if (d.agent_id && d.agent_id !== "'''+AGENT+r'''") { return []; }
const id = d.conversation_id || "";
const a = d.analysis || {}; const meta = d.metadata || {}; const dc = a.data_collection_results || {};
function dcv(k){ const o = dc[k]!=null?dc[k]:(dc[k+"  "]!=null?dc[k+"  "]:dc[k+" "]); if(o==null) return ""; return (typeof o==="object"&&"value"in o)?o.value:o; }
function esc(s){ return (s==null?"":String(s)).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
const name = dcv("user_name") || [dcv("first_name"),dcv("last_name")].filter(Boolean).join(" ") || "Asesor";
const emp = dcv("employee_number") || ""; const depto = dcv("departamento") || "";
const dur = meta.call_duration_secs||0; const durStr = Math.floor(dur/60)+":"+String(dur%60).padStart(2,"0");
const lang = (meta.main_language||"").toLowerCase(); const idioma = lang.indexOf("en")===0?"Inglés":(lang.indexOf("es")===0?"Español":"—");
const turnos = (d.transcript||[]).length;
const escn = dcv("escenario_roleplay") || dcv("tipo_actividad") || "Sesión";
const cliente = dcv("tipo_cliente") || "";
const sN = parseFloat(dcv("desempeno_score")); const hasS = isFinite(sN); const score = hasS?(Math.round(sN*10)/10):"—";
let summary = (a.transcript_summary || dcv("call_summary") || "").toString().trim();
if(summary.length>320) summary = summary.slice(0,317).trim()+"…";
const veredicto = !hasS?"Sesión de repaso.":sN>=8.5?"Excelente ejecución.":sN>=7?"Buen nivel, pulir detalles.":sN>=5?"Va bien, reforzar puntos clave.":"Más reps en lo básico.";
const audio = "'''+SITE+r'''/api/audio?conv="+id;
const report = "'''+SITE+r'''/api/report?conv="+id;
const train = "'''+SITE+r'''/";
const subject = "🎯 Reporte VTC · " + name + (hasS?(" · "+score+"/10"):"");
let tg = "🎯 <b>Nuevo entrenamiento — VTC</b>\n\n";
tg += "👤 <b>"+esc(name)+"</b>" + (emp?(" · Emp. "+esc(emp)):"") + (depto?(" · "+esc(depto)):"") + "\n";
tg += "🌐 "+idioma+"   ·   ⏱ "+durStr+"   ·   💬 "+turnos+" intervenciones\n";
tg += "🎭 "+esc(escn) + (cliente?(" — "+esc(cliente)):"") + "\n\n";
if(hasS) tg += "⭐ <b>Desempeño:</b> "+score+"/10\n";
tg += "📌 "+esc(veredicto)+"\n\n";
if(summary) tg += "📝 <b>Resumen</b>\n"+esc(summary)+"\n\n";
tg += "🎧 <a href=\""+audio+"\">Escuchar conversación</a>\n";
tg += "📄 <a href=\""+report+"\">Ver reporte completo</a>\n";
tg += "🔁 <a href=\""+train+"\">Volver a entrenar</a>";
return [{ json: { id, subject, tg, report, audio } }];'''

# 2) Nuevos nodos HTTP: traer reporte HTML + traer PDF
base_url = SITE+'/api/report?conv={{ $(\'Procesar llamada\').item.json.id }}'
N['Traer reporte HTML'] = {
  'name':'Traer reporte HTML','type':'n8n-nodes-base.httpRequest','typeVersion':4.2,
  'position':[ N['Procesar llamada']['position'][0]+220, N['Procesar llamada']['position'][1] ],
  'parameters':{ 'url':'='+base_url, 'options':{ 'response':{ 'response':{ 'responseFormat':'text' } } } } }
N['Traer PDF'] = {
  'name':'Traer PDF','type':'n8n-nodes-base.httpRequest','typeVersion':4.2,
  'position':[ N['Procesar llamada']['position'][0]+440, N['Procesar llamada']['position'][1] ],
  'parameters':{ 'url':'='+base_url+'&pdf=1', 'options':{ 'response':{ 'response':{ 'responseFormat':'file' } } } } }

# 3) Email -> mesainteligentedemo, cc a eldudemateos y chrisoria, html del reporte, PDF adjunto
e=N['Email premium llamada']['parameters']
e['toEmail']='mesainteligentedemo@gmail.com'
e['ccEmail']='eldudemateos@gmail.com,chrisoria16@gmail.com'
e['subject']="={{ $('Procesar llamada').item.json.subject }}"
e['html']="={{ $('Traer reporte HTML').item.json.data }}"
e['options']={ 'appendAttribution':False, 'attachments':'data' }

# 4) Telegram slick
t=N['Telegram llamada']['parameters']
t['text']="={{ $('Procesar llamada').item.json.tg }}"
t['additionalFields']={ 'parse_mode':'HTML', 'appendAttribution':False, 'disable_web_page_preview':True }

# 5) Reconectar la rama post-call
conns=wf['connections']
def link(a,b): conns[a]={'main':[[{'node':b,'type':'main','index':0}]]}
link('Procesar llamada','Traer reporte HTML')
link('Traer reporte HTML','Traer PDF')
link('Traer PDF','Email premium llamada')
link('Email premium llamada','Telegram llamada')
# Telegram -> OK ya existe

wf['nodes']=list(N.values())
payload={'name':wf['name'],'nodes':wf['nodes'],'connections':conns,'settings':wf.get('settings',{})}
out=api('PUT','/api/v1/workflows/'+WF,payload)
print('PUT OK · nodos:',len(out.get('nodes',[])),'· active:',out.get('active'))
'''try activate'''
try:
    api('POST','/api/v1/workflows/'+WF+'/activate'); print('activado')
except Exception as ex: print('activate:',ex)
