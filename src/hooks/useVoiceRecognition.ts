/**
 * useVoiceRecognition Hook - Web Speech API Integration
 * Maneja el reconocimiento de voz continuo con soporte para múltiples idiomas
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import VoiceCommandParser, { ContentContext, VoiceLanguage } from '@/utils/voiceEngine';

interface UseVoiceRecognitionProps {
  language?: VoiceLanguage;
  context?: ContentContext;
  onCommand?: (action: string, params?: any) => void;
  onListeningChange?: (isListening: boolean) => void;
  onError?: (error: string) => void;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
}

interface VoiceRecognitionState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  isSupported: boolean;
  error?: string;
  lastCommand?: string;
  confidence: number;
}

export const useVoiceRecognition = ({
  language = 'es-ES',
  context = 'content',
  onCommand,
  onListeningChange,
  onError,
  onTranscript,
}: UseVoiceRecognitionProps) => {
  const [state, setState] = useState<VoiceRecognitionState>({
    isListening: false,
    transcript: '',
    interimTranscript: '',
    isSupported: typeof window !== 'undefined' && (
      'webkitSpeechRecognition' in window ||
      'SpeechRecognition' in window
    ),
    confidence: 0,
  });

  const recognitionRef = useRef<any>(null);
  const parserRef = useRef<VoiceCommandParser>(
    new VoiceCommandParser(language, context)
  );
  const listeningTimeoutRef = useRef<NodeJS.Timeout>();

  /**
   * Inicializa la API de Web Speech
   */
  const initializeRecognition = useCallback(() => {
    if (!state.isSupported) {
      const error = 'Web Speech API no soportada en este navegador';
      setState(prev => ({ ...prev, error }));
      onError?.(error);
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();

    // Configuración
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    // Event: resultado de reconocimiento
    recognition.onresult = (event: any) => {
      let interim = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      // Actualizar estado
      setState(prev => ({
        ...prev,
        interimTranscript: interim,
        transcript: finalTranscript,
      }));

      onTranscript?.(finalTranscript || interim, !!finalTranscript);

      // Procesar comandos si tenemos transcripción final
      if (finalTranscript) {
        const parsed = parserRef.current.parseCommand(finalTranscript);
        if (parsed) {
          setState(prev => ({
            ...prev,
            lastCommand: parsed.action,
            confidence: parsed.confidence,
          }));
          onCommand?.(parsed.action, parsed.params);
        }

        // Limpiar transcripción después de un tiempo
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            transcript: '',
          }));
        }, 1500);
      }
    };

    // Event: error
    recognition.onerror = (event: any) => {
      const errorMessage = `Error de voz: ${event.error}`;
      setState(prev => ({ ...prev, error: errorMessage }));
      onError?.(errorMessage);
    };

    // Event: fin de escucha
    recognition.onend = () => {
      setState(prev => ({
        ...prev,
        isListening: false,
        interimTranscript: '',
      }));
      onListeningChange?.(false);
    };

    recognitionRef.current = recognition;
  }, [state.isSupported, language, onCommand, onListeningChange, onError, onTranscript]);

  /**
   * Inicia el reconocimiento de voz
   */
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      initializeRecognition();
    }

    try {
      recognitionRef.current.start();
      setState(prev => ({ ...prev, isListening: true, error: undefined }));
      onListeningChange?.(true);

      // Auto-stop después de 30 segundos sin entrada
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
      }
      listeningTimeoutRef.current = setTimeout(() => {
        stopListening();
      }, 30000);
    } catch (err: any) {
      // El reconocimiento ya está activo
      if (err.message !== 'recognition is already started') {
        onError?.(err.message);
      }
    }
  }, [initializeRecognition, onListeningChange, onError]);

  /**
   * Detiene el reconocimiento de voz
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current);
    }
    setState(prev => ({
      ...prev,
      isListening: false,
    }));
    onListeningChange?.(false);
  }, [onListeningChange]);

  /**
   * Alterna entre escuchar y no escuchar
   */
  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  /**
   * Cambia el contexto
   */
  const setContext = useCallback((newContext: ContentContext) => {
    parserRef.current.setContext(newContext);
  }, []);

  /**
   * Cambia el idioma
   */
  const setLanguage = useCallback((newLanguage: VoiceLanguage) => {
    parserRef.current.setLanguage(newLanguage);
    if (recognitionRef.current) {
      recognitionRef.current.lang = newLanguage;
    }
  }, []);

  /**
   * Obtiene comandos disponibles
   */
  const getAvailableCommands = useCallback(() => {
    return parserRef.current.getAvailableCommands();
  }, []);

  /**
   * Limpia recursos
   */
  useEffect(() => {
    return () => {
      stopListening();
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
      }
    };
  }, [stopListening]);

  // Inicializar una sola vez
  useEffect(() => {
    initializeRecognition();
  }, []);

  return {
    // Estado
    isListening: state.isListening,
    transcript: state.transcript,
    interimTranscript: state.interimTranscript,
    isSupported: state.isSupported,
    error: state.error,
    lastCommand: state.lastCommand,
    confidence: state.confidence,

    // Métodos
    startListening,
    stopListening,
    toggleListening,
    setContext,
    setLanguage,
    getAvailableCommands,
  };
};

export default useVoiceRecognition;
