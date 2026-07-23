class TimelinePlayer {
  constructor(timeline) {
    this.timeline = timeline;
    this.audio = null;
    this.isPlaying = false;
    this.currentTime = 0;
    this.executedActions = new Set();
    this.updateInterval = null;
    this.granularity = 50;

    this.callbacks = {
      onScroll: null,
      onHighlight: null,
      onPause: null,
      onTransition: null,
      onQuizShow: null,
      onSpeakStart: null,
      onProgress: null
    };

    this.init();
  }

  init() {
    this.audio = document.getElementById('victor-audio');

    if (!this.audio) {
      this.audio = document.createElement('audio');
      this.audio.id = 'victor-audio';
      this.audio.preload = 'auto';
      document.body.appendChild(this.audio);
    }

    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.startTimelineEngine();
      this.updateUI('play');
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.stopTimelineEngine();
      this.updateUI('pause');
    });

    this.audio.addEventListener('ended', () => {
      this.onAudioEnded();
    });

    this.audio.addEventListener('timeupdate', () => {
      this.currentTime = this.audio.currentTime;
      this.updateProgressUI();
    });

    this.audio.src = this.timeline.audioUrl;
  }

  getAllActions() {
    const acciones = [];

    this.timeline.bloques.forEach(bloque => {
      acciones.push(...bloque.acciones);
    });

    if (this.timeline.recap) {
      acciones.push(...this.timeline.recap.acciones);
    }

    if (this.timeline.quiz) {
      acciones.push(...this.timeline.quiz.acciones);
    }

    return acciones.sort((a, b) => a.timecode - b.timecode);
  }

  startTimelineEngine() {
    if (this.updateInterval) clearInterval(this.updateInterval);

    this.updateInterval = setInterval(() => {
      const currentTime = this.audio.currentTime;
      const acciones = this.getAllActions();

      acciones.forEach(accion => {
        if (
          currentTime >= accion.timecode &&
          !this.executedActions.has(this.getActionKey(accion))
        ) {
          this.executeAction(accion, currentTime);
          this.executedActions.add(this.getActionKey(accion));
        }
      });
    }, this.granularity);
  }

  stopTimelineEngine() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  executeAction(accion, currentTime) {
    console.log(`[${currentTime.toFixed(2)}s] Ejecutando: ${accion.tipo}`, accion);

    switch (accion.tipo) {
      case 'scroll':
        this.actionScroll(accion);
        break;
      case 'highlight':
        this.actionHighlight(accion);
        break;
      case 'pause':
        this.actionPause(accion);
        break;
      case 'transition':
        this.actionTransition(accion);
        break;
      case 'speak-start':
        this.actionSpeakStart(accion);
        break;
      case 'show-quiz':
        this.actionShowQuiz(accion);
        break;
    }

    if (this.callbacks.onProgress) {
      this.callbacks.onProgress({
        accion,
        timecode: currentTime
      });
    }
  }

  actionScroll(accion) {
    const element = document.querySelector(accion.target);

    if (!element) {
      console.warn(`Elemento no encontrado: ${accion.target}`);
      return;
    }

    element.scrollIntoView({
      behavior: accion.behavior || 'smooth',
      block: 'center'
    });

    element.classList.add('active');

    if (this.callbacks.onScroll) {
      this.callbacks.onScroll({
        target: accion.target,
        element: element
      });
    }
  }

  actionHighlight(accion) {
    const text = accion.text;
    const duration = accion.duration || 3000;

    const elements = this.findElementsByText(text);

    elements.forEach(el => {
      el.classList.add(`highlight-${accion.color || 'gold'}`);

      setTimeout(() => {
        el.classList.remove(`highlight-${accion.color || 'gold'}`);
      }, duration);
    });

    if (this.callbacks.onHighlight) {
      this.callbacks.onHighlight({
        text,
        elements,
        duration
      });
    }
  }

  actionPause(accion) {
    const duration = accion.duration || 2000;

    this.audio.pause();

    setTimeout(() => {
      if (this.isPlaying !== false) {
        this.audio.play();
      }
    }, duration);

    if (this.callbacks.onPause) {
      this.callbacks.onPause({
        duration
      });
    }
  }

  actionTransition(accion) {
    if (this.callbacks.onTransition) {
      this.callbacks.onTransition({
        text: accion.text
      });
    }
  }

  actionSpeakStart(accion) {
    document.body.classList.add('victor-speaking');

    if (this.callbacks.onSpeakStart) {
      this.callbacks.onSpeakStart({
        duracion: accion.duracion
      });
    }
  }

  actionShowQuiz(accion) {
    const quizSection = document.getElementById('quiz-section');
    if (quizSection) {
      quizSection.style.display = 'block';
      quizSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (this.callbacks.onQuizShow) {
      this.callbacks.onQuizShow();
    }
  }

  getActionKey(accion) {
    return `${accion.timecode}-${accion.tipo}-${accion.target || accion.text || ''}`;
  }

  findElementsByText(text) {
    const allElements = document.querySelectorAll('p, h3, h4, li, span, div');
    const matches = [];

    allElements.forEach(el => {
      if (el.children.length === 0 && el.textContent.includes(text)) {
        matches.push(el);
      }
    });

    return matches;
  }

  play() {
    this.audio.play();
  }

  pause() {
    this.audio.pause();
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.reset();
  }

  reset() {
    this.executedActions.clear();
    this.stopTimelineEngine();
    this.currentTime = 0;
    this.updateProgressUI();
  }

  seek(seconds) {
    const accionesAntes = this.getAllActions().filter(a => a.timecode < seconds);

    this.executedActions.clear();
    this.audio.currentTime = seconds;

    accionesAntes.forEach(accion => {
      this.executeAction(accion, seconds);
      this.executedActions.add(this.getActionKey(accion));
    });
  }

  updateProgressUI() {
    const audioSlider = document.getElementById('audio-slider');
    const audioTime = document.getElementById('audio-time');

    if (audioSlider && this.audio.duration) {
      const progress = (this.currentTime / this.audio.duration) * 100;
      audioSlider.value = progress;
    }

    if (audioTime) {
      audioTime.textContent = `${this.formatTime(this.currentTime)} / ${this.formatTime(this.audio.duration)}`;
    }
  }

  updateUI(state) {
    const btnPlay = document.getElementById('btn-play');
    const btnPause = document.getElementById('btn-pause');

    if (state === 'play') {
      if (btnPlay) btnPlay.style.display = 'none';
      if (btnPause) btnPause.style.display = 'inline-flex';
    } else if (state === 'pause') {
      if (btnPlay) btnPlay.style.display = 'inline-flex';
      if (btnPause) btnPause.style.display = 'none';
    }
  }

  formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  onScroll(callback) {
    this.callbacks.onScroll = callback;
  }

  onHighlight(callback) {
    this.callbacks.onHighlight = callback;
  }

  onPause(callback) {
    this.callbacks.onPause = callback;
  }

  onTransition(callback) {
    this.callbacks.onTransition = callback;
  }

  onQuizShow(callback) {
    this.callbacks.onQuizShow = callback;
  }

  onSpeakStart(callback) {
    this.callbacks.onSpeakStart = callback;
  }

  onProgress(callback) {
    this.callbacks.onProgress = callback;
  }

  onAudioEnded() {
    console.log('✅ Módulo completado');

    const moduleNav = document.getElementById('module-nav');
    if (moduleNav) {
      moduleNav.style.display = 'flex';
    }

    if (window.moduleController) {
      window.moduleController.saveProgress('completed');
    }
  }
}

window.TimelinePlayer = TimelinePlayer;