const express = require('express');
const router = express.Router();
const PartidaController = require('../controllers/partidaController');

router.get('/', PartidaController.obtenerPartidas);
router.post('/', PartidaController.crearPartida);
router.get('/:id', PartidaController.obtenerPartidaPorId);
router.put('/:id', PartidaController.actualizarPartida);
router.delete('/:id', PartidaController.eliminarPartida);

module.exports = router;