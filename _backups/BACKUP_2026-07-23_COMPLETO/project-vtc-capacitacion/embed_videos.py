# -*- coding: utf-8 -*-
"""Inserta <div class=lesson-video> tras el subtitulo de cada modulo que aun no tiene video."""
import re
F=r"C:\Users\inbou\vtc-capacitacion-deploy\index.html"
html=open(F,encoding="utf-8").read()

# section id -> video slug (sin extension)
MAP={
 "modulo-4":"modulo-M4","modulo-5":"modulo-M5","modulo-6":"modulo-M6","modulo-7":"modulo-M7",
 "modulo-8":"modulo-M8","modulo-9":"modulo-M9","modulo-10":"modulo-M10","modulo-11":"modulo-M11",
 "modulo-12":"modulo-M12","lvc":"modulo-PV",
}
def vid(slug):
    return (f'<div class="lesson-video feature"><video controls preload="none" playsinline '
            f'poster="/videos/{slug}.jpg"><source src="/videos/{slug}.mp4" type="video/mp4"></video></div>')

# trocear por secciones para acotar el id correcto
parts=re.split(r'(<section class="module-section" id=")', html)
out=[parts[0]]
for i in range(1,len(parts),2):
    sep=parts[i]; body=parts[i+1]
    mid=body[:body.find('"')]
    if mid in MAP and 'lesson-video' not in body[:body.find('</section>')]:
        # insertar tras el primer </p> (subtitulo) de la seccion
        idx=body.find('</p>')
        if idx!=-1:
            ins=idx+4
            body=body[:ins]+'\n      '+vid(MAP[mid])+body[ins:]
            print("embed",mid,"->",MAP[mid])
        else:
            print("NO <p> en",mid)
    out.append(sep); out.append(body)
open(F,"w",encoding="utf-8").write("".join(out))
print("EMBEDS LISTOS")
