# -*- coding: utf-8 -*-
p='index.html'; t=open(p,encoding='utf-8').read(); ch=[]

# 1) scroll-margin para no cortar modulos bajo el header fijo (56px + barra)
if 'scroll-margin-top:90px' not in t:
    css='.vtc-hl{ outline:2px solid #c9aa75 !important;'
    t=t.replace(css, '.module-section,[id^="modulo-"],#lvc,#vtc19,#bienvenida{scroll-margin-top:90px;} '+css, 1)
    ch.append('scroll-margin')

# 2) detector de respuestas del quiz -> avisa a Victor por contexto (no hablado)
anchor="input.addEventListener('keydown',e=>{if(e.key==='Enter')send();});"
quizjs=anchor+'''
  document.addEventListener('click',function(e){
    var o=e.target.closest&&e.target.closest('.q-opt'); if(!o||!conv) return;
    setTimeout(function(){ try{
      var qEl=o.closest('.q'); if(!qEl) return;
      var qText=((qEl.querySelector('.q-text')||{}).innerText||'').replace(/^\\s*\\d+\\.?\\s*/,'').trim();
      var ans=(o.innerText||'').trim();
      var ok=qEl.classList.contains('ok');
      var sec=o.closest('[id^=\"modulo-\"],#lvc,#vtc19'); var mod=sec?sec.id:'';
      if(conv.sendContextualUpdate) conv.sendContextualUpdate('[QUIZ] '+(mod?('Modulo '+mod+': '):'')+'el asesor respondio \"'+ans+'\" a la pregunta \"'+qText+'\" — '+(ok?'CORRECTO':'INCORRECTO')+'.');
    }catch(_){} },70);
  },false);'''
if '[QUIZ]' not in t and anchor in t:
    t=t.replace(anchor,quizjs,1); ch.append('quiz-detector')

open(p,'w',encoding='utf-8').write(t)
print('cambios:',ch)