
const { Juego } = require('../models/index');
const express = require('express');
const router = express.Router();
const controladorJuego = require('../controllers/juegoController');

router.get('/', controladorJuego.obtenerTodosLosJuegos);
router.get('/:id', controladorJuego.obtenerJuegoPorId);

module.exports = router;
