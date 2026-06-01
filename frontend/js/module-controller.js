class ModuleController {
  constructor() {
    this.modulosOrden = ['f', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    this.usuarioId = null;
    this.usuarioData = null;
    this.timelinePlayer = null;
    this.currentModulo = null;
  }

  async init(usuarioId) {
    this.usuarioId = usuarioId;

    try {
      const response = await fetch(`/api/usuarios/${usuarioId}`);
      const result = await response.json();

      if (result.usuario) {
        this.usuarioData = result.usuario;
      }

      console.log('✓ Usuario cargado:', this.usuarioData);
    } catch (error) {
      console.error('Error cargando usuario:', error);
      this.usuarioData = {
        _id: usuarioId,
        nombre: 'Usuario',
        ultimaModulo: 'f',
        modulosCompletados: []
      };
    }

    this.updateUserUI();
    this.renderModulosNav();

    return this.usuarioData;
  }

  async loadModulo(moduloId) {
    if (!this.modulosOrden.includes(moduloId)) {
      console.error(`Módulo ${moduloId} no válido`);
      return;
    }

    console.log(`📦 Cargando módulo ${moduloId}...`);

    try {
      const response = await fetch(`/api/timeline/${moduloId}`);
      const data = await response.json();

      if (!data.timeline) {
        throw new Error('Timeline no encontrado');
      }

      const timeline = data.timeline;

      this.renderModuleContent(moduloId, timeline);

      this.timelinePlayer = new TimelinePlayer(timeline);
      this.setupTimelineCallbacks();

      this.currentModulo = moduloId;
      this.updateUI();

      console.log('✓ Módulo cargado exitosamente');
    } catch (error) {
      console.error('Error cargando módulo:', error);
      alert(`Error cargando módulo ${moduloId}: ${error.message}`);
    }
  }

  renderModuleContent(moduloId, timeline) {
    const heroSection = document.getElementById('inicio');
    const moduleContent = document.getElementById('module-content');

    if (heroSection) heroSection.style.display = 'none';
    if (moduleContent) moduleContent.style.display = 'block';

    document.getElementById('module-title').textContent = timeline.titulo || `Módulo ${moduloId}`;

    const bloquesContainer = document.getElementById('bloques-container');
    bloquesContainer.innerHTML = '';

    timeline.bloques.forEach((bloque, index) => {
      const bloqueEl = document.createElement('div');
      bloqueEl.id = `block-${index}`;
      bloqueEl.className = 'bloque';
      bloqueEl.innerHTML = `
        <h3>${bloque.titulo}</h3>
        <p>${bloque.contenido}</p>
      `;

      bloquesContainer.appendChild(bloqueEl);
    });

    const recapSection = document.getElementById('recap-section');
    const recapContent = document.getElementById('recap-content');

    if (timeline.recap && recapContent) {
      recapContent.innerHTML = `
        <p>En este módulo aprendiste sobre <strong>${timeline.titulo}</strong>.</p>
        <p>Los conceptos clave son:</p>
        <ul>
          ${timeline.bloques.map(b => `<li>${b.titulo}</li>`).join('')}
        </ul>
        <p>Ahora haremos un quiz para verificar tu comprensión.</p>
      `;
      recapSection.style.display = 'none';
    }

    if (timeline.quiz) {
      this.renderQuiz(timeline.quiz);
    }
  }

  renderQuiz(quizData) {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = '';

    quizData.preguntas.forEach((pregunta, index) => {
      const preguntaEl = document.createElement('div');
      preguntaEl.className = 'quiz-question';
      preguntaEl.id = `question-${index}`;

      preguntaEl.innerHTML = `
        <h4>Pregunta ${index + 1}: ${pregunta.texto}</h4>
        <div class="quiz-options">
          ${pregunta.opciones.map((opcion, optIndex) => `
            <div class="option" data-index="${optIndex}" onclick="window.moduleController.selectAnswer(${index}, ${optIndex})">
              ${opcion}
            </div>
          `).join('')}
        </div>
        <div class="quiz-feedback" id="feedback-${index}" style="display:none; margin-top:1rem; padding:1rem; border-radius:4px; background-color:#f5f5f5;">
          <p id="feedback-text-${index}"></p>
        </div>
      `;

      quizContainer.appendChild(preguntaEl);
    });

    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn btn-primary btn-lg';
    submitBtn.textContent = 'Enviar Respuestas';
    submitBtn.onclick = () => this.submitQuiz();

    quizContainer.appendChild(submitBtn);
  }

  selectAnswer(questionIndex, optionIndex) {
    const options = document.querySelectorAll(`#question-${questionIndex} .option`);

    options.forEach(opt => opt.classList.remove('selected'));
    options[optionIndex].classList.add('selected');

    if (!window.quizAnswers) window.quizAnswers = {};
    window.quizAnswers[questionIndex] = optionIndex;
  }

  async submitQuiz() {
    const respuestas = Object.values(window.quizAnswers || {});

    if (respuestas.length === 0) {
      alert('Por favor responde todas las preguntas');
      return;
    }

    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: this.usuarioId,
          modulo: this.currentModulo,
          respuestas
        })
      });

      const result = await response.json();

      console.log('✓ Quiz evaluado:', result);

      this.showQuizFeedback(result.analisis);
      await this.saveProgress('completed');
      this.showNextModuleButton();
    } catch (error) {
      console.error('Error evaluando quiz:', error);
      alert('Error evaluando quiz');
    }
  }

  showQuizFeedback(analisis) {
    analisis.forEach((feedback, index) => {
      const feedbackDiv = document.getElementById(`feedback-${index}`);
      const feedbackText = document.getElementById(`feedback-text-${index}`);
      const option = document.querySelector(`#question-${index} .option[data-index="${feedback.respuestaUsuario}"]);

      if (feedback.esCorrecta) {
        option.classList.add('correct');
        feedbackText.innerHTML = `✓ <strong>Correcto:</strong> ${feedback.explicacion}`;
      } else {
        option.classList.add('incorrect');
        feedbackText.innerHTML = `✗ <strong>Incorrecto:</strong> La respuesta correcta es ${feedback.opcionCorrecta}. ${feedback.explicacion}`;
      }

      feedbackDiv.style.display = 'block';
    });
  }

  showNextModuleButton() {
    const nextIndex = this.modulosOrden.indexOf(this.currentModulo) + 1;

    if (nextIndex < this.modulosOrden.length) {
      const proximoModulo = this.modulosOrden[nextIndex];
      const moduleNav = document.getElementById('module-nav');

      moduleNav.style.display = 'flex';
      document.getElementById('btn-next-module').onclick = () => {
        this.loadModulo(proximoModulo);
      };
    } else {
      alert('🎉 ¡Felicidades! Completaste todos los módulos de capacitación.');
    }
  }

  setupTimelineCallbacks() {
    this.timelinePlayer.onProgress((data) => {
      console.log(`[${data.timecode.toFixed(2)}s] ${data.accion.tipo}`);
    });
  }

  async saveProgress(status = 'in_progress') {
    if (!this.usuarioId || !this.currentModulo || !this.timelinePlayer) {
      return;
    }

    const bloque = document.querySelector('.bloque.active')?.id || 'block-0';
    const timecode = this.timelinePlayer.currentTime || 0;

    try {
      const response = await fetch(`/api/usuarios/${this.usuarioId}/save-progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modulo: this.currentModulo,
          bloque,
          timecode,
          status
        })
      });

      const result = await response.json();
      console.log('✓ Progreso guardado:', result);
    } catch (error) {
      console.error('Error guardando progreso:', error);
    }
  }

  renderModulosNav() {
    const modulosNav = document.getElementById('modulos-nav');
    modulosNav.innerHTML = '';

    const nombres = {
      f: 'Fundamentos',
      0: 'Psicología',
      1: 'Calificación',
      2: 'OPC',
      3: 'Rapport/PNL',
      4: 'Tour',
      5: 'Presentación',
      6: 'Cierre',
      7: 'Objeciones',
      8: 'TOC',
      9: 'Manager',
      10: 'PNL Avanzado',
      11: 'Nacionalidades',
      12: 'Legal'
    };

    this.modulosOrden.forEach(moduloId => {
      const isCompleted = this.usuarioData?.modulosCompletados?.includes(moduloId);
      const isCurrent = this.usuarioData?.ultimaModulo === moduloId;

      const item = document.createElement('button');
      item.className = 'modulo-item';
      if (isCompleted) item.classList.add('completed');
      if (isCurrent) item.classList.add('current');

      item.textContent = `${isCompleted ? '✓' : '•'} ${nombres[moduloId]}`;
      item.onclick = () => this.loadModulo(moduloId);

      modulosNav.appendChild(item);
    });
  }

  updateUI() {
    this.updateUserUI();
    this.renderModulosNav();
  }

  updateUserUI() {
    const userNameEl = document.getElementById('user-name');
    if (userNameEl) {
      userNameEl.textContent = this.usuarioData?.nombre || 'Usuario';
    }
  }
}

window.moduleController = new ModuleController();