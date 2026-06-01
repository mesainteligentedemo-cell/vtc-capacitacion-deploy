const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.post('/submit', (req, res) => {
  try {
    const { usuarioId, modulo, respuestas } = req.body;

    const timelinePath = path.join(__dirname, `../data/modulos/timeline-${modulo}.json`);

    if (!fs.existsSync(timelinePath)) {
      return res.status(404).json({ error: 'Timeline no encontrado' });
    }

    const timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf8'));

    if (!timeline.quiz || !timeline.quiz.preguntas) {
      return res.status(400).json({ error: 'Quiz no disponible para este módulo' });
    }

    let puntuacion = 0;
    const analisis = [];

    respuestas.forEach((respuesta, index) => {
      const pregunta = timeline.quiz.preguntas[index];

      if (!pregunta) {
        return;
      }

      const esCorrecta = respuesta === pregunta.respuesta_correcta;

      if (esCorrecta) {
        puntuacion += (100 / timeline.quiz.preguntas.length);
      }

      analisis.push({
        pregunta: pregunta.id,
        texto: pregunta.texto,
        respuestaUsuario: respuesta,
        respuestaCorrecta: pregunta.respuesta_correcta,
        esCorrecta: esCorrecta,
        explicacion: pregunta.explicacion,
        opcionUsuario: pregunta.opciones[respuesta],
        opcionCorrecta: pregunta.opciones[pregunta.respuesta_correcta]
      });
    });

    // Guardar en usuario
    const usuariosFile = path.join(__dirname, '../data/usuarios.json');
    const usuarios = JSON.parse(fs.readFileSync(usuariosFile, 'utf8'));
    const usuario = usuarios[usuarioId];

    if (usuario) {
      if (!usuario.quizCompletos) usuario.quizCompletos = [];
      if (!usuario.modulosCompletados) usuario.modulosCompletados = [];

      usuario.quizCompletos.push({
        modulo,
        puntuacion: Math.round(puntuacion),
        respuestas: analisis,
        completadoEn: new Date().toISOString()
      });

      if (!usuario.modulosCompletados.includes(modulo)) {
        usuario.modulosCompletados.push(modulo);
      }

      fs.writeFileSync(usuariosFile, JSON.stringify(usuarios, null, 2), 'utf8');
    }

    res.json({
      status: 'ok',
      puntuacion: Math.round(puntuacion),
      analisis,
      feedback: puntuacion >= 80
        ? '✓ ¡Excelente! Dominas este módulo. Vamos al siguiente.'
        : '→ Necesitas reforzar algunos conceptos. Repasemos...'
    });
  } catch (error) {
    console.error('Error en quiz:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
