const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const usuariosFile = path.join(__dirname, '../data/usuarios.json');

const cargarUsuarios = () => {
  if (fs.existsSync(usuariosFile)) {
    return JSON.parse(fs.readFileSync(usuariosFile, 'utf8'));
  }
  return {};
};

const guardarUsuarios = (datos) => {
  fs.writeFileSync(usuariosFile, JSON.stringify(datos, null, 2), 'utf8');
};

router.post('/create', (req, res) => {
  try {
    const { nombre, email, rol } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({ error: 'Nombre y email requeridos' });
    }

    const usuarios = cargarUsuarios();
    const usuarioId = Math.random().toString(36).substr(2, 9);

    const autorizados = ['Pablo Solar', 'Christian Soria', 'Andres Mateos'];
    const autorizacion = autorizados.includes(nombre) ? 'authorized' : 'pending';

    const usuario = {
      _id: usuarioId,
      nombre,
      email,
      rol: rol || 'opc',
      autorizacion,
      ultimaModulo: 'f',
      modulosCompletados: [],
      createdAt: new Date().toISOString()
    };

    usuarios[usuarioId] = usuario;
    guardarUsuarios(usuarios);

    res.json({
      status: 'ok',
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        ultimaModulo: usuario.ultimaModulo,
        autorizacion: usuario.autorizacion
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const usuarios = cargarUsuarios();
    const usuario = usuarios[req.params.id];

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ status: 'ok', usuario });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/save-progress', (req, res) => {
  try {
    const { modulo, bloque, timecode } = req.body;
    const usuarios = cargarUsuarios();
    const usuario = usuarios[req.params.id];

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    usuario.ultimaModulo = modulo;
    usuario.ultimoBloque = bloque;
    usuario.ultimoTimestamp = timecode;
    usuario.ultimaActividad = new Date().toISOString();

    guardarUsuarios(usuarios);

    res.json({
      status: 'ok',
      message: `Progreso guardado: ${modulo}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/estado', (req, res) => {
  try {
    const usuarios = cargarUsuarios();
    const usuario = usuarios[req.params.id];

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const modulosOrden = ['f', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    let proximoModulo = usuario.ultimaModulo;

    if (usuario.modulosCompletados && usuario.modulosCompletados.length > 0) {
      const ultimoCompletado = usuario.modulosCompletados[usuario.modulosCompletados.length - 1];
      const indexUltimo = modulosOrden.indexOf(ultimoCompletado);
      if (indexUltimo < modulosOrden.length - 1) {
        proximoModulo = modulosOrden[indexUltimo + 1];
      }
    }

    res.json({
      status: 'ok',
      estado: {
        nombre: usuario.nombre,
        ultimaModulo: usuario.ultimaModulo,
        ultimoBloque: usuario.ultimoBloque,
        ultimoTimestamp: usuario.ultimoTimestamp || 0,
        modulosCompletados: usuario.modulosCompletados,
        proximoModulo,
        progreso: {
          completados: usuario.modulosCompletados?.length || 0,
          total: 13
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
