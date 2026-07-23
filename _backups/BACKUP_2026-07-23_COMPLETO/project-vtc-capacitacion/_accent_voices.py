# -*- coding: utf-8 -*-
# Busca en la biblioteca compartida y agrega a la cuenta voces por acento (ES e IN).
import json,urllib.request,urllib.parse,urllib.error
API='sk_87d5a7899d6c489c94232248c4880a0c4fe317adb3701e67'
H={'xi-api-key':API}
def get(u):
    r=urllib.request.Request(u,headers=H)
    with urllib.request.urlopen(r,timeout=30) as x: return json.loads(x.read().decode())
def post(u,b):
    r=urllib.request.Request(u,data=json.dumps(b).encode('utf-8'),method='POST',headers={**H,'Content-Type':'application/json'})
    with urllib.request.urlopen(r,timeout=30) as x: return json.loads(x.read().decode())

# tag -> (search, language, gender)
WANT=[
 ('Argentino','argentino argentina porteño','es','male'),
 ('Colombiano','colombiano colombia','es','male'),
 ('Venezolano','venezolano venezuela','es','male'),
 ('Cubano','cubano cuba','es','male'),
 ('Boricua','puerto rico boricua','es','male'),
 ('Dominicano','dominicano republica dominicana','es','male'),
 ('Espanol','español de españa castellano madrid','es','male'),
 ('AmericanoEN','american english confident','en','male'),
 ('BritanicoEN','british english london','en','male'),
 ('AustralianoEN','australian english','en','male'),
 ('InduEN','indian accent english','en','male'),
 ('ArabeEN','arabic accent english middle eastern','en','male'),
 ('ItalianoEN','italian accent english','en','male'),
 ('SudafricanoEN','south african accent english','en','male'),
 ('AsiaticoEN','asian accent english chinese','en','male'),
]
results={}
for tag,q,lang,gender in WANT:
    try:
        u='https://api.elevenlabs.io/v1/shared-voices?'+urllib.parse.urlencode({'search':q,'language':lang,'gender':gender,'page_size':3})
        d=get(u); vs=d.get('voices',[])
        if not vs:
            d=get('https://api.elevenlabs.io/v1/shared-voices?'+urllib.parse.urlencode({'search':q,'page_size':3})); vs=d.get('voices',[])
        if not vs: print(tag,'-> SIN MATCH'); continue
        v=vs[0]; pid=v.get('public_owner_id'); vid=v.get('voice_id'); nm=v.get('name')
        try:
            add=post(f'https://api.elevenlabs.io/v1/voices/add/{pid}/{vid}',{'new_name':'VTC '+tag})
            newid=add.get('voice_id',vid)
        except urllib.error.HTTPError as e:
            # ya existe o limite: usa el vid original
            newid=vid; print(tag,'add warn',e.code)
        results[tag]={'voice_id':newid,'name':nm,'accent':v.get('accent'),'lang':lang}
        print(tag,'->',nm,'|',v.get('accent'),'|',newid)
    except Exception as e:
        print(tag,'ERR',str(e)[:120])
json.dump(results,open('_accent_voices.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('\nTOTAL agregadas:',len(results))