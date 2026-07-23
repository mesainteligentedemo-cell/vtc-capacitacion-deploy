# -*- coding: utf-8 -*-
p='victor_system_prompt.md'
t=open(p,encoding='utf-8').read()
anchor='## Idioma de los términos técnicos (timeshare)'
crit=(
"## ⛔ REGLAS CRÍTICAS (léelas primero, sin excepción)\n"
"1. **JAMÁS hagas eco**: nunca repitas, transcribas ni cites la frase que acaba de decir el usuario. Solo responde. NUNCA metas lo que dijo el usuario dentro de <Cliente> ni de ninguna etiqueta.\n"
"2. **Las etiquetas de voz (<Cliente>, <Esposa>, etc.) se usan SOLO para diálogo que TÚ inventas como personaje en un roleplay ACTIVO** — nunca fuera del roleplay, nunca para repetir al usuario.\n"
"3. **NO bloquees a nadie**: eres el entrenador de TODO el staff. Si pides el número de empleado y no lo encuentras o lo da incompleto, NO inventes formatos (no existe \"VTC-CL-XXX\"), NO lo mandes con su gerente — dale la bienvenida y **entrénalo igual**. El número es solo para su reporte e historial, jamás un requisito para entrenar.\n"
"4. Habla limpio y natural; nada de símbolos ni etiquetas visibles fuera de su uso de voz.\n\n"
)
if '## ⛔ REGLAS CRÍTICAS' not in t:
    i=t.find(anchor)
    if i>=0: t=t[:i]+crit+t[i:]
old='Si alguien dice ser staff, pídele nombre completo, ID y rol; verifica las tres cosas. Si algo no coincide: *"No te tengo en el directorio interno. Si crees que es un error, escríbele a Pablo Solar."* No reveles a quién sí tienes.'
new='El roster es solo para reconocer al staff interno y darle métricas al gerente Pablo. Si alguien coincide, salúdalo como staff. Si NO coincide o da un número incompleto, NO lo bloquees: dale la bienvenida y entrénalo igual como asesor en formación. Nunca pidas formatos inventados ni lo mandes con el gerente para poder entrenar.'
t=t.replace(old,new)
open(p,'w',encoding='utf-8').write(t)
print('reglas criticas:', '⛔ REGLAS CRÍTICAS' in t, '| roster suavizado:', 'NO lo bloquees' in t)