# -*- coding: utf-8 -*-
"""
1. Agrega tool leer_modulo_completo: devuelve TODOS los textos del módulo en orden DOM
2. Amplía selectores de resaltar_texto para cubrir script-boxes, pasos, comparaciones, etc.
3. Actualiza el prompt: usar leer_modulo_completo → leer todo → explicar al final
"""
import io, re

# ─────────── index.html ───────────
p = 'index.html'
t = io.open(p, encoding='utf-8').read()

# ── 1) Ampliar selectores de resaltar_texto ──
OLD_SELS = "var sels='p,li,h1,h2,h3,h4,blockquote,.script-text,.script-note,.block-title,.step-title,.step-text,.tiedown-list li,.comp-items li,.module-subtitle,.module-id';"
NEW_SELS = "var sels='.module-id,.module-title,.module-subtitle,.block-title,.block-text,p,li,h1,h2,h3,h4,blockquote,.script-label,.script-text,.script-note,.step-title,.step-text,.tiedown-label,.tiedown-list li,.comp-header,.comp-items li,.lesson-label,.stat-num,.stat-label';"

if OLD_SELS in t:
    t = t.replace(OLD_SELS, NEW_SELS, 1)
    print('selectores ampliados')
else:
    print('WARN: sels no encontrado — busca manual')
    i2 = t.find("sels='p,li,h1")
    print('  pos:', i2, repr(t[i2:i2+80]) if i2 >= 0 else 'no')

# ── 2) Agregar tool leer_modulo_completo antes de minimizar_chat ──
ANCHOR = '    minimizar_chat: async()=>{'
NEW_TOOL = r"""    leer_modulo_completo: async(p)=>{ try{
        var id=vtcId(p); var sec=document.getElementById(id);
        if(!sec) return 'modulo no encontrado: '+id;
        /* Clonar y limpiar elementos no legibles */
        var cl=sec.cloneNode(true);
        cl.querySelectorAll('.quiz,.exam-section,script,style,video,source,nav,button,svg,.course-nav').forEach(function(x){x.remove();});
        /* Selectores de TODOS los elementos de texto, en orden DOM */
        var sels=['.module-id','.module-title','.module-subtitle',
          '.block-title','.block-text','p',
          '.script-label','.script-text','.script-note',
          '.step-title','.step-text',
          '.tiedown-label','.tiedown-list li',
          '.comp-header','.comp-items li',
          'h3','h4','li'].join(',');
        var seen=new Set(); var texts=[];
        cl.querySelectorAll(sels).forEach(function(el){
          var tx=(el.textContent||'').replace(/\s+/g,' ').trim();
          if(tx.length>3 && tx.length<900 && !seen.has(tx)){seen.add(tx);texts.push(tx);}
        });
        if(!texts.length) return 'sin texto legible en este modulo';
        return 'LEE ESTOS TEXTOS EN ORDEN (uno a uno con resaltar_texto, sin comentar entre ellos — solo explica al final del modulo): '+texts.map(function(tx,i){return (i+1)+') '+tx;}).join(' ||| ');
      }catch(e){return 'error';} },
"""

if ANCHOR in t:
    t = t.replace(ANCHOR, NEW_TOOL + '    ' + ANCHOR.lstrip(), 1)
    print('leer_modulo_completo agregado')
else:
    print('WARN: anchor minimizar_chat no encontrado')

io.open(p, 'w', encoding='utf-8').write(t)

# ─────────── Validar JS ───────────
import subprocess, os
res = subprocess.run(['node', '-e',
    'const fs=require("fs");'
    'const h=fs.readFileSync("index.html","utf8");'
    'const m=h.match(/<script type="module">([\\s\\S]*?)<\\/script>/);'
    'fs.writeFileSync("_w.mjs",m[1]);'
], capture_output=True, text=True)
res2 = subprocess.run(['node','--check','_w.mjs'], capture_output=True, text=True)
if res2.returncode == 0:
    print('JS OK')
else:
    print('JS ERROR:', res2.stderr[:300])
os.remove('_w.mjs')

# ─────────── victor_system_prompt.md ───────────
pp = 'victor_system_prompt.md'
tt = io.open(pp, encoding='utf-8').read()

i = tt.find('## \U0001f393 MODO CURSO GUIADO')
j = tt.find('\n## ', i + 10)
assert i >= 0 and j > i, f'anchors modo guiado no encontrados: {i} {j}'

NEW_MODE = u'''## \U0001f393 MODO CURSO GUIADO — LEER TODO SIN EXCEPCI\xd3N

**ACTIVACI\xd3N INMEDIATA** con: "el curso", "el curso completo", "gu\xedame", "dame la capacitaci\xf3n", "empieza", "arranca", "vamos", "ens\xe9\xf1ame", "walkthrough". Sin pedir confirmaci\xf3n.

---

### ⚡ REGLA ABSOLUTA: LEE TODO LO QUE EST\xc1 EN PANTALLA

Lee **absolutamente todo** el texto que aparece en cada m\xf3dulo: t\xedtulos, subt\xedtulos, p\xe1rrafos, cuadros de script, listas, pasos, tablas de comparaci\xf3n, etiquetas — **sin excepci\xf3n**. No resumes, no saltas, no parafraseas. Lees el texto real, palabra por palabra, con el karaoke en pantalla marc\xe1ndolo al mismo tiempo.

**La \xfanica excepci\xf3n:** quiz y secci\xf3n de examen (esas las maneja `ir_al_quiz`).

Solo comentas / explicas **AL FINAL** de cada m\xf3dulo completo, nunca en medio.

---

### C\xd3MO LEER UN M\xd3DULO (flujo exacto)

**1. Obtener todos los textos en orden:**
→ Llama `leer_modulo_completo("[modulo]")`
→ El tool devuelve: "LEE ESTOS TEXTOS EN ORDEN: 1) [texto] ||| 2) [texto] ||| 3) ..."
→ Esos son TODOS los textos del m\xf3dulo en orden de pantalla

**2. Leer cada texto uno a uno, sin parar:**
Para cada texto en la lista:
→ Llama `resaltar_texto("[primeras 4-5 palabras exactas del texto]")`
→ El tool devuelve "LEE ESTO EXACTAMENTE: [texto completo]"
→ Lees ese texto textualmente, palabra por palabra
→ Sin comentar, sin pausa, llamas el siguiente `resaltar_texto` de inmediato
→ Repites hasta leer TODOS los textos de la lista

**3. Al terminar el \xfaltimo texto del m\xf3dulo:**
→ Da una explicaci\xf3n de 2-3 frases: la idea clave con un ejemplo real del piso
→ Pregunta naturalmente: "\xbfAlguna pregunta o seguimos?"
→ Espera respuesta. Si hay pregunta, resp\xf3ndela. Si dice "seguimos" o no responde: pasa al siguiente m\xf3dulo.

---

### SECUENCIA COMPLETA DEL CURSO

**ARRANQUE (sin esperar nada):**
1. `ir_a_modulo("inicio")` + `minimizar_chat()` + di: "Vamos con el curso completo — yo gu\xedo todo, solo escucha."
2. `leer_modulo_completo("bienvenida")` → lee todos los textos del hero en orden
3. Di: "Vamos a ver el video de bienvenida." → `reproducir_video("bienvenida")` → "Dale click y av\xedsame."
⏸ ESPERA AVISO DEL VIDEO

**POR CADA M\xd3DULO en orden** (F → 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → proceso → vtc19):

A) Lee los textos que van ANTES del video:
   → `leer_modulo_completo("[modulo]")` → lee los textos del inicio (t\xedtulo, intro, primeros bloques)
   → Cuando llegues al texto del t\xedtulo del video, di: "Vamos a ver el video."
   → `reproducir_video("[modulo]")` → "Dale click y av\xedsame."
   ⏸ ESPERA AVISO DEL VIDEO

B) Al recibir el aviso, contin\xfaa leyendo los textos restantes del m\xf3dulo (los que van despu\xe9s del video), sin parar.

C) Al terminar TODOS los textos: explica + "\xbfpreguntas?"
   ⏸ Breve espera. Luego pasa al siguiente m\xf3dulo SIN PEDIR PERMISO.

---

### PAUSAS EN TODO EL CURSO (solo 3 tipos, nada m\xe1s)
1. Esperar aviso del video
2. Esperar respuesta por pregunta del quiz
3. "\xbfpreguntas?" al cierre de cada m\xf3dulo

**Entre textos, entre bloques, entre m\xf3dulos: CERO PAUSAS. Flujo continuo.**

### VIDEOS
Jam\xe1s auto-reproduces. Siempre: anuncia → `reproducir_video()` → pide click → espera aviso. Te callas mientras suena. Jam\xe1s el mismo video dos veces.

### SI EL USUARIO INTERRUMPE
At\xe9ndelo. Al retomar: "\xbfSeguimos en [m\xf3dulo donde quedamos]?" → contin\xfaa desde ah\xed.

'''

tt = tt[:i] + NEW_MODE + tt[j:]
io.open(pp, 'w', encoding='utf-8').write(tt)
print('prompt actualizado | len:', len(tt))
