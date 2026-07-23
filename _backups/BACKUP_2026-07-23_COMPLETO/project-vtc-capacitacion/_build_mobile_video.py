# -*- coding: utf-8 -*-
p='index.html'; t=open(p,encoding='utf-8').read(); ch=[]

# 1) playsinline + webkit-playsinline en todos los videos (inline en iOS)
if 'webkit-playsinline' not in t:
    n=t.count('controls preload="none" playsinline ')
    t=t.replace('controls preload="none" playsinline ','controls preload="none" playsinline webkit-playsinline ')
    ch.append('playsinline x'+str(n))

# 2) Unlock de media en el gesto de Acceder (begin)
a_unlock="err.textContent=''; try{localStorage.setItem('vtc_user',JSON.stringify({name:name,emp:emp,dep:dep}));}catch(e){}"
n_unlock=a_unlock+" try{ var _bv=document.querySelector('#bienvenida video'); if(_bv){ _bv.muted=true; var _pp=_bv.play(); if(_pp&&_pp.then) _pp.then(function(){ _bv.pause(); try{_bv.currentTime=0;}catch(e){} _bv.muted=false; }).catch(function(){ _bv.muted=false; }); } }catch(e){}"
if '_bv=document.querySelector' not in t and a_unlock in t: t=t.replace(a_unlock,n_unlock,1); ch.append('unlock')

# 3) Reescribir reproducir_video completo (mobile-aware: detecta bloqueo, fullscreen iOS/Android, sin mute manual -> lo hace la guarda global)
i=t.find('reproducir_video: async(p)=>{')
j=t.find('ir_al_quiz: async(p)=>{')
if i>=0 and j>i:
    NEW='''reproducir_video: async(p)=>{ try{
        await new Promise(function(r){setTimeout(r,900);});
        await new Promise(function(r){var n=0,iv=setInterval(function(){n++; if(!window.__vtcSpeaking||n>45){clearInterval(iv);r();}},300);});
        var el=document.getElementById(vtcId(p)); if(!el) return 'modulo no encontrado';
        el.scrollIntoView({behavior:'smooth',block:'start'}); vtcHL(el);
        var box=el.querySelector('.lesson-video'); var v=el.querySelector('video'); if(!v) return 'ese modulo no tiene video';
        setTimeout(function(){ v.scrollIntoView({behavior:'smooth',block:'center'}); },500);
        if(box) box.classList.add('vtc-playing');
        try{ v.playsInline=true; v.setAttribute('playsinline',''); v.setAttribute('webkit-playsinline',''); }catch(e){}
        try{ v.muted=false; v.volume=1.0; }catch(e){}
        try{ await v.play(); }catch(e){}
        await new Promise(function(r){setTimeout(r,450);});
        if(v.paused){ if(box) box.classList.remove('vtc-playing'); return '(En este dispositivo el navegador no dejó arrancar el video solo. Pídele al usuario que TOQUE el video para reproducirlo; cuando se acabe, que diga "continúa" y sigues.)'; }
        try{ var rf=v.requestFullscreen||v.webkitRequestFullscreen||v.webkitEnterFullscreen||v.mozRequestFullScreen||v.msRequestFullscreen; if(rf) rf.call(v); }catch(e){}
        return await new Promise(function(res){
          var done=false, pauseT=null;
          function exitFs(){ try{ if(document.fullscreenElement||document.webkitFullscreenElement){ var xf=document.exitFullscreen||document.webkitExitFullscreen||document.mozCancelFullScreen||document.msExitFullscreen; if(xf) xf.call(document); } }catch(e){} }
          function fin(msg){ if(done)return; done=true; clearTimeout(pauseT); if(box) box.classList.remove('vtc-playing'); exitFs(); res(msg); }
          v.addEventListener('ended',function(){ fin('El video terminó completo. Continúa con la explicación del módulo.'); },{once:true});
          v.addEventListener('pause',function(){ if(done||v.ended) return; clearTimeout(pauseT); pauseT=setTimeout(function(){ if(!done&&v.paused&&!v.ended){ var falta=Math.max(0,Math.round((v.duration||0)-(v.currentTime||0))); fin('(EL USUARIO PAUSÓ y NO terminó el video (faltan ~'+falta+'s). Pídele amablemente que lo termine; cuando confirme, vuelve a reproducirlo.)'); } },7000); });
          v.addEventListener('play',function(){ clearTimeout(pauseT); });
          setTimeout(function(){ fin('El video llegó al tiempo máximo. Continúa.'); },600000);
        });
      }catch(e){ return 'error'; } },
    '''
    t=t[:i]+NEW+t[j:]; ch.append('reproducir_video-rewrite')

open(p,'w',encoding='utf-8').write(t)
print('cambios:',ch)