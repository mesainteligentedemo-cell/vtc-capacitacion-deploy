# -*- coding: utf-8 -*-
"""
Implementa el flujo exacto del usuario:
1. Antes del video: lee titulo + subtitulo + intro, comenta, "dale play"
2. Despues del video: lee todo lo que sigue
3. Antes del quiz: explicacion del modulo + preguntas al usuario
4. "ahora vamos a hacer un pequeño quiz"
5. Lee pregunta + opciones, espera respuesta, pasa a la siguiente
6. Al terminar: felicita, lista aciertos/errores por pregunta, continua
"""
import io, re

# ──────────────────────────────────────────────────
# 1) index.html: reescribir leer_modulo_completo y ir_al_quiz
# ──────────────────────────────────────────────────
p = 'index.html'
t = io.open(p, encoding='utf-8').read()

# ── leer_modulo_completo: separar ANTES y DESPUES del video ──
OLD_LMC_START = '    leer_modulo_completo: async(p)=>{ try{'
OLD_LMC_END   = "return 'LEE ESTOS TEXTOS EN ORDEN"
i_lmc = t.find(OLD_LMC_START)
j_lmc = t.find('\n    minimizar_chat:', i_lmc)
assert i_lmc >= 0 and j_lmc > i_lmc, f'leer_modulo_completo no encontrado: {i_lmc}'

NEW_LMC = r"""    leer_modulo_completo: async(p)=>{ try{
        var id=vtcId(p); var sec=document.getElementById(id);
        if(!sec) return 'modulo no encontrado: '+id;
        var cl=sec.cloneNode(true);
        cl.querySelectorAll('.quiz,.exam-section,script,style,video,source,nav,button,svg,.course-nav').forEach(function(x){x.remove();});
        var VIDEO_SENTINEL='__VIDEO_AQUI__';
        /* Marcar donde estaba el video */
        cl.querySelectorAll('.lesson-video,.lesson-video.feature').forEach(function(v,idx){
          if(idx===0){ var m=document.createElement('div'); m.textContent=VIDEO_SENTINEL; v.replaceWith(m); }
          else{ v.remove(); }
        });
        var sels='.module-id,.module-title,.module-subtitle,.pnl-title,.pnl-text,.block-title,.block-text,p,.script-label,.script-text,.script-note,.step-title,.step-text,.tiedown-label,.tiedown-list li,.comp-header,.comp-items li,h3,h4,li,.lesson-label';
        var seen=new Set(); var before=[]; var after=[]; var pastVideo=false;
        cl.querySelectorAll('*').forEach(function(el){
          if(el.textContent.trim()===VIDEO_SENTINEL){ pastVideo=true; return; }
          if(el.matches(sels)){
            var tx=(el.textContent||'').replace(/\s+/g,' ').trim();
            if(tx.length>3 && tx.length<900 && !seen.has(tx)){
              seen.add(tx);
              if(pastVideo) after.push(tx); else before.push(tx);
            }
          }
        });
        var hasVideo=pastVideo; /* si encontro el sentinel, hay video */
        var fmt=function(arr){return arr.map(function(tx,i){return (i+1)+') '+tx;}).join(' ||| ');};
        if(!hasVideo){
          return 'SIN_VIDEO. TEXTOS: '+fmt(before.length?before:after);
        }
        return 'ANTES_VIDEO: '+fmt(before)+' ### DESPUES_VIDEO: '+fmt(after);
      }catch(e){return 'error: '+String(e);} },
"""

t = t[:i_lmc] + NEW_LMC + t[j_lmc:]
print('leer_modulo_completo reescrito')

# ── ir_al_quiz: devuelve preguntas + respuesta correcta + formato para leer 1 a 1 ──
OLD_QUIZ = "    ir_al_quiz: async(p)=>{ try{ var sec=document.getElementById(vtcId(p)); var q=sec?sec.querySelector('.quiz'):null; if(!q) return 'ese modulo no tiene quiz; continua'; try{window.__vtcDrive=Date.now();}catch(e){} q.scrollIntoView({behavior:'smooth',block:'start'}); vtcHL(q); var out=[]; q.querySelectorAll('.q').forEach(function(qq,i){ var qt=(((qq.querySelector('.q-text')||{}).innerText)||'').replace(/^\\s*[0-9]+\\.?\\s*/,'').trim(); var ops=[]; qq.querySelectorAll('.q-opt').forEach(function(o){ops.push(((o.innerText)||'').trim());}); out.push('P'+(i+1)+': '+qt+' Opciones: '+ops.join(' / ')); }); return 'Quiz del modulo. LEE cada pregunta con sus opciones, UNA a la vez, y espera a que el usuario conteste (recibiras [QUIZ] con correcto o incorrecto; la UI baja sola a la siguiente). Da feedback por pregunta. ' + out.join('  ||  '); }catch(e){ return 'error'; } },"

NEW_QUIZ = r"""    ir_al_quiz: async(p)=>{ try{
        var sec=document.getElementById(vtcId(p));
        var q=sec?sec.querySelector('.quiz'):null;
        if(!q) return 'ese modulo no tiene quiz; continua al siguiente modulo';
        try{window.__vtcDrive=Date.now();}catch(e){}
        q.scrollIntoView({behavior:'smooth',block:'start'}); vtcHL(q);
        var pregs=[]; var total=0;
        q.querySelectorAll('.q').forEach(function(qq,i){
          total++;
          var qt=((qq.querySelector('.q-text')||{}).innerText||'').replace(/^\s*[0-9]+\.?\s*/,'').trim();
          var ops=[]; var corrIdx=-1;
          qq.querySelectorAll('.q-opt').forEach(function(o,oi){
            var tx=(o.innerText||'').trim();
            /* La opcion correcta tiene data-c="1" o es la primera en el quiz generado */
            var isCorr=(o.dataset&&(o.dataset.c==='1'||o.dataset.correct==='1'));
            ops.push(tx);
            if(isCorr) corrIdx=oi;
          });
          pregs.push('P'+total+': '+qt+' | OPCIONES: '+ops.map(function(o,oi){return String.fromCharCode(65+oi)+') '+o;}).join(' / ')+(corrIdx>=0?' | CORRECTA: '+String.fromCharCode(65+corrIdx):''));
        });
        return 'QUIZ LISTO ('+total+' preguntas). INSTRUCCIONES: Lee P1 completa con todas sus opciones en voz. Espera que el usuario responda. Cuando recibas [QUIZ] con CORRECTO/INCORRECTO para P1, da feedback breve y lee P2. Y asi hasta el final. Al recibir QUIZ COMPLETO: felicita, lista cada pregunta con si acerto o no. || '+pregs.join(' || ');
      }catch(e){ return 'error'; } },"""

if OLD_QUIZ in t:
    t = t.replace(OLD_QUIZ, NEW_QUIZ, 1)
    print('ir_al_quiz actualizado')
else:
    print('WARN: ir_al_quiz patron no encontrado')
    print('Buscando...', t.find('ir_al_quiz: async'))

io.open(p, 'w', encoding='utf-8').write(t)

# ── Validar JS ──
import subprocess, os
subprocess.run(['node','-e','const fs=require("fs");const h=fs.readFileSync("index.html","utf8");const m=h.match(/<script type="module">([\\s\\S]*?)<\\/script>/);fs.writeFileSync("_w.mjs",m[1]);'],capture_output=True)
r2=subprocess.run(['node','--check','_w.mjs'],capture_output=True,text=True)
print('JS:', 'OK' if r2.returncode==0 else 'ERROR: '+r2.stderr[:200])
try: os.remove('_w.mjs')
except: pass

# ──────────────────────────────────────────────────
# 2) Prompt: flujo exacto descrito por el usuario
# ──────────────────────────────────────────────────
pp = 'victor_system_prompt.md'
tt = io.open(pp, encoding='utf-8').read()

i2 = tt.find('## \U0001f393 MODO CURSO GUIADO')
j2 = tt.find('\n## ', i2 + 10)
assert i2 >= 0 and j2 > i2

NEW_MODE = u'''## \U0001f393 MODO CURSO GUIADO — FLUJO EXACTO

**ACTIVACI\xd3N INMEDIATA** con: "el curso", "el curso completo", "gu\xedame", "dame la capacitaci\xf3n", "empieza", "arranca", "vamos", "ens\xe9\xf1ame todo". Sin pedir confirmaci\xf3n. Arrancas directo.

---

### ⚡ REGLA ABSOLUTA: LEE TODO SIN EXCEPCI\xd3N

Lee absolutamente todo el texto visible en cada m\xf3dulo: t\xedtulos, subt\xedtulos, p\xe1rrafos, cuadros de script, listas, pasos, comparaciones, etiquetas de PNL — **todo**. Sin saltar nada. Sin resumir en medio. La \xfanica excepci\xf3n es el bloque del quiz (ese lo maneja `ir_al_quiz`).

---

### FLUJO POR M\xd3DULO (repite exactamente para cada uno)

**PASO A — OBTENER CONTENIDO:**
Llama `leer_modulo_completo("[modulo]")` al entrar a cada m\xf3dulo.
El tool devuelve una de dos cosas:
- `"ANTES_VIDEO: 1) ... ||| 2) ... ### DESPUES_VIDEO: 1) ... ||| 2) ..."` — hay video
- `"SIN_VIDEO. TEXTOS: 1) ... ||| 2) ..."` — no hay video, lee todo seguido

**PASO B — LEE LOS TEXTOS ANTES DEL VIDEO (si los hay):**
Para cada texto en ANTES_VIDEO:
→ Llama `resaltar_texto("[primeras 4-5 palabras exactas]")`
→ Lee el texto exacto que devuelve el tool, palabra por palabra
→ Sin comentar entre textos — llama el siguiente `resaltar_texto` de inmediato

**PASO C — VIDEO (cuando llegues al \xfaltimo texto de ANTES_VIDEO):**
Di de forma natural: "Antes de continuar, vamos a ver el video de este m\xf3dulo. Te va a dar el contexto completo de todo lo que acabamos de leer."
→ `reproducir_video("[modulo]")`
→ "Dale play y av\xedsame en cuanto termines."
⏸ ESPERA SU AVISO

**PASO D — LEE LOS TEXTOS DESPU\xc9S DEL VIDEO (al recibir aviso):**
Para cada texto en DESPUES_VIDEO:
→ Llama `resaltar_texto("[primeras 4-5 palabras exactas]")`
→ Lee el texto exacto que devuelve el tool
→ Sin comentar entre textos — flujo continuo hasta el \xfaltimo texto

**PASO E — EXPLICACI\xd3N + PREGUNTAS AL USUARIO:**
Al terminar el \xfaltimo texto del m\xf3dulo:
→ Da una explicaci\xf3n de 2-3 frases: la idea m\xe1s importante del m\xf3dulo con un ejemplo real del piso
→ Hazle 1-2 preguntas de comprensi\xf3n al usuario (abiertas, no del quiz). Por ejemplo: "\xbfC\xf3mo usar\xedas esto en tu pr\xf3xima presentaci\xf3n?" o "\xbfQu\xe9 har\xedas si el prospecto hace X?"
⏸ ESPERA SU RESPUESTA. Da feedback breve (1 frase).

**PASO F — QUIZ:**
Di: "Ahora vamos a hacer un peque\xf1o quiz de este m\xf3dulo."
→ Llama `ir_al_quiz("[modulo]")`
→ El tool devuelve la lista de preguntas con opciones

Para cada pregunta:
→ Lee la pregunta en voz: "Pregunta [N]: [texto]"
→ Lee cada opci\xf3n: "A) [opci\xf3n A]. B) [opci\xf3n B]. C) [opci\xf3n C]..."
→ Espera que el usuario responda (cualquier cosa: letra, texto, voz)
→ Cuando recibas `[QUIZ]` con CORRECTO/INCORRECTO: da feedback en 1 frase
→ Llama `resaltar_texto` en la pregunta siguiente y lee la siguiente pregunta de inmediato
⏸ Repite hasta terminar todas las preguntas

**PASO G — RESULTADO DEL QUIZ:**
Cuando recibas `(QUIZ COMPLETO ... X de Y correctas)`:
→ Felicita calurosamente
→ Lista cada pregunta: "Pregunta 1 — [acert\xf3/fall\xf3]" (usa los `[QUIZ]` que recibiste)
→ Si hubo errores: explica brevemente la respuesta correcta de cada una
→ Di: "Listo, continuamos." → pasa al siguiente m\xf3dulo SIN ESPERAR.

---

### SECUENCIA COMPLETA DEL CURSO

**ARRANQUE:**
1. `ir_a_modulo("inicio")` + `minimizar_chat()` + "Vamos con el curso completo — yo gu\xedo todo."
2. `leer_modulo_completo("bienvenida")` → lee todos los textos del hero (sin video a\xfan)
3. "Vamos a ver el video de bienvenida." → `reproducir_video("bienvenida")` → "Dale play y av\xedsame."
⏸ ESPERA AVISO → continua con PANORAMA

**PANORAMA:**
→ `ir_a_modulo("indice")` → `leer_modulo_completo("indice")` → lee cada tarjeta
→ "Entramos al primer m\xf3dulo." → arranca PASOS A-G para modulo-f

**M\xd3DULOS EN ORDEN:**
modulo-f → modulo-0 → modulo-1 → modulo-2 → modulo-3 → modulo-4 → modulo-5
→ modulo-6 → modulo-7 → modulo-8 → modulo-9 → modulo-10 → modulo-11 → modulo-12
→ proceso → vtc19

**CIERRE:** Felicita. Propone roleplay. Fin.

---

### REGLAS DE resaltar_texto

El tool devuelve: `"LEE ESTO EXACTAMENTE: [texto]"` — lees ese texto tal cual.
Si devuelve "NO ENCONTRADO": usa 3-4 palabras m\xe1s cortas y exactas del mismo texto.
Llama el siguiente `resaltar_texto` INMEDIATAMENTE al terminar de leer — sin pausa.

### VIDEOS
Siempre: anuncia → `reproducir_video()` → pide play → espera aviso. Te callas mientras suena.

### PAUSAS (solo estas, nada m\xe1s)
1. Esperar aviso del video
2. Esperar respuesta del usuario en preguntas de comprensi\xf3n (PASO E)
3. Esperar respuesta por pregunta del quiz (PASO F)

'''

tt = tt[:i2] + NEW_MODE + tt[j2:]
io.open(pp, 'w', encoding='utf-8').write(tt)
print('prompt actualizado | len:', len(tt))
