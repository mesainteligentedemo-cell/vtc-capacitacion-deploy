# -*- coding: utf-8 -*-
import json,urllib.request,urllib.parse,urllib.error
API='sk_87d5a7899d6c489c94232248c4880a0c4fe317adb3701e67'; H={'xi-api-key':API}
AG='agent_9501k3vkt6svekjs6y0qe5xzcek1'; B=f'https://api.elevenlabs.io/v1/convai/agents/{AG}'
def get(u):
    with urllib.request.urlopen(urllib.request.Request(u,headers=H),timeout=30) as x: return json.loads(x.read().decode())
def post(u,b):
    with urllib.request.urlopen(urllib.request.Request(u,data=json.dumps(b).encode(),method='POST',headers={**H,'Content-Type':'application/json'}),timeout=30) as x: return json.loads(x.read().decode())
def req(m,u,b=None):
    d=json.dumps(b).encode('utf-8') if b is not None else None
    with urllib.request.urlopen(urllib.request.Request(u,data=d,method=m,headers={**H,'Content-Type':'application/json'})) as x: return json.loads(x.read().decode())

# label -> (accent, gender, preferred_age)
WANT=[('ArgentinaF','argentine','female','middle_aged'),('ColombianaF','colombian','female','young'),
 ('VenezolanaF','venezuelan','female','middle_aged'),('CubanaF','cuban','female','young'),
 ('Venezolano','venezuelan','male','middle_aged')]
ac=json.load(open('_accent_voices.json',encoding='utf-8'))
for label,acc,g,age in WANT:
    if label in ac: continue
    d=get('https://api.elevenlabs.io/v1/shared-voices?'+urllib.parse.urlencode({'language':'es','accent':acc,'gender':g,'page_size':5}))
    vs=d.get('voices',[])
    pick=next((v for v in vs if v.get('age')==age), vs[0] if vs else None)
    if not pick: print(label,'sin match'); continue
    owner=pick['public_owner_id']; vid0=pick['voice_id']
    try: a=post('https://api.elevenlabs.io/v1/voices/add/'+owner+'/'+vid0,{'new_name':'VTC '+label}); nid=a.get('voice_id',vid0)
    except Exception: nid=vid0
    ac[label]={'voice_id':nid,'name':pick.get('name'),'accent':acc,'lang':'es'}
    print(label,'->',pick.get('name'),'|',pick.get('age'))
json.dump(ac,open('_accent_voices.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)

# attach al agente
cfg=req('GET',B); tts=cfg['conversation_config']['tts']; have={v['label'] for v in tts['supported_voices']}
def V(l,vid,desc): return {'label':l,'voice_id':vid,'model_family':'multilingual','language':None,'optimize_streaming_latency':None,'stability':0.4,'speed':1.0,'similarity_boost':0.92,'description':desc}
addd={'ArgentinaF':'ES mujer argentina','ColombianaF':'ES mujer colombiana','VenezolanaF':'ES mujer venezolana','CubanaF':'ES mujer cubana','Venezolano':'ES hombre venezolano'}
for l,desc in addd.items():
    if l in ac and l not in have: tts['supported_voices'].append(V(l,ac[l]['voice_id'],desc))
out=req('PATCH',B,{'conversation_config':{'tts':tts}})
sv=out['conversation_config']['tts']['supported_voices']
print('TOTAL voces:',len(sv))
# verificar unicidad
from collections import Counter
c=Counter(v['voice_id'] for v in sv); dup={k:n for k,n in c.items() if n>1}
print('duplicados:',dup or 'ninguno')