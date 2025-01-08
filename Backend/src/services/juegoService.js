// servicios/servicioJuego.js
const { Juego } = require('../models/index');

class JuegoService {
  async obtenerTodosLosJuegos() {
    try {
      return await Juego.findAll({
        attributes: ['id', 'nombre', 'descripcion']
      });
    } catch (error) {
      throw new Error('Error al obtener los juegos');
    }
  }

  async obtenerJuegoPorId(id) {
    try {
      const juego = await Juego.findOne({
        where: { id },
        attributes: ['id', 'nombre', 'descripcion']
      });

      if (!juego) {
        throw new Error('Juego no encontrado');
      }

      return juego;
    } catch (error) {
      if (error.message === 'Juego no encontrado') {
        throw error;
      }
      throw new Error('Error al obtener el juego');
    }
  }
}

module.exports = new JuegoService();