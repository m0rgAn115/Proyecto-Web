const { sequelize } = require('../models');

async function syncDatabase() {
  try {
    await sequelize.sync({ force: false }); // Cambia a true para reiniciar las tablas
    console.log('Base de datos sincronizada');
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error.message);
  }
}

module.exports = syncDatabase; 