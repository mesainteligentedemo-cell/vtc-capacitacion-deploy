// api/_i18n.js — VTC report translations (ES source → native US-English).
// Written by a bilingual timeshare-sales pro: coaching tone, not literal translation.
// VTC terms preserved exactly: VTC, OPC, Closer, Tour, Meet & Greet, NLP, TOC, F2M, F2B.
//
// USAGE
//   const { t, translations } = require('./_i18n');
//   t('Reporte de entrenamiento', lang)      // -> "Sales Training Debrief" when lang==='en'
//   Keys are the EXACT Spanish strings that appear in _template.js / _chat.js.
//   If a key is missing or lang!=='en', the original Spanish is returned unchanged
//   (so the live ES flow never breaks).

const translations = {
  // ── HEADER ────────────────────────────────────────────────────────────────
  'Reporte de entrenamiento': 'Sales Training Debrief',
  'Reporte de entrenamiento · Víctor · VTC': 'Sales Training Debrief · Victor · VTC',
  // Sentence fragments around the header sub-line (built with variables):
  'Sesión de': "coaching session with Victor —", // used in email pre-header context
  'con Víctor': 'with Victor',
  'EMPLEADO Nº': 'EMPLOYEE ID',
  // Department / category chips (data-driven; common values):
  'Ventas Piso': 'Floor Sales',
  'CIERRE': 'CLOSE',
  'Cierre': 'Close',

  // ── SCORE HERO ────────────────────────────────────────────────────────────
  'Desempeño global': 'Overall Performance',

  // ── CALL SUMMARY ──────────────────────────────────────────────────────────
  'Resumen de la llamada': 'Call Breakdown',

  // ── METRICS ROW (scenario + modules) ──────────────────────────────────────
  'Escenario': 'What We Practiced',
  'Módulos practicados': 'Modules Practiced',
  'Roleplay': 'Roleplay',

  // ── 4-COLUMN ANALYTICS TABLE ──────────────────────────────────────────────
  'Tiempo hablado': 'Your Speaking Time',
  'Idioma': 'Language',
  'Sentimiento': 'Tone of Call',
  'Intervenciones': 'Exchanges',
  // Secondary chip strip:
  'Duración': 'Call Duration',
  'Tono': 'Tone',
  'Dificultad': 'Difficulty',
  'Horario': 'Time',
  // Common cell values:
  'Español': 'Spanish',
  'Inglés': 'English',
  'Profesional': 'Professional',
  'Baja': 'Low',
  'Media': 'Medium',
  'Alta': 'High',

  // ── SKILLS RADAR ──────────────────────────────────────────────────────────
  'Mapa de competencias': 'Skills Map',
  'Radar de competencias': 'Skills radar', // SVG aria-label
  'Rapport': 'Rapport',
  'PNL': 'NLP',
  'Postura': 'Poise',
  'Objeciones': 'Objections',
  'Leer la Sala': 'Reading the Room',
  'Leer la sala': 'Reading the room',

  // ── NEUROSCIENCE PRINCIPLES (bars) ────────────────────────────────────────
  'Principios neurocientíficos activados': 'Psychology at Play',
  'Reciprocidad': 'Reciprocity',
  'Escasez': 'Scarcity',
  'Autoridad': 'Authority',
  'Oxitocina': 'Oxytocin',
  'Dopamina': 'Dopamine',
  'Cortisol': 'Cortisol',
  'Amígdala': 'Amygdala',
  'Anticipación de recompensa': 'Reward anticipation',
  'Confianza y vínculo': 'Trust & connection',
  'Estrés ante objeciones': 'Stress under objections',
  'Miedo y percepción de riesgo': 'Fear & risk perception',

  // ── CONVERSATION TIMELINE ─────────────────────────────────────────────────
  'Línea de la conversación': 'Key Moments',

  // ── FEEDBACK BLOCKS ───────────────────────────────────────────────────────
  '✓ Lo que hiciste bien': '✓ What You Nailed',
  'Lo que hiciste bien': 'What You Nailed',
  '△ A mejorar': '△ Quick Wins for Next Call',
  'A mejorar': 'Quick Wins for Next Call',
  'Objeciones que enfrentaste': 'Objections You Faced',

  // ── NLP ANALYSIS ──────────────────────────────────────────────────────────
  '🧠 Análisis PNL': '🧠 NLP Breakdown',
  'Análisis PNL': 'NLP Breakdown',

  // ── NEXT DRILL (CTA) ──────────────────────────────────────────────────────
  '🎯 Tu próximo drill': '🎯 Your Next Challenge',
  'Tu próximo drill': 'Your Next Challenge',
  'Entrenar de nuevo': 'Run Another Scenario',

  // ── KNOWLEDGE CHECK / QUIZ ────────────────────────────────────────────────
  'Evaluación de comprensión — Quiz': 'Knowledge Check',
  'Puntuación del quiz': 'Your Score',
  'Total preguntas': 'Questions',
  'Correctas': 'Correct',
  'Incorrectas': 'Missed',
  '✅ Correcto': '✅ Correct',
  '❌ Incorrecto': '❌ Missed',
  'Respuesta correcta:': 'Correct answer:',
  'Respuesta esperada:': 'Expected answer:',
  'Tu respuesta:': 'Your answer:',
  '📚 Consejo de aprendizaje:': "📚 Coaching tip:",
  'Consejo de aprendizaje:': 'Coaching tip:',

  // ── COACH ACTION PLAN ─────────────────────────────────────────────────────
  '📋 Plan de acción · para el gerente': "📋 Coach's Action Plan",
  'Plan de acción · para el gerente': "Coach's Action Plan",
  'Pasos concretos para llevar a este asesor a la excelencia.':
    'Concrete steps to take this rep to the next level.',

  // ── LEARNING ANALYSIS ─────────────────────────────────────────────────────
  'Análisis del Aprendizaje': 'Learning Breakdown',
  'Sesión de Roleplay': 'Roleplay Session',
  'Sesión de Curso': 'Course Session',
  'Consulta': 'Q&A',
  'Cobertura del curso': 'Course Coverage',
  'Módulos recorridos': 'Modules Covered',
  'Comprensión general': 'Overall Understanding',
  'Puntos fuertes': 'Strengths',
  'Brechas de aprendizaje': 'Learning Gaps',
  'Puntaje de participación': 'Engagement Score',
  'Seguimiento': 'Follow-Through',
  'Quizzes por módulo': 'Quizzes by Module',
  'Preguntas incorrectas a repasar': 'Questions to Review',
  'Siguiente paso de estudio': 'Your Focus for Next Time',
  '🧠 Nota Deep Learning — mejoras para Víctor': '🧠 What Victor Observed',
  'Nota Deep Learning — mejoras para Víctor': 'What Victor Observed',

  // ── NEUROSCIENCE ANALYSIS (client-side chemistry) ─────────────────────────
  '🧠 Análisis Neurociencia': '🧠 The Neuroscience',
  'Análisis Neurociencia': 'The Neuroscience',
  'Neurotransmisores que el asesor activó en el cliente durante la sesión.':
    'The neurochemistry the rep triggered in the client during the session.',

  // ── STANDOUT MOMENT ───────────────────────────────────────────────────────
  '✨ Momento de Oro': '✨ Standout Moment',
  'Momento de Oro': 'Standout Moment',
  'Por qué fue efectiva': 'Why it landed',

  // ── TRAINER NOTE ──────────────────────────────────────────────────────────
  '📋 Nota para entrenador': '📋 Note for the Coach',
  'Nota para entrenador': 'Note for the Coach',

  // ── SESSION ACTIVITY ──────────────────────────────────────────────────────
  'Actividad de la sesión': 'Session Activity',
  'Sesión de conversación libre (sin recorrido de módulos).':
    'Free-form conversation (no module walkthrough).',
  'Entró a': 'Opened',
  '▶ Vio el video de': '▶ Watched the video for',
  '✓ Hizo el quiz de': '✓ Took the quiz for',

  // ── FULL TRANSCRIPT ───────────────────────────────────────────────────────
  'Transcripción completa': 'Full Transcript',
  'Conversación palabra por palabra entre Víctor y el asesor.':
    'The full word-for-word between Victor and the rep.',
  'VÍCTOR': 'VICTOR',
  'ASESOR': 'REP',

  // ── FOOTER CTAs ───────────────────────────────────────────────────────────
  '🎧 Escuchar conversación': '🎧 Replay the Call',
  'Escuchar conversación': 'Replay the Call',
  '🔁 Volver a entrenar': '🔁 Practice Again',
  'Volver a entrenar': 'Practice Again',
  'Coach de IA del piso': 'AI floor coach',
  'Generado por': 'Powered by',
  'Este reporte es interno del equipo VTC.': 'Internal VTC team report.',

  // ── MODULE LABELS (course walkthrough) ────────────────────────────────────
  'Inicio del curso': 'Course start',
  'Índice de módulos': 'Module index',
  '0 · Psicología': '0 · Psychology',
  '1 · Calificación': '1 · Qualifying',
  '2 · El OPC': '2 · The OPC',
  '3 · Rapport y PNL': '3 · Rapport & NLP',
  '11 · Nacionalidades': '11 · Nationalities',
  '12 · Ética y Legal': '12 · Ethics & Legal',
  'Pitch VTC (19 módulos)': 'VTC Pitch (19 modules)',
  'Cierre del curso': 'Course close',

  // ── EMPTY-STATE / FALLBACK COPY ───────────────────────────────────────────
  'Sin transcripción disponible.': 'No transcript available.',
  'No registrado en esta sesión.': 'Not tracked this session.',
  'No registrada.': 'Not recorded.',
  'Sin quizzes registrados en esta sesión.': 'No quizzes recorded this session.',
  '(sin resumen)': '(no summary)',
};

// Look up a translation. Falls back to the original string when lang !== 'en'
// or the key isn't mapped — the Spanish flow is never broken.
function t(str, lang) {
  if (!str) return str;
  const l = (lang || '').toLowerCase();
  if (l.indexOf('en') !== 0) return str;            // only translate for English sessions
  return Object.prototype.hasOwnProperty.call(translations, str) ? translations[str] : str;
}

module.exports = { translations, t };