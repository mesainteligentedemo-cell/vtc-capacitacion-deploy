# -*- coding: utf-8 -*-
p='victor_system_prompt.md'; t=open(p,encoding='utf-8').read(); ch=[]

# REGLA ABSOLUTA del video -> manual
import re
i=t.find('⚠️ **REGLA ABSOLUTA DEL VIDEO')
if i>=0:
    j=t.find('\n',i+5)
    # reemplazar el parrafo completo (hasta doble salto)
    end=t.find('\n\n',i)
    if end<0: end=t.find('\n',i+200)
    nuevo='⚠️ **REGLA ABSOLUTA DEL VIDEO (manual, en TODOS los módulos):** 1) Anuncia el video en voz (qué módulo y de qué trata). 2) Llama `reproducir_video(modulo)` (lleva al video y lo encuadra con su título y contenido). 3) DILE al usuario que le **dé CLICK al video** para reproducirlo y que te **avise** ("listo" o "ya terminé") cuando lo haya visto completo. 4) TÚ NO reproduces el video; **espera su aviso** y recién entonces continúas. Mientras el video suena, te callas (el sistema te silencia para no encimar audio). Jamás sigas sin que confirme que terminó.'
    t=t[:i]+nuevo+t[end:]; ch.append('regla-absoluta-manual')

reps=[
 ('se reproduce el video "Bienvenido a tu Capacitación VTC" y TÚ te quedas callado hasta que termina.',
  'pídele que le dé CLICK al video de bienvenida y que te avise cuando lo termine; tú te quedas callado mientras suena.'),
 ('→ llama `reproducir_video(modulo)` (callado hasta que acabe).',
  '→ llama `reproducir_video(modulo)`, luego pídele que le dé click al video y te avise cuando termine (tú callado mientras suena).'),
 ('Llama `reproducir_video("bienvenida")` (se reproduce el video "Bienvenido a tu Capacitación VTC" y TÚ te quedas callado hasta que termina).',
  'Llama `reproducir_video("bienvenida")`, pídele que le dé click al video y te avise al terminar.'),
 ('Si recibes un mensaje "(EL USUARIO PAUSÓ…)", dile con calma que necesita TERMINAR de ver el video completo para poder avanzar; cuando te confirme que ya, vuelve a reproducirlo con reproducir_video del mismo módulo.',
  'Espera siempre a que el usuario te avise que terminó el video antes de continuar.'),
]
for a,b in reps:
    if a in t: t=t.replace(a,b,1); ch.append('rep')

open(p,'w',encoding='utf-8').write(t)
print('cambios:',ch)