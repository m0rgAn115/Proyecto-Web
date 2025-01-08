const servicioJuego = require('../services/juegoService');

class ControladorJuego {
  async obtenerTodosLosJuegos(req, res) {
    try {
      const juegos = await servicioJuego.obtenerTodosLosJuegos();
      res.status(200).json(juegos);
    } catch (error) {
      console.error('Error en obtenerTodosLosJuegos:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async obtenerJuegoPorId(req, res) {
    try {
      const { id } = req.params;
      const juego = await servicioJuego.obtenerJuegoPorId(id);
      res.status(200).json(juego);
    } catch (error) {
      console.error('Error en obtenerJuegoPorId:', error);
      
      if (error.message === 'Juego no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ControladorJuego();