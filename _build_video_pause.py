# -*- coding: utf-8 -*-
p='index.html'; t=open(p,encoding='utf-8').read()
old='''        return await new Promise(function(res){
          var done=false;
          function fin(){ if(done)return; done=true; if(box) box.classList.remove('vtc-playing');
            try{conv&&conv.setMicMuted&&conv.setMicMuted(false);}catch(e){}
            try{conv&&conv.setVolume&&conv.setVolume({volume:1});}catch(e){}
            res('El video terminó. Continúa con la explicación.'); }
          v.addEventListener('ended',fin,{once:true});
          setTimeout(fin,420000);
        });'''
new='''        return await new Promise(function(res){
          var done=false, pauseT=null;
          function cleanup(){ if(box) box.classList.remove('vtc-playing'); try{conv&&conv.setMicMuted&&conv.setMicMuted(false);}catch(e){} try{conv&&conv.setVolume&&conv.setVolume({volume:1});}catch(e){} }
          function fin(msg){ if(done)return; done=true; clearTimeout(pauseT); cleanup(); res(msg); }
          v.addEventListener('ended',function(){ fin('El video terminó completo. Continúa con la explicación del módulo.'); },{once:true});
          v.addEventListener('pause',function(){ if(done||v.ended) return; clearTimeout(pauseT); pauseT=setTimeout(function(){ if(!done && v.paused && !v.ended){ var falta=Math.max(0,Math.round((v.duration||0)-(v.currentTime||0))); fin('(EL USUARIO PAUSÓ y NO terminó el video (faltan ~'+falta+'s). Pídele amablemente que lo termine de ver completo para continuar; cuando te confirme que ya, vuelve a reproducirlo con reproducir_video del mismo módulo.)'); } },7000); });
          v.addEventListener('play',function(){ clearTimeout(pauseT); });
          setTimeout(function(){ fin('El video llegó al tiempo máximo. Continúa.'); },600000);
        });'''
if old in t:
    t=t.replace(old,new,1); open(p,'w',encoding='utf-8').write(t); print('pausa de video manejada')
else: print('ancla no encontrada')