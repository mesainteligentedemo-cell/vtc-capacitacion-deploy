# -*- coding: utf-8 -*-
"""
Problema raiz: resaltar_texto usa smooth scroll (300-500ms) pero devuelve
el valor ANTES de que termine el scroll → Victor empieza a hablar mientras
la pantalla todavia se esta moviendo.

Solucion:
  1. Scroll INSTANTANEO (behavior:'instant') → el elemento esta en pantalla
     ANTES de que el tool retorne → Victor habla y ya esta marcado
  2. Ajuste fino INMEDIATO (sin setTimeout) → no hay delay
  3. Solo el marco dorado (.vtc-mark) tiene animacion CSS (no el scroll)
"""
import io

p = 'index.html'
t = io.open(p, encoding='utf-8').read()

i = t.find('    resaltar_texto: async(p)=>{ try{')
j = t.find('\n    ir_al_quiz: async(p)=>{', i)
# Si no encontro ir_al_quiz despues, busca minimizar_chat
if j < i:
    j = t.find('\n    minimizar_chat:', i)
assert i > 0 and j > i, f'anchors: {i} {j}'

NEW = r"""    resaltar_texto: async(p)=>{ try{
        var raw=String((p&&(p.texto||p.text||p.frase))||'').trim();
        if(raw.length<3) return 'sin texto';

        /* normalizar: sin acentos, minusculas, sin signos */
        function norm(s){
          return String(s||'').toLowerCase()
            .replace(/[aáàäâã]/g,'a').replace(/[eéèëê]/g,'e')
            .replace(/[iíìïî]/g,'i').replace(/[oóòöôõ]/g,'o')
            .replace(/[uúùüû]/g,'u').replace(/[nñ]/g,'n')
            .replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
        }
        var q=norm(raw);

        var SELS='.module-id,.module-title,.module-subtitle,.pnl-title,.pnl-text,.block-title,.block-text,p,li,h2,h3,h4,.script-label,.script-text,.script-note,.step-title,.step-text,.tiedown-label,.tiedown-list li,.comp-header,.comp-items li,.lesson-label,.q-text,.q-opt';
        var cands=[];
        document.querySelectorAll('[id^="modulo-"],#lvc,#vtc19,#bienvenida,#indice').forEach(function(sec){
          sec.querySelectorAll(SELS).forEach(function(el){
            var tx=norm(el.textContent||'');
            if(tx.length<4||tx.length>900) return;
            var score=0;
            if(tx===q) score=100;
            else if(tx.indexOf(q)>=0) score=85-(tx.length/20);
            else {
              var words=q.split(' ').filter(function(w){return w.length>2;});
              var hits=words.filter(function(w){return tx.indexOf(w)>=0;}).length;
              if(hits>0) score=(hits/Math.max(words.length,1))*65-(tx.length/60);
            }
            if(score>5) cands.push({el:el,score:score,len:tx.length});
          });
        });
        if(!cands.length) return 'NO ENCONTRADO ('+raw.slice(0,30)+'). Intenta con 2-3 palabras mas cortas.';
        cands.sort(function(a,b){return b.score-a.score||a.len-b.len;});
        var el=cands[0].el;

        /* --- SCROLL INSTANTANEO: el elemento esta en pantalla ANTES de retornar --- */
        try{window.__vtcDrive=Date.now();}catch(e){}
        document.querySelectorAll('.vtc-mark').forEach(function(x){x.classList.remove('vtc-mark');});

        /* 1) Calcular posicion objetivo: elemento centrado, minimo 90px del top (nav) */
        var rect=el.getBoundingClientRect();
        var nav=88; var vh=window.innerHeight||800;
        var elH=Math.min(rect.height,300);
        /* Centro ideal: mitad del viewport menos la mitad del elemento, respetando el nav */
        var targetTop=Math.max(nav+16, (vh-elH)/2);
        var delta=rect.top - targetTop;
        /* Scroll instantaneo: sin animacion, el elemento ya esta ahi al retornar */
        if(Math.abs(delta)>6) window.scrollBy({top:Math.round(delta),behavior:'instant'});

        /* 2) Marco dorado (solo animacion visual, no de scroll) */
        el.classList.add('vtc-mark');
        el.scrollIntoView({block:'nearest'}); /* asegura que no quede tapado por nada */

        vtcMobMin();

        var rawText=(el.textContent||'').replace(/\s+/g,' ').trim();
        return rawText;
      }catch(e){ return 'error: '+String(e); } },
"""

t = t[:i] + NEW + t[j:]
io.open(p, 'w', encoding='utf-8').write(t)
print('resaltar_texto reescrito con scroll instantaneo')

import subprocess, os
subprocess.run(['node','-e','const fs=require("fs");const h=fs.readFileSync("index.html","utf8");const m=h.match(/<script type="module">([\\s\\S]*?)<\\/script>/);fs.writeFileSync("_w.mjs",m[1]);'],capture_output=True)
r = subprocess.run(['node','--check','_w.mjs'],capture_output=True,text=True)
print('JS:', 'OK' if r.returncode==0 else 'ERR: '+r.stderr[:300])
try: os.remove('_w.mjs')
except: pass
