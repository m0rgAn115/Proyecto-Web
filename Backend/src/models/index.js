const sequelize = require('../config/sequelize');
const Rol = require('./rol.model');
const Usuario = require('./usuario.model');
const Partida = require('./partida.model');
const Juego = require('./juego.model');

// Definir relaciones
Usuario.belongsTo(Rol, { foreignKey: 'id_rol', as: 'rol' });
Rol.hasMany(Usuario, { foreignKey: 'id_rol', as: 'usuarios' });

Partida.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });
Usuario.hasMany(Partida, { foreignKey: 'id_usuario', as: 'partidas' });

Partida.belongsTo(Juego, { foreignKey: 'id_juego', as: 'juego' });
Juego.hasMany(Partida, { foreignKey: 'id_juego', as: 'partidas' });

module.exports = { sequelize, Rol, Usuario, Partida, Juego };