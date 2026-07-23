# -*- coding: utf-8 -*-
p='index.html'; t=open(p,encoding='utf-8').read()
i=t.find('reproducir_video: async(p)=>{')
j=t.find('ir_al_quiz: async(p)=>{')
assert i>=0 and j>i, ('no encontrado', i, j)
NEW='''reproducir_video: async(p)=>{ try{
        await new Promise(function(r){setTimeout(r,900);});
        await new Promise(function(r){var n=0,iv=setInterval(function(){n++; if(!window.__vtcSpeaking||n>45){clearInterval(iv);r();}},300);});
        var el=document.getElementById(vtcId(p)); if(!el) return 'modulo no encontrado';
        el.scrollIntoView({behavior:'smooth',block:'start'}); vtcHL(el);
        var box=el.querySelector('.lesson-video'); var v=el.querySelector('video'); if(!v) return 'ese modulo no tiene video';
        var _vid=vtcId(p); window.__vtcSeen=window.__vtcSeen||{}; if(window.__vtcSeen[_vid]){ return 'Ese video YA se reprodujo en esta sesión. NO lo repitas; continúa directo con la explicación o el siguiente paso.'; }
        setTimeout(function(){ v.scrollIntoView({behavior:'smooth',block:'center'}); },500);
        if(box) box.classList.add('vtc-playing');
        try{ v.playsInline=true; v.setAttribute('playsinline',''); v.setAttribute('webkit-playsinline',''); }catch(e){}
        try{ v.muted=false; v.volume=1.0; }catch(e){}
        try{ await v.play(); }catch(e){}
        await new Promise(function(r){setTimeout(r,450);});
        if(v.paused){ if(box) box.classList.remove('vtc-playing'); return '(En este dispositivo el navegador no dejó arrancar el video solo. Pídele al usuario que TOQUE el video para reproducirlo; cuando se acabe la narración, sigues.)'; }
        try{ var rf=v.requestFullscreen||v.webkitRequestFullscreen||v.webkitEnterFullscreen||v.mozRequestFullScreen||v.msRequestFullscreen; if(rf) rf.call(v); }catch(e){}
        var VOEND={'modulo-wel':68.2,'modulo-m0':71.2,'modulo-m1':81.3,'modulo-m2':66.6,'modulo-m3':78.1,'modulo-m4':79.1,'modulo-m5':89.4,'modulo-m6':79.5,'modulo-m7':69.8,'modulo-m8':61.9,'modulo-m9':78.5,'modulo-m10':71.8,'modulo-m11':72.3,'modulo-m12':68.8,'modulo-pv':66.3,'modulo-fin':58.6};
        var _src=(v.currentSrc||((v.querySelector('source')||{}).src)||''); var _fn=_src.split('/').pop().split('?')[0].toLowerCase().replace('.mp4',''); var _voEnd=VOEND[_fn]||0;
        return await new Promise(function(res){
          var done=false, pauseT=null;
          function exitFs(){ try{ if(document.fullscreenElement||document.webkitFullscreenElement){ var xf=document.exitFullscreen||document.webkitExitFullscreen||document.mozCancelFullScreen||document.msExitFullscreen; if(xf) xf.call(document); } }catch(e){} }
          function reactivar(){ try{conv&&conv.setMicMuted&&conv.setMicMuted(false);}catch(e){} try{conv&&conv.setVolume&&conv.setVolume({volume:1});}catch(e){} try{ if(window._vKeep){clearInterval(window._vKeep);window._vKeep=null;} }catch(e){} }
          function fin(msg){ if(done)return; done=true; clearTimeout(pauseT); if(box) box.classList.remove('vtc-playing'); res(msg); }
          function finVO(){ if(done)return; try{window.__vtcSeen=window.__vtcSeen||{}; window.__vtcSeen[_vid]=true;}catch(e){} try{v.muted=true;}catch(e){} reactivar(); fin('Terminó la NARRACIÓN del video (el cierre visual sigue solo, sin voz). Empieza a explicar YA, sin esperar.'); }
          if(_voEnd>0){ v.addEventListener('timeupdate',function(){ if(!done && v.currentTime>=(_voEnd+1)) finVO(); }); }
          v.addEventListener('ended',function(){ try{window.__vtcSeen=window.__vtcSeen||{}; window.__vtcSeen[_vid]=true;}catch(e){} exitFs(); reactivar(); fin('El video terminó completo. Continúa con la explicación del módulo.'); },{once:true});
          v.addEventListener('pause',function(){ if(done||v.ended) return; clearTimeout(pauseT); pauseT=setTimeout(function(){ if(!done&&v.paused&&!v.ended){ var falta=Math.max(0,Math.round((v.duration||0)-(v.currentTime||0))); fin('(EL USUARIO PAUSÓ y NO terminó el video (faltan ~'+falta+'s). Pídele amablemente que lo termine; cuando confirme, vuelve a reproducirlo.)'); } },7000); });
          v.addEventListener('play',function(){ clearTimeout(pauseT); });
          setTimeout(function(){ exitFs(); reactivar(); fin('El video llegó al tiempo máximo. Continúa.'); },600000);
        });
      }catch(e){ return 'error'; } },
    '''
t=t[:i]+NEW+t[j:]
open(p,'w',encoding='utf-8').write(t)
print('reproducir_video reescrito con VO-end')