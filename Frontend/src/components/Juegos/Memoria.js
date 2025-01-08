import React, { Component } from "react";
import { Button, Container, Table, Alert, Modal, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import * as tf from "@tensorflow/tfjs"
import Tarjeta from "./Memoria-Comps/tarjeta";
import { getRandomInteger } from "@tensorflow-models/speech-commands/dist/generic_utils";
import { Redirect } from "react-router-dom";

// const speech = speechCommands.create('BROWSER_FFT');
// import * as speech from "@tensorflow-models/speech-commands"

const listaColores = [
  "bg-green-500",
"bg-red-500",
"bg-pink-500",
"bg-blue-500",
"bg-orange-500",
"bg-lime-500",
"bg-cyan-500",
"bg-emerald-500",
"bg-violet-500",
"bg-fuchsia-500",
"bg-yellow-500",
"bg-teal-500",
"bg-rose-500",
"bg-indigo-500",
"bg-purple-500",
"bg-amber-500",
"bg-gray-500",
"bg-sky-500",
"bg-lime-700",
"bg-emerald-700",

]

const listaColores_texto = [
  "text-green-500",
  "text-red-500",
  "text-pink-500",
  "text-blue-500",
  "text-orange-500",
  "text-lime-500",
  "text-cyan-500",
  "text-emerald-500",
  "text-violet-500",
  "text-fuchsia-500",
  "text-yellow-500",
  "text-teal-500",
  "text-rose-500",
  "text-indigo-500",
  "text-purple-500",
  "text-amber-500",
  "text-gray-500",
  "text-sky-500",
  "text-lime-700",
  "text-emerald-700",
];


const puntos_por_ronda = {
  "facil": 100,
  "medio": 200,
  "dificil": 400,
  "extremo": 700
}

class Memoria extends Component {
  state = {
    model: null,
    action: null,
    labels: null,
    dificultad: "facil",
    rondaActual: 0,
    secuencia: [],
    cantidadRondas: 15,
    indiceActual: 0,
    comandoActual: null,
    colorActual: undefined,
    coloresTarjetas: [],
    jugadorRespondiendo: false,
    comandosUsuario: [],
    comandoActualUsuario: null,
    esCorrecta: undefined,
    puntuacion: 0,
    idUsuario: sessionStorage.getItem('id_usuario'),
    tipoUsuario: sessionStorage.getItem('tipo_usuario'),
    IdPartida: undefined, 
    terminado: false,
    nombre_partida: undefined,
    hora_inicial: undefined,
    regresar: false
  };

  componentDidMount() {
    this.loadModel()

    const pathname = window.location.pathname;
    const parametros = pathname.split('/');  // Dividir la ruta por "/"
    
    const parametro1 = parametros[parametros.length - 2];  // El parámetro "2"
    const parametro2 = parametros[parametros.length - 1];  // El parámetro "1"

    
  
    this.setState(
      {
        IdPartida: parametro2
      },
      () => {
        this.consultar_estado_partida();
      }
    );

  }


  loadModel = async () => {

    const recognizer = speechCommands.create('BROWSER_FFT');
    console.log("Model Loaded")
    await recognizer.ensureModelLoaded()
    this.setState({
      model: recognizer,
      labels: recognizer.wordLabels()
    })
  }

  

  recognizeCommands = async () => {
    const { secuencia, comandosUsuario } = this.state;

    if (comandosUsuario.length > 0 ){
      this.setState({comandosUsuario: []})
      this.state.model.stopListening();
    }

    let lastCommand = null;
    let lastTimestamp = Date.now();
  
    console.log("Listening for commands");
    const comandos = [];

    this.state.model.listen(
      (result) => {
        const tensor_resultados = tf.tensor(result.scores);
        const maxValue = tensor_resultados.argMax().dataSync()[0];
        const comando = this.state.labels[maxValue];
  
        const currentTime = Date.now();
        const timeElapsed = currentTime - lastTimestamp;
  
        // Evita duplicados: solo procesa comandos con un intervalo mayor a 500ms
        if (comando !== lastCommand || timeElapsed > 1000) {
          lastCommand = comando;
          lastTimestamp = currentTime;
          comandos.push(comando);
  
          this.setState(prev => ({
            comandosUsuario: comandos
          }))
  
          if (comandos.length >= secuencia.length) {
            this.state.model.stopListening();
            this.validarRespuesta(comandos, secuencia)
          }
        }
      },
      { includeSpectrogram: true, probabilityThreshold: 0.99 }
    );
  };

  reiniciarValores = () => {
    this.setState((prev) => ({
      secuencia: []
    }))
  }

  generarSecuencia = () => {
    // Esta funcion va a generar la secuencia de instrucciones de acuerdo
    // a la dificultad y la cantidad de rondas actuales.

    const { dificultad, labels,rondaActual  } = this.state;

    switch (dificultad) {
      case "facil": {
        const instrucciones = [labels[2], labels[7], labels[11], labels[17]];

        let nuevaSecuencia = []; // Variable temporal para construir la secuencia
        let nuevosColores = []
        for (let j = 0; j < 3 + parseInt(rondaActual / 2); j++) {
          const randomInt = Math.floor(Math.random() * instrucciones.length);
          const randomIntColor = Math.floor(Math.random() * listaColores.length);
          nuevaSecuencia.push(instrucciones[randomInt]);
          nuevosColores.push(listaColores[randomIntColor])
        }

        

        this.setState(
          {
            secuencia: nuevaSecuencia,
            coloresTarjetas: nuevosColores
          },
          () => {
            // Este callback se ejecuta después de que el estado se ha actualizado
            this.intervalo = setInterval(this.imprimirValor, 2000);
            setTimeout(this.validarRespuesta,5000)
          }
        );

        
      }
      break;

      case "medio": {
        const instrucciones = [labels[2], labels[7], labels[11], labels[17], labels[6], labels[14], labels[9], labels[18]];

        let nuevaSecuencia = []; // Variable temporal para construir la secuencia
        let nuevosColores = []
        for (let j = 0; j < 3 + parseInt(rondaActual / 2); j++) {
          const randomInt = Math.floor(Math.random() * instrucciones.length);
          const randomIntColor = Math.floor(Math.random() * listaColores.length);
          nuevaSecuencia.push(instrucciones[randomInt]);
          nuevosColores.push(listaColores[randomIntColor])
        }

        

        this.setState(
          {
            secuencia: nuevaSecuencia,
            coloresTarjetas: nuevosColores
          },
          () => {
            // Este callback se ejecuta después de que el estado se ha actualizado
            this.intervalo = setInterval(this.imprimirValor, 2000);
            setTimeout(this.validarRespuesta,5000)
          }
        );

        
      }
      break;

      case "dificil": {
        const instrucciones = [labels[2], labels[7], labels[11], labels[17], labels[6], labels[14], labels[9], labels[18], labels[19],  labels[10],  labels[16]];

        let nuevaSecuencia = []; // Variable temporal para construir la secuencia
        let nuevosColores = []
        for (let j = 0; j < 4 + parseInt(rondaActual / 2); j++) {
          const randomInt = Math.floor(Math.random() * instrucciones.length);
          const randomIntColor = Math.floor(Math.random() * listaColores.length);
          nuevaSecuencia.push(instrucciones[randomInt]);
          nuevosColores.push(listaColores[randomIntColor])
        }

        

        this.setState(
          {
            secuencia: nuevaSecuencia,
            coloresTarjetas: nuevosColores
          },
          () => {
            // Este callback se ejecuta después de que el estado se ha actualizado
            this.intervalo = setInterval(this.imprimirValor, 1000);
            setTimeout(this.validarRespuesta,5000)
          }
        );

        
      }
      break;

      case "extremo": {
        const instrucciones = labels.slice(2,19);
        

        let nuevaSecuencia = []; // Variable temporal para construir la secuencia
        let nuevosColores = []
        for (let j = 0; j < 5 + parseInt(rondaActual / 2); j++) {
          const randomInt = Math.floor(Math.random() * instrucciones.length);
          const randomIntColor = Math.floor(Math.random() * listaColores.length);
          nuevaSecuencia.push(instrucciones[randomInt]);
          nuevosColores.push(listaColores[randomIntColor])
        }

        

        this.setState(
          {
            secuencia: nuevaSecuencia,
            coloresTarjetas: nuevosColores
          },
          () => {
            // Este callback se ejecuta después de que el estado se ha actualizado
            this.intervalo = setInterval(this.imprimirValor, 500);
            setTimeout(this.validarRespuesta,5000)
          }
        );

        
      }
      break;

      // Agrega los otros casos si es necesario
      default:
        break;
    }
  };  

  // cambiarValorTarjeta = () => {
    
  // }

  imprimirValor = () => {
    const { secuencia, indiceActual, coloresTarjetas } = this.state;


    if (indiceActual < secuencia.length) {
      this.setState({ indiceActual: indiceActual + 1, comandoActual:  secuencia[indiceActual], colorActual: coloresTarjetas[indiceActual]  }); // Actualiza al siguiente índice
    } else {
      clearInterval(this.intervalo); // Detiene el intervalo cuando se recorren todos los valores
      this.setState({comandoActual: undefined, indiceActual: 0, coloresTarjetas: undefined, jugadorRespondiendo: true})

    }

  };

  validarRespuesta = (comandos, secuencia) => {
    const correcto = comandos.every((element, index) => element === secuencia[index])
    this.setState({esCorrecta: correcto})

  }

  componentWillUnmount() {
    // Limpia el intervalo al desmontar el componente
    clearInterval(this.intervalo);
  }

  limpiarValores = () => {
    this.setState({
      secuencia: [],
      jugadorRespondiendo: false,
      esCorrecta: undefined,
      coloresTarjetas: [],
      comandosUsuario: []
    })
  }

  redirigir = (ruta) => {
    const rutaActual = window.location.pathname; // Obtiene la ruta actual
    const partesRuta = rutaActual.split('/')[0]; // Divide la ruta en partes usando "/"
  
  
    // Redirige a la nueva ruta manteniendo el dominio actual
    window.location.href = partesRuta + ruta;
  };

  consultar_estado_partida = () => {
    const { IdPartida } = this.state;


    if (IdPartida) {
      axios
      .get(`http://localhost:9999/partidas/${IdPartida}`, {
      })
      .then((response) => {
        console.log("data: ",response.data);
        const puntuacion_respuesta = response.data.puntuacion
        const nombre_partida_respuesta = response.data.nombre
      
        this.setState({
          puntuacion: puntuacion_respuesta,
          nombre_partida: nombre_partida_respuesta
        })

        if(puntuacion_respuesta != null || puntuacion_respuesta != undefined){
          this.setState({
            terminado: true
          })
        }
      })
      .catch((err) => {
        console.error("Error al actualizar la partida", err);
      });
    }else {
      console.error("No se encuentro un id de partida")
    }
  }
  

  obtener_duracion_partida = (hora_inicio) => {
    // Convierte las horas a objetos Date
    const hora_fin = new Date().toLocaleTimeString("en-GB");

    console.log("hora inicio: ", hora_inicio);
    console.log("hora fin: ", hora_fin);
    
    const date1 = new Date(`1970-01-01T${hora_inicio}Z`);
    const date2 = new Date(`1970-01-01T${hora_fin}Z`);

    // Obtén la diferencia en milisegundos y conviértela a segundos
    const differenceInSeconds = (date2 - date1) / 1000;

    console.log("timepo: ", differenceInSeconds);
    

    return differenceInSeconds;
  }
  

  terminarJuego = () => {
    const {  IdPartida, puntuacion, hora_inicial } = this.state;

    const duracion = this.obtener_duracion_partida(hora_inicial)
    
    if (IdPartida) {
      axios
      .put(`http://localhost:9999/partidas/${IdPartida}`, {
        puntuacion: puntuacion,
        duracion
      })
      .then(() => {
        this.setState({
          terminado: true
        })
      })
      .catch((err) => {
        console.error("Error al actualizar la partida", err);
      });
    }else {
      console.error("No se encuentro un id de partida")
    }

  }

  iniciarRonda = () => {

    const { rondaActual, cantidadRondas, dificultad } = this.state;

    const dificultad_formateada = dificultad.toLowerCase()

    const puntos_ronda = puntos_por_ronda[dificultad_formateada]

    if(rondaActual == 0){
      this.setState({
        hora_inicial: new Date().toLocaleTimeString("en-GB")
      })
    }


    this.limpiarValores()
    if (rondaActual < cantidadRondas) {
      this.setState(
        prev => ({
          rondaActual: prev.rondaActual + 1,

        }),
        () => {
          this.generarSecuencia();
          this.state.puntuacion = puntos_ronda*rondaActual
        }
      );
    } else {
      alert("Juego Terminado");
    }
  };

  onRegresar = () => {
    this.setState({
      terminado: true
    })
  }

  

  render() {
    const {
      rondaActual,
      comandosUsuario,
      puntuacion,
      terminado,
      tipoUsuario,
      nombre_partida,
      regresar
    } = this.state;

   
    if(regresar)
      return <Redirect to={`/Proyecto/${tipoUsuario}`} />
    
    if (terminado) {
      return (
        <div className="h-screen w-full bg-slate-100 font-mono flex flex-col items-center justify-center ">
          <h1 className="text-3xl font-bold " >Juego Terminado!</h1>
          <h2 className="text-xl" >Nombre de la partida: <span className="font-bold"> { nombre_partida??"" } </span></h2>
          <p className="text-xl"  >Puntuacion: <span className="font-bold" > { puntuacion } </span></p>

          <button className="bg-blue-500 text-white mt-5 font-bold rounded-md text-xl px-3 py-2"
              onClick={() => this.setState({regresar: true})}
          >
            Regresar al menu
          </button>

        </div>
      )
    }

    return (
      <div className="flex flex-col h-screen">
        
        {/* Barra superior */}
        <div className="flex flex-row justify-between px-5 items-center bg-blue-800 text-white h-10 leading-none">
        <button className="m-0 font-bold hover:scale-[1.03] z-30 flex items-center" onClick={() => this.onRegresar()}>
          <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 text-white transform scale-x-[-1]" width={12} height={24} viewBox="0 0 12 24"><path fill="currentColor" fillRule="evenodd" d="M10.157 12.711L4.5 18.368l-1.414-1.414l4.95-4.95l-4.95-4.95L4.5 5.64l5.657 5.657a1 1 0 0 1 0 1.414"></path></svg>
          Regresar
        </button>
          <div>
            <p className="text-md m-0 font-bold">Juego de Memoria!</p>
            <p className="text-md m-0 font-bold text-md">Puntuacion: {puntuacion}</p>
          </div>

          <div>
            <p className="text-sm m-0">Modo: {this.state.dificultad}</p>
            <p className="text-sm m-0">Ronda: {this.state.rondaActual}</p>
          </div>
          
        </div>
    
        {/* Área del juego */}
        <div className="flex-grow flex items-center justify-center">
          {this.state.comandoActual && this.state.colorActual ? (
            <Tarjeta title={this.state.comandoActual} bg_color={this.state.colorActual} />
            )
            :
            this.state.comandosUsuario && (
              <div>
                <div className="mx-auto flex flex-row justify-center">
                  {this.state.secuencia.map((_, index) => (
                    <div
                      className={`mx-1 w-4 h-4 ${
                        comandosUsuario.length <= index ? "bg-white" : "bg-slate-600"
                      } border border-gray-300 rounded-full`}
                    ></div>
                  ))}
                </div>
      
                <div className="mx-auto flex flex-row justify-center mt-10">
                  {comandosUsuario.map((c, index) => (
                    <p
                      className={`mx-1 font-bold text-xl ${listaColores_texto[index]}`}
                    >
                      {` ${c} `}
                    </p>
                  ))}
                </div>
              </div>
            )}
            
          
        </div>
    
        {/* Indicador de resultado */}
        {this.state.esCorrecta !== undefined  && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-lg h-full w-full mx-auto my-auto">
            {this.state.esCorrecta ? (
              <>
              <div className="flex flex-col items-center justify-center w-32 h-32 bg-green-500 rounded-full animate-fade-in">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-16 h-16 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {/* <p className="mt-5 text-black text-lg font-medium">¡Correcto!</p> */}
              </div>
              <p className="text-lg" >Correcto!!</p>

              <button
                className="bg-blue-500 text-white px-10 py-3 mt-5 rounded-lg hover:bg-blue-600 transition"
                onClick={this.iniciarRonda}
              >
                Siguiente ronda!
              </button>
              </>

            ) : (
              <>
              <div className="flex flex-col items-center justify-center w-32 h-32 bg-red-500 rounded-full animate-fade-in">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-16 h-16 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="mt-5 text-black text-lg font-medium">¡Incorrecto!</p>

              <button
              className="bg-blue-500 text-white px-10 py-3 mt-5 rounded-lg hover:bg-blue-600 transition"
              onClick={this.terminarJuego}
              >
              Terminar Partida
            </button>
              </>
            )}
            
          </div>
        )}
    
        {/* Configuración: Posicionado en la parte inferior */}
        <div className="flex flex-col justify-center justify-around items-center py-1 bg-gray-100 h-36">

          {
            rondaActual==0 ? 
            <>
              <div className="" >
              <label>Seleccione la dificultad:</label>

              <select
                onChange={(e) => this.setState({ dificultad: e.target.value })}
                value={this.state.dificultad}
                className="mx-2 px-3 py-1 border rounded "
              >
                <option value="facil">Fácil</option>
                <option value="medio">Medio</option>
                <option value="dificil">Difícil</option>
                <option value="extremo">Extremo</option>
              </select>
            </div>
            
            <button
              className="px-5 hover:scale-[1.03] hover:bg-blue-600 py-2 bg-blue-500 text-white font-bold rounded"
              onClick={this.iniciarRonda}
            >
              Comenzar!
            </button>
          </>

          :
            this.state.jugadorRespondiendo ? (
              <button
                className="px-5 hover:scale-[1.03] hover:bg-blue-600 py-2 bg-blue-500 text-white font-bold rounded"
                onClick={this.recognizeCommands}
              >
                Decir secuencia!
              </button>
            )
            :
            <p className="text-lg text-blue-500 font-bold" >Memorice los comandos! </p>
          }


        </div>
      </div>
    );
  }
}

export default Memoria;
