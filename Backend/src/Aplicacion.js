const { sequelize } = require('./models/index.js');
const express = require('express');
const app = express();
const puerto = 9999;
const routes = require('./routes/index.js');
const { Usuario, Rol } = require('./models/index.js');
const seedData = require('./scripts/seedData'); // Importa la función de semillas

// Middleware para manejo de CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.json());

app.use('/', routes);


// Función para inicializar la base de datos
async function initializeDatabase() {
  try {
    await sequelize.authenticate(); // Verifica la conexión con la base de datos
    console.log('Conexión con la base de datos establecida.');

    await seedData(); // Inserta datos semilla

    console.log('Datos iniciales insertados.');
  } catch (error) {
    console.error('Error durante la inicialización de la base de datos:', error.message);
    process.exit(1); // Finaliza el proceso si hay un error crítico
  }
}

// Inicia el servidor después de la inicialización de la base de datos
initializeDatabase().then(() => {
  app.listen(puerto, () => {
    console.log(`Servidor escuchando en el puerto ${puerto}`);
  });
});

// Ruta de ejemplo para login
app.get('/', async (req, res) => {
  const { User, password } = req.query;

  try {
    const usuario = await Usuario.findOne({
      where: { username: User, password: password },
      include: { model: Rol, as: 'rol' },
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