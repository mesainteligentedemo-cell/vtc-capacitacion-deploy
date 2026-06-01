class VTCApp {
  constructor() {
    this.userState = window.userState;
    this.moduleController = window.moduleController;
  }

  async init() {
    console.log('🚀 Inicializando VTC Capacitación...');

    const usuarioGuardado = this.userState.cargarLocal();

    if (usuarioGuardado) {
      console.log('✓ Usuario encontrado en localStorage');
      await this.iniciarCapacitacion(usuarioGuardado._id);
    } else {
      console.log('→ Mostrar pantalla de login');
      this.mostrarLogin();
    }

    this.setupEventListeners();
  }

  mostrarLogin() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
      <div class="login-section" style="max-width: 400px; margin: 3rem auto; text-align: center;">
        <h2>Bienvenido a VTC Capacitación</h2>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">
          Inicia sesión con tu información para continuar
        </p>

        <form id="login-form" style="display: flex; flex-direction: column; gap: 1rem;">
          <input
            type="text"
            id="login-nombre"
            placeholder="Nombre completo"
            required
            style="padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 4px; font-family: inherit; font-size: 1rem;"
          >
          <input
            type="email"
            id="login-email"
            placeholder="Correo electrónico"
            required
            style="padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 4px; font-family: inherit; font-size: 1rem;"
          >
          <select
            id="login-rol"
            style="padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 4px; font-family: inherit; font-size: 1rem;"
          >
            <option value="opc">OPC</option>
            <option value="liner">Liner</option>
            <option value="closer">Closer</option>
            <option value="manager">Manager</option>
          </select>
          <button type="submit" class="btn btn-primary btn-lg">
            Iniciar Capacitación
          </button>
        </form>
      </div>
    `;

    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });
  }

  async handleLogin() {
    const nombre = document.getElementById('login-nombre').value;
    const email = document.getElementById('login-email').value;
    const rol = document.getElementById('login-rol').value;

    if (!nombre || !email) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      const usuario = await this.userState.crearUsuario(nombre, email, rol);
      await this.iniciarCapacitacion(usuario._id);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }

  async iniciarCapacitacion(usuarioId) {
    console.log(`📖 Iniciando capacitación para usuario ${usuarioId}`);

    const usuario = await this.userState.cargarUsuario(usuarioId);

    if (!usuario) {
      alert('Error cargando usuario');
      return;
    }

    if (!this.userState.estaAutorizado()) {
      console.warn('Acceso pendiente de autorización, pero continuando...');
    }

    const estado = await this.userState.obtenerEstado();

    await this.moduleController.init(usuarioId);

    const moduloACargar = estado?.ultimaModulo || 'f';
    await this.moduleController.loadModulo(moduloACargar);

    if (estado?.ultimoTimestamp && estado.ultimoTimestamp > 5) {
      console.log(`↪️ Reanudando desde segundo ${estado.ultimoTimestamp}`);
      setTimeout(() => {
        if (this.moduleController.timelinePlayer) {
          this.moduleController.timelinePlayer.seek(estado.ultimoTimestamp);
        }
      }, 1000);
    }
  }

  setupEventListeners() {
    const btnStartCourse = document.getElementById('btn-start-course');
    if (btnStartCourse) {
      btnStartCourse.addEventListener('click', async () => {
        const usuarioId = this.userState.getId();
        if (usuarioId && this.moduleController) {
          await this.moduleController.loadModulo('f');
        } else {
          this.mostrarLogin();
        }
      });
    }

    const btnPlay = document.getElementById('btn-play');
    const btnPause = document.getElementById('btn-pause');
    const audioSlider = document.getElementById('audio-slider');

    if (btnPlay) {
      btnPlay.addEventListener('click', () => {
        if (this.moduleController?.timelinePlayer) {
          this.moduleController.timelinePlayer.play();
        }
      });
    }

    if (btnPause) {
      btnPause.addEventListener('click', () => {
        if (this.moduleController?.timelinePlayer) {
          this.moduleController.timelinePlayer.pause();
        }
      });
    }

    if (audioSlider) {
      audioSlider.addEventListener('change', (e) => {
        if (this.moduleController?.timelinePlayer) {
          const percent = e.target.value / 100;
          const duration = this.moduleController.timelinePlayer.audio.duration;
          this.moduleController.timelinePlayer.seek(percent * duration);
        }
      });
    }

    setInterval(() => {
      if (this.moduleController?.timelinePlayer?.isPlaying) {
        this.moduleController.saveProgress();
      }
    }, 10000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new VTCApp();
  app.init();
});