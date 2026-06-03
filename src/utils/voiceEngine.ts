/**
 * VOICE RECOGNITION ENGINE - VTC Hands-Free System
 * Soporte para comandos naturales en español + inglés
 * Detección de contexto automática (video, quiz, notas)
 */

export type VoiceLanguage = 'es-ES' | 'en-US';
export type ContentContext = 'video' | 'quiz' | 'notes' | 'content' | 'navigation';

export interface VoiceCommand {
  pattern: RegExp;
  action: string;
  context?: ContentContext[];
  aliases?: string[];
  feedback: string;
}

export interface VoiceState {
  isListening: boolean;
  language: VoiceLanguage;
  context: ContentContext;
  confidence: number;
  lastCommand?: string;
  commandQueue: string[];
}

/**
 * Catalogo de comandos de voz mapeados a acciones
 */
const VOICE_COMMANDS_ES: VoiceCommand[] = [
  // VIDEO PLAYBACK
  {
    pattern: /^(reproducir|play|comenzar|empezar)$/i,
    action: 'playVideo',
    context: ['video'],
    feedback: 'Reproduciendo video',
    aliases: ['play', 'comenzar', 'empezar']
  },
  {
    pattern: /^(pausar|pause|pausa)$/i,
    action: 'pauseVideo',
    context: ['video'],
    feedback: 'Video pausado',
    aliases: ['pause', 'pausa']
  },
  {
    pattern: /^(siguiente|next|sig)$/i,
    action: 'nextVideo',
    context: ['video', 'navigation'],
    feedback: 'Siguiente video cargando',
    aliases: ['next', 'siguiente', 'sig']
  },
  {
    pattern: /^(anterior|previous|atrás|atras|back)$/i,
    action: 'previousVideo',
    context: ['video', 'navigation'],
    feedback: 'Video anterior',
    aliases: ['previous', 'atrás', 'back']
  },

  // SKIP NAVIGATION
  {
    pattern: /^adelantar\s+(\d+)(?:\s+segundos)?$/i,
    action: 'skipForward',
    context: ['video'],
    feedback: 'Adelantando video',
    aliases: ['adelantar', 'skip forward']
  },
  {
    pattern: /^(adelantar\s+30|skip\s+30|treinta\s+segundos)$/i,
    action: 'skipForward30',
    context: ['video'],
    feedback: 'Adelantando 30 segundos',
  },
  {
    pattern: /^(adelantar\s+10|skip\s+10)$/i,
    action: 'skipForward10',
    context: ['video'],
    feedback: 'Adelantando 10 segundos',
  },
  {
    pattern: /^rebobinar\s+(\d+)(?:\s+segundos)?$/i,
    action: 'skipBackward',
    context: ['video'],
    feedback: 'Rebobinando video',
    aliases: ['rebobinar', 'rewind']
  },
  {
    pattern: /^(rebobinar\s+10|rewind\s+10)$/i,
    action: 'skipBackward10',
    context: ['video'],
    feedback: 'Rebobinando 10 segundos',
  },

  // SPEED CONTROL
  {
    pattern: /^velocidad\s+(normal|1(?:\.0)?|1x)$/i,
    action: 'setSpeed1x',
    context: ['video'],
    feedback: 'Velocidad normal (1x)',
  },
  {
    pattern: /^velocidad\s+(rápida|1\.5|1\.5x)$/i,
    action: 'setSpeed1_5x',
    context: ['video'],
    feedback: 'Velocidad rápida (1.5x)',
  },
  {
    pattern: /^velocidad\s+(lenta|0\.75|0\.75x)$/i,
    action: 'setSpeed0_75x',
    context: ['video'],
    feedback: 'Velocidad lenta (0.75x)',
  },
  {
    pattern: /^velocidad\s+(\d+(?:\.\d+)?)x?$/i,
    action: 'setCustomSpeed',
    context: ['video'],
    feedback: 'Velocidad ajustada',
  },

  // SUBTITLES
  {
    pattern: /^subtítulos?\s+(activado|encendido|on|si|sí)$/i,
    action: 'enableSubtitles',
    context: ['video'],
    feedback: 'Subtítulos activados',
    aliases: ['subtitulos activado', 'subtitulos on']
  },
  {
    pattern: /^subtítulos?\s+(desactivado|apagado|off|no)$/i,
    action: 'disableSubtitles',
    context: ['video'],
    feedback: 'Subtítulos desactivados',
    aliases: ['subtitulos off']
  },
  {
    pattern: /^subtítulos?\s+(grande|large|aumentar)$/i,
    action: 'subtitleSizeLarge',
    context: ['video'],
    feedback: 'Subtítulos aumentados',
  },
  {
    pattern: /^subtítulos?\s+(pequeño|small|reducir)$/i,
    action: 'subtitleSizeSmall',
    context: ['video'],
    feedback: 'Subtítulos reducidos',
  },

  // FULLSCREEN
  {
    pattern: /^(pantalla completa|fullscreen|fullscreen mode)$/i,
    action: 'toggleFullscreen',
    context: ['video'],
    feedback: 'Pantalla completa activada',
    aliases: ['pantalla completa', 'fullscreen']
  },

  // SCROLL & CONTENT NAVIGATION
  {
    pattern: /^scroll\s+(arriba|up|upward)$/i,
    action: 'scrollUp',
    context: ['content'],
    feedback: 'Scroll arriba',
  },
  {
    pattern: /^scroll\s+(abajo|down|downward)$/i,
    action: 'scrollDown',
    context: ['content'],
    feedback: 'Scroll abajo',
  },
  {
    pattern: /^scroll\s+(rápido|fast|continuo)$/i,
    action: 'startAutoScroll',
    context: ['content'],
    feedback: 'Scroll automático iniciado',
  },
  {
    pattern: /^(parar\s+)?scroll|detener\s+scroll$/i,
    action: 'stopAutoScroll',
    context: ['content'],
    feedback: 'Scroll detenido',
  },
  {
    pattern: /^página\s+(siguiente|anterior|next|previous)$/i,
    action: 'nextPage',
    context: ['content', 'navigation'],
    feedback: 'Siguiente página',
  },

  // COURSE NAVIGATION
  {
    pattern: /^(mostrar|abrir)\s+(lecciones|modulos|chapters)$/i,
    action: 'toggleLessonSidebar',
    context: ['navigation'],
    feedback: 'Mostrando lecciones',
  },
  {
    pattern: /^ir\s+a\s+(lección|leccion|modulo|module)\s+(\d+)$/i,
    action: 'jumpToLesson',
    context: ['navigation'],
    feedback: 'Ir a lección',
  },
  {
    pattern: /^siguiente\s+(módulo|modulo|unidad)$/i,
    action: 'nextModule',
    context: ['navigation'],
    feedback: 'Siguiente módulo cargando',
  },
  {
    pattern: /^(ir\s+a\s+)?inicio|home|return$/i,
    action: 'backToHome',
    context: ['navigation'],
    feedback: 'Volviendo a inicio',
  },

  // QUIZ MODE
  {
    pattern: /^(abrir|comenzar|empezar)\s+(quiz|examen|test)$/i,
    action: 'openQuiz',
    context: ['quiz'],
    feedback: 'Quiz abierto',
    aliases: ['abrir quiz', 'comenzar quiz']
  },
  {
    pattern: /^respuesta\s+([a-d]|1|2|3|4)$/i,
    action: 'submitQuizAnswer',
    context: ['quiz'],
    feedback: 'Respuesta registrada',
  },
  {
    pattern: /^(siguiente|next)\s+(pregunta|question)$/i,
    action: 'nextQuestion',
    context: ['quiz'],
    feedback: 'Siguiente pregunta',
  },
  {
    pattern: /^(anterior|previous)\s+(pregunta|question)$/i,
    action: 'previousQuestion',
    context: ['quiz'],
    feedback: 'Pregunta anterior',
  },
  {
    pattern: /^(repetir|repeat)\s+(pregunta|question)$/i,
    action: 'repeatQuestion',
    context: ['quiz'],
    feedback: 'Pregunta repetida',
  },
  {
    pattern: /^(enviar|submit|terminar|finish)\s+(quiz|examen)$/i,
    action: 'submitQuiz',
    context: ['quiz'],
    feedback: 'Quiz enviado',
  },

  // NOTES
  {
    pattern: /^(crear|nueva|new)\s+(nota|note)$/i,
    action: 'createNote',
    context: ['notes'],
    feedback: 'Nueva nota creada',
    aliases: ['crear nota', 'nueva nota']
  },
  {
    pattern: /^(nota\s+)?automática|dictar\s+nota$/i,
    action: 'takeAutomaticNote',
    context: ['notes'],
    feedback: 'Escuchando nota...',
    aliases: ['nota automatica', 'dictar']
  },
  {
    pattern: /^(mostrar|listar|ver)\s+notas$/i,
    action: 'showNotes',
    context: ['notes'],
    feedback: 'Mostrando notas',
  },
  {
    pattern: /^(borrar|eliminar)\s+nota\s+(\d+)$/i,
    action: 'deleteNote',
    context: ['notes'],
    feedback: 'Nota eliminada',
  },

  // GENERAL
  {
    pattern: /^(ayuda|help|comandos|commands)$/i,
    action: 'showHelp',
    context: [],
    feedback: 'Mostrando comandos disponibles',
    aliases: ['ayuda', 'help', 'comandos']
  },
  {
    pattern: /^(repetir|repeat)\s+(último|last|command|comando)$/i,
    action: 'repeatLastCommand',
    context: [],
    feedback: 'Repitiendo último comando',
  },
  {
    pattern: /^(cerrar|close|salir|exit)$/i,
    action: 'closeOverlay',
    context: [],
    feedback: 'Cerrando control de voz',
  },
  {
    pattern: /^(configurar|settings|opciones|options)$/i,
    action: 'openSettings',
    context: [],
    feedback: 'Abriendo configuración',
  },
];

/**
 * English voice commands (same structure)
 */
const VOICE_COMMANDS_EN: VoiceCommand[] = [
  {
    pattern: /^(play|start|begin)$/i,
    action: 'playVideo',
    context: ['video'],
    feedback: 'Playing video',
  },
  {
    pattern: /^(pause|stop)$/i,
    action: 'pauseVideo',
    context: ['video'],
    feedback: 'Video paused',
  },
  {
    pattern: /^(next|skip)$/i,
    action: 'nextVideo',
    context: ['video', 'navigation'],
    feedback: 'Next video loading',
  },
  {
    pattern: /^(previous|back)$/i,
    action: 'previousVideo',
    context: ['video', 'navigation'],
    feedback: 'Previous video',
  },
  {
    pattern: /^skip\s+(\d+)(?:\s+seconds)?$/i,
    action: 'skipForward',
    context: ['video'],
    feedback: 'Skipping forward',
  },
  {
    pattern: /^rewind\s+(\d+)(?:\s+seconds)?$/i,
    action: 'skipBackward',
    context: ['video'],
    feedback: 'Rewinding',
  },
  {
    pattern: /^fullscreen$/i,
    action: 'toggleFullscreen',
    context: ['video'],
    feedback: 'Fullscreen enabled',
  },
  {
    pattern: /^scroll\s+(up|down)$/i,
    action: 'scrollContent',
    context: ['content'],
    feedback: 'Scrolling',
  },
  {
    pattern: /^(open|start)\s+quiz$/i,
    action: 'openQuiz',
    context: ['quiz'],
    feedback: 'Quiz opened',
  },
  {
    pattern: /^answer\s+([a-d])$/i,
    action: 'submitQuizAnswer',
    context: ['quiz'],
    feedback: 'Answer recorded',
  },
  {
    pattern: /^help$/i,
    action: 'showHelp',
    context: [],
    feedback: 'Showing available commands',
  },
];

/**
 * VoiceCommandParser - Procesa transcripciones de voz a acciones
 */
export class VoiceCommandParser {
  private commands: VoiceCommand[];
  private language: VoiceLanguage;
  private context: ContentContext;
  private commandHistory: string[] = [];

  constructor(language: VoiceLanguage = 'es-ES', context: ContentContext = 'content') {
    this.language = language;
    this.context = context;
    this.commands = language === 'es-ES' ? VOICE_COMMANDS_ES : VOICE_COMMANDS_EN;
  }

  /**
   * Parsea una transcripción de voz y retorna la acción correspondiente
   */
  parseCommand(transcript: string): {
    action: string;
    feedback: string;
    confidence: number;
    params?: Record<string, any>;
  } | null {
    const cleaned = transcript.toLowerCase().trim();

    // Buscar coincidencia exacta
    for (const cmd of this.commands) {
      const match = cleaned.match(cmd.pattern);
      if (match) {
        // Validar que el contexto sea compatible
        if (cmd.context && !cmd.context.includes(this.context)) {
          continue; // Saltar si el contexto no aplica
        }

        // Extraer parámetros si existen
        const params = this.extractParams(match, cmd.action);

        this.commandHistory.push(cmd.action);

        return {
          action: cmd.action,
          feedback: cmd.feedback,
          confidence: 0.95,
          params,
        };
      }
    }

    // Si no hay coincidencia exacta, buscar parcial (más tolerante)
    return this.findFuzzyMatch(cleaned);
  }

  /**
   * Busca coincidencias parciales (fuzzy matching)
   */
  private findFuzzyMatch(transcript: string): any {
    const words = transcript.split(/\s+/);

    for (const cmd of this.commands) {
      // Buscar si alguna palabra clave aparece en el comando
      const cmdPattern = cmd.pattern.source.toLowerCase();
      const score = words.filter(w => cmdPattern.includes(w)).length / words.length;

      if (score > 0.5) {
        return {
          action: cmd.action,
          feedback: `${cmd.feedback} (baja confianza)`,
          confidence: 0.6,
        };
      }
    }

    return null;
  }

  /**
   * Extrae parámetros de comandos complejos (ej: "adelantar 30" → {seconds: 30})
   */
  private extractParams(match: RegExpMatchArray, action: string): Record<string, any> {
    const params: Record<string, any> = {};

    switch (action) {
      case 'skipForward':
      case 'skipBackward':
        params.seconds = parseInt(match[1]) || 10;
        break;
      case 'jumpToLesson':
        params.lessonNumber = parseInt(match[2]);
        break;
      case 'setCustomSpeed':
        params.speed = parseFloat(match[1]);
        break;
      case 'submitQuizAnswer':
        const answer = match[1];
        params.answer = isNaN(Number(answer)) ? answer.toUpperCase() : parseInt(answer) - 1;
        break;
    }

    return params;
  }

  /**
   * Cambia el contexto de comando (ej: cambiar a "quiz" cuando se abre quiz)
   */
  setContext(context: ContentContext) {
    this.context = context;
  }

  /**
   * Cambia el idioma de reconocimiento
   */
  setLanguage(language: VoiceLanguage) {
    this.language = language;
    this.commands = language === 'es-ES' ? VOICE_COMMANDS_ES : VOICE_COMMANDS_EN;
  }

  /**
   * Obtiene el historial de comandos
   */
  getHistory(): string[] {
    return [...this.commandHistory];
  }

  /**
   * Obtiene el último comando ejecutado
   */
  getLastCommand(): string | undefined {
    return this.commandHistory[this.commandHistory.length - 1];
  }

  /**
   * Limpia el historial
   */
  clearHistory() {
    this.commandHistory = [];
  }

  /**
   * Obtiene todos los comandos disponibles para el contexto actual
   */
  getAvailableCommands(context?: ContentContext): VoiceCommand[] {
    const ctx = context || this.context;
    return this.commands.filter(cmd => !cmd.context || cmd.context.includes(ctx));
  }
}

export default VoiceCommandParser;
