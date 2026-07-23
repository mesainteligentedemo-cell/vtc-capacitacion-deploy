# -*- coding: utf-8 -*-
p='index.html'; t=open(p,encoding='utf-8').read()
ch=[]

# 1) CSS de resaltado fuerte del modulo activo (inyectar antes del @media del widget)
css_anchor='@media(max-width:480px){#vw-panel{right:8px;bottom:8px;height:calc(100vh - 16px)}}'
css_new='''.vtc-hl{ outline:2px solid #c9aa75 !important; outline-offset:8px; border-radius:10px !important; scroll-margin-top:24px; animation:vtcpulse 1.8s ease-in-out infinite; }
  @keyframes vtcpulse{0%,100%{box-shadow:0 0 28px rgba(201,170,117,.30)}50%{box-shadow:0 0 64px rgba(201,170,117,.65)}}
  .lesson-video.vtc-playing video{ outline:3px solid #c9aa75; box-shadow:0 0 60px rgba(201,170,117,.7); }
  '''+css_anchor
if '.vtc-hl{' not in t:
    t=t.replace(css_anchor,css_new,1); ch.append('css')

# 2) Reemplazar el bloque clientTools por uno con highlight + reproducir_video
import re
m=re.search(r'const MAP=\{[^;]*\};\s*const clientTools=\{.*?\};', t, re.S)
if m:
    block='''const MAP={'f':'modulo-f','fundamentos':'modulo-f','proceso':'lvc','lvc':'lvc','club':'lvc','vtc19':'vtc19','vtc 19':'vtc19','19':'vtc19','bienvenida':'bienvenida','fin':'modulo-FIN','cierre-curso':'modulo-FIN'};
  function vtcId(p){ var m=String((p&&(p.modulo||p.module||p.id))||'').toLowerCase().trim().replace('módulo','').replace('modulo-','').replace('modulo','').trim(); return MAP[m]||('modulo-'+m); }
  function vtcHL(el){ try{document.querySelectorAll('.vtc-hl').forEach(function(e){e.classList.remove('vtc-hl');});}catch(e){} if(el) el.classList.add('vtc-hl'); }
  const clientTools={
    ir_a_modulo: async(p)=>{ try{ var el=document.getElementById(vtcId(p)); if(el){ el.scrollIntoView({behavior:'smooth',block:'start'}); vtcHL(el); return 'Navegado y resaltado'; } return 'modulo no encontrado'; }catch(e){return 'error';} },
    reproducir_video: async(p)=>{ try{
        var el=document.getElementById(vtcId(p)); if(!el) return 'modulo no encontrado';
        el.scrollIntoView({behavior:'smooth',block:'start'}); vtcHL(el);
        var box=el.querySelector('.lesson-video'); var v=el.querySelector('video'); if(!v) return 'ese modulo no tiene video';
        try{conv&&conv.setMicMuted&&conv.setMicMuted(true);}catch(e){}
        try{conv&&conv.setVolume&&conv.setVolume({volume:0});}catch(e){}
        setTimeout(function(){ v.scrollIntoView({behavior:'smooth',block:'center'}); },500);
        if(box) box.classList.add('vtc-playing');
        try{ await v.play(); }catch(e){}
        return await new Promise(function(res){
          var done=false;
          function fin(){ if(done)return; done=true; if(box) box.classList.remove('vtc-playing');
            try{conv&&conv.setMicMuted&&conv.setMicMuted(false);}catch(e){}
            try{conv&&conv.setVolume&&conv.setVolume({volume:1});}catch(e){}
            res('El video terminó. Continúa con la explicación.'); }
          v.addEventListener('ended',fin,{once:true});
          setTimeout(fin,420000);
        });
      }catch(e){ return 'error'; } }
  };'''
    t=t[:m.start()]+block+t[m.end():]; ch.append('clientTools')

open(p,'w',encoding='utf-8').write(t)
print('cambios:',ch,'| tiene reproducir_video:', 'reproducir_video' in t)