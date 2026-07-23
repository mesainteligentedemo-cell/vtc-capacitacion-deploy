# -*- coding: utf-8 -*-
# Reemplaza el bloque del widget en index.html por la version con popup de acceso + minimizar.
p='index.html'
t=open(p,encoding='utf-8').read()
START='<!-- ░░ VÍCTOR · Chat'
END='<!-- Scroll-UX:'
i=t.find(START); j=t.find(END)
assert i>=0 and j>i, ('marcadores no encontrados', i, j)

W = r'''<!-- VICTOR · Chat de capacitacion VTC — UI propia -->
<style>
  #vw-launch{position:fixed;right:24px;bottom:24px;width:64px;height:64px;border-radius:50%;background:#0d0d0f;border:1px solid #b89a6a;box-shadow:0 8px 30px rgba(0,0,0,.5);cursor:pointer;z-index:99998;display:flex;align-items:center;justify-content:center;transition:transform .2s}
  #vw-launch:hover{transform:scale(1.06)} #vw-launch img{width:34px;height:34px;border-radius:50%}
  #vw-launch .vw-pulse{position:absolute;inset:-1px;border-radius:50%;border:1px solid #b89a6a;animation:vwp 2.4s infinite ease-out;opacity:0}
  #vw-launch.vw-active .vw-pulse{animation:vwp 1.4s infinite ease-out}
  @keyframes vwp{0%{transform:scale(1);opacity:.6}100%{transform:scale(1.5);opacity:0}}
  #vw-panel{position:fixed;right:24px;bottom:24px;width:390px;max-width:calc(100vw - 32px);height:620px;max-height:calc(100vh - 48px);background:#0c0c0e;border:1px solid #23211c;border-radius:20px;box-shadow:0 24px 70px rgba(0,0,0,.65);z-index:99999;display:none;flex-direction:column;overflow:hidden;font-family:'Helvetica Neue',Arial,sans-serif}
  #vw-panel.vw-open{display:flex}
  .vw-head{display:flex;align-items:center;gap:12px;padding:16px 16px;border-bottom:1px solid #1c1b17;background:linear-gradient(180deg,#131210,#0c0c0e)}
  .vw-head img{width:38px;height:38px;border-radius:50%;border:1px solid #b89a6a}
  .vw-head .vw-t{flex:1;min-width:0}
  .vw-head .vw-name{color:#f4f1ea;font-size:15px;font-weight:600;letter-spacing:.3px}
  .vw-head .vw-st{color:#8a8a92;font-size:11px;letter-spacing:.4px;margin-top:2px}
  .vw-head .vw-st b{color:#b89a6a;font-weight:600}
  .vw-ico{color:#6a6a72;cursor:pointer;font-size:20px;line-height:1;padding:2px 6px;background:none;border:none}
  .vw-ico:hover{color:#cfcfd6}
  /* gate / popup de acceso */
  #vw-gate{flex:1;display:flex;flex-direction:column;justify-content:center;padding:30px 26px;gap:14px}
  #vw-gate h3{color:#f4f1ea;font-family:Georgia,serif;font-size:21px;margin:0;font-weight:400}
  #vw-gate p{color:#9a9aa2;font-size:13px;line-height:1.5;margin:0 0 6px}
  .vw-f label{display:block;color:#7c7c84;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 5px}
  .vw-f input,.vw-f select{width:100%;box-sizing:border-box;background:#121113;border:1px solid #2a2620;border-radius:10px;padding:12px 14px;color:#eae6df;font-size:14px;outline:none;font-family:inherit}
  .vw-f input:focus,.vw-f select:focus{border-color:#b89a6a}
  .vw-f{margin-bottom:12px}
  #vw-cta{width:100%;background:#b89a6a;color:#0a0a0c;border:none;border-radius:12px;padding:14px;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;cursor:pointer;font-family:inherit;transition:.2s}
  #vw-cta:hover{background:#cdb28c} #vw-cta:disabled{opacity:.6;cursor:default}
  #vw-gate .vw-err{color:#d98a6a;font-size:12px;min-height:14px}
  /* chat */
  #vw-chat{flex:1;display:none;flex-direction:column;min-height:0}
  #vw-msgs{flex:1;overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:12px}
  #vw-msgs::-webkit-scrollbar{width:6px}#vw-msgs::-webkit-scrollbar-thumb{background:#23211c;border-radius:3px}
  .vw-b{max-width:84%;padding:11px 14px;border-radius:15px;font-size:14px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word}
  .vw-ai{align-self:flex-start;background:#15140f;border:1px solid #2a2620;color:#e6e2d8;border-bottom-left-radius:5px}
  .vw-me{align-self:flex-end;background:#1a1812;border:1px solid #3a3326;color:#f1ede3;border-bottom-right-radius:5px}
  .vw-b .vw-who{font-size:9px;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;margin-bottom:5px;opacity:.85}
  .vw-ai .vw-who{color:#b89a6a}.vw-me .vw-who{color:#c9b48a}
  .vw-foot{padding:14px;border-top:1px solid #1c1b17;display:flex;align-items:center;gap:10px;background:#0a0a0c}
  #vw-mic{width:46px;height:46px;border-radius:50%;flex:none;border:1px solid #2a2620;background:#15140f;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.2s}
  #vw-mic svg{width:20px;height:20px;fill:#b89a6a} #vw-mic.vw-live{background:#b89a6a;border-color:#b89a6a;box-shadow:0 0 0 4px rgba(184,154,106,.18)} #vw-mic.vw-live svg{fill:#0a0a0c}
  #vw-in{flex:1;background:#121113;border:1px solid #23211c;border-radius:22px;padding:12px 16px;color:#eae6df;font-size:14px;outline:none;font-family:inherit}
  #vw-in::placeholder{color:#5a5a62}
  #vw-snd{background:none;border:none;color:#b89a6a;font-size:20px;cursor:pointer;padding:6px}
  .vw-dots span{display:inline-block;width:5px;height:5px;border-radius:50%;background:#b89a6a;margin:0 2px;animation:vwd 1.2s infinite}
  .vw-dots span:nth-child(2){animation-delay:.2s}.vw-dots span:nth-child(3){animation-delay:.4s}
  @keyframes vwd{0%,60%,100%{opacity:.25}30%{opacity:1}}
  @media(max-width:480px){#vw-panel{right:8px;bottom:8px;height:calc(100vh - 16px)}}
</style>

<div id="vw-launch" title="Habla con Victor"><span class="vw-pulse"></span><img src="/victor-avatar.png" alt="Victor"></div>

<div id="vw-panel">
  <div class="vw-head">
    <img src="/victor-avatar.png" alt="Victor">
    <div class="vw-t"><div class="vw-name">Victor</div><div class="vw-st" id="vw-status">Tu entrenador personal · VTC</div></div>
    <button class="vw-ico" id="vw-min" title="Minimizar (sigue activo)">&#8211;</button>
    <button class="vw-ico" id="vw-close" title="Terminar">&times;</button>
  </div>

  <div id="vw-gate">
    <h3>Acceso a tu entrenamiento</h3>
    <p>Identifícate para que Victor revise tu progreso y continúe donde te quedaste.</p>
    <div class="vw-f"><label>Nombre completo</label><input id="vw-name" type="text" placeholder="Tu nombre" autocomplete="name"></div>
    <div class="vw-f"><label>Número de empleado</label><input id="vw-emp" type="text" placeholder="Ej. 12345" inputmode="numeric" autocomplete="off"></div>
    <div class="vw-f"><label>Departamento</label>
      <select id="vw-dep">
        <option value="">Selecciona…</option>
        <option>OPC</option><option>Línea</option><option>Front to Middle</option><option>Front to Back</option>
        <option>Selfgen</option><option>Cierre</option><option>Gerencia</option><option>Dirección</option><option>Otro</option>
      </select>
    </div>
    <div class="vw-err" id="vw-err"></div>
    <button id="vw-cta">Comenzar capacitación</button>
  </div>

  <div id="vw-chat">
    <div id="vw-msgs"></div>
    <div class="vw-foot">
      <button id="vw-mic" title="Hablar"><svg viewBox="0 0 24 24"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"/></svg></button>
      <input id="vw-in" type="text" placeholder="Escribe o toca el micrófono…" autocomplete="off">
      <button id="vw-snd" title="Enviar">&#10148;</button>
    </div>
  </div>
</div>

<script type="module">
  import { Conversation } from 'https://cdn.jsdelivr.net/npm/@elevenlabs/client/+esm';
  const AGENT='agent_9501k3vkt6svekjs6y0qe5xzcek1', SITE='https://vtc-capacitacion-deploy.vercel.app';
  const $=id=>document.getElementById(id);
  const launch=$('vw-launch'),panel=$('vw-panel'),gate=$('vw-gate'),chat=$('vw-chat'),msgs=$('vw-msgs'),statusEl=$('vw-status'),mic=$('vw-mic'),input=$('vw-in');
  let conv=null,connecting=false,muted=false,started=false;

  function clean(s){return String(s||'').replace(/<\/?[a-zA-ZÀ-ſ][^>]*>/g,'').replace(/\[[^\]\n]{1,40}\]/g,'').replace(/\*\*?([^*]+)\*\*?/g,'$1').replace(/[ \t]{2,}/g,' ').replace(/\s*\n\s*/g,'\n').trim();}
  function setStatus(h){statusEl.innerHTML=h;}
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
  function bubble(role,text){const tx=clean(text);if(!tx)return;const d=document.createElement('div');d.className='vw-b '+(role==='user'?'vw-me':'vw-ai');d.innerHTML='<div class="vw-who">'+(role==='user'?'Tú':'Victor')+'</div>'+esc(tx);msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;}
  function typing(on){let e=$('vw-typing');if(on){if(!e){e=document.createElement('div');e.id='vw-typing';e.className='vw-b vw-ai';e.innerHTML='<span class="vw-dots"><span></span><span></span><span></span></span>';msgs.appendChild(e);msgs.scrollTop=msgs.scrollHeight;}}else if(e)e.remove();}

  const MAP={'f':'modulo-f','fundamentos':'modulo-f','proceso':'lvc','lvc':'lvc','club':'lvc','vtc19':'vtc19','19':'vtc19','bienvenida':'bienvenida'};
  const clientTools={ ir_a_modulo: async(p)=>{ try{ let m=String((p&&(p.modulo||p.module))||'').toLowerCase().trim().replace('modulo-','').replace('módulo','').trim(); let id=MAP[m]||(/^[0-9]+$/.test(m)?('modulo-'+m):('modulo-'+m)); let el=document.getElementById(id); if(el){el.scrollIntoView({behavior:'smooth',block:'start'});return 'Navegado a '+id;} return 'modulo no encontrado'; }catch(e){return 'error';} } };

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
        onModeChange:(m)=>{const md=(m&&m.mode)||m;if(md==='speaking'){typing(false);setStatus('<b>Victor hablando…</b>');}else setStatus('<b>Escuchando…</b>');},
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
    err.textContent=''; const cta=$('vw-cta'); cta.disabled=true; cta.textContent='Revisando acceso…';
    let hist='';
    try{ const h=await (await fetch(SITE+'/api/history?emp='+encodeURIComponent(emp))).json(); if(h&&h.found) hist=h.texto||''; }catch(e){}
    const firstMessage = hist
      ? '¡Qué gusto verte de nuevo, '+name+'! Ya revisé tu progreso. '+hist+'. ¿Seguimos desde ahí o quieres trabajar algo nuevo?'
      : '¡Bienvenido, '+name+'! Soy Victor, tu entrenador personal, y hoy vamos a hacerte mejor. ¿Quieres repasar un módulo o entramos directo a un roleplay?';
    gate.style.display='none'; chat.style.display='flex'; started=true;
    await connect({name,emp,dep,hist,firstMessage});
    cta.disabled=false; cta.textContent='Comenzar capacitación';
  }

  function openPanel(){ panel.classList.add('vw-open'); launch.style.display='none'; if(!started){gate.style.display='flex';chat.style.display='none';} }
  function minimize(){ panel.classList.remove('vw-open'); launch.style.display='flex'; } // NO corta la sesión
  function endAll(){ try{conv&&conv.endSession();}catch(e){} conv=null;started=false; mic.classList.remove('vw-live');launch.classList.remove('vw-active'); msgs.innerHTML=''; gate.style.display='flex';chat.style.display='none'; $('vw-cta').disabled=false;$('vw-cta').textContent='Comenzar capacitación'; panel.classList.remove('vw-open'); launch.style.display='flex'; }

  launch.onclick=openPanel; $('vw-min').onclick=minimize; $('vw-close').onclick=endAll; $('vw-cta').onclick=begin;
  $('vw-emp').addEventListener('keydown',e=>{if(e.key==='Enter')begin();});
  mic.onclick=()=>{ if(!conv)return; try{muted=!muted;conv.setMicMuted&&conv.setMicMuted(muted);mic.classList.toggle('vw-live',!muted);setStatus(muted?'Micrófono en pausa':'<b>En línea</b>');}catch(e){} };
  function send(){const t=input.value.trim();if(!t||!conv)return;input.value='';bubble('user',t);typing(true);try{conv.sendUserMessage?conv.sendUserMessage(t):(conv.sendText&&conv.sendText(t));}catch(e){console.error(e);}}
  $('vw-snd').onclick=send; input.addEventListener('keydown',e=>{if(e.key==='Enter')send();});
</script>

'''
t2=t[:i]+W+t[j:]
open(p,'w',encoding='utf-8').write(t2)
print('widget reconstruido. len index:',len(t2),'| popup:', '#vw-gate' in t2, '| minimizar:', 'vw-min' in t2)