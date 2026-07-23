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

print("[*] Actualizando nodo 'Send an Email'...")

# Encontrar nodo Send an Email
send_email = None
for n in wf['nodes']:
    if n['name'] == 'Send an Email':
        send_email = n
        break

if not send_email:
    print("[!] No se encontró nodo 'Send an Email'")
    exit(1)

# Actualizar parámetros
print(f"[+] Nodo encontrado")
print(f"[*] Cambiando correo a: mesainteligentedemo@gmail.com")
print(f"[*] Agregando CC: eldudemateos@gmail.com, chrisoria16@gmail.com")

send_email['parameters']['toEmail'] = 'mesainteligentedemo@gmail.com'
send_email['parameters']['ccEmail'] = 'eldudemateos@gmail.com,chrisoria16@gmail.com'

# Minimal payload update
payload = {
    'nodes': [send_email],
    'connections': {}
}

print("[*] Guardando cambios...")
try:
    out = api('PUT', '/api/v1/workflows/' + WF, {
        'name': wf['name'],
        'active': True,
        'nodes': wf['nodes'],
        'connections': wf['connections']
    })
    print("[+] Cambios guardados")
except Exception as e:
    print(f"[!] Error: {str(e)[:200]}")

print("")
print("="*70)
print("[+] CORREOS CONFIGURADOS!")
print("="*70)
print("")
print("Para: mesainteligentedemo@gmail.com")
print("CC: eldudemateos@gmail.com")
print("CC: chrisoria16@gmail.com")
print("")