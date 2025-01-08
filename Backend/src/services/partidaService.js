const { Partida } = require('../models/index');

class PartidaService {
  async obtenerPartidas() {
    try {
      return await Partida.findAll({
        attributes: ['id', 'id_usuario', 'id_juego', 'nombre', 'descripcion', 'puntuacion', 'duracion'],
      });
    } catch (error) {
      throw new Error('Error al obtener las partidas');
    }
  }

  async crearPartida(datos) {
    try {
      if (!datos.nombre || !datos.descripcion || !datos.id) {
        throw new Error('Todos los campos son obligatorios.');
      }

      return await Partida.create({
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        id_juego: datos.id,
        id_usuario: datos.usuario,
      });
    } catch (error) {
      throw new Error('Hubo un problema al crear la partida');
    }
  }

  async obtenerPartidaPorId(id) {
    try {
      const partida = await Partida.findOne({
        where: { id },
        attributes: ['id', 'nombre', 'descripcion', 'id_juego', 'puntuacion', 'duracion'],
      });

      if (!partida) {
        throw new Error('Partida no encontrada');
      }

      return partida;
    } catch (error) {
      throw new Error('Error al obtener la partida');
    }
  }

  async actualizarPartida(id, datos) {
    try {
      const partida = await Partida.findOne({ where: { id } });
      
      if (!partida) {
        throw new Error('Partida no encontrada');
      }

      if (datos.nombre !== undefined) partida.nombre = datos.nombre;
      if (datos.descripcion !== undefined) partida.descripcion = datos.descripcion;
      if (datos.id_juego !== undefined) partida.id_juego = datos.id_juego;
      if (datos.puntuacion !== undefined) partida.puntuacion = datos.puntuacion;
      if (datos.duracion !== undefined) partida.duracion = datos.duracion;

      await partida.save();
      return partida;
    } catch (error) {
      throw new Error('Error al actualizar la partida');
    }
  }

  async eliminarPartida(id) {
    try {
      const partida = await Partida.findOne({ where: { id } });
      
      if (!partida) {
        throw new Error('Partida no encontrada');
      }

      await partida.destroy();
      return true;
    } catch (error) {
      throw new Error('Error al eliminar la partida');
    }
  }
}

module.exports = new PartidaService();