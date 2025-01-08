const express = require('express');
const router = express.Router();
const partida_routes = require('./partida');
const model_routes = require('./model');
const juegos_routes = require('./juegos');

router.use('/partidas', partida_routes);
router.use('/model', model_routes);
router.use('/juegos', juegos_routes);

module.exports = router;