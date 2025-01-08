const PartidaService = require('../services/partidaService');

class PartidaController {
  async obtenerPartidas(req, res) {
    try {
      const partidas = await PartidaService.obtenerPartidas();
      res.status(200).json(partidas);
    } catch (error) {
      console.error('Error en obtenerPartidas:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async crearPartida(req, res) {
    try {
      const nuevaPartida = await PartidaService.crearPartida(req.body);
      res.status(201).json({
        message: 'Partida creada correctamente',
        partida: nuevaPartida,
      });
    } catch (error) {
      console.error('Error en crearPartida:', error);
      res.status(error.message.includes('obligatorios') ? 400 : 500)
        .json({ error: error.message });
    }
  }

  async obtenerPartidaPorId(req, res) {
    try {
      const partida = await PartidaService.obtenerPartidaPorId(req.params.id);
      res.status(200).json(partida);
    } catch (error) {
      console.error('Error en obtenerPartidaPorId:', error);
      res.status(404).json({ error: error.message });
    }
  }

  async actualizarPartida(req, res) {
    try {
      const partida = await PartidaService.actualizarPartida(req.params.id, req.body);
      res.status(200).json({
        message: 'Partida actualizada correctamente',
        id: partida.id,
        nombre: partida.nombre,
        descripcion: partida.descripcion,
        puntuacion: partida.puntuacion,
        id_juego: partida.id_juego,
        duracion: partida.duracion,
      });
    } catch (error) {
      console.error('Error en actualizarPartida:', error);
      res.status(error.message.includes('no encontrada') ? 404 : 500)
        .json({ error: error.message });
    }
  }

  async eliminarPartida(req, res) {
    try {
      await PartidaService.eliminarPartida(req.params.id);
      res.status(200).json({ message: 'Partida eliminada correctamente' });
    } catch (error) {
      console.error('Error en eliminarPartida:', error);
      res.status(error.message.includes('no encontrada') ? 404 : 500)
        .json({ error: error.message });
    }
  }
}

module.exports = new PartidaController();