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
 "modulos": "módulos cubiertos separados por ·",
 "escenario": "descripción breve de qué hizo el asesor",
 "tipo_cliente": "solo si fue roleplay: driver|analytic|amiable|etc — vacío si fue curso",

 "curso": {
   "modulos_completados": ["lista de módulos que cubrió"],
   "comprension_general": number 0-10,
   "puntos_fuertes": "2-3 conceptos que demostró entender bien",
   "brechas_aprendizaje": "2-3 conceptos donde mostró dudas o gaps",
   "participacion": "cómo participó: respondió preguntas, hizo dudas, activo/pasivo",
   "recomendacion_estudio": "qué módulos repasar o practicar primero"
 },

 "roleplay": {
   "competencias": {"rapport":0-10,"postura":0-10,"objeciones":0-10,"sala":0-10,"cierre":0-10,"pnl":0-10},
   "principios_neuro": [{"nombre":"...","intensidad":0-100}],
   "fortalezas": "2-3 frases con el principio neurocientífico que activó",
   "areas_mejora": "2-3 frases con el momento y el principio que falló",
   "objeciones_trabajadas": "qué objeciones enfrentó y cómo las manejó",
   "analisis_pnl": "patrones que usó, los que faltaron y un tip concreto"
 },

 "momentos_clave": [{"t":"mm:ss","label":"descripción breve"}],
 "plan_accion": ["3 a 5 pasos CONCRETOS y accionables para el gerente"],
 "recomendacion": "el siguiente paso exacto para este asesor",
 "deep_learning": {
   "que_salio_bien": "1-2 cosas específicas que Víctor hizo bien en esta sesión como coach",
   "que_mejorar": "1-2 cosas concretas que Víctor debería hacer diferente la próxima vez",
   "config_sugerida": "ajustes de configuración o comportamiento del agente para mejorar la experiencia (velocidad, profundidad, estilo, timing, etc.)"
 }
}

Si fue curso_guiado: enfoca el análisis en comprensión, participación y brechas de aprendizaje.
Si fue roleplay: enfoca en competencias de venta y técnicas PNL.
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