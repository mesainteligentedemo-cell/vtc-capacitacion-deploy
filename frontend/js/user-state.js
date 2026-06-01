class UserState {
  constructor() {
    this.usuario = null;
    this.storageKey = 'vtc_user_state';
  }

  async crearUsuario(nombre, email, rol = 'opc') {
    try {
      const response = await fetch('/api/usuarios/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, rol })
      });

      const result = await response.json();

      if (result.usuario) {
        this.usuario = result.usuario;
        this.guardarLocal();
        console.log('✓ Usuario creado:', this.usuario);
        return this.usuario;
      }

      throw new Error(result.error);
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw error;
    }
  }

  async cargarUsuario(usuarioId) {
    try {
      const response = await fetch(`/api/usuarios/${usuarioId}`);
      const result = await response.json();

      if (result.usuario) {
        this.usuario = result.usuario;
        this.guardarLocal();
        console.log('✓ Usuario cargado:', this.usuario);
        return this.usuario;
      }

      throw new Error(result.error);
    } catch (error) {
      console.error('Error cargando usuario:', error);
      return null;
    }
  }

  async obtenerEstado() {
    if (!this.usuario?._id) {
      return null;
    }

    try {
      const response = await fetch(`/api/usuarios/${this.usuario._id}/estado`);
      const result = await response.json();

      if (result.estado) {
        console.log('✓ Estado actual:', result.estado);
        return result.estado;
      }

      throw new Error(result.error);
    } catch (error) {
      console.error('Error obteniendo estado:', error);
      return null;
    }
  }

  guardarLocal() {
    if (this.usuario) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.usuario));
    }
  }

  cargarLocal() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      this.usuario = JSON.parse(stored);
      return this.usuario;
    }
    return null;
  }

  estaAutorizado() {
    return this.usuario?.autorizacion === 'authorized' || this.usuario?.autorizacion === 'pending';
  }

  limpiar() {
    this.usuario = null;
    localStorage.removeItem(this.storageKey);
  }

  getId() {
    return this.usuario?._id;
  }

  getNombre() {
    return this.usuario?.nombre;
  }
}

window.userState = new UserState();
