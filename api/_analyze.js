// Análisis de IA del transcript -> análisis de aprendizaje del curso VTC.
// Detecta si fue sesión de CURSO GUIADO o ROLEPLAY y adapta el análisis.
const MODEL = 'google/gemini-2.5-flash';

const SYS = `Eres el evaluador experto del programa Victorious Travelers Club (VTC).
Analizas la conversación entre el coach "Víctor" (agent) y un ASESOR (user) y determinas el tipo de sesión:

TIPO A — CURSO GUIADO: el asesor tomó el curso (Víctor explicó módulos, videos, quizzes).
TIPO B — ROLEPLAY/PRÁCTICA: el asesor practicó ventas con clientes simulados.
TIPO C — CONSULTA/REPASO: preguntas puntuales, repaso de temas específicos.

Devuelve EXCLUSIVAMENTE JSON válido (sin texto extra, sin markdown):
{
 "tipo_sesion": "curso_guiado|roleplay|consulta",
 "desempeno_score": number 0-10,
 "veredicto": "una frase directa sobre el desempeño del asesor",
 "sentimiento": "Positivo|Neutral|Negativo",
 "tono": "1-2 palabras: cómo fue el tono de la sesión (ej. Cálido, Profesional, Tenso, Relajado, Formal)",
 "dificultad": "Baja|Media|Alta — qué tan retador fue el escenario/objeciones para el asesor",
 "modulos": "módulos cubiertos separados por ·",
 "escenario": "descripción breve de qué hizo el asesor",
 "tipo_cliente": "solo si fue roleplay: driver|analytic|amiable|etc — vacío si fue curso",

 "curso": {
   "modulos_completados": ["lista de módulos que cubrió"],
   "comprension_general": number 0-10,
   "puntos_fuertes": "2-3 conceptos que demostró entender bien",
   "brechas_aprendizaje": "2-3 conceptos donde mostró dudas o gaps",
   "participacion": "cómo participó: respondió preguntas, hizo dudas, activo/pasivo",
   "participacion_score": number 0-10,
   "seguimiento": number 0-10 (qué tanto siguió el hilo del curso/proceso sin perderse ni repetir errores),
   "recomendacion_estudio": "qué módulos repasar o practicar primero"
 },

 "roleplay": {
   "competencias": {"rapport":0-10,"pnl":0-10,"postura":0-10,"objeciones":0-10,"cierre":0-10,"sala":0-10},
   "principios_neuro": [{"nombre":"...","intensidad":0-100}],
   "fortalezas": "2-3 frases con el principio neurocientífico que activó",
   "areas_mejora": "2-3 frases con el momento y el principio que falló",
   "objeciones_trabajadas": "qué objeciones enfrentó y cómo las manejó",
   "analisis_pnl": "patrones que usó, los que faltaron y un tip concreto"
 },

 "nota_entrenador": "1-2 frases DIRIGIDAS AL ENTRENADOR/GERENTE HUMANO: qué observar o reforzar en piso con este asesor (no es para el asesor, es una nota interna de coaching)",

 "momentos_clave": [{"t":"mm:ss","label":"descripción breve"}],

 "frecuencia_temas": [{"tema":"tema o argumento tratado (ej. Precio, Incentivos, Tiempo, Indagación, Urgencia)","score":0-10}],

 "quiz": [
   {
     "id": 1,
     "question": "pregunta de comprensión (3 a 5 en total) sobre el módulo/tema EXACTO practicado en esta sesión",
     "user_answer": "lo que el asesor demostró saber o respondió en la conversación (o 'No demostrado' si el tema no se cubrió)",
     "correct_answer": "la respuesta correcta esperada según el material VTC",
     "is_correct": true,
     "explanation": "1 frase: por qué la respuesta del asesor fue correcta o incorrecta",
     "learning_tip": "si is_correct es false, un consejo concreto para dominarlo; usa null si is_correct es true"
   }
 ],

 "neurociencia": {
   "dopamina":  {"nivel":0-100, "texto":"cómo el asesor activó anticipación de recompensa: mencionó beneficios, upgrades, exclusividad. 1 frase."},
   "cortisol":  {"nivel":0-100, "texto":"nivel de estrés/defensa ante objeciones y cómo respondió (alto nivel = manejó mal la presión). 1 frase."},
   "oxitocina": {"nivel":0-100, "texto":"confianza y vínculo construido: rapport, empatía, escucha activa. 1 frase."},
   "amigdala":  {"nivel":0-100, "texto":"activación de miedo/riesgo: qué objeciones o temores del cliente surgieron y si los desactivó. 1 frase."}
 },

 "momento_de_oro": {
   "t": "mm:ss del mejor turno del ASESOR",
   "cita": "transcripción EXACTA de la mejor intervención del asesor (cópiala textual del transcript)",
   "analisis": "por qué fue efectiva: técnica de venta o principio neurocientífico/PNL que usó. 1-2 frases."
 },

 "plan_accion": ["3 a 5 pasos CONCRETOS y accionables para el gerente"],
 "recomendacion": "el siguiente paso exacto para este asesor",
 "siguiente_modulo": "el módulo/escenario EXACTO que debe practicar después (ej. '7 · Objeciones' o '9 · Manager Close')",
 "deep_learning": {
   "que_salio_bien": "1-2 cosas específicas que Víctor hizo bien en esta sesión como coach",
   "que_mejorar": "1-2 cosas concretas que Víctor debería hacer diferente la próxima vez",
   "config_sugerida": "ajustes de configuración o comportamiento del agente para mejorar la experiencia (velocidad, profundidad, estilo, timing, etc.)"
 }
}

Si fue curso_guiado: enfoca el análisis en comprensión, participación, seguimiento y brechas de aprendizaje.
Si fue roleplay: enfoca en las 6 competencias de venta (Rapport, PNL, Postura, Objeciones, Cierre, Leer la Sala) y técnicas de programación neurolingüística.
"tono", "dificultad" y "nota_entrenador" van SIEMPRE, sin importar el tipo de sesión.
"frecuencia_temas": lista SIEMPRE de 3 a 5 temas/argumentos reales que aparecieron en la conversación, con un score 0-10 según qué tan bien/frecuente los trabajó el asesor.
QUIZ: genera SIEMPRE de 3 a 5 preguntas de comprensión basadas en el módulo/tema EXACTO practicado en la sesión (si fue "19 Pasos", pregunta sobre esos pasos; si fueron objeciones, pregunta sobre objeciones). Evalúa cada pregunta contra lo que el asesor demostró saber durante la conversación y marca is_correct. Si un dato clave no se cubrió o el asesor lo dijo mal, márcalo is_correct=false, da la correct_answer y un learning_tip accionable. learning_tip va SOLO cuando is_correct=false (usa null cuando es true). Sé exacto con los datos VTC.
Siempre sé honesto. Responde en español.`;

async function analyze(transcriptText, meta) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key || !transcriptText || transcriptText.length < 20) return null;
  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYS },
          { role: 'user', content: `Duración: ${meta.dur || '?'} · Idioma: ${meta.lang || '?'}\n\nCONVERSACIÓN:\n${transcriptText}` },
        ],
      }),
    });
    if (!r.ok) return null;
    const j = await r.json();
    let txt = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '';
    txt = txt.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const start = txt.indexOf('{'), end = txt.lastIndexOf('}');
    if (start < 0 || end < 0) return null;
    return JSON.parse(txt.slice(start, end + 1));
  } catch (e) {
    return null;
  }
}

module.exports = { analyze };