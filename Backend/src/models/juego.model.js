const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');

//Juego
const Juego = sequelize.define('Juego', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'juego',
  timestamps: false
});

module.exports = Juego;
