# -*- coding: utf-8 -*-
import sys
import io
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time
import json
import requests

API_KEY = "sk_87d5a7899d6c489c94232248c4880a0c4fe317adb3701e67"
BASE_URL = "https://api.elevenlabs.io/v1"

VOCES_CONFIG = [
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

def generar_audio_prueba(voice_id, nombre):
    """Genera un audio de prueba con Text-to-Speech"""
    try:
        url = f"{BASE_URL}/text-to-speech/{voice_id}"
        headers = {"xi-api-key": API_KEY}

        text_prueba = f"Hola, soy {nombre}. Esta es una prueba de voz."

        payload = {
            "text": text_prueba,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75
            }
        }

        response = requests.post(url, json=payload, headers=headers)

        if response.status_code == 200:
            # Guardar archivo de audio
            audio_path = f"C:\\Users\\inbou\\vtc-capacitacion-deploy\\audios_prueba\\{nombre}.mp3"
            with open(audio_path, "wb") as f:
                f.write(response.content)
            return audio_path
        else:
            print(f"   Error al generar audio: {response.status_code}")
            return None
    except Exception as e:
        print(f"   Excepción al generar audio: {str(e)}")
        return None

def main():
    print("=" * 80)
    print("AUTOMATIZACIÓN DE VOCES - ELEVENLABS VOICE DESIGN")
    print("=" * 80)

    # Crear carpeta de audios
    import os
    os.makedirs("C:\\Users\\inbou\\vtc-capacitacion-deploy\\audios_prueba", exist_ok=True)

    # Inicializar webdriver
    print("\n[1/2] Abriendo navegador...")
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))

    voice_ids = {}

    try:
        for idx, voz in enumerate(VOCES_CONFIG, 1):
            print(f"\n[{idx}/{len(VOCES_CONFIG)}] Generando: {voz['nombre']}")

            # Ir a Voice Design
            driver.get("https://elevenlabs.io/voice-library?action=create&creationType=voiceDesign")
            time.sleep(3)

            # Rellenar prompt
            print(f"   - Pegando prompt...")
            try:
                prompt_field = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.TAG_NAME, "textarea"))
                )
                driver.execute_script("arguments[0].value = '';", prompt_field)
                prompt_field.send_keys(voz["prompt"])
            except Exception as e:
                print(f"   Error pegando prompt: {e}")
                continue

            time.sleep(1)

            # Ajustar Loudness (si es necesario)
            print(f"   - Configurando Loudness: {voz['loudness']}%")
            try:
                # Buscar slider de loudness
                sliders = driver.find_elements(By.CSS_SELECTOR, "input[type='range']")
                if len(sliders) >= 1:
                    driver.execute_script(
                        f"arguments[0].value = {voz['loudness']}; " +
                        "arguments[0].dispatchEvent(new Event('input', {{ bubbles: true }}));",
                        sliders[0]
                    )
            except Exception as e:
                print(f"   Advertencia ajustando Loudness: {e}")

            time.sleep(1)

            # Ajustar Guidance Scale
            print(f"   - Configurando Guidance Scale: {voz['guidance_scale']}%")
            try:
                sliders = driver.find_elements(By.CSS_SELECTOR, "input[type='range']")
                if len(sliders) >= 2:
                    driver.execute_script(
                        f"arguments[0].value = {voz['guidance_scale']}; " +
                        "arguments[0].dispatchEvent(new Event('input', {{ bubbles: true }}));",
                        sliders[1]
                    )
            except Exception as e:
                print(f"   Advertencia ajustando Guidance Scale: {e}")

            time.sleep(1)

            # Hacer clic en "Generate voice"
            print(f"   - Generando voz...")
            try:
                generate_btn = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Generate')]"))
                )
                generate_btn.click()

                # Esperar a que se genere
                time.sleep(10)  # Esperar generación

                # Extraer Voice ID (puede estar en la URL o en algún elemento)
                print(f"   - Extrayendo Voice ID...")
                voice_id = f"voice_{idx}"  # Placeholder

                voice_ids[voz["nombre"]] = voice_id
                print(f"   ✓ {voz['nombre']} generado (ID: {voice_id})")

            except Exception as e:
                print(f"   Error generando voz: {e}")
                voice_ids[voz["nombre"]] = "ERROR"

            time.sleep(2)

    finally:
        driver.quit()

    # Guardar Voice IDs
    print("\n" + "=" * 80)
    print("[2/2] Guardando Voice IDs y generando audios de prueba...")
    print("=" * 80)

    output_file = "C:\\Users\\inbou\\vtc-capacitacion-deploy\\voice_ids_generados.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(voice_ids, f, indent=2, ensure_ascii=False)

    print(f"\n[OK] Voice IDs guardados en: {output_file}")

    # Generar audios de prueba
    print("\nGenerando audios de prueba...")
    for nombre, voice_id in voice_ids.items():
        if voice_id != "ERROR":
            print(f"   - {nombre}...", end=" ")
            audio_path = generar_audio_prueba(voice_id, nombre)
            if audio_path:
                print(f"✓ ({audio_path})")
            else:
                print("Error")

    print("\n" + "=" * 80)
    print("LISTO!")
    print("=" * 80)
    print(f"\nAudios de prueba guardados en: C:\\Users\\inbou\\vtc-capacitacion-deploy\\audios_prueba\\")

if __name__ == "__main__":
    main()
