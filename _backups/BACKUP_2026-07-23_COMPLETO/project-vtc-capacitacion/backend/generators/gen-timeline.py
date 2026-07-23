#!/usr/bin/env python3
import json
import os
from pathlib import Path

class TimelineGenerator:
    def __init__(self):
        self.modulos_orden = ['f', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
        self.output_dir = Path(__file__).parent.parent / 'data' / 'modulos'
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def contenido_modulos(self):
        return {
            'f': {
                'titulo': 'Fundamentos del Negocio VTC',
                'bloques': [
                    {
                        'id': 'block-0',
                        'titulo': 'Por qué este módulo existe',
                        'contenido': 'La mayoría de representantes nuevos fracasan porque no entienden qué venden realmente. Venden puntos, habitaciones, fechas. Pero eso está mal. El cliente no compra puntos. El cliente compra una idea: vacaciones garantizadas, sin preocupaciones, con tranquilidad mental. Esa es la diferencia entre un vendedor promedio y un vendedor VTC.'
                    },
                    {
                        'id': 'block-1',
                        'titulo': 'Los tres pilares del éxito en VTC',
                        'contenido': 'Primero: entender psicología del cliente. Segundo: dominar las técnicas de qualifying. Tercero: cerrar con confianza. Si dominas estos tres, cierras el 80 por ciento de tus prospectos.'
                    },
                    {
                        'id': 'block-2',
                        'titulo': 'Por qué VTC es diferente',
                        'contenido': 'VTC no es un timeshare común. Es un sistema de vacaciones con beneficios reales. El cliente obtiene vacaciones de calidad, plusvalía, y seguridad. Eso es lo que vendemos.'
                    }
                ],
                'quiz': {
                    'preguntas': [
                        {
                            'id': 'q1',
                            'texto': '¿Qué vende realmente un representante VTC?',
                            'opciones': ['Timeshare', 'Tranquilidad mental', 'Puntos', 'Habitaciones'],
                            'respuesta_correcta': 1,
                            'explicacion': 'El cliente compra la idea de vacaciones garantizadas con tranquilidad mental.'
                        },
                        {
                            'id': 'q2',
                            'texto': '¿Cuáles son los tres pilares del éxito?',
                            'opciones': ['Precio, producto, promoción', 'Psicología, qualifying, cierre', 'Presentación, presión, persuasión', 'Publicidad, posicionamiento, posibilidad'],
                            'respuesta_correcta': 1,
                            'explicacion': 'Psicología del cliente, dominio de técnicas de qualifying, y cierre con confianza.'
                        }
                    ]
                }
            }
        }

    def estimar_duracion(self, texto):
        palabras = len(texto.split())
        return palabras / 2.5

    def generar_timeline_modulo(self, modulo_id, contenido):
        timeline = {
            'modulo': modulo_id,
            'titulo': contenido['titulo'],
            'audioUrl': f'https://s3.amazonaws.com/vtc-audios/modulo-{modulo_id}.mp3',
            'duration': 0,
            'generatedAt': '2026-05-31T12:00:00Z',
            'bloques': [],
            'recap': None,
            'quiz': None
        }

        current_timecode = 1.0

        for i, bloque in enumerate(contenido['bloques']):
            duracion_habla = self.estimar_duracion(bloque['contenido'])

            acciones = [
                {
                    'timecode': current_timecode - 0.5,
                    'tipo': 'scroll',
                    'target': f'#block-{i}',
                    'behavior': 'smooth',
                    'duration': 800,
                    'description': f'Scroll a bloque {i}'
                },
                {
                    'timecode': current_timecode,
                    'tipo': 'speak-start',
                    'duracion': duracion_habla,
                    'description': f'Victor explica: {bloque["titulo"]}'
                },
                {
                    'timecode': current_timecode + duracion_habla,
                    'tipo': 'highlight',
                    'text': bloque['titulo'],
                    'color': 'gold',
                    'duration': 3000,
                    'description': f'Resaltar: {bloque["titulo"]}'
                },
                {
                    'timecode': current_timecode + duracion_habla + 3,
                    'tipo': 'pause',
                    'duration': 2000,
                    'description': 'Pausa para procesar'
                },
                {
                    'timecode': current_timecode + duracion_habla + 5,
                    'tipo': 'transition',
                    'text': 'Ahora vamos al siguiente punto',
                    'description': 'Transición al siguiente bloque'
                }
            ]

            timeline['bloques'].append({
                'id': bloque['id'],
                'titulo': bloque['titulo'],
                'contenido': bloque['contenido'],
                'duracion': duracion_habla,
                'acciones': acciones
            })

            current_timecode += duracion_habla + 7

        recap_timecode = current_timecode
        recap_duracion = 30.0

        timeline['recap'] = {
            'timecode': recap_timecode,
            'duracion': recap_duracion,
            'acciones': [
                {
                    'timecode': recap_timecode - 0.5,
                    'tipo': 'scroll',
                    'target': '#recap-section',
                    'duration': 800
                },
                {
                    'timecode': recap_timecode,
                    'tipo': 'speak-start',
                    'duracion': recap_duracion,
                    'description': 'Victor da recap del módulo'
                }
            ]
        }

        quiz_timecode = recap_timecode + recap_duracion + 2

        timeline['quiz'] = {
            'timecode': quiz_timecode,
            'acciones': [
                {
                    'timecode': quiz_timecode - 0.5,
                    'tipo': 'scroll',
                    'target': '#quiz-section',
                    'duration': 800
                },
                {
                    'timecode': quiz_timecode,
                    'tipo': 'show-quiz',
                    'description': 'Mostrar quiz'
                }
            ],
            'preguntas': contenido['quiz']['preguntas']
        }

        timeline['duration'] = quiz_timecode + 5

        return timeline

    def guardar_timeline(self, modulo_id, timeline):
        filepath = self.output_dir / f'timeline-{modulo_id}.json'

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(timeline, f, ensure_ascii=False, indent=2)

        print(f"✓ Timeline generado: {filepath}")
        print(f"  - Bloques: {len(timeline['bloques'])}")
        print(f"  - Duración total: {timeline['duration']:.1f}s")

    def generar_todos(self):
        print("🚀 Generando timelines para VTC Capacitación...\n")

        contenido = self.contenido_modulos()

        for modulo_id in self.modulos_orden:
            if modulo_id == 'f':
                print(f"\n📦 Procesando módulo {modulo_id.upper()}...")
                timeline = self.generar_timeline_modulo(modulo_id, contenido[modulo_id])
                self.guardar_timeline(modulo_id, timeline)
            else:
                print(f"⚠️  Módulo {modulo_id} - usando estructura de Fundamentos...")
                timeline = self.generar_timeline_modulo(modulo_id, contenido['f'])
                timeline['modulo'] = modulo_id
                timeline['titulo'] = f'Módulo {modulo_id}'
                self.guardar_timeline(modulo_id, timeline)

        print("\n✅ Todos los timelines generados exitosamente!")
        print(f"📁 Archivos guardados en: {self.output_dir}")

if __name__ == '__main__':
    generator = TimelineGenerator()
    generator.generar_todos()