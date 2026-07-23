#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para generar 12 voces con Voice Design en ElevenLabs
Configura automáticamente Loudness y Guidance Scale para cada voz
"""

import sys
import os
import requests
import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

# Configurar encoding UTF-8 para Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Tu API key de ElevenLabs
API_KEY = "sk_87d5a7899d6c489c94232248c4880a0c4fe317adb3701e67"
BASE_URL = "https://api.elevenlabs.io/v1"

# Definición de voces con prompts y settings optimizados
VOCES = [
    {
        "nombre": "NIÑO_6_AÑOS",
        "prompt": "Native Spanish (Mexican). Male, 6 years old. Excellent quality. Persona: Curious, playful, innocent child. Emotion: Happy, excited, inquisitive. Bright and cheerful voice with natural, youthful energy. Speaks at a natural conversational pace with spontaneous enthusiasm.",
        "loudness": 45,
        "guidance_scale": 70
    },
    {
        "nombre": "NIÑA_4_AÑOS",
        "prompt": "Native Spanish (Mexican). Female, 4 years old. Excellent quality. Persona: Sweet, gentle, precious little girl. Emotion: Innocent, happy, playful. Soft, high-pitched voice with warmth and gentleness. Speaks slightly slower with childlike wonder and sweetness.",
        "loudness": 40,
        "guidance_scale": 70
    },
    {
        "nombre": "NIÑO_14_AÑOS",
        "prompt": "Native Spanish (Mexican). Male, 14 years old. Excellent quality. Persona: Energetic, curious, transitioning adolescent. Emotion: Enthusiastic, eager, slightly uncertain. Voice in transition with slight depth emerging. Fast, natural teen Mexican pace with excitement and energy.",
        "loudness": 55,
        "guidance_scale": 70
    },
    {
        "nombre": "NIÑA_16_AÑOS",
        "prompt": "Native Spanish (Mexican). Female, 16 years old. Excellent quality. Persona: Smart, confident, thoughtful teenager. Emotion: Intelligent, curious, assured. Clear and mature voice for her age with intellectual confidence. Natural conversational pace with thoughtfulness and poise.",
        "loudness": 55,
        "guidance_scale": 70
    },
    {
        "nombre": "HOMBRE_20_AÑOS",
        "prompt": "Native Spanish (Mexican). Male, 20 years old. Excellent quality. Persona: Friendly, approachable young professional. Emotion: Warm, confident, energetic. Clear, warm voice with youthful brightness. Natural conversational pace with genuine friendliness and approachability.",
        "loudness": 60,
        "guidance_scale": 70
    },
    {
        "nombre": "MUJER_24_AÑOS",
        "prompt": "Native Spanish (Mexican). Female, 24 years old. Excellent quality. Persona: Smart, empathetic professional woman. Emotion: Confident, caring, intelligent. Clear, warm voice with professional maturity and intelligence. Engaging natural pace with empathy and warmth.",
        "loudness": 60,
        "guidance_scale": 70
    },
    {
        "nombre": "HOMBRE_65_AÑOS",
        "prompt": "Native Spanish (Mexican). Male, 65 years old. Excellent quality. Persona: Wise, warm, fatherly mentor. Emotion: Calm, trustworthy, experienced. Deep, warm voice with wisdom and life experience. Deliberate, slower pace with grandfatherly warmth and authority.",
        "loudness": 50,
        "guidance_scale": 70
    },
    {
        "nombre": "MUJER_60_AÑOS",
        "prompt": "Native Spanish (Mexican). Female, 60 years old. Excellent quality. Persona: Caring, protective, maternal mentor. Emotion: Loving, experienced, nurturing. Warm, mature voice with gentle strength. Natural pace with maternal warmth and protective care.",
        "loudness": 50,
        "guidance_scale": 70
    },
    {
        "nombre": "HOMBRE_45_EJECUTIVO",
        "prompt": "Native Spanish (Mexican). Male, 45 years old. Excellent quality. Persona: Authoritative executive, decisive leader. Emotion: Powerful, confident, commanding. Deep, authoritative voice with professional strength. Controlled, assertive pace with executive authority and decisiveness.",
        "loudness": 75,
        "guidance_scale": 72
    },
    {
        "nombre": "HOMBRE_45_CÁLIDO",
        "prompt": "Native Spanish (Mexican). Male, 45 years old. Excellent quality. Persona: Supportive mentor, warm coach. Emotion: Caring, friendly, encouraging. Deep, warm voice with approachable strength. Natural conversational pace with paternal warmth and genuine support.",
        "loudness": 55,
        "guidance_scale": 70
    },
    {
        "nombre": "MUJER_40_EJECUTIVA",
        "prompt": "Native Spanish (Mexican). Female, 40 years old. Excellent quality. Persona: Strong executive, confident leader. Emotion: Powerful, decisive, commanding. Clear, strong voice with professional authority. Controlled, assertive pace with executive presence and confidence.",
        "loudness": 72,
        "guidance_scale": 72
    },
    {
        "nombre": "MUJER_40_CÁLIDA",
        "prompt": "Native Spanish (Mexican). Female, 40 years old. Excellent quality. Persona: Empathetic coach, warm connector. Emotion: Caring, supportive, relatable. Clear, warm voice with intelligence and kindness. Natural conversational pace with empathy and genuine connection.",
        "loudness": 55,
        "guidance_scale": 70
    }
]

def generar_voz(voz_data):
    """Genera una voz individual usando Voice Design API"""
    nombre = voz_data["nombre"]

    print(f"🎤 Generando: {nombre}...")

    try:
        # Endpoint para generar voz con Voice Design
        url = f"{BASE_URL}/voice-design"

        headers = {
            "xi-api-key": API_KEY,
            "Content-Type": "application/json"
        }

        payload = {
            "prompt": voz_data["prompt"],
            "voice_name": nombre,
            "loudness": voz_data["loudness"],
            "guidance_scale": voz_data["guidance_scale"]
        }

        response = requests.post(url, json=payload, headers=headers, timeout=60)

        if response.status_code == 200:
            data = response.json()
            voice_id = data.get("voice_id")
            print(f"✅ {nombre} → Voice ID: {voice_id}")
            return {
                "nombre": nombre,
                "voice_id": voice_id,
                "loudness": voz_data["loudness"],
                "guidance_scale": voz_data["guidance_scale"],
                "status": "success"
            }
        else:
            print(f"❌ {nombre} → Error {response.status_code}: {response.text}")
            return {
                "nombre": nombre,
                "status": "error",
                "error": response.text
            }

    except Exception as e:
        print(f"❌ {nombre} → Excepción: {str(e)}")
        return {
            "nombre": nombre,
            "status": "error",
            "error": str(e)
        }

def main():
    """Ejecuta la generación de todas las voces en paralelo"""

    print("=" * 70)
    print("🎵 GENERADOR DE VOCES - ELEVENLABS VOICE DESIGN")
    print("=" * 70)
    print(f"Total de voces a generar: {len(VOCES)}")
    print(f"API Key: {'✅ Configurada' if API_KEY else '❌ No configurada'}")
    print("=" * 70)

    if not API_KEY:
        print("❌ ERROR: No hay API Key configurada")
        return

    resultados = []

    # Generar voces en paralelo (máximo 4 simultáneas para no saturar la API)
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(generar_voz, voz): voz["nombre"] for voz in VOCES}

        for future in as_completed(futures):
            resultado = future.result()
            resultados.append(resultado)
            # Pequeña pausa entre requests
            time.sleep(0.5)

    # Guardar resultados en JSON
    print("\n" + "=" * 70)
    print("📊 RESUMEN DE GENERACIÓN")
    print("=" * 70)

    exitosas = [r for r in resultados if r["status"] == "success"]
    fallidas = [r for r in resultados if r["status"] == "error"]

    print(f"✅ Exitosas: {len(exitosas)}/{len(VOCES)}")
    print(f"❌ Fallidas: {len(fallidas)}/{len(VOCES)}")

    # Guardar JSON con los Voice IDs
    output_file = "C:\\Users\\inbou\\vtc-capacitacion-deploy\\voces_generadas.json"

    output_data = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total": len(VOCES),
        "exitosas": len(exitosas),
        "fallidas": len(fallidas),
        "voces": {r["nombre"]: r.get("voice_id", "ERROR") for r in resultados}
    }

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)

    print(f"\n📁 Archivo guardado: {output_file}")

    print("\n" + "=" * 70)
    print("🎉 LISTO!")
    print("=" * 70)
    print("\nVoices generados:")
    for r in resultados:
        if r["status"] == "success":
            print(f"  ✅ {r['nombre']}: {r['voice_id']}")
        else:
            print(f"  ❌ {r['nombre']}: ERROR")

if __name__ == "__main__":
    main()
