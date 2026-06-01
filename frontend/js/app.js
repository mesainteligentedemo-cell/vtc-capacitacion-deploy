// Global function to show login form
function showLoginForm() {
  const inicio = document.getElementById('inicio');
  const loginContainer = document.getElementById('login-container');

  if (inicio) inicio.style.display = 'none';
  if (loginContainer) loginContainer.style.display = 'block';

  console.log('Login form shown');
}

class VTCApp {
  constructor() {
    this.userState = window.userState;

    // Create moduleController if it doesn't exist
    if (!window.moduleController) {
      console.log('Creating moduleController...');
      console.log('window.ModuleController:', window.ModuleController);
      try {
        if (window.ModuleController) {
          window.moduleController = new window.ModuleController();
          console.log('✓ moduleController created in VTCApp');
        } else {
          console.error('ModuleController class not found in window');
          window.moduleController = null;
        }
      } catch (e) {
        console.error('Failed to create ModuleController:', e);
        window.moduleController = null;
      }
    }

    this.moduleController = window.moduleController;
  }

  async init() {
    console.log('🚀 Inicializando VTC Capacitación...');

    const usuarioGuardado = this.userState.cargarLocal();

    if (usuarioGuardado) {
      console.log('✓ Usuario encontrado en localStorage');
      await this.iniciarCapacitacion(usuarioGuardado._id);
    } else {
      console.log('→ Mostrando pantalla de bienvenida');
    }

    this.setupEventListeners();
  }

  async handleLogin() {
    console.log('handleLogin called');
    const nombre = document.getElementById('login-nombre').value;
    const email = document.getElementById('login-email').value;
    const rol = document.getElementById('login-rol').value;

    if (!nombre || !email) {
      alert('Por favor completa todos los campos');
      return;
    }

    console.log('Creating user:', { nombre, email, rol });

    try {
      const usuario = await this.userState.crearUsuario(nombre, email, rol);
      console.log('User created:', usuario);
      alert('✓ Usuario creado: ' + nombre);

      const loginContainer = document.getElementById('login-container');
      if (loginContainer) loginContainer.style.display = 'none';

      await this.iniciarCapacitacion(usuario._id);
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error details:', error.message, error.stack);
      alert(`Error en login: ${error.message}`);
    }
  }

  async iniciarCapacitacion(usuarioId) {
    console.log(`📖 Iniciando capacitación para usuario ${usuarioId}`);

    try {
      // Load user
      const usuario = await this.userState.cargarUsuario(usuarioId);

      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      console.log('✓ Usuario cargado:', usuario);

      // Show success screen
      const contentArea = document.getElementById('content-area');
      const inicio = document.getElementById('inicio');
      const loginContainer = document.getElementById('login-container');

      if (inicio) inicio.style.display = 'none';
      if (loginContainer) loginContainer.style.display = 'none';

      contentArea.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--foreground-color);">
          <h2 style="font-size: 2rem; margin-bottom: 1rem;">✓ ¡Bienvenido, ${usuario.nombre}!</h2>
          <p style="font-size: 1.2rem; margin-bottom: 2rem;">Tu capacitación está lista para comenzar.</p>
          <div style="background: var(--border-color); padding: 2rem; border-radius: 8px; max-width: 600px; margin: 0 auto;">
            <h3>Estado actual:</h3>
            <p><strong>Rol:</strong> ${usuario.rol || 'OPC'}</p>
            <p><strong>Módulo actual:</strong> ${usuario.ultimaModulo || 'Fundamentos'}</p>
            <p><strong>Progreso:</strong> ${usuario.modulosCompletados?.length || 0} / 13 módulos completados</p>
          </div>
          <p style="margin-top: 2rem; color: var(--text-secondary);">El sistema está listo. Los módulos interactivos se cargarán en breve...</p>
        </div>
      `;

      alert('✓ ¡Sesión iniciada correctamente! La plataforma está lista para comenzar.');
    } catch (error) {
      console.error('Error en iniciarCapacitacion:', error);
      console.error('Stack:', error.stack);
      alert(`Error: ${error.message}`);
    }
  }

  setupEventListeners() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
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
  console.log('DOMContentLoaded event fired');
  console.log('Globals:', {
    userState: !!window.userState,
    moduleController: !!window.moduleController,
    TimelinePlayer: !!window.TimelinePlayer
  });

  // Fallback: create moduleController if it doesn't exist
  if (!window.moduleController && window.TimelinePlayer && window.ModuleController) {
    console.log('Creating moduleController fallback...');
    window.moduleController = new ModuleController();
  }

  // Fallback: create userState if it doesn't exist
  if (!window.userState && window.UserState) {
    console.log('Creating userState fallback...');
    window.userState = new UserState();
  }

  console.log('Globals after fallback:', {
    userState: !!window.userState,
    moduleController: !!window.moduleController
  });

  const app = new VTCApp();
  app.init();
});