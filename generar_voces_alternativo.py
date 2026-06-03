# -*- coding: utf-8 -*-
import sys
import io
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import requests
import json
import time

API_KEY = "sk_87d5a7899d6c489c94232248c4880a0c4fe317adb3701e67"
BASE_URL = "https://api.elevenlabs.io/v1"

# Directamente vamos a crear las voces EN EL DASHBOARD de forma manual
# porque Voice Design requiere interacción web
# Pero te doy el JSON con los prompts exactos y settings para que los copies

VOCES_CONFIG = [
    {
        "nombre": "NIÑO_6_AÑOS",
        "prompt": "Native Spanish (Mexican). Male, 6 years old. Excellent quality. Persona: Curious, playful, innocent child. Emotion: Happy, excited, inquisitive. Bright and cheerful voice with natural, youthful energy. Speaks at a natural conversational pace with spontaneous enthusiasm.",
        "settings": {"loudness": 45, "guidance_scale": 70}
    },
    {
        "nombre": "NIÑA_4_AÑOS",
        "prompt": "Native Spanish (Mexican). Female, 4 years old. Excellent quality. Persona: Sweet, gentle, precious little girl. Emotion: Innocent, happy, playful. Soft, high-pitched voice with warmth and gentleness. Speaks slightly slower with childlike wonder and sweetness.",
        "settings": {"loudness": 40, "guidance_scale": 70}
    },
    {
        "nombre": "NIÑO_14_AÑOS",
        "prompt": "Native Spanish (Mexican). Male, 14 years old. Excellent quality. Persona: Energetic, curious, transitioning adolescent. Emotion: Enthusiastic, eager, slightly uncertain. Voice in transition with slight depth emerging. Fast, natural teen Mexican pace with excitement and energy.",
        "settings": {"loudness": 55, "guidance_scale": 70}
    },
    {
        "nombre": "NIÑA_16_AÑOS",
        "prompt": "Native Spanish (Mexican). Female, 16 years old. Excellent quality. Persona: Smart, confident, thoughtful teenager. Emotion: Intelligent, curious, assured. Clear and mature voice for her age with intellectual confidence. Natural conversational pace with thoughtfulness and poise.",
        "settings": {"loudness": 55, "guidance_scale": 70}
    },
    {
        "nombre": "HOMBRE_20_AÑOS",
        "prompt": "Native Spanish (Mexican). Male, 20 years old. Excellent quality. Persona: Friendly, approachable young professional. Emotion: Warm, confident, energetic. Clear, warm voice with youthful brightness. Natural conversational pace with genuine friendliness and approachability.",
        "settings": {"loudness": 60, "guidance_scale": 70}
    },
    {
        "nombre": "MUJER_24_AÑOS",
        "prompt": "Native Spanish (Mexican). Female, 24 years old. Excellent quality. Persona: Smart, empathetic professional woman. Emotion: Confident, caring, intelligent. Clear, warm voice with professional maturity and intelligence. Engaging natural pace with empathy and warmth.",
        "settings": {"loudness": 60, "guidance_scale": 70}
    },
    {
        "nombre": "HOMBRE_65_AÑOS",
        "prompt": "Native Spanish (Mexican). Male, 65 years old. Excellent quality. Persona: Wise, warm, fatherly mentor. Emotion: Calm, trustworthy, experienced. Deep, warm voice with wisdom and life experience. Deliberate, slower pace with grandfatherly warmth and authority.",
        "settings": {"loudness": 50, "guidance_scale": 70}
    },
    {
        "nombre": "MUJER_60_AÑOS",
        "prompt": "Native Spanish (Mexican). Female, 60 years old. Excellent quality. Persona: Caring, protective, maternal mentor. Emotion: Loving, experienced, nurturing. Warm, mature voice with gentle strength. Natural pace with maternal warmth and protective care.",
        "settings": {"loudness": 50, "guidance_scale": 70}
    },
    {
        "nombre": "HOMBRE_45_EJECUTIVO",
        "prompt": "Native Spanish (Mexican). Male, 45 years old. Excellent quality. Persona: Authoritative executive, decisive leader. Emotion: Powerful, confident, commanding. Deep, authoritative voice with professional strength. Controlled, assertive pace with executive authority and decisiveness.",
        "settings": {"loudness": 75, "guidance_scale": 72}
    },
    {
        "nombre": "HOMBRE_45_CÁLIDO",
        "prompt": "Native Spanish (Mexican). Male, 45 years old. Excellent quality. Persona: Supportive mentor, warm coach. Emotion: Caring, friendly, encouraging. Deep, warm voice with approachable strength. Natural conversational pace with paternal warmth and genuine support.",
        "settings": {"loudness": 55, "guidance_scale": 70}
    },
    {
        "nombre": "MUJER_40_EJECUTIVA",
        "prompt": "Native Spanish (Mexican). Female, 40 years old. Excellent quality. Persona: Strong executive, confident leader. Emotion: Powerful, decisive, commanding. Clear, strong voice with professional authority. Controlled, assertive pace with executive presence and confidence.",
        "settings": {"loudness": 72, "guidance_scale": 72}
    },
    {
        "nombre": "MUJER_40_CÁLIDA",
        "prompt": "Native Spanish (Mexican). Female, 40 years old. Excellent quality. Persona: Empathetic coach, warm connector. Emotion: Caring, supportive, relatable. Clear, warm voice with intelligence and kindness. Natural conversational pace with empathy and genuine connection.",
        "settings": {"loudness": 55, "guidance_scale": 70}
    }
]

print("=" * 80)
print("CONFIGURACION DE VOCES - ELEVENLABS VOICE DESIGN")
print("=" * 80)
print("\nVoice Design NO está disponible por API directamente.")
print("Solución: Generar manualmente en el dashboard + usar estos settings.\n")

# Guardar JSON con todos los prompts y settings
output_file = "C:\\Users\\inbou\\vtc-capacitacion-deploy\\voces_prompts_config.json"

output_data = {
    "instrucciones": "Copia cada prompt en ElevenLabs Voice Design y configura los settings",
    "total_voces": len(VOCES_CONFIG),
    "voces": VOCES_CONFIG
}

with open(output_file, "w", encoding="utf-8") as f:
    json.dump(output_data, f, indent=2, ensure_ascii=False)

print(f"[OK] Archivo guardado: {output_file}\n")

print("=" * 80)
print("INSTRUCCIONES RÁPIDAS:")
print("=" * 80)

for i, voz in enumerate(VOCES_CONFIG, 1):
    print(f"\n[{i}] {voz['nombre']}")
    print(f"    Loudness: {voz['settings']['loudness']}%")
    print(f"    Guidance Scale: {voz['settings']['guidance_scale']}%")
    print(f"    Prompt: (copiar del JSON)")

print("\n" + "=" * 80)
print("ALTERNATIVA: Usa este script para crear voces MANUALMENTE en el dashboard")
print("1. Ve a: https://elevenlabs.io/voice-library")
print("2. Haz clic en '+ Create new voice'")
print("3. Selecciona 'Voice Design'")
print("4. Copia el PROMPT de este archivo (voces_prompts_config.json)")
print("5. Configura: Loudness y Guidance Scale según especificado")
print("6. Genera y guarda el Voice ID")
print("=" * 80)
