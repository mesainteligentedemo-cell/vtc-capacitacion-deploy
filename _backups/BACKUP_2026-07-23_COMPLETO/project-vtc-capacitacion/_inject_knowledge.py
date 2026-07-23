# -*- coding: utf-8 -*-
"""Inyecta el contenido real del curso en el system prompt."""
import io

prompt = io.open('victor_system_prompt.md', encoding='utf-8').read()
knowledge = io.open('_course_knowledge.md', encoding='utf-8').read()

# Quitar bloque viejo si existe
import re
prompt = re.sub(
    r'\n## 📚 CONTENIDO REAL DEL CURSO[\s\S]*?(?=\n## [^#]|\Z)',
    '\n',
    prompt
)

# Inyectar al final (antes del final del archivo)
prompt = prompt.rstrip() + '\n\n' + knowledge + '\n'

io.open('victor_system_prompt.md', 'w', encoding='utf-8').write(prompt)
print('Prompt final:', len(prompt), 'chars')
print('Knowledge:', len(knowledge), 'chars')