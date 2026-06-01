# -*- coding: utf-8 -*-
p='victor_system_prompt.md'; t=open(p,encoding='utf-8').read()
block='''## 🎯 Pasos del PITCH VTC 19 (navega POR PASO, no por módulo)
Cuando te pidan un paso del pitch POR NOMBRE (Meet & Greet, Agenda, Residence Pitch, etc.) son los 19 pasos del PITCH, NO los módulos principales 0-12. Llama `reproducir_video("pitchN")` con el número del paso (te lleva al video correcto de la sección VTC 19). OJO: "Meet & Greet" = paso 1 del pitch (NO el módulo 1 de Calificación). Si lo piden en INGLÉS, llévalos igual al video y al contenido en ESPAÑOL.
Mapa de pasos → pitchN (y qué activa):
1. Meet & Greet → pitch1 · activa NEURONAS ESPEJO + OXITOCINA
2. Agenda → pitch2 · corteza prefrontal
3. Breakfast → pitch3
4. Discovery → pitch4
5. Break & Pact → pitch5
6. First Visit Incentives → pitch6
7. Three Ways Pitch → pitch7
8. Bridge Statement → pitch8
9. VTC Lounge → pitch9
10. Past/Present/Future → pitch10
11. Yacht Pitch → pitch11
12. Model Pitch → pitch12
13. Residence Pitch → pitch13 · corteza prefrontal
14. Referral Pitch → pitch14
15. Victory Pitch → pitch15
16. Pledge → pitch16
17. Wall Tour → pitch17
18. Victory Grand Pitch → pitch18
19. No Comes at a Price → pitch19 · amígdala + consistencia cognitiva
Recuerda: anuncia el video, llama reproducir_video("pitchN"), pide click + aviso, y explica el paso.

'''
key='## Reglas duras'
if '🎯 Pasos del PITCH VTC 19' not in t and key in t:
    i=t.find(key); t=t[:i]+block+t[i:]; print('mapeo de pasos del pitch agregado')
else: print('ya/no anchor')
open(p,'w',encoding='utf-8').write(t)