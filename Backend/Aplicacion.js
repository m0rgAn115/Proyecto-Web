const { Rol, Usuario, Juego, Partida } = require('./modelos.js');
const sequelize = require('./sequelize');
const express = require('express');
const app = express();
const puerto = 9999;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.json());

app.listen(puerto, () => {
  console.log(`Servidor escuchando en el puerto ${puerto}`);
});

// Login de usuario
app.get('/', async (req, res) => {
  const { User, password } = req.query;

  try {
    await sequelize.authenticate();
    const usuario = await Usuario.findOne({
      where: { username: User, password: password },
      include: { model: Rol, as: 'rol'},
    });

    if (usuario) {
      res.status(200).json({ status: 'yes', tipo: usuario.rol.nombre, id: usuario.id });
    } else {
      res.status(404).json({ status: 'no', tipo: 'nodefinido' });
    }
  } catch (err) {
    console.error('Error al conectar o consultar la base de datos:', err);
    res.status(500).json({ status: 'error', message: 'Error al conectar o consultar la base de datos' });
  }
});

// Obtener partidas
app.get('/partidas', async (req, res) => {
  try {
    const partidas = await Partida.findAll({
      attributes: ['id', 'id_usuario', 'id_juego', 'nombre', 'descripcion', 'puntuacion'],
    });
    res.status(200).json(partidas);
  } catch (error) {
    console.error('Error al obtener las partidas:', error);
    res.status(500).json({ error: 'Error al obtener los partidas' });
  }
});

// Obtener juegos
app.get('/juegos', async (req, res) => {
  try {
    const juegos = await Juego.findAll({
      attributes: ['id', 'nombre', 'descripcion'],
    });
    res.status(200).json(juegos);
  } catch (error) {
    console.error('Error al obtener los juegos:', error);
    res.status(500).json({ error: 'Error al obtener los juegos' });
  }
});

// Obtener un juego
app.get('/juegos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const juego = await Juego.findOne({
      where: { id },
      attributes: ['id', 'nombre', 'descripcion'],
    });

    if (juego) {
      res.status(200).json(juego);
    } else {
      res.status(404).json({ error: 'Juego no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener el juego:', error);
    res.status(500).json({ error: 'Error al obtener el juego' });
  }
});

//CRUD
//CREAR PARTIDA
app.post('/partidas', async (req, res) => {
  const { nombre, descripcion, id, usuario } = req.body;

  try {
    // Verificar si los datos necesarios están presentes
    if (!nombre || !descripcion || !id) {
      return res.status(400).json({ status: 'error', message: 'Todos los campos son obligatorios.' });
    }

    // Crear una nueva partida en la base de datos
    const nuevaPartida = await Partida.create({
      nombre,
      descripcion,
      id_juego: id,
      id_usuario: usuario,
    });

    // Devolver una respuesta de éxito
    res.status(201).json({message: 'Partida creada correctamente', partida: nuevaPartida,});
  } catch (err) {
    console.error('Error al crear la partida:', err);
    res.status(500).json({error: 'Hubo un problema al crear la partida. Inténtalo de nuevo.' });
  }
});

//VER PARTIDA
app.get('/partidas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const partida = await Partida.findOne({
      where: { id },
      attributes: ['id', 'nombre', 'descripcion', 'id_juego', 'puntuacion'],
    });
    res.status(200).json(partida);
  } catch (error) {
    console.error('Error al obtener el juego:', error);
    res.status(500).json({ error: 'Error al obtener el juego' });
  }
});

//EDITAR PARTIDA
app.put('/partidas/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, id_juego, puntuacion } = req.body;

  try {
    const partida = await Partida.findOne({ where: { id: id } });

    if(nombre != undefined)
      partida.nombre = nombre;

    if(descripcion != undefined)
      partida.descripcion = descripcion;

    if(id_juego != undefined )
      partida.id_juego = id_juego;

    if(puntuacion != undefined)
      partida.puntuacion = puntuacion;

    await partida.save();

    res.status(200).json({
      message: 'Partida actualizada correctamente',
      id: partida.id,
      nombre: partida.nombre,
      descripcion: partida.descripcion,
      puntuacion: partida.puntuacion,
      id_juego: partida.id_juego,
    });
  } catch (error) {
    console.error('Error al actualizar la partida:', error);
    res.status(500).json({ error: 'Error al actualizar la partida' });
  }
});

// ELIMINAR PARTIDA
app.delete('/partidas/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const partida = await Partida.findOne({ where: { id: id } });
    await partida.destroy();
    res.status(200).json({ message: 'Partida eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar el partida:', error);
    res.status(500).json({ error: 'Error al eliminar la partida' });
  }
});

