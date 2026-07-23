# -*- coding: utf-8 -*-
p='index.html'; t=open(p,encoding='utf-8').read(); ch=[]

# 1) Refresh siempre al hero (no restaurar scroll)
flag='let conv=null,connecting=false,muted=false,started=false;'
flag2=flag+" try{history.scrollRestoration='manual';}catch(e){} try{window.scrollTo(0,0);}catch(e){} window.addEventListener('load',function(){try{window.scrollTo(0,0);}catch(e){}});"
if 'scrollRestoration' not in t and flag in t: t=t.replace(flag,flag2,1); ch.append('refresh-hero')

# 2) MAP: inicio/cero/principio/header -> hero (__top)
old_map="const MAP={'inicio':'bienvenida','curso':'bienvenida','principio':'bienvenida','top':'__top','h1':'__top','arriba':'__top','indice':'indice','modulos':'indice','todos':'indice','f':'modulo-f','fundamentos':'modulo-f','proceso':'lvc','lvc':'lvc','club':'lvc','vtc19':'vtc19','vtc 19':'vtc19','19':'vtc19','bienvenida':'bienvenida','fin':'modulo-FIN','cierre-curso':'modulo-FIN'};"
new_map="const MAP={'inicio':'__top','cero':'__top','desde cero':'__top','principio':'__top','header':'__top','curso':'__top','top':'__top','h1':'__top','arriba':'__top','indice':'indice','modulos':'indice','todos':'indice','f':'modulo-f','fundamentos':'modulo-f','proceso':'lvc','lvc':'lvc','club':'lvc','vtc19':'vtc19','vtc 19':'vtc19','19':'vtc19','bienvenida':'bienvenida','fin':'modulo-FIN','cierre-curso':'modulo-FIN'};"
if old_map in t: t=t.replace(old_map,new_map,1); ch.append('map-hero')

# 3) Reportar PROGRESO guardado a Victor al conectar
ab='await connect({name,emp,dep,hist,firstMessage});'
ab2=ab+'''
    try{ var _q={},_v={}; try{_q=JSON.parse(localStorage.getItem('vtc_quiz_v1')||'{}');}catch(e){} try{_v=JSON.parse(localStorage.getItem('vtc_video_v1')||'{}');}catch(e){}
      var _msg='[PROGRESO] Quizzes con avance en: '+(Object.keys(_q).join(', ')||'ninguno')+'. Videos vistos: '+Object.keys(_v).length+'.';
      if(conv && conv.sendContextualUpdate) conv.sendContextualUpdate(_msg);
    }catch(e){}'''
if '[PROGRESO]' not in t and ab in t: t=t.replace(ab,ab2,1); ch.append('progreso')

open(p,'w',encoding='utf-8').write(t)
print('cambios:',ch)