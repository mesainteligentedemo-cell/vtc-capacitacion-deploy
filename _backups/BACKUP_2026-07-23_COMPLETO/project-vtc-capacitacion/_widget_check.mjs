import { Conversation } from 'https://cdn.jsdelivr.net/npm/@elevenlabs/client/+esm';
  const AGENT='agent_9501k3vkt6svekjs6y0qe5xzcek1', SITE='https://vtc-capacitacion-deploy.vercel.app';
  const $=id=>document.getElementById(id);
  const launch=$('vw-launch'),panel=$('vw-panel'),gate=$('vw-gate'),chat=$('vw-chat'),msgs=$('vw-msgs'),statusEl=$('vw-status'),mic=$('vw-mic'),input=$('vw-in');
  let conv=null,connecting=false,muted=false,started=false; try{history.scrollRestoration='manual';}catch(e){} try{window.scrollTo(0,0);}catch(e){} window.addEventListener('load',function(){try{window.scrollTo(0,0);}catch(e){}});

  function clean(s){return String(s||'').replace(/<\/?[a-zA-ZÀ-ſ][^>]*>/g,'').replace(/\[[^\]\n]{1,40}\]/g,'').replace(/\*\*?([^*]+)\*\*?/g,'$1').replace(/[ \t]{2,}/g,' ').replace(/\s*\n\s*/g,'\n').trim();}
  function setStatus(h){statusEl.innerHTML=h;}
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
  function bubble(role,text){const tx=clean(text);if(!tx)return;const d=document.createElement('div');d.className='vw-b '+(role==='user'?'vw-me':'vw-ai');d.innerHTML='<div class="vw-who">'+(role==='user'?'Tú':'Victor')+'</div>'+esc(tx);msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;}
  function typing(on){let e=$('vw-typing');if(on){if(!e){e=document.createElement('div');e.id='vw-typing';e.className='vw-b vw-ai';e.innerHTML='<span class="vw-dots"><span></span><span></span><span></span></span>';msgs.appendChild(e);msgs.scrollTop=msgs.scrollHeight;}}else if(e)e.remove();}

  const MAP={'inicio':'__top','cero':'__top','desde cero':'__top','principio':'__top','header':'__top','curso':'__top','top':'__top','h1':'__top','arriba':'__top','indice':'indice','modulos':'indice','todos':'indice','f':'modulo-f','fundamentos':'modulo-f','proceso':'lvc','lvc':'lvc','club':'lvc','vtc19':'vtc19','vtc 19':'vtc19','19':'vtc19','bienvenida':'bienvenida','fin':'modulo-FIN','cierre-curso':'modulo-FIN'};
  function vtcId(p){ var m=String((p&&(p.modulo||p.module||p.id))||'').toLowerCase().trim().replace('módulo','').replace('modulo-','').replace('modulo','').trim(); return MAP[m]||('modulo-'+m); }
  function vtcMobMin(){ try{ if(window.innerWidth<700){ var pn=document.getElementById("vw-panel"); if(pn&&pn.classList.contains("vw-open")){ pn.classList.remove("vw-open"); var lc=document.getElementById("vw-launch"); if(lc) lc.style.display="flex"; } } }catch(e){} } function vtcHL(el){ try{window.__vtcDrive=Date.now();}catch(e){} try{document.querySelectorAll(".vtc-hl").forEach(function(e){e.classList.remove("vtc-hl");});}catch(e){} if(el) el.classList.add("vtc-hl"); vtcMobMin(); }
  function vtcResolve(p){ var raw=String((p&&(p.modulo||p.module||p.id))||'').toLowerCase().replace(/\s+/g,' ').trim();
    var pm=raw.match(/(?:pitch|paso|step)\s*-?\s*([0-9]{1,2})/);
    if(pm){ var nn=('0'+pm[1]).slice(-2); var src=document.querySelector('#vtc19 source[src*="modulo-'+nn+'.mp4"]'); if(src){ var box=src.closest('.lesson-video'); var lab=(box&&box.previousElementSibling&&box.previousElementSibling.classList&&box.previousElementSibling.classList.contains('script-label'))?box.previousElementSibling:box; return {scroll:lab||box, video:box?box.querySelector('video'):null}; } }
    var id=vtcId(p); var el=document.getElementById(id); return {scroll:el, video:el?el.querySelector('video'):null, id:id}; }
  const clientTools={
    ir_a_modulo: async(p)=>{ try{ var id=vtcId(p); if(id==='__top'){ try{window.__vtcDrive=Date.now();}catch(e){} window.scrollTo({top:0,behavior:'smooth'}); return 'En el inicio del curso'; } var r=vtcResolve(p); if(r.scroll){ r.scroll.scrollIntoView({behavior:'smooth',block:'start'}); vtcHL(r.scroll); return 'Navegado y resaltado'; } return 'modulo no encontrado'; }catch(e){return 'error';} },
    reproducir_video: async(p)=>{ try{
        await new Promise(function(r){setTimeout(r,900);});
        await new Promise(function(r){var n=0,iv=setInterval(function(){n++; if(!window.__vtcSpeaking||n>45){clearInterval(iv);r();}},300);});
        var r=vtcResolve(p); if(!r.scroll) return 'modulo no encontrado';
        r.scroll.scrollIntoView({behavior:'smooth',block:'start'}); vtcHL(r.scroll);
        var v=r.video; if(!v) return 'ese modulo no tiene video; continua con la explicacion';
        try{ setTimeout(function(){ try{ var rc=v.getBoundingClientRect(); var vh=window.innerHeight||800; if(rc.bottom>vh-8){ window.scrollBy({top:Math.ceil(rc.bottom-vh+24),behavior:'smooth'}); } else if(rc.top<70){ window.scrollBy({top:Math.ceil(rc.top-84),behavior:'smooth'}); } }catch(e){} },680); }catch(e){}
        return 'Listo: el usuario ya tiene en pantalla el modulo con su titulo, contenido y video. Pidele que le de CLICK al video para reproducirlo y que te avise (por ejemplo: listo o ya termine) cuando lo haya visto completo. NO lo reproduzcas tu; espera su aviso y entonces continua.';
      }catch(e){ return 'error'; } },
    ir_al_quiz: async(p)=>{ try{ var sec=document.getElementById(vtcId(p)); var q=sec?sec.querySelector('.quiz'):null; if(!q) return 'ese modulo no tiene quiz; continua'; try{window.__vtcDrive=Date.now();}catch(e){} q.scrollIntoView({behavior:'smooth',block:'start'}); vtcHL(q); var out=[]; q.querySelectorAll('.q').forEach(function(qq,i){ var qt=(((qq.querySelector('.q-text')||{}).innerText)||'').replace(/^\s*[0-9]+\.?\s*/,'').trim(); var ops=[]; qq.querySelectorAll('.q-opt').forEach(function(o){ops.push(((o.innerText)||'').trim());}); out.push('P'+(i+1)+': '+qt+' Opciones: '+ops.join(' / ')); }); return 'Quiz del modulo. LEE cada pregunta con sus opciones, UNA a la vez, y espera a que el usuario conteste (recibiras [QUIZ] con correcto o incorrecto; la UI baja sola a la siguiente). Da feedback por pregunta. ' + out.join('  ||  '); }catch(e){ return 'error'; } },
    resaltar_texto: async(p)=>{ try{
        var q=String((p&&(p.texto||p.text||p.frase))||'').toLowerCase().replace(/\s+/g,' ').trim(); if(q.length<3) return 'sin texto';
        var sels='p,li,h1,h2,h3,h4,blockquote,figcaption,td,.script-note,.quiz-title,.q-text'; var cands=[];
        document.querySelectorAll('[id^="modulo-"],#lvc,#vtc19,#bienvenida,#indice').forEach(function(s){ s.querySelectorAll(sels).forEach(function(el){ var tx=(el.textContent||'').toLowerCase().replace(/\s+/g,' '); if(tx.indexOf(q)>=0 && tx.length<700) cands.push(el); }); });
        cands.sort(function(a,b){return (a.textContent||'').length-(b.textContent||'').length;});
        var el=cands[0]; if(!el) return 'no encontre ese texto en pantalla';
        try{window.__vtcDrive=Date.now();}catch(e){}
        document.querySelectorAll('.vtc-mark').forEach(function(e){e.classList.remove('vtc-mark');});
        el.classList.add('vtc-mark'); el.scrollIntoView({behavior:'smooth',block:'center'}); vtcMobMin(); try{ if(el.children.length===0 && (el.textContent||'').trim().length>1 && !el.__vw){ el.__vw=1; var ws=el.textContent.split(/(\s+)/); el.innerHTML=ws.map(function(w){return /\S/.test(w)?('<span class="vtc-word">'+w.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</span>'):w;}).join(''); } var sp=el.querySelectorAll('.vtc-word'); if(sp.length){ sp.forEach(function(s){s.classList.remove('on');}); if(window.__vwT)clearInterval(window.__vwT); var k=0; window.__vwT=setInterval(function(){ if(k>0&&sp[k-1])sp[k-1].classList.remove('on'); if(k<sp.length){sp[k].classList.add('on');k++;}else{clearInterval(window.__vwT);} },230); } }catch(e){}
        return 'resaltado';
      }catch(e){ return 'error'; } }
  };

  async function connect(ctx){
    if(conv||connecting)return; connecting=true; setStatus('<b>Conectando…</b>');
    try{
      await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:1}});
      conv=await Conversation.startSession({
        agentId:AGENT, connectionType:'webrtc',
        dynamicVariables:{ user_name:ctx.name, employee_number:ctx.emp, departamento:ctx.dep||'', historial_usuario:ctx.hist||'' },
        overrides:{ agent:{ firstMessage:ctx.firstMessage } },
        clientTools,
        onConnect:()=>{setStatus('<b>En línea</b>');mic.classList.add('vw-live');launch.classList.add('vw-active');},
        onDisconnect:()=>{setStatus('Sesión terminada');mic.classList.remove('vw-live');launch.classList.remove('vw-active');conv=null;started=false;},
        onError:(e)=>{setStatus('Error de conexión');console.error(e);},
        onModeChange:(m)=>{const md=(m&&m.mode)||m;window.__vtcSpeaking=(md==='speaking');if(md==='speaking'){typing(false);setStatus('<b>Victor hablando…</b>');}else setStatus('<b>Escuchando…</b>');},
        onMessage:(m)=>{const s=m.source||m.role,txt=m.message||m.text||'';if(s==='ai'||s==='agent'){typing(false);bubble('ai',txt);}else bubble('user',txt);},
      });
    }catch(e){setStatus('No se pudo conectar');console.error(e);}
    connecting=false;
  }

  async function begin(){
    const name=$('vw-name').value.trim(), emp=$('vw-emp').value.trim(), dep=$('vw-dep').value.trim();
    const err=$('vw-err');
    if(!name){err.textContent='Escribe tu nombre.';return;}
    if(!emp){err.textContent='Escribe tu número de empleado.';return;}
    err.textContent=''; try{localStorage.setItem('vtc_user',JSON.stringify({name:name,emp:emp,dep:dep}));}catch(e){} try{ var _bv=document.querySelector('#bienvenida video'); if(_bv){ _bv.muted=true; var _pp=_bv.play(); if(_pp&&_pp.then) _pp.then(function(){ _bv.pause(); try{_bv.currentTime=0;}catch(e){} _bv.muted=false; }).catch(function(){ _bv.muted=false; }); } }catch(e){} const cta=$('vw-cta'); cta.disabled=true; cta.textContent='Revisando acceso…';
    let hist='';
    try{ const h=await (await fetch(SITE+'/api/history?emp='+encodeURIComponent(emp))).json(); if(h&&h.found) hist=h.texto||''; }catch(e){}
    const firstMessage = hist
      ? '¡Qué gusto verte de nuevo, '+name+'! Ya revisé tu progreso. '+hist+'. ¿Seguimos desde ahí o quieres trabajar algo nuevo?'
      : '¡Bienvenido, '+name+'! Soy Victor, tu entrenador personal, y hoy vamos a hacerte mejor. ¿Quieres repasar un módulo o entramos directo a un roleplay?';
    gate.style.display='none'; chat.style.display='flex'; started=true; setStatus('<b>Preparando tu sesión…</b>'); await new Promise(function(r){setTimeout(r,2000);});
    await connect({name,emp,dep,hist,firstMessage});
    try{ var _q={},_v={}; try{_q=JSON.parse(localStorage.getItem('vtc_quiz_v1')||'{}');}catch(e){} try{_v=JSON.parse(localStorage.getItem('vtc_video_v1')||'{}');}catch(e){}
      var _msg='[PROGRESO] Quizzes con avance en: '+(Object.keys(_q).join(', ')||'ninguno')+'. Videos vistos: '+Object.keys(_v).length+'.';
      if(conv && conv.sendContextualUpdate) conv.sendContextualUpdate(_msg);
    }catch(e){}
    cta.disabled=false; cta.textContent='Comenzar capacitación';
  }

  function openPanel(){ panel.classList.add('vw-open'); launch.style.display='none'; if(!started){gate.style.display='flex';chat.style.display='none'; try{var u=JSON.parse(localStorage.getItem('vtc_user')||'null'); if(u){ $('vw-name').value=u.name||''; $('vw-emp').value=u.emp||''; if(u.dep){$('vw-dep').value=u.dep;} var c=$('vw-cta'); if(c) c.textContent='Acceder'; var gp=document.querySelector('#vw-gate p'); if(gp&&u.name) gp.textContent='Bienvenido de nuevo, '+u.name+'. Toca Acceder para continuar tu capacitación.'; } }catch(e){} } }
  function minimize(){ panel.classList.remove('vw-open'); launch.style.display='flex'; } // NO corta la sesión
  function endAll(){ try{conv&&conv.endSession();}catch(e){} conv=null;started=false; mic.classList.remove('vw-live');launch.classList.remove('vw-active'); msgs.innerHTML=''; gate.style.display='flex';chat.style.display='none'; $('vw-cta').disabled=false;$('vw-cta').textContent='Comenzar capacitación'; panel.classList.remove('vw-open'); launch.style.display='flex'; }

  launch.onclick=openPanel; $('vw-min').onclick=minimize; $('vw-close').onclick=endAll; $('vw-cta').onclick=begin;
  $('vw-emp').addEventListener('keydown',e=>{if(e.key==='Enter')begin();});
  mic.onclick=()=>{ if(!conv)return; try{muted=!muted;conv.setMicMuted&&conv.setMicMuted(muted);mic.classList.toggle('vw-live',!muted);setStatus(muted?'Micrófono en pausa':'<b>En línea</b>');}catch(e){} };
  function send(){const t=input.value.trim();if(!t||!conv)return;input.value='';bubble('user',t);typing(true);try{conv.sendUserMessage?conv.sendUserMessage(t):(conv.sendText&&conv.sendText(t));}catch(e){console.error(e);}}
  $('vw-snd').onclick=send;
  function _vAny(){ return [].slice.call(document.querySelectorAll('video')).some(function(v){return !v.paused && !v.ended;}); }
  function _vMute(){ try{conv&&conv.setMicMuted&&conv.setMicMuted(true);}catch(e){} try{conv&&conv.setVolume&&conv.setVolume({volume:0});}catch(e){} try{ if(!window._vKeep) window._vKeep=setInterval(function(){ try{ if(conv&&conv.sendUserActivity) conv.sendUserActivity(); }catch(e){} },12000); }catch(e){} }
  function _vUn(){ try{conv&&conv.setMicMuted&&conv.setMicMuted(false);}catch(e){} try{conv&&conv.setVolume&&conv.setVolume({volume:1});}catch(e){} try{ if(window._vKeep){clearInterval(window._vKeep); window._vKeep=null;} }catch(e){} }
  document.addEventListener('play',function(e){ if(e.target&&e.target.tagName==='VIDEO'){ try{var _s=e.target.closest('[id^="modulo-"],#bienvenida,#lvc,#vtc19'); if(_s&&window.__vtcSeen&&window.__vtcSeen[_s.id]){ e.target.pause(); return; }}catch(x){} try{var b=e.target.closest('.lesson-video'); if(b) b.classList.add('vtc-playing');}catch(x){} if(conv) _vMute(); } },true);
  document.addEventListener('pause',function(e){ if(e.target&&e.target.tagName==='VIDEO'){ try{var b=e.target.closest('.lesson-video'); if(b&&e.target.ended) b.classList.remove('vtc-playing');}catch(x){} if(conv) setTimeout(function(){ if(!_vAny()) _vUn(); },300); } },true);
  document.addEventListener('ended',function(e){ if(e.target&&e.target.tagName==='VIDEO'){ try{var b=e.target.closest('.lesson-video'); if(b) b.classList.remove('vtc-playing');}catch(x){} if(conv) setTimeout(function(){ if(!_vAny()) _vUn(); },300); } },true); input.addEventListener('keydown',e=>{if(e.key==='Enter')send();});
  document.addEventListener('click',function(e){
    var o=e.target.closest&&e.target.closest('.q-opt'); if(!o||!conv) return;
    setTimeout(function(){ try{
      var qEl=o.closest('.q'); if(!qEl) return;
      var qText=((qEl.querySelector('.q-text')||{}).innerText||'').replace(/^\s*\d+\.?\s*/,'').trim();
      var ans=(o.innerText||'').trim();
      var ok=qEl.classList.contains('ok');
      var sec=o.closest('[id^="modulo-"],#lvc,#vtc19'); var mod=sec?sec.id:'';
      if(conv.sendContextualUpdate) conv.sendContextualUpdate('[QUIZ] '+(mod?('Modulo '+mod+': '):'')+'el asesor respondio "'+ans+'" a la pregunta "'+qText+'" — '+(ok?'CORRECTO':'INCORRECTO')+'.');
    }catch(_){} },70);
  },false);
  // --- Conciencia de navegacion: Victor sabe en que parte del sitio esta el usuario ---
  var _vLast='', _vT=null, _vOffered={};
  function _vCur(){ var secs=document.querySelectorAll('[id^="modulo-"],#lvc,#vtc19,#bienvenida'); var mid=window.innerHeight*0.4,best=null,bd=1e9; secs.forEach(function(s){var r=s.getBoundingClientRect(); if(r.bottom>60&&r.top<window.innerHeight){var c=r.top+Math.min(r.height,window.innerHeight)/2; var d=Math.abs(c-mid); if(d<bd){bd=d;best=s;}}}); return best; }
  window.addEventListener('scroll',function(){ if(!conv) return; clearTimeout(_vT); _vT=setTimeout(function(){
      var agentDrive = window.__vtcDrive && (Date.now()-window.__vtcDrive < 6000);
      var s=_vCur(); if(!s||s.id===_vLast) return; _vLast=s.id;
      if(agentDrive) return; // fue scroll del propio Victor, no del usuario
      try{ conv.sendContextualUpdate && conv.sendContextualUpdate('[NAV] El usuario esta viendo la seccion '+s.id+'.'); }catch(e){}
      if(!window.__vtcSpeaking && !_vOffered[s.id]){ _vOffered[s.id]=1;
        setTimeout(function(){ var c=_vCur(); if(!window.__vtcSpeaking && c && c.id===s.id){ try{ conv.sendUserMessage && conv.sendUserMessage('(NAV: el usuario se detuvo leyendo la seccion '+s.id+'. Ofrecele ayuda breve y natural con esa parte, en una sola frase.)'); }catch(e){} } },4500);
      }
    },1100); },{passive:true});
  // --- Detecta quiz COMPLETO para auto-continuar el curso guiado ---
  document.addEventListener('click',function(e){
    var o=e.target.closest&&e.target.closest('.q-opt'); if(!o||!conv) return;
    setTimeout(function(){ try{
      var quizEl=o.closest('.quiz'); if(!quizEl) return;
      var _tq=o.closest('.q'); if(_tq){ var _all=[].slice.call(quizEl.querySelectorAll('.q')); var _ix=_all.indexOf(_tq); for(var _i=_ix+1;_i<_all.length;_i++){ if(!_all[_i].classList.contains('answered')){ try{window.__vtcDrive=Date.now();}catch(e){} _all[_i].scrollIntoView({behavior:'smooth',block:'center'}); break; } } }
      var qs=quizEl.querySelectorAll('.q'); var an=quizEl.querySelectorAll('.q.answered');
      if(qs.length && an.length>=qs.length && !quizEl.__vdone){
        quizEl.__vdone=1;
        var sc=((quizEl.querySelector('.scnum')||{}).textContent||'?');
        var sec=o.closest('[id^="modulo-"],#lvc,#vtc19'); var mod=sec?sec.id:'';
        if(conv.sendUserMessage) conv.sendUserMessage('(QUIZ COMPLETO'+(mod?(' en '+mod):'')+': '+sc+' de '+qs.length+' correctas. Agradece, comenta breve el resultado y ANUNCIA en voz el video del siguiente modulo (di algo como: continuamos con el video de...) y SOLO despues reproducelo.)');
      }
    }catch(_){} },120);
  },false);
