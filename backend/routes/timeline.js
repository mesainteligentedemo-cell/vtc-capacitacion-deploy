const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/:modulo', (req, res) => {
  try {
    const { modulo } = req.params;
    const modulosValidos = ['f', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

    if (!modulosValidos.includes(modulo)) {
      return res.status(400).json({ error: 'Módulo no válido' });
    }

    const timelinePath = path.join(__dirname, `../data/modulos/timeline-${modulo}.json`);

    if (!fs.existsSync(timelinePath)) {
      return res.status(404).json({ error: `Timeline para módulo ${modulo} no encontrado` });
    }

    const timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf8'));

    res.json({
      status: 'ok',
      modulo,
      timeline,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', (req, res) => {
  try {
    const modulosDir = path.join(__dirname, '../data/modulos');

    if (!fs.existsSync(modulosDir)) {
      return res.json({ status: 'ok', modulos: [] });
    }

    const files = fs.readdirSync(modulosDir).filter(f => f.startsWith('timeline-'));
    const modulos = files.map(f => ({
      modulo: f.replace('timeline-', '').replace('.json', ''),
      archivo: f
    }));

    res.json({ status: 'ok', modulos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
