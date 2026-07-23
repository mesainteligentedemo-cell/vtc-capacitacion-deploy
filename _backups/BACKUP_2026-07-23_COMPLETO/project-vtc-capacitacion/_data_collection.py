# -*- coding: utf-8 -*-
import json, urllib.request
API="sk_87d5a7899d6c489c94232248c4880a0c4fe317adb3701e67"
AG="agent_9501k3vkt6svekjs6y0qe5xzcek1"
B=f"https://api.elevenlabs.io/v1/convai/agents/{AG}"
def req(m,u,b=None):
    d=json.dumps(b).encode("utf-8") if b is not None else None
    r=urllib.request.Request(u,data=d,method=m,headers={"xi-api-key":API,"Content-Type":"application/json"})
    try:
        with urllib.request.urlopen(r) as x: return json.loads(x.read().decode())
    except urllib.error.HTTPError as e:
        print("HTTP",e.code,e.read().decode()[:500]); raise

# Campos que Victor extrae de cada conversacion
data_collection = {
  "user_name":        {"type":"string","description":"Nombre del asesor/usuario que entreno en esta sesion. Vacio si no se identifico."},
  "user_email":       {"type":"string","description":"Correo electronico del asesor para enviarle su reporte. Pidelo amablemente al inicio si no lo tienes."},
  "user_role":        {"type":"string","description":"Rol del usuario: OPC, liner, closer, gerente, director o prospecto."},
  "idioma":           {"type":"string","description":"Idioma principal de la sesion: 'espanol' o 'ingles'."},
  "tipo_actividad":   {"type":"string","description":"Que se hizo: 'roleplay', 'repaso_modulo', 'duda', 'coaching' o 'mixto'."},
  "escenario_roleplay":{"type":"string","description":"Si hubo roleplay, el escenario: cliente_solo, pareja, familia_con_hijos, hijos_dificiles, adolescente_smartass, o combinacion. Vacio si no hubo."},
  "tipo_cliente":     {"type":"string","description":"Personalidad/dificultad encarnada: driver, analytic, amiable, expressive, mezcla, borracho, nefasto, necio, stroker, sabelotodo, etc."},
  "nacionalidad":     {"type":"string","description":"Nacionalidad del prospecto en el roleplay si aplica."},
  "modulos_practicados":{"type":"string","description":"Modulos del curso VTC tocados en la sesion, separados por coma (ej: 'M2 OPC, M7 Objeciones')."},
  "objeciones_trabajadas":{"type":"string","description":"Objeciones que el asesor enfrento y como las manejo."},
  "desempeno_score":  {"type":"number","description":"Calificacion del desempeno del asesor del 1 al 10 segun el manual VTC y neurociencia. Solo si hubo roleplay o practica evaluable."},
  "fortalezas":       {"type":"string","description":"Lo que el asesor hizo bien en la sesion, con el principio neurocientifico que activo."},
  "areas_mejora":     {"type":"string","description":"Lo que el asesor debe mejorar, con el momento y el principio que fallo."},
  "recomendacion_siguiente":{"type":"string","description":"Drill o recomendacion concreta para la proxima sesion de entrenamiento."},
  "duracion_practica":{"type":"string","description":"Resumen de cuanto y que tan a fondo practico (corto/medio/intenso)."}
}

evaluation = {"criteria":[
  {"id":"mantuvo_postura","name":"Mantuvo postura","type":"prompt",
   "conversation_goal_prompt":"Evalua si el asesor mantuvo postura y control sin presionar al cliente durante el roleplay. Responde success si lo logro, failure si presiono o perdio el control, unknown si no hubo roleplay."},
  {"id":"manejo_objeciones","name":"Manejo de objeciones","type":"prompt",
   "conversation_goal_prompt":"Evalua si el asesor manejo las objeciones usando el framework VTC (aislar la objecion real, no discutir, reencuadrar). success / failure / unknown."},
  {"id":"leyo_la_sala","name":"Leyo la sala","type":"prompt",
   "conversation_goal_prompt":"Evalua si el asesor adapto su pitch al arquetipo DISC y atendio a todos los decisores (pareja/familia). success / failure / unknown."},
  {"id":"completo_practica","name":"Completo la practica","type":"prompt",
   "conversation_goal_prompt":"Evalua si el asesor completo el roleplay o repaso hasta el cierre/feedback en vez de abandonarlo. success / failure / unknown."}
]}

cfg=req("GET",B)
ps=cfg.get("platform_settings",{}) or {}            # <-- nivel RAIZ
existing_dc = ps.get("data_collection",{}) or {}
merged_dc = dict(existing_dc)                         # conservar lo que ya existe
for k,v in data_collection.items():
    merged_dc[k]=v                                    # agregar/actualizar campos VTC
out=req("PATCH",B,{"platform_settings":{"data_collection":merged_dc,"evaluation":evaluation}})
fps=out.get("platform_settings",{})
print("data_collection fields:", len(fps.get("data_collection",{})))
print("evaluation criteria:", len(fps.get("evaluation",{}).get("criteria",[])))
print("campos VTC nuevos presentes:", [k for k in data_collection if k in fps.get("data_collection",{})])
