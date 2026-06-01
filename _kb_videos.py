# -*- coding: utf-8 -*-
import json, glob, os, urllib.request

API = "sk_87d5a7899d6c489c94232248c4880a0c4fe317adb3701e67"
AGENT = "agent_9501k3vkt6svekjs6y0qe5xzcek1"
KB_COMPLETO = "bhyUNPypv1ihxkOtIEjr"   # 80KB base completa (ya existe, no atada)
CFG = r"C:\Users\inbou\vtc-course-videos\configs"

def req(method, url, body=None):
    data = json.dumps(body).encode("utf-8") if body is not None else None
    r = urllib.request.Request(url, data=data, method=method,
        headers={"xi-api-key": API, "Content-Type": "application/json"})
    with urllib.request.urlopen(r) as resp:
        return json.loads(resp.read().decode())

def readcfg(p):
    for enc in ("utf-8", "cp1252", "latin-1"):
        try:
            with open(p, encoding=enc) as f: return json.load(f)
        except Exception: continue
    return None

# 1) compilar guiones de video
order = ["wel","fin","pv","m0","m1","m2","m3","m4","m5","m6","m7","m8","m9","m10","m11","m12"]
files = {os.path.splitext(os.path.basename(p))[0]: p for p in glob.glob(os.path.join(CFG,"*.json"))}
lines = ["# GUIONES DE LOS VIDEOS DEL CURSO VTC",
         "Contenido exacto que enseña cada video de la plataforma de capacitacion. Victor lo domina y puede referenciar que dice el video de cada modulo.\n"]
for key in order + [k for k in files if k not in order]:
    p = files.get(key)
    if not p: continue
    d = readcfg(p)
    if not d: continue
    lines.append(f"\n## Video {d.get('module_id_text', key)} — {d.get('title_main','')}")
    if d.get("vo_dur"): lines.append(f"_Duracion: {round(d['vo_dur'])}s_")
    for s in d.get("scenes", []):
        eb = (s.get("eyebrow") or "").strip()
        hd = (s.get("head") or "").replace("*","").strip()
        sb = (s.get("sub") or "").strip()
        seg = " · ".join([x for x in [eb, hd, sb] if x])
        if seg: lines.append(f"- {seg}")
    cl = d.get("closing")
    if isinstance(cl, dict):
        ct = " ".join(str(v).replace("*","") for v in cl.values() if isinstance(v,str))
        if ct.strip(): lines.append(f"- Cierre: {ct.strip()}")
    elif isinstance(cl, str) and cl.strip():
        lines.append(f"- Cierre: {cl.strip()}")
doc = "\n".join(lines)
print("video KB chars:", len(doc), "| modulos:", doc.count("## Video"))

# 2) subir como KB text
up = req("POST", "https://api.elevenlabs.io/v1/convai/knowledge-base/text",
         {"name": "VTC — Guiones de los Videos del Curso", "text": doc})
KB_VIDEOS = up.get("id")
print("KB videos creado:", KB_VIDEOS)

# 3) atar ambos KB al agente (conservando el existente)
B = f"https://api.elevenlabs.io/v1/convai/agents/{AGENT}"
cfg = req("GET", B)
agent = cfg["conversation_config"]["agent"]
kb = agent["prompt"].get("knowledge_base", []) or []
have = {x.get("id") for x in kb}
for kid, nm in [(KB_COMPLETO, "VTC base completa"), (KB_VIDEOS, "VTC guiones videos")]:
    if kid and kid not in have:
        kb.append({"type":"text","name":nm,"id":kid,"usage_mode":"auto"})
agent["prompt"]["knowledge_base"] = kb
out = req("PATCH", B, {"conversation_config":{"agent":{"prompt":{"knowledge_base":kb}}}})
final = out["conversation_config"]["agent"]["prompt"]["knowledge_base"]
print("KB atados al agente:", len(final))
for x in final: print("  -", x.get("id"), x.get("name"))