# -*- coding: utf-8 -*-
"""Construye el bloque de conocimiento del curso para el system prompt."""
import io, re, sys

# Forzar UTF-8 en stdout
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

html = io.open('index.html', encoding='utf-8').read()

# Limpiar tags no relevantes
html = re.sub(r'<script[\s\S]*?</script>', '', html, flags=re.I)
html = re.sub(r'<style[\s\S]*?</style>', '', html, flags=re.I)
html = re.sub(r'<video[\s\S]*?</video>', '', html, flags=re.I)
html = re.sub(r'<source[^>]*>', '', html, flags=re.I)
html = re.sub(r'<nav[\s\S]*?</nav>', '', html, flags=re.I)
html = re.sub(r'<!--[\s\S]*?-->', '', html)

def clean(s):
    s = re.sub(r'<[^>]+>', ' ', s)
    for e, r in [('&amp;','&'),('&lt;','<'),('&gt;','>'),('&nbsp;',' '),('&#[0-9]+;',''),('&[a-z]+;',' ')]:
        s = re.sub(e, r, s)
    return re.sub(r'\s+', ' ', s).strip()

def extract_section(html_str, sec_id):
    """Extrae el HTML entre <section id="X"> y el siguiente <section"""
    pat = r'(<section[^>]*id="%s"[\s\S]*?)(?=<section[^>]*id="|<!-- ═{5}|<footer)' % re.escape(sec_id)
    m = re.search(pat, html_str)
    return m.group(1) if m else ''

def extract_blocks(section_html):
    """Extrae bloques de contenido: título + texto."""
    # quitar quiz/exam
    section_html = re.sub(r'<div class="[^"]*quiz[\s\S]*', '', section_html, flags=re.I)
    section_html = re.sub(r'<div class="exam-section[\s\S]*', '', section_html, flags=re.I)

    # título del módulo
    title_m = re.search(r'<h2[^>]*class="module-title[^"]*">(.*?)</h2>', section_html, re.I)
    subtitle_m = re.search(r'<p[^>]*class="module-subtitle[^"]*">(.*?)</p>', section_html, re.I)
    module_id_m = re.search(r'<div[^>]*class="module-id[^"]*">(.*?)</div>', section_html, re.I)

    parts = []
    if module_id_m:
        parts.append('ROLES/REQUISITO: ' + clean(module_id_m.group(1)))
    if subtitle_m:
        parts.append('INTRO: ' + clean(subtitle_m.group(1)))

    # content-blocks
    for b in re.findall(r'<div class="content-block">([\s\S]*?)(?=<div class="content-block"|<div class="exam-section|$)', section_html):
        t_m = re.search(r'<div class="block-title[^"]*">(.*?)</div>', b, re.I)
        btitle = clean(t_m.group(1)) if t_m else ''
        btext = clean(b)
        if btitle and btext.startswith(btitle):
            btext = btext[len(btitle):].strip()
        entry = ''
        if btitle:
            entry = '• ' + btitle + ': ' + btext[:600]
        elif btext:
            entry = btext[:600]
        if entry:
            parts.append(entry)

    return '\n'.join(parts)

SECTIONS = [
    ('modulo-f',  'MÓDULO F — Fundamentos del Negocio VTC'),
    ('modulo-0',  'MÓDULO 0 — Psicología del Vendedor de Éxito'),
    ('modulo-1',  'MÓDULO 1 — Calificación'),
    ('modulo-2',  'MÓDULO 2 — El OPC'),
    ('modulo-3',  'MÓDULO 3 — Rapport y PNL'),
    ('modulo-4',  'MÓDULO 4 — El Tour'),
    ('modulo-5',  'MÓDULO 5 — La Presentación'),
    ('modulo-6',  'MÓDULO 6 — El Cierre'),
    ('modulo-7',  'MÓDULO 7 — Manejo de Objeciones'),
    ('modulo-8',  'MÓDULO 8 — TOC y Cierres Alternativos'),
    ('modulo-9',  'MÓDULO 9 — Manager Close'),
    ('modulo-10', 'MÓDULO 10 — PNL Avanzado'),
    ('modulo-11', 'MÓDULO 11 — Venta por Nacionalidades'),
    ('modulo-12', 'MÓDULO 12 — Ética y Legal'),
    ('lvc',       'EL PROCESO VTC — 12 Etapas'),
    ('vtc19',     'VTC 19 — Los 19 Pasos del Pitch'),
]

lines = ['## 📚 CONTENIDO REAL DEL CURSO (lo que está escrito en cada módulo — úsalo para explicar, no para leer mecánicamente)\n']
lines.append('Cuando estés en el modo guiado o explicando un módulo, ESTE es el contenido que tienes en pantalla. Úsalo para:\n1. Saber qué frase exacta pasar a resaltar_texto\n2. Explicar con tus propias palabras (no leer textualmente)\n3. Dar ejemplos y conectar con la realidad del piso\n')

total_chars = 0
for sec_id, sec_name in SECTIONS:
    sec_html = extract_section(html, sec_id)
    if not sec_html:
        lines.append(f'\n### {sec_name}\n(sin contenido extraído)\n')
        continue
    content = extract_blocks(sec_html)
    if not content:
        content = clean(sec_html)[:1000]
    # limitar por sección para no exceder el prompt
    content = content[:2000]
    total_chars += len(content)
    lines.append(f'\n### {sec_name}\n{content}\n')

result = '\n'.join(lines)
io.open('_course_knowledge.md', 'w', encoding='utf-8').write(result)
print(f'Total: {total_chars} chars en {len(SECTIONS)} módulos')
print('\n--- Preview F ---')
preview = [l for l in result.split('\n') if l.strip()][:20]
print('\n'.join(preview))