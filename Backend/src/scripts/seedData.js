const { Rol, Usuario, Juego, Partida } = require('../models/index');
const syncDatabase = require('./initDatabase'); // Importa la función de semillas


async function crearJuego(nombre, descripcion) {
  const [juego, creado] = await Juego.findOrCreate({
    where: { nombre },
    defaults: { descripcion },
  });
  console.log(creado ? `Juego "${nombre}" creado` : `Juego "${nombre}" ya existe`);
}

async function partidasPrecargadas(nombre, descripcion, id_usuario, id_juego) {
  try {
    const [partida, creada] = await Partida.findOrCreate({
      where: { nombre, id_usuario, id_juego },
      defaults: { descripcion }
    });
    console.log(creada ? `Partida "${nombre}" creada` : `Partida "${nombre}" ya existe`);
  } catch (error) {
    console.error("Error al crear la partida:", error.message);
  }
}

async function run() {
  try {
    await syncDatabase();

    const [rolAdministrador, createdRol] = await Rol.findOrCreate({
      where: { nombre: 'administrador' },
    });
    console.log(createdRol ? 'Rol administrador creado' : 'Rol administrador ya existe');

    const [administradorUser, createdUser] = await Usuario.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        password: '1234',
        id_rol: rolAdministrador.id,
      },
    });
    console.log(createdUser ? 'Usuario admin creado' : 'Usuario admin ya existe');
    console.log('Detalles del Usuario Admin:', administradorUser.toJSON());

    // Crear juegos
    await crearJuego('Trivia', 'Responde a la trivia mediante los comandos UP, DOWN, LEFT y RIGHT que se encuentren en la respuesta que quieres marcar, veamos que tanto sabes');
    await crearJuego('Memoria', 'No pierdas la atención en la secuencia de comandos, posteriormente repítelos tú y pon a prueba tu memoria.');
    await crearJuego('Historia Inmersiva', 'Si eres curioso y explorador, este es tu juego, investiga la sala de escape y gana en el menor tiempo posible');

    // Partidas precargadas
    await partidasPrecargadas('Partida 1', 'Partida precargada no. 1', '1', '1');
    await partidasPrecargadas('Partida 2', 'Partida precargada no. 2', '1', '2');
    await partidasPrecargadas('Partida 3', 'Partida precargada no. 3', '1', '3');

  } catch (error) {
    console.error('Error en la ejecución:', error);
  }
}

module.exports = run;
