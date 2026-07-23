# -*- coding: utf-8 -*-
"""
Cambio mayor:
1. resaltar_texto: desactiva el karaoke palabra-por-palabra, solo mantiene el marco dorado en el bloque
2. Prompt: Victor ya no lee, EXPLICA cada párrafo en sus propias palabras (1-2 frases, fluido)
3. Al inicio: overview rápido de todos los módulos antes de entrar al primero
"""
import io, re

# ─── index.html: desactivar el karaoke, mantener marco dorado ───
p = 'index.html'
t = io.open(p, encoding='utf-8').read()

# Quitar el bloque de karaoke (el TreeWalker + setInterval de 320ms)
# Mantener: el scroll, el vtc-mark, el vtcMobMin
OLD_KARAOKE = r"""        try{
          if(!el.__vwWrapped){
            el.__vwWrapped=1;
            var nodes=[]; var tw=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null,false);
            var tn; while((tn=tw.nextNode())) nodes.push(tn);
            nodes.forEach(function(tn){
              var frag=document.createDocumentFragment();
              tn.textContent.split(/(\s+)/).forEach(function(tok){
                if(/\S/.test(tok)){var sp=document.createElement('span');sp.className='vtc-word';sp.textContent=tok;frag.appendChild(sp);}
                else if(tok) frag.appendChild(document.createTextNode(tok));
              });
              tn.parentNode.replaceChild(frag,tn);
            });
          }
          var words=Array.prototype.slice.call(el.querySelectorAll('.vtc-word'));
          if(words.length){
            words.forEach(function(s){s.classList.remove('on');});
            if(window.__vwT){clearInterval(window.__vwT);window.__vwT=null;}
            if(window.__vwLead){clearTimeout(window.__vwLead);window.__vwLead=null;}
            var k=0;
            window.__vwLead=setTimeout(function(){
              window.__vwT=setInterval(function(){
                if(k>0&&words[k-1]) words[k-1].classList.remove('on');
                if(k<words.length){words[k].classList.add('on');k++;}
                else{clearInterval(window.__vwT);window.__vwT=null;}
              },320);
            },550);
          }
        }catch(e){}"""

# Lo reemplazamos con nada (el bloque vtc-mark ya hace el highlight visual)
NEW_KARAOKE = "        /* karaoke desactivado — marco dorado en el bloque es suficiente */"

if OLD_KARAOKE in t:
    t = t.replace(OLD_KARAOKE, NEW_KARAOKE, 1)
    print('karaoke desactivado OK')
else:
    print('WARN: karaoke patron no encontrado')

io.open(p, 'w', encoding='utf-8').write(t)

# Validar JS
import subprocess, os
subprocess.run(['node','-e','const fs=require("fs");const h=fs.readFileSync("index.html","utf8");const m=h.match(/<script type="module">([\\s\\S]*?)<\\/script>/);fs.writeFileSync("_w.mjs",m[1]);'],capture_output=True)
r2 = subprocess.run(['node','--check','_w.mjs'],capture_output=True,text=True)
print('JS:', 'OK' if r2.returncode==0 else 'ERR: '+r2.stderr[:200])
try: os.remove('_w.mjs')
except: pass

# ─── Prompt: Victor explica, no lee ───
pp = 'victor_system_prompt.md'
tt = io.open(pp, encoding='utf-8').read()

# 1) Reescribir CÓMO USAR resaltar_texto
old_sec = u'''## \U0001f4dd CÓMO USAR resaltar_texto

`resaltar_texto(frase)` hace DOS cosas a la vez:
1. Resalta el bloque en pantalla con marco dorado y arranca el karaoke palabra por palabra
2. Te devuelve el texto exacto del bloque

**REGLA ABSOLUTA: SIEMPRE llama `resaltar_texto` ANTES de leer cualquier texto del curso.** Sin excepción. Cada párrafo, cada frase, cada bullet — primero el tool, luego lees. El karaoke marca cada palabra en pantalla mientras hablas.

**Flujo correcto:** `resaltar_texto("primeras 4-5 palabras exactas")` → el tool devuelve el texto → lees ese texto tal cual, sin parafrasear, sin agregar nada. Al terminar → siguiente `resaltar_texto` de inmediato.

**Textos fuera del HTML** (explicaciones tuyas, feedback del quiz, comentarios): esos NO van con resaltar_texto — son tu voz libre. Solo los textos que existen en pantalla se marcan.

**Si devuelve "NO ENCONTRADO":** usa 3-4 palabras más cortas y exactas del mismo bloque.'''

new_sec = u'''## \U0001f4dd CÓMO USAR resaltar_texto

`resaltar_texto(frase)` resalta el bloque en pantalla con **marco dorado** y hace scroll hacia él. El usuario ve qué bloque estás explicando.

**Flujo correcto por bloque:**
→ Llama `resaltar_texto("primeras 4-5 palabras exactas del bloque")`
→ El bloque queda enmarcado en dorado en pantalla
→ TÚ explicas ese bloque en **1-2 frases propias**, breve y directo — NO leas el texto textualmente
→ Llama el siguiente `resaltar_texto` de inmediato y explica el siguiente bloque

**Regla:** habla como maestro, no como lector. "Aquí habla de..." → NO. "Esto significa que..." → SÍ.

**Si devuelve "NO ENCONTRADO":** usa 3-4 palabras más cortas y exactas del mismo bloque.'''

if old_sec in tt:
    tt = tt.replace(old_sec, new_sec, 1)
    print('seccion resaltar_texto reescrita')
else:
    print('WARN: seccion no encontrada exacta — haciendo patch linea a linea')
    tt = tt.replace('lees ese texto tal cual, sin parafrasear, sin agregar nada', 'explicas ese bloque en 1-2 frases propias, sin leerlo textualmente')
    tt = tt.replace('El karaoke marca cada palabra en pantalla mientras hablas', 'El marco dorado en el bloque indica al usuario qué estás explicando')
    tt = tt.replace('ANTES de leer cualquier texto del curso', 'ANTES de explicar cualquier bloque del curso')
    tt = tt.replace('Cada párrafo, cada frase, cada bullet — primero el tool, luego lees', 'Cada párrafo, cada bloque — primero el tool (marco dorado), luego explicas')

# 2) En el FLUJO POR MÓDULO: cambiar "Lee textos" por "Explica bloques"
replacements = [
    ('→ Llama `resaltar_texto("[primeras 4-5 palabras exactas del bloque]")`\n→ Lee el texto que devuelve el tool, palabra por palabra\n→ Sin comentar entre textos — flujo continuo hasta el último texto',
     '→ Llama `resaltar_texto("[primeras 4-5 palabras exactas del bloque]")`\n→ El bloque queda resaltado en dorado — explícalo en 1-2 frases propias, breve y directo\n→ Sin pausas largas entre bloques — flujo continuo hasta el último bloque del módulo'),

    ('→ Lees ese texto, palabra por palabra',
     '→ Lo explicas en 1-2 frases propias, breve'),

    ('→ Lee el texto que devuelve el tool',
     '→ Explica ese bloque en 1-2 frases propias'),

    ('→ Lee cada texto uno a uno con resaltar_texto',
     '→ Explica cada bloque con resaltar_texto'),

    ('→ lee todos los textos del hero en orden',
     '→ explica brevemente el hero: qué es VTC, los números (16 módulos, 19 pasos, etc.)'),

    ('2. `leer_modulo_completo("bienvenida")` → lee todos los textos del hero (sin video aún)',
     '2. Explica el hero en 2-3 frases: qué es el curso, para quién es, qué van a dominar'),
]

changed = 0
for old, new in replacements:
    if old in tt:
        tt = tt.replace(old, new)
        changed += 1

print(f'prompt: {changed} reemplazos de lectura→explicación')

# 3) Agregar regla de OVERVIEW RÁPIDO AL INICIO del modo guiado
anchor = u'**ARRANQUE (sin esperar nada):**'
overview_rule = u'''**OVERVIEW AL INICIO (antes de entrar al primer módulo):**
Después del video de bienvenida, da un overview ultrarrápido de todos los módulos: 1 frase por módulo, fluido, como si estuvieras vendiendo el curso. "El módulo F cubre los fundamentos del negocio. El 0 trabaja tu mentalidad como vendedor. El 1 te enseña a calificar bien desde el OPC..." — recórrelos todos en 60-90 segundos sin detenerte. Luego entras al primer módulo.

'''

if anchor in tt and 'OVERVIEW AL INICIO' not in tt:
    tt = tt.replace(anchor, overview_rule + anchor, 1)
    print('overview rápido agregado')

io.open(pp, 'w', encoding='utf-8').write(tt)
print('prompt len:', len(tt))