# -*- coding: utf-8 -*-
p='index.html'; t=open(p,encoding='utf-8').read(); ch=[]

# 1) MAP: inicio -> bienvenida (arranque del curso); agregar indice
old_map="const MAP={'inicio':'__top','top':'__top','h1':'__top','arriba':'__top','principio':'__top','f':'modulo-f','fundamentos':'modulo-f','proceso':'lvc','lvc':'lvc','club':'lvc','vtc19':'vtc19','vtc 19':'vtc19','19':'vtc19','bienvenida':'bienvenida','fin':'modulo-FIN','cierre-curso':'modulo-FIN'};"
new_map="const MAP={'inicio':'bienvenida','curso':'bienvenida','principio':'bienvenida','top':'__top','h1':'__top','arriba':'__top','indice':'indice','modulos':'indice','todos':'indice','f':'modulo-f','fundamentos':'modulo-f','proceso':'lvc','lvc':'lvc','club':'lvc','vtc19':'vtc19','vtc 19':'vtc19','19':'vtc19','bienvenida':'bienvenida','fin':'modulo-FIN','cierre-curso':'modulo-FIN'};"
if old_map in t: t=t.replace(old_map,new_map,1); ch.append('map')

# 2) agregar tool ir_al_quiz dentro de clientTools (despues de reproducir_video)
anchor="      }catch(e){ return 'error'; } }\n  };"
newtools="""      }catch(e){ return 'error'; } },
    ir_al_quiz: async(p)=>{ try{ var sec=document.getElementById(vtcId(p)); var q=sec?sec.querySelector('.quiz'):null; if(q){ try{window.__vtcDrive=Date.now();}catch(e){} q.scrollIntoView({behavior:'smooth',block:'start'}); vtcHL(q); return 'En el quiz'; } return 'ese modulo no tiene quiz'; }catch(e){ return 'error'; } }
  };"""
if "ir_al_quiz" not in t and anchor in t: t=t.replace(anchor,newtools,1); ch.append('ir_al_quiz')

# 3) deteccion de quiz COMPLETO en el listener (despues del sendContextualUpdate del [QUIZ])
qanchor="if(conv.sendContextualUpdate) conv.sendContextualUpdate('[QUIZ] '+(mod?('Modulo '+mod+': '):'')+'el asesor respondio \\\"'+ans+'\\\" a la pregunta \\\"'+qText+'\\\" — '+(ok?'CORRECTO':'INCORRECTO')+'.');"
qadd=qanchor+"""
      var quizEl=qEl.closest('.quiz');
      if(quizEl){ var qs=quizEl.querySelectorAll('.q'); var an=quizEl.querySelectorAll('.q.answered'); if(qs.length && an.length>=qs.length && !quizEl.__vdone){ quizEl.__vdone=1; var sc=((quizEl.querySelector('.scnum')||{}).textContent||'?'); setTimeout(function(){ try{ if(conv.sendUserMessage) conv.sendUserMessage('(QUIZ COMPLETO'+(mod?(' en '+mod):'')+': '+sc+' de '+qs.length+' correctas. Comenta el resultado brevemente y continua con el siguiente paso del curso guiado.)'); }catch(e){} },500); } }"""
if 'QUIZ COMPLETO' not in t and qanchor in t: t=t.replace(qanchor,qadd,1); ch.append('quiz-completo')

open(p,'w',encoding='utf-8').write(t)
print('cambios:',ch)