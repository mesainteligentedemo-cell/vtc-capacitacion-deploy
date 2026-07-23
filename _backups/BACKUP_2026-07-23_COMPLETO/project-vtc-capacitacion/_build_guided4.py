# -*- coding: utf-8 -*-
p='index.html'; t=open(p,encoding='utf-8').read(); ch=[]

# 1) CSS para resaltar bloque/texto explicado (marcador suave)
hl_anchor='.vtc-hl{ outline:2px solid #c9aa75 !important;'
mark_css='.vtc-mark{ background:rgba(201,170,117,.12) !important; outline:1px solid rgba(201,170,117,.45); border-radius:6px; box-shadow:0 0 26px rgba(201,170,117,.28); transition:background .35s, box-shadow .35s; scroll-margin-top:100px; } '+hl_anchor
if '.vtc-mark{' not in t and hl_anchor in t: t=t.replace(hl_anchor,mark_css,1); ch.append('css-mark')

# 2) tool resaltar_texto (resalta el bloque que contiene esa frase + scroll suave al centro)
anchor="return 'ese modulo no tiene quiz'; }catch(e){ return 'error'; } }\n  };"
newt="""return 'ese modulo no tiene quiz'; }catch(e){ return 'error'; } },
    resaltar_texto: async(p)=>{ try{
        var q=String((p&&(p.texto||p.text||p.frase))||'').toLowerCase().replace(/\\s+/g,' ').trim(); if(q.length<3) return 'sin texto';
        var sels='p,li,h1,h2,h3,h4,blockquote,figcaption,td,.script-note,.quiz-title,.q-text'; var cands=[];
        document.querySelectorAll('[id^=\"modulo-\"],#lvc,#vtc19,#bienvenida,#indice').forEach(function(s){ s.querySelectorAll(sels).forEach(function(el){ var tx=(el.textContent||'').toLowerCase().replace(/\\s+/g,' '); if(tx.indexOf(q)>=0 && tx.length<700) cands.push(el); }); });
        cands.sort(function(a,b){return (a.textContent||'').length-(b.textContent||'').length;});
        var el=cands[0]; if(!el) return 'no encontre ese texto en pantalla';
        try{window.__vtcDrive=Date.now();}catch(e){}
        document.querySelectorAll('.vtc-mark').forEach(function(e){e.classList.remove('vtc-mark');});
        el.classList.add('vtc-mark'); el.scrollIntoView({behavior:'smooth',block:'center'});
        return 'resaltado';
      }catch(e){ return 'error'; } }
  };"""
if 'resaltar_texto' not in t and anchor in t: t=t.replace(anchor,newt,1); ch.append('resaltar_texto')

# 3) auto-scroll por pregunta del quiz (al contestar una, baja a la siguiente sin contestar)
qa="var quizEl=o.closest('.quiz'); if(!quizEl) return;"
qa2=qa+"""
      var _tq=o.closest('.q'); if(_tq){ var _all=[].slice.call(quizEl.querySelectorAll('.q')); var _ix=_all.indexOf(_tq); for(var _i=_ix+1;_i<_all.length;_i++){ if(!_all[_i].classList.contains('answered')){ try{window.__vtcDrive=Date.now();}catch(e){} _all[_i].scrollIntoView({behavior:'smooth',block:'center'}); break; } } }"""
if '_tq=o.closest' not in t and qa in t: t=t.replace(qa,qa2,1); ch.append('quiz-autoscroll')

open(p,'w',encoding='utf-8').write(t)
print('cambios:',ch)