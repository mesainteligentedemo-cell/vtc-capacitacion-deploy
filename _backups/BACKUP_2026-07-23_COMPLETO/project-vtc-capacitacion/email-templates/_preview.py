# -*- coding: utf-8 -*-
# Genera session-report-preview.html con datos de ejemplo. Misma logica que usara el nodo n8n.
import urllib.parse, json, urllib.request

s = open('session-report.html', encoding='utf-8').read()

CONV_REAL = 'conv_3201ksxgc5fgfj3be648h1wkr8tm'
def fetch_chat_rows():
    try:
        r=urllib.request.Request('https://vtc-capacitacion-deploy.vercel.app/api/transcript?conv='+CONV_REAL+'&format=rows')
        with urllib.request.urlopen(r,timeout=40) as x: return x.read().decode()
    except Exception:
        return '<table><tr><td style="color:#8a8a92;font-family:Helvetica;">(chat no disponible)</td></tr></table>'

def radar_url(labels, values):
    chart={'type':'radar','data':{'labels':labels,'datasets':[{'data':values,
      'backgroundColor':'rgba(201,170,117,0.18)','borderColor':'rgba(201,170,117,1)','borderWidth':2,
      'pointBackgroundColor':'#c9aa75','pointRadius':3}]},
      'options':{'legend':{'display':False},'scale':{'ticks':{'display':False,'beginAtZero':True,'max':10,'stepSize':2},
      'gridLines':{'color':'rgba(255,255,255,0.08)'},'angleLines':{'color':'rgba(255,255,255,0.08)'},
      'pointLabels':{'fontColor':'#c9aa75','fontSize':13}}}}
    return 'https://quickchart.io/chart?bkg=transparent&w=360&h=360&c='+urllib.parse.quote(json.dumps(chart))

def neuro_bars(pairs):  # [(name,pct),...]
    out=''
    for name,pct in pairs:
        out+=('<tr><td style="padding:0 0 4px 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
          '<td style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#cfcfd6;letter-spacing:0.3px;">'+name+'</td>'
          '<td align="right" style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#c9aa75;">'+str(pct)+'%</td>'
          '</tr></table></td></tr>'
          '<tr><td style="padding:0 0 13px 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1e1e22;border-radius:99px;"><tr>'
          '<td style="font-size:0;line-height:0;"><table width="'+str(pct)+'%" cellpadding="0" cellspacing="0" border="0"><tr>'
          '<td height="6" style="background:#c9aa75;border-radius:99px;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr></table></td></tr>')
    return out

def timeline(items):  # [(t,label),...]
    out=''
    for t,label in items:
        out+=('<tr><td width="66" valign="top" style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#c9aa75;letter-spacing:1px;padding:0 0 16px 0;">'+t+'</td>'
          '<td valign="top" style="padding:0 0 16px 14px;border-left:2px solid #2a2620;">'
          '<span style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:20px;color:#cfcfd6;">'+label+'</span></td></tr>')
    return out

d={
'USER_NAME':'Andrés Mateos','EMP_NUM':'12345','DEPARTAMENTO':'Cierre','USER_ROLE':'Closer',
'FECHA':'30 MAY 2026','TIPO_ACTIVIDAD':'Roleplay','DURACION':'Intenso · 14 min',
'SCORE':'7.5','SCORE_PCT':'75','VEREDICTO':'Buen control de sala. Te falta aterrizar el cierre con postura y no ceder a la presión de tiempo.',
'ESCENARIO':'Familia con hijos','TIPO_CLIENTE':'Driver + Amiable (mezcla)','IDIOMA':'Español',
'DURACION_EXACTA':'14:12','SENTIMIENTO':'Positivo','NUM_TURNOS':'19',
'AUDIO_URL':'https://vtc-capacitacion-deploy.vercel.app/api/audio?conv='+CONV_REAL,
'MODULOS':'M7 Objeciones · M8 TOC',
'RADAR_URL':radar_url(['Rapport','Postura','Objeciones','Leer la sala','Cierre','PNL'],[8,7,6,7,5,6]),
'NEURO_BARS':neuro_bars([('Neuronas espejo',80),('Oxitocina (confianza)',60),('Aversión a la pérdida',40),('Anclaje de precio',30)]),
'TIMELINE_HTML':timeline([('00:30','Rapport — espejeaste la postura del esposo'),('04:00','Descubrimiento — calificaste motivos de viaje'),('08:10','Objeción de precio — la esposa frenó'),('11:30','Intento de cierre — apresurado por el adolescente')]),
'RESUMEN':'Andrés pidió practicar manejo de objeciones. Víctor encarnó una familia mexicana — esposo Driver impaciente, esposa Amiable indecisa y un adolescente smart-ass que googleaba precios. Andrés arrancó con rapport sólido y calificó bien los motivos de viaje, pero al llegar a la objeción de precio cedió a la presión de tiempo del hijo y soltó cifras antes del anclaje, debilitando el cierre. Cerró con un intento apresurado que la pareja pospuso.',
'FORTALEZAS':'Excelente rapport inicial — espejeaste la postura del esposo Driver y activaste neuronas espejo. Atendiste a la esposa Amiable sin que él se impacientara.',
'AREAS_MEJORA':'En el minuto 9 cediste a la presión de tiempo del adolescente y soltaste precio antes del anclaje. Eso apagó la corteza ventromedial del decisor.',
'OBJECIONES':'"Lo tengo que pensar" y "está muy caro" — aislaste la primera bien; la segunda la discutiste en vez de reencuadrar con el costo de no decidir.',
'ANALISIS_PNL':'Usaste bien el <b style="color:#cfb6ff">espejeo</b> de postura y ritmo (rapport rápido). Te faltó <b style="color:#cfb6ff">anclaje sensorial</b> ("imagina despertar frente al mar") y un <b style="color:#cfb6ff">patrón Milton</b> para suavizar el precio. Tip: antes de dar números, mete un reencuadre — "la pregunta no es cuánto cuesta, es cuánto te cuesta no tenerlo".',
'RECOMENDACION':'Practica 3 veces el Three Ways Pitch con una familia donde el adolescente mete prisa. Meta: no soltar precio hasta el módulo 11.',
'CTA_URL':'https://vtc-capacitacion-deploy.vercel.app/','CONV_ID':CONV_REAL,
'TRANSCRIPT_CHAT':fetch_chat_rows()
}
for k,v in d.items(): s=s.replace('{{'+k+'}}',v)
open('session-report-preview.html','w',encoding='utf-8').write(s)
print('preview OK · tokens restantes:', s.count('{{'))