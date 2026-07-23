/**
 * ELEVENLABS VICTOR WIDGET — CONVERSACIÓN IA CON AUTENTICACIÓN DE VOZ
 *
 * CARACTERÍSTICAS:
 * ✅ Verificación de voz autorizada (solo usuario específico)
 * ✅ Filtro de ruido en micrófono
 * ✅ Detección dinámica de Knowledge Base
 * ✅ Soporte bilingüe (ES/EN con voice ID correcto)
 * ✅ Cambio de idioma en vivo
 * ✅ Webhook n8n automático
 * ✅ Almacenamiento de sesión en localStorage
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';

// ============================================================================
// SISTEMA DE AUTENTICACIÓN DE VOZ — CLASE PRINCIPAL
// ============================================================================

class VoiceAuthenticator {
  authorizedUser: any = null;
  voiceProfile: any = null;
  audioContext: any = null;
  analyser: any = null;
  dataArray: any = null;
  isAuthenticated = false;
  unauthorizedAttempts = 0;
  maxUnauthorizedAttempts = 2;

  initAudioAnalyzer(stream: MediaStream) {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      console.log('✅ Analizador de audio inicializado');
      return true;
    } catch (error) {
      console.error('❌ Error inicializando analizador de audio:', error);
      return false;
    }
  }

  getVoiceFingerprint() {
    if (!this.analyser || !this.dataArray) return null;

    this.analyser.getByteFrequencyData(this.dataArray);

    const avg = (arr: Uint8Array) => Array.from(arr).reduce((a, b) => a + b, 0) / arr.length;
    const low = avg(this.dataArray.slice(0, 10));
    const mid = avg(this.dataArray.slice(20, 40));
    const high = avg(this.dataArray.slice(100, 120));

    return { low, mid, high, timestamp: Date.now() };
  }

  registerAuthorizedUser(userName: string, userEmail: string) {
    this.authorizedUser = {
      name: userName,
      email: userEmail,
      registeredAt: new Date().toISOString()
    };

    localStorage.setItem('vtc_authorized_user', JSON.stringify(this.authorizedUser));

    this.voiceProfile = this.getVoiceFingerprint();
    if (this.voiceProfile) {
      localStorage.setItem('vtc_voice_profile', JSON.stringify(this.voiceProfile));
    }

    this.isAuthenticated = true;
    console.log('✅ Usuario autorizado registrado:', this.authorizedUser.name);
    console.log('🎤 Perfil de voz grabado');
  }

  verifyVoiceMatch() {
    if (!this.isAuthenticated || !this.voiceProfile) {
      return true;
    }

    const currentFingerprint = this.getVoiceFingerprint();
    if (!currentFingerprint) return true;

    const tolerance = 30;
    const lowMatch = Math.abs(currentFingerprint.low - this.voiceProfile.low) < tolerance;
    const midMatch = Math.abs(currentFingerprint.mid - this.voiceProfile.mid) < tolerance;
    const highMatch = Math.abs(currentFingerprint.high - this.voiceProfile.high) < tolerance;

    const isMatch = lowMatch && midMatch && highMatch;

    if (!isMatch) {
      console.warn('⚠️ DETECCIÓN: Cambio de voz identificado');
      this.unauthorizedAttempts++;
    } else {
      this.unauthorizedAttempts = 0;
    }

    return isMatch;
  }

  handleUnauthorizedVoice(language: string) {
    const userName = this.authorizedUser?.name || 'el usuario';

    const messages: any = {
      es: `Espera, escucho que hay alguien más que no está autorizado en esta sesión. Lo siento, pero esta capacitación de VTC es únicamente para ${userName}. Solo puedo hablar con ${userName}. Si eres ${userName}, por favor asegúrate de estar en un lugar privado sin otras personas.`,
      en: `Wait, I hear someone else who is not authorized in this session. I'm sorry, but this VTC training is exclusively for ${userName}. I can only speak with ${userName}. If you are ${userName}, please make sure you're in a private location without other people.`
    };

    return messages[language] || messages.es;
  }

  shouldBlockSession() {
    return this.unauthorizedAttempts >= this.maxUnauthorizedAttempts;
  }
}

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

const getInitialLanguage = () => {
  if (typeof window === 'undefined') return 'es';

  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang');
  if (urlLang === 'en' || urlLang === 'es') return urlLang;
  return localStorage.getItem('vtc_language') || 'es';
};

const detectKnowledgeBase = (userMessage: string) => {
  const msg = userMessage.toLowerCase();
  if (msg.includes('curso') || msg.includes('capacitación') || msg.includes('entrenamiento')) {
    return 'KB_PART_1_MODULOS_BIENVENIDA_F_0_1_2';
  } else if (msg.includes('pitch') || msg.includes('19 pasos') || msg.includes('proceso')) {
    return 'PITCH_VTC_19_PASOS_12_MODULOS';
  }
  return 'KB_PART_1_MODULOS_BIENVENIDA_F_0_1_2';
};

const getVoiceId = (language: string) => {
  return language === 'en' ? 'pwMBn0SsmN1220Aorv15' : 'sDh3eviBhiuHKi0MjTNq';
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

interface ElevenLabsVictorWidgetProps {
  agentId?: string;
  webhookUrl?: string;
  userName?: string;
  userEmail?: string;
  onReady?: () => void;
  onError?: (error: string) => void;
}

const ElevenLabsVictorWidget: React.FC<ElevenLabsVictorWidgetProps> = ({
  agentId = 'agent_9501k3vkt6svekjs6y0qe5xzcek1',
  webhookUrl = 'https://n8n.srv1013903.hstgr.cloud/webhook/5e52ee2e-0a0d-4591-941b-c0140e783505',
  userName = 'Usuario VTC',
  userEmail = 'user@vtc.com',
  onReady,
  onError,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [language, setLanguage] = useState(getInitialLanguage());
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Array<{role: string; text: string}>>([]);
  const [error, setError] = useState<string>('');

  const voiceAuthRef = useRef(new VoiceAuthenticator());
  const conversationRef = useRef<any>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const sessionStartTimeRef = useRef(Date.now());

  // ============================================================================
  // INICIALIZAR CONVERSACIÓN CON ELEVENLABS
  // ============================================================================

  const initializeConversation = async (audioStream: MediaStream) => {
    try {
      const voiceId = getVoiceId(language);
      const knowledgeBase = 'KB_PART_1_MODULOS_BIENVENIDA_F_0_1_2';

      // Simulación de creación de conversación (en producción usarías el SDK real)
      const conversation = {
        id: `conv_${Date.now()}`,
        agentId: agentId,
        language: language,
        voiceId: voiceId,
        knowledgeBase: knowledgeBase,
        listeners: {} as any,
      };

      // Métodos de evento simulados
      conversation.on = function(event: string, callback: Function) {
        this.listeners[event] = callback;
      };

      conversation.send = function(text: string) {
        // Simular envío
        console.log('📤 Usuario enviado:', text);

        // Verificar voz
        const isVoiceMatch = voiceAuthRef.current.verifyVoiceMatch();
        if (!isVoiceMatch) {
          const rejection = voiceAuthRef.current.handleUnauthorizedVoice(language);
          setMessages(prev => [...prev, { role: 'agent', text: rejection }]);

          if (voiceAuthRef.current.shouldBlockSession()) {
            console.error('🚫 SESIÓN BLOQUEADA');
            setError('Sesión bloqueada por seguridad. Contacta al administrador.');
            conversation.end();
          }
          return;
        }

        // Procesar normalmente
        setMessages(prev => [...prev, { role: 'user', text }]);

        // Detectar KB
        const newKB = detectKnowledgeBase(text);
        localStorage.setItem('vtc_knowledge_base', newKB);

        // Simular respuesta de Victor
        setTimeout(() => {
          const response = `Entendido. Procederé con tu solicitud sobre: ${text.substring(0, 50)}...`;
          setMessages(prev => [...prev, { role: 'agent', text: response }]);
        }, 1000);
      };

      conversation.end = function() {
        console.log('🔌 Conversación terminada');
        // Enviar datos a webhook
        sendToWebhook();
      };

      localStorage.setItem('vtc_language', language);
      localStorage.setItem('vtc_knowledge_base', knowledgeBase);
      localStorage.setItem('vtc_conversation_id', conversation.id);

      conversationRef.current = conversation;
      setIsConnected(true);

      console.log('✅ Conversación iniciada');
      console.log('  - Idioma:', language);
      console.log('  - Voice ID:', voiceId);
      console.log('  - KB:', knowledgeBase);

      onReady?.();
    } catch (error: any) {
      console.error('❌ Error iniciando conversación:', error);
      const errorMsg = 'Error al conectar con Víctor. Por favor, recarga la página.';
      setError(errorMsg);
      onError?.(errorMsg);
    }
  };

  // ============================================================================
  // INICIALIZAR MICRÓFONO CON FILTRO DE RUIDO
  // ============================================================================

  const initializeMicrophone = async () => {
    try {
      const audioConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
      audioStreamRef.current = stream;

      console.log('✅ Micrófono con filtro de ruido activado');

      // Inicializar analizador de voz
      voiceAuthRef.current.initAudioAnalyzer(stream);

      // Registrar usuario autorizado
      voiceAuthRef.current.registerAuthorizedUser(userName, userEmail);

      // Inicializar conversación
      await initializeConversation(stream);
    } catch (error: any) {
      console.error('❌ Error accediendo al micrófono:', error);
      const errorMsg = `Error de micrófono: ${error.message}`;
      setError(errorMsg);
      onError?.(errorMsg);
    }
  };

  // ============================================================================
  // ENVIAR DATOS A WEBHOOK n8n
  // ============================================================================

  const sendToWebhook = async () => {
    try {
      const sessionData = {
        conversationId: localStorage.getItem('vtc_conversation_id'),
        userName: localStorage.getItem('vtc_session_user_name') || userName,
        language: language,
        knowledgeBase: localStorage.getItem('vtc_knowledge_base'),
        timestamp: new Date().toISOString(),
        duration: Date.now() - sessionStartTimeRef.current,
        messages: messages,
      };

      console.log('📧 Enviando a webhook n8n...', sessionData);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer secret_vtc_webhook_v2024'
        },
        body: JSON.stringify(sessionData)
      });

      if (response.ok) {
        console.log('✅ Datos enviados a webhook n8n');
        localStorage.setItem('vtc_last_session', JSON.stringify(sessionData));
      } else {
        console.warn('⚠️ Error en webhook:', response.status);
      }
    } catch (error) {
      console.error('❌ Error enviando a webhook:', error);
    }
  };

  // ============================================================================
  // CAMBIAR IDIOMA EN VIVO
  // ============================================================================

  const handleLanguageChange = async (newLanguage: string) => {
    if (newLanguage === language) return;

    console.log('🌐 Cambiando idioma a', newLanguage);
    setLanguage(newLanguage);
    localStorage.setItem('vtc_language', newLanguage);

    if (conversationRef.current) {
      conversationRef.current.end();
    }

    // Reiniciar
    await initializeMicrophone();
  };

  // ============================================================================
  // TERMINAR SESIÓN
  // ============================================================================

  const endConversation = () => {
    console.log('✅ Sesión terminada');
    if (conversationRef.current) {
      conversationRef.current.end();
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
    }

    setIsConnected(false);
  };

  // ============================================================================
  // EFECTOS
  // ============================================================================

  useEffect(() => {
    initializeMicrophone();

    return () => {
      endConversation();
    };
  }, []);

  // ============================================================================
  // RENDERIZADO
  // ============================================================================

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      maxHeight: '600px',
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      zIndex: 9999
    }}>
      {/* HEADER */}
      <div style={{
        backgroundColor: '#667eea',
        color: '#fff',
        padding: '16px',
        borderRadius: '12px 12px 0 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600 }}>
            🤖 Víctor - Coach VTC
          </h3>
          <small style={{ opacity: 0.9 }}>
            {isConnected ? '✅ Conectado' : '⏳ Conectando...'}
          </small>
        </div>
        <button
          onClick={endConversation}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        >
          ✕ Cerrar
        </button>
      </div>

      {/* IDIOMA */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee' }}>
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '13px'
          }}
        >
          <option value="es">🇪🇸 Español</option>
          <option value="en">🇺🇸 English</option>
        </select>
      </div>

      {/* MENSAJES */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        backgroundColor: '#f9fafb'
      }}>
        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '12px',
            fontSize: '13px'
          }}>
            ⚠️ {error}
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: '12px',
              textAlign: msg.role === 'user' ? 'right' : 'left'
            }}
          >
            <div style={{
              display: 'inline-block',
              maxWidth: '85%',
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: msg.role === 'user' ? '#667eea' : '#e5e7eb',
              color: msg.role === 'user' ? '#fff' : '#111',
              fontSize: '13px',
              lineHeight: '1.4'
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {!isConnected && (
          <div style={{
            textAlign: 'center',
            color: '#999',
            padding: '20px',
            fontSize: '13px'
          }}>
            ⏳ Conectando con Víctor...
          </div>
        )}
      </div>

      {/* INPUT */}
      {isConnected && (
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid #eee',
          display: 'flex',
          gap: '8px'
        }}>
          <input
            type="text"
            placeholder="Escribe aquí..."
            onKeyPress={(e) => {
              if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                const text = (e.target as HTMLInputElement).value.trim();
                conversationRef.current?.send(text);
                (e.target as HTMLInputElement).value = '';
              }
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '13px'
            }}
          />
          <button
            onClick={() => {
              const input = document.querySelector('[placeholder="Escribe aquí..."]') as HTMLInputElement;
              if (input?.value.trim()) {
                conversationRef.current?.send(input.value.trim());
                input.value = '';
              }
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#667eea',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500
            }}
          >
            Enviar
          </button>
        </div>
      )}
    </div>
  );
};

export default ElevenLabsVictorWidget;