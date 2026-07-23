# -*- coding: utf-8 -*-
p='index.html'; t=open(p,encoding='utf-8').read(); ch=[]

# 1) vtcHL marca timestamp de "scroll dirigido por el agente" (para no confundir con navegacion del usuario)
old_hl="function vtcHL(el){ try{document.querySelectorAll('.vtc-hl').forEach(function(e){e.classList.remove('vtc-hl');});}catch(e){} if(el) el.classList.add('vtc-hl'); }"
new_hl="function vtcHL(el){ try{window.__vtcDrive=Date.now();}catch(e){} try{document.querySelectorAll('.vtc-hl').forEach(function(e){e.classList.remove('vtc-hl');});}catch(e){} if(el) el.classList.add('vtc-hl'); }"
if old_hl in t: t=t.replace(old_hl,new_hl,1); ch.append('vtcHL')

# 2) MAP: agregar inicio/top/h1
old_map="const MAP={'f':'modulo-f','fundamentos':'modulo-f','proceso':'lvc','lvc':'lvc','club':'lvc','vtc19':'vtc19','vtc 19':'vtc19','19':'vtc19','bienvenida':'bienvenida','fin':'modulo-FIN','cierre-curso':'modulo-FIN'};"
new_map="const MAP={'inicio':'__top','top':'__top','h1':'__top','arriba':'__top','principio':'__top','f':'modulo-f','fundamentos':'modulo-f','proceso':'lvc','lvc':'lvc','club':'lvc','vtc19':'vtc19','vtc 19':'vtc19','19':'vtc19','bienvenida':'bienvenida','fin':'modulo-FIN','cierre-curso':'modulo-FIN'};"
if old_map in t: t=t.replace(old_map,new_map,1); ch.append('map-top')

# 3) ir_a_modulo: manejar __top (ir al H1)
old_ir="ir_a_modulo: async(p)=>{ try{ var el=document.getElementById(vtcId(p)); if(el){ el.scrollIntoView({behavior:'smooth',block:'start'}); vtcHL(el); return 'Navegado y resaltado'; } return 'modulo no encontrado'; }catch(e){return 'error';} },"
new_ir="ir_a_modulo: async(p)=>{ try{ var id=vtcId(p); if(id==='__top'){ try{window.__vtcDrive=Date.now();}catch(e){} window.scrollTo({top:0,behavior:'smooth'}); return 'En el inicio del curso'; } var el=document.getElementById(id); if(el){ el.scrollIntoView({behavior:'smooth',block:'start'}); vtcHL(el); return 'Navegado y resaltado'; } return 'modulo no encontrado'; }catch(e){return 'error';} },"
if old_ir in t: t=t.replace(old_ir,new_ir,1); ch.append('ir-top')

# 4) onModeChange: marcar si Victor esta hablando
old_mc="onModeChange:(m)=>{const md=(m&&m.mode)||m;if(md==='speaking'){typing(false);setStatus('<b>Victor hablando…</b>');}else setStatus('<b>Escuchando…</b>');},"
new_mc="onModeChange:(m)=>{const md=(m&&m.mode)||m;window.__vtcSpeaking=(md==='speaking');if(md==='speaking'){typing(false);setStatus('<b>Victor hablando…</b>');}else setStatus('<b>Escuchando…</b>');},"
if old_mc in t: t=t.replace(old_mc,new_mc,1); ch.append('modechange')

# 5) Detector de navegacion del usuario (despues del listener del quiz)
anchor="},false);"  # cierre del listener del quiz (unico con ese patron tras el quiz)
nav='''},false);
  // --- Conciencia de navegacion: Victor sabe en que parte del sitio esta el usuario ---
  var _vLast='', _vT=null, _vOffered={};
  function _vCur(){ var secs=document.querySelectorAll('[id^=\"modulo-\"],#lvc,#vtc19,#bienvenida'); var mid=window.innerHeight*0.4,best=null,bd=1e9; secs.forEach(function(s){var r=s.getBoundingClientRect(); if(r.bottom>60&&r.top<window.innerHeight){var c=r.top+Math.min(r.height,window.innerHeight)/2; var d=Math.abs(c-mid); if(d<bd){bd=d;best=s;}}}); return best; }
  window.addEventListener('scroll',function(){ if(!conv) return; clearTimeout(_vT); _vT=setTimeout(function(){
      var agentDrive = window.__vtcDrive && (Date.now()-window.__vtcDrive < 6000);
      var s=_vCur(); if(!s||s.id===_vLast) return; _vLast=s.id;
      if(agentDrive) return; // fue scroll del propio Victor, no del usuario
      try{ conv.sendContextualUpdate && conv.sendContextualUpdate('[NAV] El usuario esta viendo la seccion '+s.id+'.'); }catch(e){}
      if(!window.__vtcSpeaking && !_vOffered[s.id]){ _vOffered[s.id]=1;
        setTimeout(function(){ var c=_vCur(); if(!window.__vtcSpeaking && c && c.id===s.id){ try{ conv.sendUserMessage && conv.sendUserMessage('(NAV: el usuario se detuvo leyendo la seccion '+s.id+'. Ofrecele ayuda breve y natural con esa parte, en una sola frase.)'); }catch(e){} } },4500);
      }
    },1100); },{passive:true});'''
if '[NAV]' not in t and anchor in t:
    t=t.replace(anchor,nav,1); ch.append('nav-detector')

open(p,'w',encoding='utf-8').write(t)
print('cambios:',ch)