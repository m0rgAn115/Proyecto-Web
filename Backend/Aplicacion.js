const { Rol, Usuario, Juego, Partida } = require('./modelos.js');
const sequelize = require('./sequelize');
const express = require('express');
const app = express();
const puerto = 9999;
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: "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"});

const MODELS = ["llama-3.3-70b-versatile","llama3-70b-8192"]

const MODEL = MODELS[1]

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

async function sendMessage(message) {
  try {

    // Enviar el historial completo de mensajes al modelo
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: message,
        }
      ],
      model: MODEL,
      response_format: {"type": "json_object"}
    });

    return response.choices[0]?.message?.content
  } catch (error) {
    throw new Error(`Error en Groq: ${error.message}`);
  }
}

async function generarTrivia(tema) {
  try {

    // Enviar el historial completo de mensajes al modelo
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `
         Eres un generador especializado de preguntas de trivia. Tu tarea es crear 5 preguntas desafiantes pero precisas sobre el tema: "${tema}".

          Requisitos para las preguntas:
          - Deben ser claras y concisas
          - Nivel de dificultad moderado
          - Basadas en hechos verificables
          - Sin ambigüedades en las respuestas

          Para cada pregunta deberás generar:
          - 1 respuesta correcta
          - 3 respuestas incorrectas pero plausibles
          - Las opciones deben presentarse en orden aleatorio
          - El índice correcto debe corresponder a la posición (0-3) de la respuesta correcta
          
          La puntuación debe asignarse según estos criterios:
          - Para preguntas muy básicas: 50-150 puntos
          - Para preguntas de conocimiento general: 151-300 puntos
          - Para preguntas especializadas: 301-500 puntos
          - Para preguntas muy específicas o técnicas: 501-1000 puntos
          
          Asigna la puntuación considerando:
          - La especificidad del conocimiento requerido
          - La complejidad de la pregunta
          - El nivel de detalle necesario
          - La rareza o unicidad de la información

          La respuesta debe ser un objeto JSON con la siguiente estructura, sin caracteres de escape:
          {
            "puntuacion": número que representa los puntos por respuesta correcta,
            "preguntas": [
              {
                "pregunta": "string con la pregunta",
                "opciones": ["opción 1", "opción 2", "opción 3", "opción 4"],
                "indice_correcto": número del 0 al 3
              }
            ]
          }

          Devuelve el JSON formateado.

          Ejemplo de respuesta de salida:
          {
            "puntuacion": 450,
            "preguntas": [
              {
                "pregunta": "¿En qué año comenzó la Revolución Mexicana?",
                "opciones": [
                  "1910",
                  "1921",
                  "1900",
                  "1917"
                ],
                "indice_correcto": 0
              },
              {
                "pregunta": "¿Quién fue el último emperador azteca?",
                "opciones": [
                  "Hernán Cortés",
                  "Cuauhtémoc",
                  "Moctezuma I",
                  "Cuitláhuac"
                ],
                "indice_correcto": 1
              },
              {
                "pregunta": "¿Qué presidente mexicano implementó la expropiación petrolera?",
                "opciones": [
                  "Porfirio Díaz",
                  "Benito Juárez",
                  "Lázaro Cárdenas",
                  "Francisco I. Madero"
                ],
                "indice_correcto": 2
              },
              {
                "pregunta": "¿En qué año se firmó la actual Constitución Mexicana?",
                "opciones": [
                  "1810",
                  "1910",
                  "1921",
                  "1917"
                ],
                "indice_correcto": 3
              },
              {
                "pregunta": "¿Cuál fue el nombre original de la Ciudad de México?",
                "opciones": [
                  "Tenochtitlan",
                  "Tlatelolco",
                  "Texcoco",
                  "Tula"
                ],
                "indice_correcto": 0
              }
            ]
          }

          UNICAMENTE DEVUELVE TU RESPUESTA EN FORMATO JSON, VALIDA QUE EL JSON TENGA EL FORMATO CORRECTO.

          `,
        }
      ],
      model: MODEL,
      response_format: {"type": "json_object"}
    });

    return response.choices[0]?.message?.content
  } catch (error) {
    throw new Error(`Error en Groq: ${error.message}`);
  }
}

app.post('/model/send-message', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ status: "error", message: "No se envio un mensaje." });
  }

  const response = await sendMessage(message)
  res.status(200).json({ response });
})

app.post('/model/generar-trivia', async (req, res) => {
  const { tema } = req.body;

  if (!tema) {
    return res.status(400).json({ status: "error", message: "No se envio un tema para generar trivia." });
  }

  const response = await generarTrivia(tema)


  const obj = JSON.parse(response);
  
  res.status(200).json({ preguntas: obj.preguntas, puntuacion: obj.puntuacion });
})

async function generar_temas_trivia() {
  try {

    // Enviar el historial completo de mensajes al modelo
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Eres un experto generador de temas para trivias. Tu tarea es crear una lista diversa y entretenida de 10 temas, cada uno acompañado de emojis relevantes.

          Requisitos para los temas:
          - Cada tema debe incluir 1-2 emojis que lo representen visualmente
          - Los temas deben ser diversos y abarcar diferentes categorías:
            * Historia y cultura
            * Entretenimiento (cine, TV, música)
            * Ciencia y tecnología
            * Deportes
            * Literatura
            * Arte
            * Cultura pop
            * Geografía
            * Gastronomía
            * Curiosidades generales

          El formato de respuesta debe ser un objeto JSON exactamente así:
          {
            "temas": [
              "Nombre del tema + emoji(s)"
            ]
          }

          Ejemplo de temas bien formateados:
          - "Imperio Romano ⚔️🏛️"
          - "Mundo Marvel 🦸‍♂️🎬"
          - "Videojuegos Clásicos 🕹️👾"


          Ejemplo de respuesta de salida:

          {
            "temas": [
              "Historia de Japón 🗾⛩️",
              "Series Netflix 📺🍿",
              "Sistema Solar 🌎🌠",
              "Copa Mundial ⚽🏆",
              "Mitología Griega ⚡🏺",
              "Arte Renacentista 🎨🖼️",
              "Rock Clásico 🎸🤘",
              "Cultura Maya 🏯🗿",
              "Cocina Italiana 🍝🇮🇹",
              "Inventos Famosos 💡⚡"
            ]
          }

          UNICAMENTE DEVUELVE UN JSON CORRECTAMENTE FORMATEADO.
          `,
        }
      ],
      model: MODEL,
      response_format: {"type": "json_object"}
    });

    return response.choices[0]?.message?.content
  } catch (error) {
    throw new Error(`Error en Groq: ${error.message}`);
  }
}

app.get('/model/generar-temas', async (req, res) => {

  const response = await generar_temas_trivia()


  const obj = JSON.parse(response);
  
  res.status(200).json({ data: obj });
})

let conversationHistory = [];

async function generarHistoria(tema, comando) {
  try {
    // if(conversationHistory.length > 5){
    //   conversationHistory.reduce
    // }
    // Agregar el mensaje del usuario al historial

    if(conversationHistory.length==0 && tema!= undefined)
      conversationHistory.push({
        role: "user",
        content: `Eres un creador de juegos de escape interactivos. El jugador está atrapado en un lugar virtual y debe resolver acertijos para escapar. Deberas crear el juego en base al siguiente tema: ${tema}

                  Te daré el historial de la conversación entre el jugador y el juego, junto con el último comando ingresado por el jugador. Basándote en esto, debes generar la siguiente parte del juego, describiendo el entorno actual, las acciones posibles y los comandos asociados a ellas.

                  Tu respuesta debe estar en formato JSON, con las siguientes claves:

                  "description": Describe el entorno actual y cualquier detalle relevante (objetos, pistas, etc.).
                  "options": Una lista de objetos que represente las acciones posibles. Cada objeto debe incluir:
                  "text": La acción que el jugador puede realizar.
                  "command": El comando de voz asociado a la acción.
                  Ejemplo de respuesta: 
                  {
                    "description": "Estás en una habitación oscura con una puerta cerrada frente a ti. A tu izquierda hay un escritorio con un cajón, y a tu derecha hay una ventana bloqueada.",
                    "options": [
                      { "text": "Abrir el cajón del escritorio", "command": "left" },
                      { "text": "Inspeccionar la puerta cerrada", "command": "up" },
                      { "text": "Mirar por la ventana bloqueada", "command": "right" }
                    ]
                  }

                  Responde únicamente en formato JSON, sin ningún texto adicional. Si el jugador realiza un comando incorrecto o no válido, devuelve una descripción adecuada y opciones para continuar.

                  `,
      });
    else {
      conversationHistory.push({
        role: "user",
        content: `El usuario decidio: ${comando}`,
      });
    }

    // Si tienes datos adicionales (como fecha, reservación, etc.), inclúyelos en el mensaje

    // Enviar el historial completo de mensajes al modelo
    const response = await groq.chat.completions.create({
      messages: conversationHistory,
      model: MODEL,
      response_format: {"type": "json_object"}
    });

    const respuesta_modelo = response.choices[0]?.message?.content;

    conversationHistory.push({
      role: "system",  // Puedes usar "system" para incluir datos relevantes en el historial
      content: `Contexto de historia: ${JSON.stringify(respuesta_modelo)}`,
    });

    return respuesta_modelo
  } catch (error) {
    throw new Error(`Error en Groq: ${error.message}`);
  }
}


app.post('/model/generar-historia', async (req, res) => {

  const { tema, comando, reset } = req.body

  if(reset== true){
    conversationHistory = []
  }

  const response = await generarHistoria(tema, comando)


  const obj = JSON.parse(response);
  
  res.status(200).json({ data: obj });
})