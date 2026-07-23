# -*- coding: utf-8 -*-
import io, re

p = 'index.html'
t = io.open(p, encoding='utf-8').read()

# Localizar resaltar_texto exactamente
i = t.find('    resaltar_texto: async(p)=>{ try{')
j = t.find('\n    minimizar_chat:')
assert i > 0 and j > i, f'anchors no encontrados i={i} j={j}'

NEW = """    resaltar_texto: async(p)=>{ try{
        var q=String((p&&(p.texto||p.text||p.frase))||'').toLowerCase().replace(/\\s+/g,' ').trim();
        if(q.length<3) return 'sin texto';
        var sels='p,li,h1,h2,h3,h4,blockquote,.script-text,.script-note,.block-title,.step-title,.step-text,.tiedown-list li,.comp-items li,.module-subtitle,.module-id';
        var cands=[];
        document.querySelectorAll('[id^="modulo-"],#lvc,#vtc19,#bienvenida,#indice').forEach(function(s){
          s.querySelectorAll(sels).forEach(function(el){
            var tx=(el.textContent||'').toLowerCase().replace(/\\s+/g,' ');
            if(tx.indexOf(q)>=0 && tx.length<900) cands.push(el);
          });
        });
        cands.sort(function(a,b){return (a.textContent||'').length-(b.textContent||'').length;});
        var el=cands[0];
        if(!el) return 'NO ENCONTRADO: '+q.slice(0,50)+'. Usa una frase MAS CORTA y EXACTA.';
        try{window.__vtcDrive=Date.now();}catch(e){}
        document.querySelectorAll('.vtc-mark').forEach(function(x){x.classList.remove('vtc-mark');});
        el.classList.add('vtc-mark');
        el.scrollIntoView({behavior:'smooth',block:'center'});
        vtcMobMin();
        var rawText=(el.textContent||'').replace(/\\s+/g,' ').trim();
        try{
          if(!el.__vwWrapped){
            el.__vwWrapped=1;
            var nodes=[]; var tw=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null,false);
            var tn; while((tn=tw.nextNode())) nodes.push(tn);
            nodes.forEach(function(tn){
              var frag=document.createDocumentFragment();
              tn.textContent.split(/(\\s+)/).forEach(function(tok){
                if(/\\S/.test(tok)){var sp=document.createElement('span');sp.className='vtc-word';sp.textContent=tok;frag.appendChild(sp);}
                else if(tok) frag.appendChild(document.createTextNode(tok));
              });
              tn.parentNode.replaceChild(frag,tn);
            });
          }
          var words=Array.prototype.slice.call(el.querySelectorAll('.vtc-word'));
          if(words.length){
            words.forEach(function(s){s.classList.remove('on');});
            if(window.__vwT){clearInterval(window.__vwT);window.__vwT=null;}
            if(window.__vwLead){clearTimeout(window.__vwLead);window.__vwLead=null;}
            var k=0;
            window.__vwLead=setTimeout(function(){
              window.__vwT=setInterval(function(){
                if(k>0&&words[k-1]) words[k-1].classList.remove('on');
                if(k<words.length){words[k].classList.add('on');k++;}
                else{clearInterval(window.__vwT);window.__vwT=null;}
              },320);
            },550);
          }
        }catch(e){}
        return 'LEE ESTO EXACTAMENTE (palabra por palabra, sin agregar ni cambiar nada): '+rawText;
      }catch(e){ return 'error'; } },
"""

t = t[:i] + NEW + t[j:]
io.open(p, 'w', encoding='utf-8').write(t)
print('resaltar_texto reescrito OK · len:', len(t))