# -*- coding: utf-8 -*-
p='index.html'; t=open(p,encoding='utf-8').read()
i=t.find('ir_al_quiz: async(p)=>{')
j=t.find('resaltar_texto: async(p)=>{')
assert i>=0 and j>i, ('no encontrado', i, j)
NEW = r'''ir_al_quiz: async(p)=>{ try{ var sec=document.getElementById(vtcId(p)); var q=sec?sec.querySelector('.quiz'):null; if(!q) return 'ese modulo no tiene quiz; continua'; try{window.__vtcDrive=Date.now();}catch(e){} q.scrollIntoView({behavior:'smooth',block:'start'}); vtcHL(q); var out=[]; q.querySelectorAll('.q').forEach(function(qq,i){ var qt=(((qq.querySelector('.q-text')||{}).innerText)||'').replace(/^\s*[0-9]+\.?\s*/,'').trim(); var ops=[]; qq.querySelectorAll('.q-opt').forEach(function(o){ops.push(((o.innerText)||'').trim());}); out.push('P'+(i+1)+': '+qt+' Opciones: '+ops.join(' / ')); }); return 'Quiz del modulo. LEE cada pregunta con sus opciones, UNA a la vez, y espera a que el usuario conteste (recibiras [QUIZ] con correcto o incorrecto; la UI baja sola a la siguiente). Da feedback por pregunta. ' + out.join('  ||  '); }catch(e){ return 'error'; } },
    '''
t=t[:i]+NEW+t[j:]
open(p,'w',encoding='utf-8').write(t)
print('ir_al_quiz reescrito limpio')