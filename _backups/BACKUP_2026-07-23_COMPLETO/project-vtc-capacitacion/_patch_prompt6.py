# -*- coding: utf-8 -*-
p='victor_system_prompt.md'; t=open(p,encoding='utf-8').read()
anchor='`<EsposaEN>` (mujer) · `<HijoEN>` (joven).'
add=anchor+'''
- **Mujeres con acento (inglés):** `<AmericanaF>` · `<BritanicaF>` · `<AustralianaF>` · `<InduF>` · `<ItalianaF>`.
- **Por EDAD:** mujer joven → `<MujerJoven>`, madura → `<Esposa>`, mayor → `<Abuela>`. Hombre joven → `<HombreJoven>` o `<Hijo>`, adulto → `<Cliente>`, mayor → `<Abuelo>`. Elige SIEMPRE la voz que corresponda a la edad y al género que te pidan.'''
if '<AmericanaF>' not in t and anchor in t:
    t=t.replace(anchor,add,1)
open(p,'w',encoding='utf-8').write(t)
print('femeninas+edad:', '<AmericanaF>' in t and 'Por EDAD' in t)