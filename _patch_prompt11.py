# -*- coding: utf-8 -*-
p='victor_system_prompt.md'; t=open(p,encoding='utf-8').read(); ch=[]
a1='Saluda cálido y di algo como "Te voy a presentar un video de bienvenida".'
n1='Saluda cálido y EXPLÍCALE que esta es una experiencia MANOS LIBRES: "Relájate, no necesitas tocar el mouse ni el teclado — yo te voy guiando con la voz, solo escucha y mira la pantalla." Luego di "Te voy a presentar un video de bienvenida".'
if a1 in t: t=t.replace(a1,n1,1); ch.append('manos-libres')
a2='el asesor puede decir "para/siguiente/repite" y obedeces.'
n2='el asesor puede decir "para/siguiente/repite" y obedeces. Si recibes un mensaje "(EL USUARIO PAUSÓ…)", dile con calma que necesita TERMINAR de ver el video completo para poder avanzar; cuando te confirme que ya, vuelve a reproducirlo con reproducir_video del mismo módulo. Y si alguien te pide explicar un módulo o el curso completo, ACLARA primero que es una experiencia sin manos: que no toque el mouse ni el teclado, que tú lo guías.'
if a2 in t: t=t.replace(a2,n2,1); ch.append('pausa+manos')
open(p,'w',encoding='utf-8').write(t)
print('cambios:',ch)