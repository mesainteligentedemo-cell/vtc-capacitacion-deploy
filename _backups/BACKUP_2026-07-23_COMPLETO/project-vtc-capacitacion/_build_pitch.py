# -*- coding: utf-8 -*-
p='index.html'; t=open(p,encoding='utf-8').read(); ch=[]

# 1) helper vtcResolve (despues de vtcHL)
anchor_hl="if(el) el.classList.add('vtc-hl'); vtcMobMin(); }"
resolver=anchor_hl+'''
  function vtcResolve(p){ var raw=String((p&&(p.modulo||p.module||p.id))||'').toLowerCase().replace(/\\s+/g,' ').trim();
    var pm=raw.match(/(?:pitch|paso|step)\\s*-?\\s*([0-9]{1,2})/);
    if(pm){ var nn=('0'+pm[1]).slice(-2); var src=document.querySelector('#vtc19 source[src*="modulo-'+nn+'.mp4"]'); if(src){ var box=src.closest('.lesson-video'); var lab=(box&&box.previousElementSibling&&box.previousElementSibling.classList&&box.previousElementSibling.classList.contains('script-label'))?box.previousElementSibling:box; return {scroll:lab||box, video:box?box.querySelector('video'):null}; } }
    var id=vtcId(p); var el=document.getElementById(id); return {scroll:el, video:el?el.querySelector('video'):null, id:id}; }'''
if 'function vtcResolve' not in t and anchor_hl in t: t=t.replace(anchor_hl,resolver,1); ch.append('vtcResolve')

# 2) ir_a_modulo usa vtcResolve
old_ir="var id=vtcId(p); if(id==='__top'){ try{window.__vtcDrive=Date.now();}catch(e){} window.scrollTo({top:0,behavior:'smooth'}); return 'En el inicio del curso'; } var el=document.getElementById(id); if(el){ el.scrollIntoView({behavior:'smooth',block:'start'}); vtcHL(el); return 'Navegado y resaltado'; } return 'modulo no encontrado';"
new_ir="var id=vtcId(p); if(id==='__top'){ try{window.__vtcDrive=Date.now();}catch(e){} window.scrollTo({top:0,behavior:'smooth'}); return 'En el inicio del curso'; } var r=vtcResolve(p); if(r.scroll){ r.scroll.scrollIntoView({behavior:'smooth',block:'start'}); vtcHL(r.scroll); return 'Navegado y resaltado'; } return 'modulo no encontrado';"
if old_ir in t: t=t.replace(old_ir,new_ir,1); ch.append('ir_a_modulo')

# 3) reproducir_video usa vtcResolve
old_rv="var el=document.getElementById(vtcId(p)); if(!el) return 'modulo no encontrado';\n        el.scrollIntoView({behavior:'smooth',block:'start'}); vtcHL(el);\n        var v=el.querySelector('video'); if(!v) return 'ese modulo no tiene video; continua con la explicacion';"
new_rv="var r=vtcResolve(p); if(!r.scroll) return 'modulo no encontrado';\n        r.scroll.scrollIntoView({behavior:'smooth',block:'start'}); vtcHL(r.scroll);\n        var v=r.video; if(!v) return 'ese modulo no tiene video; continua con la explicacion';"
if old_rv in t: t=t.replace(old_rv,new_rv,1); ch.append('reproducir_video')

open(p,'w',encoding='utf-8').write(t); print('cambios:',ch)