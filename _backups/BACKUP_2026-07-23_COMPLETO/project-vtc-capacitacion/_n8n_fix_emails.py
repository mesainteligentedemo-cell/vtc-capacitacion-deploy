# -*- coding: utf-8 -*-
import json, urllib.request

KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMGUxNzJlNy1mYzM2LTQ3ODItYWFmYi05ZDAzOWFiNzk4NmEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiYzMyNWNhM2YtYjNhOS00MWQxLWFjYjktODE3ZmQ4MjExZDU4IiwiaWF0IjoxNzg0NDU4OTQwfQ.n_J5__rEkQnw_dT-3CR4KWLGWBaJMUAW3dZpCBzy9ZU'
WF='zCtqHc9Pj8ZbtVp1'
B='https://n8n.srv1013903.hstgr.cloud'

def api(m, p, d=None):
    body = json.dumps(d).encode('utf-8') if d is not None else None
    r = urllib.request.Request(B+p, data=body, method=m, headers={'X-N8N-API-KEY': KEY, 'Content-Type': 'application/json'})
    with urllib.request.urlopen(r, timeout=30) as x:
        return json.loads(x.read().decode())

print("[*] Obteniendo workflow...")
wf = api('GET', '/api/v1/workflows/' + WF)

print("[*] Nodos en el workflow:")
for n in wf['nodes']:
    print(f"  - {n['name']}")

print("")
print("[*] Actualizando nodo 'Send an Email'...")

# Encontrar el nodo "Send an Email"
email_node = None
for n in wf['nodes']:
    if 'Send an Email' in n['name'] or 'Email' in n['name']:
        email_node = n
        break

if not email_node:
    print("[!] No se encontró nodo de email")
    exit(1)

print(f"[+] Encontrado: {email_node['name']}")

# Actualizar parámetros del email
email_node['parameters']['toEmail'] = 'mesainteligentedemo@gmail.com'
email_node['parameters']['ccEmail'] = 'eldudemateos@gmail.com,chrisoria16@gmail.com'

print(f"[+] Para: mesainteligentedemo@gmail.com")
print(f"[+] CC: eldudemateos@gmail.com, chrisoria16@gmail.com")

# Guardar cambios
print("[*] Guardando cambios en n8n...")
payload = {
    'name': wf['name'],
    'nodes': wf['nodes'],
    'connections': wf['connections'],
    'settings': wf.get('settings', {})
}

out = api('PUT', '/api/v1/workflows/' + WF, payload)
print(f"[+] Workflow actualizado · nodos: {len(out.get('nodes', []))}")

# Activar
print("[*] Activando workflow...")
try:
    api('POST', '/api/v1/workflows/' + WF + '/activate')
    print("[+] Workflow activado")
except Exception as e:
    print(f"[!] Error al activar: {e}")

print("")
print("="*70)
print("[+] CORREOS CONFIGURADOS CORRECTAMENTE!")
print("="*70)
print("")
print("Para: mesainteligentedemo@gmail.com")
print("CC: eldudemateos@gmail.com, chrisoria16@gmail.com")
print("")
print("[*] El webhook está listo para recibir eventos de ElevenLabs")
print("")