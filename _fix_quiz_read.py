# -*- coding: utf-8 -*-
import io

p = 'index.html'
t = io.open(p, encoding='utf-8').read()

i = t.find('    ir_al_quiz: async(p)=>{ try{')
j = t.find('\n    resaltar_texto: async(p)=>{', i)
assert i > 0 and j > i

NEW = r"""    ir_al_quiz: async(p)=>{ try{
        var sec=document.getElementById(vtcId(p));
        var q=sec?sec.querySelector('.quiz'):null;
        if(!q) return 'ese modulo no tiene quiz; continua al siguiente modulo';
        try{window.__vtcDrive=Date.now();}catch(e){}
        q.scrollIntoView({behavior:'smooth',block:'start'});
        vtcHL(q);
        setTimeout(function(){try{
          var qr=q.getBoundingClientRect(); var diff=qr.top-80;
          if(Math.abs(diff)>4) window.scrollBy({top:Math.ceil(diff),behavior:'smooth'});
        }catch(e){}},350);

        var pregs=[]; var total=0;
        q.querySelectorAll('.q').forEach(function(qq,idx){
          total++;
          /* texto limpio de la pregunta */
          var qtEl=qq.querySelector('.q-text');
          var qt=(qtEl?qtEl.innerText||qtEl.textContent:'').replace(/^\s*[0-9]+[.)]\s*/,'').trim();
          /* opciones exactas tal como aparecen */
          var ops=[];
          qq.querySelectorAll('.q-opt').forEach(function(o,oi){
            var tx=(o.innerText||o.textContent||'').replace(/^\s*[A-Z][.)]\s*/i,'').trim();
            if(tx) ops.push(String.fromCharCode(65+oi)+') '+tx);
          });
          pregs.push('PREGUNTA '+total+': '+qt+' | '+ops.join(' | '));
        });

        return (
          'QUIZ: '+total+' preguntas. '+
          'INSTRUCCION: por cada pregunta — (1) llama resaltar_texto con las primeras palabras de la pregunta para que se marque en pantalla, (2) lee la pregunta EXACTA y todas sus opciones tal como aparecen aqui, (3) espera que el usuario responda, (4) da feedback breve, (5) pasa a la siguiente. '+
          '||| '+pregs.join(' ||| ')
        );
      }catch(e){ return 'error'; } },
"""

t = t[:i] + NEW + t[j:]
io.open(p, 'w', encoding='utf-8').write(t)
print('ir_al_quiz reescrito OK')

import subprocess, os
subprocess.run(['node','-e','const fs=require("fs");const h=fs.readFileSync("index.html","utf8");const m=h.match(/<script type="module">([\\s\\S]*?)<\\/script>/);fs.writeFileSync("_w.mjs",m[1]);'],capture_output=True)
r = subprocess.run(['node','--check','_w.mjs'],capture_output=True,text=True)
print('JS:', 'OK' if r.returncode==0 else 'ERR: '+r.stderr[:300])
try: os.remove('_w.mjs')
except: pass
