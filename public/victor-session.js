/* ═════════════════════════════════════════════════════════════
   VÍCTOR AGENT — Session State Management
   Persiste: user profile, progress, roleplay context, evaluation history
   ═════════════════════════════════════════════════════════════ */

const MODULES_SEQUENCE = [
  'modulo-f', 'modulo-0', 'modulo-1', 'modulo-2', 'modulo-3',
  'modulo-4', 'modulo-5', 'modulo-6', 'modulo-7', 'modulo-8',
  'modulo-9', 'modulo-10', 'modulo-11', 'modulo-12', 'lvc', 'vtc19'
];

const STORAGE_KEY = 'victorSession';

// ──────────────────────────────────────────────────────────────
// Estructura por defecto de sesión
// ──────────────────────────────────────────────────────────────

function createDefaultSession(userId = null) {
  return {
    user_id: userId || 'user_' + Date.now(),
    known: false,
    name: '',
    role: 'OPC', // default

    // Progreso
    current_module: 'modulo-f',
    last_video_seen: null,
    quiz_completed: [],
    completion_percent: 0,

    // Contexto
    pitch_focus: 19,
    last_session: new Date().toISOString(),
    total_minutes: 0,

    // Evaluación
    strengths: [],
    gaps: [],
    next_focus: 'pitch-simulation',

    // Timestamps
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

// ──────────────────────────────────────────────────────────────
// LOAD / SAVE
// ──────────────────────────────────────────────────────────────

function loadVictorSession() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const newSession = createDefaultSession();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
      return newSession;
    }
    return JSON.parse(stored);
  } catch (e) {
    console.warn('Session load failed, creating new:', e);
    return createDefaultSession();
  }
}

function saveVictorSession(session) {
  try {
    session.updated_at = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    console.log('✓ Session saved:', session.user_id);
    return true;
  } catch (e) {
    console.error('Session save failed:', e);
    return false;
  }
}

function clearVictorSession() {
  localStorage.removeItem(STORAGE_KEY);
}

// ──────────────────────────────────────────────────────────────
// Session Updates (use these to modify state)
// ──────────────────────────────────────────────────────────────

function updateSessionUser(session, name, role, isKnown = true) {
  session.known = isKnown;
  session.name = name;
  session.role = role;
  saveVictorSession(session);
}

function updateCurrentModule(session, moduleId) {
  session.current_module = moduleId;
  saveVictorSession(session);
}

function markVideoSeen(session, moduleId) {
  session.last_video_seen = moduleId;
  if (!session.quiz_completed.includes(moduleId)) {
    // Mark as partially completed (video seen, quiz pending)
  }
  saveVictorSession(session);
}

function markQuizCompleted(session, moduleId) {
  if (!session.quiz_completed.includes(moduleId)) {
    session.quiz_completed.push(moduleId);
    session.completion_percent = Math.round(
      (session.quiz_completed.length / MODULES_SEQUENCE.length) * 100
    );
  }
  saveVictorSession(session);
}

function addStrength(session, strength) {
  if (!session.strengths.includes(strength)) {
    session.strengths.push(strength);
  }
  saveVictorSession(session);
}

function addGap(session, gap) {
  if (!session.gaps.includes(gap)) {
    session.gaps.push(gap);
  }
  saveVictorSession(session);
}

function setNextFocus(session, focus) {
  session.next_focus = focus;
  saveVictorSession(session);
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

function getNextModule(session) {
  const currentIdx = MODULES_SEQUENCE.indexOf(session.current_module);
  if (currentIdx < MODULES_SEQUENCE.length - 1) {
    return MODULES_SEQUENCE[currentIdx + 1];
  }
  return 'final'; // fin del curso
}

function getProgressRing(session) {
  return session.completion_percent;
}

function getFormattedElapsed(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

// ──────────────────────────────────────────────────────────────
// EXPORT para usar en index.html
// ──────────────────────────────────────────────────────────────

window.VictorSession = {
  load: loadVictorSession,
  save: saveVictorSession,
  clear: clearVictorSession,
  updateUser: updateSessionUser,
  setModule: updateCurrentModule,
  videoSeen: markVideoSeen,
  quizDone: markQuizCompleted,
  addStrength,
  addGap,
  setFocus: setNextFocus,
  nextModule: getNextModule,
  progress: getProgressRing,
  formatTime: getFormattedElapsed
};

console.log('✓ Victor Session Manager loaded');
