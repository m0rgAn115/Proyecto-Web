const sequelize = require('./sequelize');
const { DataTypes } = require('sequelize');

//Rol
const Rol = sequelize.define('Rol', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'rol',
  timestamps: false
});

//Usuario
const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  id_rol: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'usuario',
  timestamps: false
});

//Partida
const Partida = sequelize.define('Partida', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_juego: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  puntuacion: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'partida',
  timestamps: false
});

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

// Relaciones
Usuario.belongsTo(Rol, { 
  foreignKey: 'id_rol',
  as: 'rol'            
});

Rol.hasMany(Usuario, { 
  foreignKey: 'id_rol', 
  as: 'usuarios'
});

Partida.belongsTo(Usuario, { 
  foreignKey: 'id_usuario',
  as: 'usuario'            
});

Usuario.hasMany(Partida, { 
  foreignKey: 'id_usuario', 
  as: 'partidas'
});

Partida.belongsTo(Juego, { 
  foreignKey: 'id_juego',
  as: 'juego'            
});

Juego.hasMany(Partida, { 
  foreignKey: 'id_juego', 
  as: 'partidas'
});

// Sincronización y datos iniciales
async function syncDatabase() {
  await sequelize.sync({ force: false });
  console.log('Base de datos sincronizada');
}

async function crearJuego(nombre, descripcion) {
  const [juego, creado] = await Juego.findOrCreate({
    where: { nombre },
    defaults: { descripcion },
  });
  console.log(creado ? `Juego "${nombre}" creado` : `Juego "${nombre}" ya existe`);
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
    await crearJuego('Trivia', 'Esto es prueba de descripcion');
    await crearJuego('Memoria', 'Esto es prueba igual');
    await crearJuego('Juego3', 'Esto es prueba tambien');
  } catch (error) {
    console.error('Error en la ejecución:', error);
  }
}

run();

module.exports = { Rol, Usuario, Partida, Juego };
