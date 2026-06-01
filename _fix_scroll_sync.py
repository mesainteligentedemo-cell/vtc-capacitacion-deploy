# -*- coding: utf-8 -*-
"""
Reescribe resaltar_texto para scroll perfecto sin errores:
1. Búsqueda robusta: normaliza acentos, busca por palabras individuales si falla la frase
2. Scroll inteligente: el elemento queda visible justo bajo el nav, nunca tapado
3. Siempre devuelve el texto del bloque aunque sea match parcial
"""
import io

p = 'index.html'
t = io.open(p, encoding='utf-8').read()

# Localizar el tool resaltar_texto completo
i = t.find('    resaltar_texto: async(p)=>{ try{')
j = t.find('\n    minimizar_chat:', i)
assert i > 0 and j > i, f'anchors no encontrados i={i} j={j}'

NEW = r"""    resaltar_texto: async(p)=>{ try{
        var raw=String((p&&(p.texto||p.text||p.frase))||'').trim();
        if(raw.length<3) return 'sin texto';

        /* ── normalizar: quitar acentos, minusculas, espacios multiples ── */
        function norm(s){
          return s.toLowerCase()
            .replace(/[áàäâã]/g,'a').replace(/[éèëê]/g,'e')
            .replace(/[íìïî]/g,'i').replace(/[óòöôõ]/g,'o')
            .replace(/[úùüû]/g,'u').replace(/ñ/g,'n')
            .replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
        }
        var q=norm(raw);

        /* ── selectores de todos los elementos de texto ── */
        var SELS='.module-id,.module-title,.module-subtitle,.pnl-title,.pnl-text,.block-title,.block-text,p,li,h1,h2,h3,h4,.script-label,.script-text,.script-note,.step-title,.step-text,.tiedown-label,.tiedown-list li,.comp-header,.comp-items li,.lesson-label';
        var cands=[];
        document.querySelectorAll('[id^="modulo-"],#lvc,#vtc19,#bienvenida,#indice').forEach(function(s){
          s.querySelectorAll(SELS).forEach(function(el){
            var tx=norm(el.textContent||'');
            if(tx.length>3 && tx.length<900){
              /* Score: coincidencia exacta > incluye la frase > incluye palabras clave */
              var score=0;
              if(tx===q) score=100;
              else if(tx.indexOf(q)>=0) score=80-(tx.length/20);
              else {
                /* buscar por palabras: cuantas palabras del query estan en el texto */
                var words=q.split(' ').filter(function(w){return w.length>3;});
                var hits=words.filter(function(w){return tx.indexOf(w)>=0;}).length;
                if(hits>0) score=(hits/Math.max(words.length,1))*60-(tx.length/50);
              }
              if(score>0) cands.push({el:el,score:score,len:tx.length});
            }
          });
        });

        if(!cands.length) return 'NO ENCONTRADO: '+raw.slice(0,40)+'. Usa 3-4 palabras clave mas cortas.';

        /* Ordenar: mayor score primero, a igual score el mas corto */
        cands.sort(function(a,b){ return b.score-a.score || a.len-b.len; });
        var el=cands[0].el;

        /* ── Scroll inteligente: elemento visible justo bajo el nav ── */
        try{window.__vtcDrive=Date.now();}catch(e){}
        document.querySelectorAll('.vtc-mark').forEach(function(x){x.classList.remove('vtc-mark');});
        el.classList.add('vtc-mark');

        /* scrollIntoView primero para aproximar */
        el.scrollIntoView({behavior:'smooth',block:'center'});

        /* Ajuste fino 350ms despues: asegurar que no quede bajo el nav ni cortado */
        setTimeout(function(){try{
          var rc=el.getBoundingClientRect();
          var nav=84; /* alto del nav */
          var vh=window.innerHeight||800;
          var margin=24;
          if(rc.top < nav+margin){
            /* demasiado arriba — subir para que se vea con contexto */
            window.scrollBy({top:Math.ceil(rc.top-nav-margin),behavior:'smooth'});
          } else if(rc.bottom > vh-margin){
            /* cortado abajo — bajar un poco */
            window.scrollBy({top:Math.ceil(rc.bottom-vh+margin),behavior:'smooth'});
          }
        }catch(e){}},350);

        vtcMobMin();

        /* Devolver texto del elemento para que Victor sepa qué explicar */
        var rawText=(el.textContent||'').replace(/\s+/g,' ').trim();
        return rawText;
      }catch(e){ return 'error: '+String(e); } },
"""

t = t[:i] + NEW + t[j:]
io.open(p, 'w', encoding='utf-8').write(t)

import subprocess, os
subprocess.run(['node','-e','const fs=require("fs");const h=fs.readFileSync("index.html","utf8");const m=h.match(/<script type="module">([\\s\\S]*?)<\\/script>/);fs.writeFileSync("_w.mjs",m[1]);'],capture_output=True)
r = subprocess.run(['node','--check','_w.mjs'],capture_output=True,text=True)
print('JS:', 'OK' if r.returncode==0 else 'ERR: '+r.stderr[:300])
try: os.remove('_w.mjs')
except: pass
