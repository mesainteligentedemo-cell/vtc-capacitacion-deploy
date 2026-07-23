#!/bin/bash

# MCP Configuration for n8n
# Este script configura MCP para conectar Claude Code con n8n

echo "[*] Configurando MCP para n8n..."

# Variables
N8N_URL="https://n8n.srv1013903.hstgr.cloud"
N8N_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMGUxNzJlNy1mYzM2LTQ3ODItYWFmYi05ZDAzOWFiNzk4NmEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiYzMyNWNhM2YtYjNhOS00MWQxLWFjYjktODE3ZmQ4MjExZDU4IiwiaWF0IjoxNzg0NDU4OTQwfQ.n_J5__rEkQnw_dT-3CR4KWLGWBaJMUAW3dZpCBzy9ZU"
WORKFLOW_ID="zCtqHc9Pj8ZbtVp1"

echo "[+] Server URL: $N8N_URL"
echo "[+] Workflow ID: $WORKFLOW_ID"
echo ""
echo "[*] Para conectar MCP en Claude Code:"
echo "    1. Ve a n8n Settings → Instance-level MCP"
echo "    2. Copia el Server URL"
echo "    3. En Claude Code, agrega como MCP server"
echo ""
echo "[+] Credenciales guardadas en memoria"