"""Embebe los 21 videos en index.html (seccion VTC19) + alinea marcas + CSS."""
import re

p = 'index.html'
h = open(p, encoding='utf-8').read()

# ---------- 1) CSS del player (insertar tras el bloque .script-note) ----------
css = """
/* LESSON VIDEO */
.lesson-video{margin:0 0 1.25rem;}
.lesson-video video{width:100%;display:block;border:1px solid var(--faint);border-radius:6px;background:#000;aspect-ratio:16/9;}
.lesson-video.feature video{border-color:rgba(184,154,106,.45);}
.lesson-cap{font-size:.6rem;letter-spacing:.18em;text-transform:uppercase;color:var(--gold3);margin-top:.5rem;}
"""
h = h.replace(".script-note{font-size:.78rem;color:var(--muted);margin-top:.75rem;font-style:normal;}",
              ".script-note{font-size:.78rem;color:var(--muted);margin-top:.75rem;font-style:normal;}\n" + css, 1)

# ---------- 2) Acotar a la seccion VTC19 ----------
a = h.find('id="vtc19"')
b = h.find('<footer>')
head, sec, tail = h[:a], h[a:b], h[b:]

# ---------- 3) Alinear marcas (solo en VTC19, video+texto coinciden) ----------
for old, new in [
    ('Preferred Lounge', 'VTC Lounge'),
    ('Vitara by VTC', 'Victory'),
    ('Vitara Pitch', 'Victory Pitch'),
    ('Vitara', 'Victory'),
    ('Programa Impression VTC', 'Programa Victory Grand VTC'),
    ('Impression Pitch', 'Victory Grand Pitch'),
    ('miembros Impression', 'miembros Victory Grand'),
    ('Programa Impression', 'Programa Victory Grand'),
    ('$349K Impression', '$349K Victory Grand'),
    ('Impression:', 'Victory Grand:'),
    ('Impression VTC', 'Victory Grand VTC'),
    ('Impression', 'Victory Grand'),
]:
    sec = sec.replace(old, new)

def vid(slug, feature=False):
    cls = 'lesson-video feature' if feature else 'lesson-video'
    return (f'\n        <div class="{cls}"><video controls preload="none" playsinline '
            f'poster="/videos/{slug}.jpg"><source src="/videos/{slug}.mp4" type="video/mp4"></video></div>')

# ---------- 4) Video por cada Modulo N (tras su script-label) ----------
def insert_after_label(m):
    label = m.group(1); num = int(m.group(2))
    return label + vid(f'modulo-{num:02d}')
sec = re.sub(r'(<div class="script-label">Módulo (\d+)[^<]*</div>)', insert_after_label, sec)

# ---------- 5) Intro M00 (tras la subtitle de la seccion) ----------
sub_end = sec.find('</p>', sec.find('module-subtitle'))
if sub_end != -1:
    sub_end += len('</p>')
    intro = ('\n\n    <div class="content-block">\n      <div class="block-title">Módulo 0 · Introducción al Pitch VTC 19</div>'
             + vid('modulo-00', feature=True).replace('        ', '      ')
             + '\n    </div>')
    sec = sec[:sub_end] + intro + sec[sub_end:]

# ---------- 6) Bonus (en el bloque de los 11 principios, antes del grid) ----------
anchor = 'Los 11 Principios de Neurociencia — resumen de aplicación</div>'
if anchor in sec:
    sec = sec.replace(anchor, anchor + vid('bonus', feature=True).replace('        ', '      '), 1)

h = head + sec + tail
open(p, 'w', encoding='utf-8').write(h)

# reporte
import re as _r
print('videos por modulo insertados:', len(_r.findall(r'/videos/modulo-\d\d\.mp4', h)))
print('intro M00:', '/videos/modulo-00.mp4' in h)
print('bonus:', '/videos/bonus.mp4' in h)
print('marcas restantes en VTC19 (debe ser solo plan-tier Preferred):',
      _r.findall(r'Preferred|Vitara|Impression', h[h.find('id=\"vtc19\"'):h.find('<footer>')]))