# -*- coding: utf-8 -*-
import json, urllib.request

API = "sk_87d5a7899d6c489c94232248c4880a0c4fe317adb3701e67"
AGENT = "agent_9501k3vkt6svekjs6y0qe5xzcek1"
BASE = f"https://api.elevenlabs.io/v1/convai/agents/{AGENT}"

with open(r"C:\Users\inbou\vtc-capacitacion-deploy\victor_system_prompt.md", encoding="utf-8") as f:
    new_prompt = f.read()

def req(method, url, body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, method=method,
        headers={"xi-api-key": API, "Content-Type": "application/json"})
    with urllib.request.urlopen(r) as resp:
        return json.loads(resp.read().decode())

cfg = req("GET", BASE)
agent = cfg["conversation_config"]["agent"]
agent["prompt"]["prompt"] = new_prompt
agent["prompt"]["temperature"] = 0.5
# V10 · Saludo contextual: NUNCA pide nombre/numero/departamento (los recibe por dynamic-variables)
FIRST_MESSAGE = "¡Hola {{user_name}}! Soy Víctor, tu entrenador personal de ventas, y mi único trabajo es convertirte en el mejor closer del piso. Qué gusto entrenar contigo hoy. ¿List@ para empezar?"
agent["first_message"] = FIRST_MESSAGE

# V10: defaults para TODAS las variables que usa el saludo contextual
# (evita 'missing dynamic variable' si la sesión no pasa alguna)
PLACEHOLDERS = {
    "user_name": "",
    "employee_number": "",
    "departamento": "",
    "is_first_time": "true",
    "last_module": "",
    "last_quiz": "",
    "session_timestamp": "",
    "historial_usuario": ""
}
agent.setdefault("dynamic_variables", {})
agent["dynamic_variables"]["dynamic_variable_placeholders"] = PLACEHOLDERS

# patch MÍNIMO (merge profundo) — no reenviar tools/tool_ids para evitar conflicto 400
patch = {"conversation_config": {"agent": {
    "prompt": {"prompt": new_prompt, "temperature": 0.4},
    "first_message": FIRST_MESSAGE,
    "dynamic_variables": {"dynamic_variable_placeholders": PLACEHOLDERS},
}}}
out = req("PATCH", BASE, patch)
a = out["conversation_config"]["agent"]
print("OK · prompt len:", len(a["prompt"]["prompt"]))
print("temp:", a["prompt"].get("temperature"))
print("first_message:", a.get("first_message")[:80], "...")
print("dynamic_vars:", list(a.get("dynamic_variables", {}).get("dynamic_variable_placeholders", {}).keys()))
