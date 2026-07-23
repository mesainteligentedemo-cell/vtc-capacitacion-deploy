/**
 * VoiceOverlay - Interfaz Flotante de Control de Voz
 * Ubicación: esquina inferior derecha
 * Muestra: status + commandos rápidos + indicador de escucha
 */

import React, { useState, useEffect } from 'react';
import styles from './VoiceOverlay.module.css';
import useVoiceRecognition from '@/hooks/useVoiceRecognition';
import { ContentContext, VoiceLanguage } from '@/utils/voiceEngine';

interface VoiceOverlayProps {
  context?: ContentContext;
  language?: VoiceLanguage;
  onCommand?: (action: string, params?: any) => void;
  onContextChange?: (context: ContentContext) => void;
  showQuickCommands?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  mobileOffset?: number; // px offset para mobile (default: 80px para bottom nav)
}

/**
 * Listado de comandos rápidos por contexto
 */
const QUICK_COMMANDS = {
  video: [
    { icon: '▶', label: 'Reproducir', action: 'playVideo' },
    { icon: '⏸', label: 'Pausar', action: 'pauseVideo' },
    { icon: '⏭', label: 'Siguiente', action: 'nextVideo' },
  ],
  quiz: [
    { icon: '✓', label: 'Responder', action: 'submitQuizAnswer' },
    { icon: '⏭', label: 'Siguiente', action: 'nextQuestion' },
    { icon: '🔄', label: 'Repetir', action: 'repeatQuestion' },
  ],
  content: [
    { icon: '⬇', label: 'Scroll', action: 'scrollDown' },
    { icon: '⬆', label: 'Arriba', action: 'scrollUp' },
    { icon: '?', label: 'Ayuda', action: 'showHelp' },
  ],
  notes: [
    { icon: '✏', label: 'Nota', action: 'createNote' },
    { icon: '🎤', label: 'Dictar', action: 'takeAutomaticNote' },
    { icon: '📋', label: 'Ver', action: 'showNotes' },
  ],
};

/**
 * Componente VoiceOverlay
 */
export const VoiceOverlay: React.FC<VoiceOverlayProps> = ({
  context = 'content',
  language = 'es-ES',
  onCommand,
  onContextChange,
  showQuickCommands = true,
  position = 'bottom-right',
  mobileOffset = 80,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [commandFeedback, setCommandFeedback] = useState<string>('');
  const [currentContext, setCurrentContext] = useState<ContentContext>(context);

  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    lastCommand,
    confidence,
    startListening,
    stopListening,
    toggleListening,
    setContext,
    setLanguage,
    getAvailableCommands,
  } = useVoiceRecognition({
    language,
    context: currentContext,
    onCommand: (action, params) => {
      setCommandFeedback(action);
      onCommand?.(action, params);
      setTimeout(() => setCommandFeedback(''), 2000);
    },
  });

  // Sincronizar contexto
  useEffect(() => {
    setContext(currentContext);
    onContextChange?.(currentContext);
  }, [currentContext, setContext, onContextChange]);

  // Si no está soportado
  if (!isSupported) {
    return (
      <div className={`${styles.voiceOverlay} ${styles[position]}`}>
        <div className={styles.unsupported}>
          <span>🎤</span>
          <p>Web Speech API no disponible</p>
        </div>
      </div>
    );
  }

  const currentQuickCommands = QUICK_COMMANDS[currentContext] || QUICK_COMMANDS.content;
  const availableCommands = getAvailableCommands();

  return (
    <>
      {/* MAIN OVERLAY */}
      <div className={`${styles.voiceOverlay} ${styles[position]} ${isExpanded ? styles.expanded : ''}`}>
        {/* Header - Siempre visible */}
        <div className={styles.voiceHeader}>
          <button
            className={`${styles.micButton} ${isListening ? styles.active : ''}`}
            onClick={toggleListening}
            title={isListening ? 'Dejar de escuchar' : 'Escuchar comandos'}
            aria-label="Toggle voice recognition"
          >
            <span className={styles.micIcon}>🎤</span>
            {isListening && <span className={styles.pulseBadge}>●</span>}
          </button>

          <div className={styles.headerText}>
            <span className={styles.title}>Control por voz</span>
            {isListening && <span className={styles.listeningBadge}>Escuchando...</span>}
          </div>

          <button
            className={styles.expandButton}
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Minimizar' : 'Expandir'}
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>

        {/* EXPANDED CONTENT */}
        {isExpanded && (
          <div className={styles.expandedContent}>
            {/* STATUS */}
            <div className={styles.statusSection}>
              <div className={`${styles.statusIndicator} ${isListening ? styles.active : ''}`}>
                {isListening ? (
                  <>
                    <div className={styles.waveform}>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span className={styles.statusText}>Escuchando...</span>
                  </>
                ) : (
                  <span className={styles.statusText}>Presiona micrófono para escuchar</span>
                )}
              </div>

              {/* TRANSCRIPT */}
              {(transcript || interimTranscript) && (
                <div className={styles.transcriptBox}>
                  <p className={styles.finalTranscript}>{transcript}</p>
                  {interimTranscript && (
                    <p className={styles.interimTranscript}>{interimTranscript}</p>
                  )}
                </div>
              )}

              {/* FEEDBACK */}
              {commandFeedback && (
                <div className={`${styles.feedbackBadge} ${styles.success}`}>
                  ✓ {commandFeedback}
                </div>
              )}

              {/* ERROR */}
              {error && (
                <div className={`${styles.feedbackBadge} ${styles.error}`}>
                  ⚠ {error}
                </div>
              )}
            </div>

            {/* QUICK COMMANDS */}
            {showQuickCommands && (
              <div className={styles.quickCommands}>
                {currentQuickCommands.map((cmd) => (
                  <button
                    key={cmd.action}
                    className={styles.quickButton}
                    onClick={() => {
                      onCommand?.(cmd.action);
                      setCommandFeedback(cmd.action);
                      setTimeout(() => setCommandFeedback(''), 2000);
                    }}
                    title={cmd.label}
                  >
                    <span className={styles.icon}>{cmd.icon}</span>
                    <span className={styles.label}>{cmd.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* CONTEXT SWITCHER */}
            <div className={styles.contextSwitcher}>
              <label htmlFor="context-select">Contexto:</label>
              <select
                id="context-select"
                value={currentContext}
                onChange={(e) => setCurrentContext(e.target.value as ContentContext)}
                className={styles.select}
              >
                <option value="video">Video</option>
                <option value="quiz">Quiz</option>
                <option value="content">Contenido</option>
                <option value="notes">Notas</option>
                <option value="navigation">Navegación</option>
              </select>
            </div>

            {/* SETTINGS */}
            <div className={styles.settingsRow}>
              <label htmlFor="language-select">Idioma:</label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as VoiceLanguage)}
                className={styles.select}
              >
                <option value="es-ES">Español</option>
                <option value="en-US">English</option>
              </select>
            </div>

            {/* CONFIDENCE */}
            {confidence > 0 && (
              <div className={styles.confidenceBar}>
                <span className={styles.label}>Confianza:</span>
                <div className={styles.bar}>
                  <div
                    className={styles.fill}
                    style={{ width: `${confidence * 100}%` }}
                  ></div>
                </div>
                <span className={styles.value}>{Math.round(confidence * 100)}%</span>
              </div>
            )}

            {/* FOOTER BUTTONS */}
            <div className={styles.footerButtons}>
              <button
                className={styles.helpButton}
                onClick={() => setShowHelp(!showHelp)}
              >
                ? Ayuda
              </button>
              <button
                className={styles.closeButton}
                onClick={() => setIsExpanded(false)}
              >
                ✕ Cerrar
              </button>
            </div>
          </div>
        )}

        {/* HINTS (Minimized) */}
        {!isExpanded && (
          <div className={styles.hints}>
            <small>Di: "{availableCommands[0]?.pattern.source.split('|')[0]}"</small>
          </div>
        )}
      </div>

      {/* HELP PANEL */}
      {showHelp && (
        <div className={`${styles.helpPanel} ${styles[position]}`}>
          <div className={styles.helpContent}>
            <div className={styles.helpHeader}>
              <h3>Comandos Disponibles</h3>
              <button
                className={styles.closeHelp}
                onClick={() => setShowHelp(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.commandsList}>
              {availableCommands.map((cmd, idx) => (
                <div key={idx} className={styles.commandItem}>
                  <code className={styles.pattern}>
                    {cmd.pattern.source}
                  </code>
                  <span className={styles.feedback}>{cmd.feedback}</span>
                </div>
              ))}
            </div>

            <div className={styles.helpFooter}>
              <small>💡 Tip: Presiona el micrófono y habla naturalmente</small>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceOverlay;
