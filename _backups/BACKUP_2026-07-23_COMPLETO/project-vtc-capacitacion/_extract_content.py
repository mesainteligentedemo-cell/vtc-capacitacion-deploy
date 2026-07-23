# -*- coding: utf-8 -*-
"""Extrae el contenido educativo real de cada módulo del HTML."""
import io, re

html = io.open('index.html', encoding='utf-8').read()

# Quitar scripts, styles, video tags, quiz/exam sections
html = re.sub(r'<script[\s\S]*?</script>', '', html, flags=re.I)
html = re.sub(r'<style[\s\S]*?</style>', '', html, flags=re.I)
html = re.sub(r'<video[\s\S]*?</video>', '', html, flags=re.I)
html = re.sub(r'<div class="[^"]*quiz[\s\S]*?(?=<div class="content-block|<div class="exam-section|</section)', '', html, flags=re.I)
html = re.sub(r'<div class="exam-section[\s\S]*?</section', '</section', html, flags=re.I)
html = re.sub(r'<nav[\s\S]*?</nav>', '', html, flags=re.I)
html = re.sub(r'<!--[\s\S]*?-->', '', html)

def strip_tags(s):
    s = re.sub(r'<[^>]+>', ' ', s)
    s = re.sub(r'&amp;', '&', s)
    s = re.sub(r'&lt;', '<', s)
    s = re.sub(r'&gt;', '>', s)
    s = re.sub(r'&#[0-9]+;', '', s)
    s = re.sub(r'&[a-z]+;', ' ', s)
    s = re.sub(r'\s+', ' ', s)
    return s.strip()

SECTIONS = [
    ('modulo-f',  'F · Fundamentos del Negocio VTC'),
    ('modulo-0',  '0 · Psicología del Vendedor de Éxito'),
    ('modulo-1',  '1 · Calificación'),
    ('modulo-2',  '2 · El OPC'),
    ('modulo-3',  '3 · Rapport y PNL'),
    ('modulo-4',  '4 · El Tour'),
    ('modulo-5',  '5 · La Presentación'),
    ('modulo-6',  '6 · El Cierre'),
    ('modulo-7',  '7 · Manejo de Objeciones'),
    ('modulo-8',  '8 · TOC y Cierres Alternativos'),
    ('modulo-9',  '9 · Manager Close'),
    ('modulo-10', '10 · PNL Avanzado'),
    ('modulo-11', '11 · Venta por Nacionalidades'),
    ('modulo-12', '12 · Ética y Legal'),
    ('lvc',       'El Proceso VTC — 12 Etapas'),
    ('vtc19',     'VTC 19 — Los 19 Pasos del Pitch'),
]

out_lines = []

for sec_id, sec_name in SECTIONS:
    # Extraer el bloque HTML de esta sección
    pat = r'<section[^>]*id="%s"[\s\S]*?(?=<section[^>]*id="|<!-- ═|$)' % re.escape(sec_id)
    m = re.search(pat, html)
    if not m:
        out_lines.append(f'\n### {sec_name}\n(no encontrado)\n')
        continue
    block = m.group(0)

    # Extraer bloques de contenido uno a uno
    blocks = re.findall(r'<div class="content-block">([\s\S]*?)(?=<div class="content-block"|<div class="exam-section|$)', block)
    if not blocks:
        # fallback: todo el texto
        text = strip_tags(block)[:2000]
        out_lines.append(f'\n### {sec_name}\n{text}\n')
        continue

    section_text = [f'\n### {sec_name}']
    for b in blocks:
        # título del bloque
        t_m = re.search(r'<div class="block-title[^"]*">(.*?)</div>', b, re.I)
        title = strip_tags(t_m.group(1)) if t_m else ''
        body = strip_tags(b)
        body = re.sub(r'\s+', ' ', body).strip()
        # quitar el titulo del body si está duplicado al inicio
        if title and body.startswith(title):
            body = body[len(title):].strip()
        if title:
            section_text.append(f'\n**{title}**')
        if body:
            section_text.append(body[:800])

    out_lines.append('\n'.join(section_text))

result = '\n'.join(out_lines)
io.open('_course_content.md', 'w', encoding='utf-8').write(result)
print(f'Extraído: {len(result)} chars, {len(out_lines)} secciones')
print('\n--- Preview modulo-f ---')
print(result[:600])