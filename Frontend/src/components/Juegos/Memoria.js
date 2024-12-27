import React, { Component } from "react";
import { Button, Container, Table, Alert, Modal, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import * as tf from "@tensorflow/tfjs"
import Tarjeta from "./Memoria-Comps/tarjeta";
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
]

class Memoria extends Component {
  state = {
    model: null,
    action: null,
    labels: null,
    dificultad: "facil",
    rondaActual: 0,
    secuencia: [],
    cantidadRondas: 3,
    indiceActual: 0,
    comandoActual: null,
    colorActual: undefined,
    coloresTarjetas: [],
    jugadorRespondiendo: false,
    comandosUsuario: [],
    comandoActualUsuario: null,
    esCorrecta: undefined
  };

  componentDidMount() {
    this.loadModel()
  }


  loadModel = async () => {

    const recognizer = speechCommands.create('BROWSER_FFT');
    console.log("Model Loaded")
    await recognizer.ensureModelLoaded()
    console.log(recognizer.wordLabels())
    this.setState({
      model: recognizer,
      labels: recognizer.wordLabels()
    })
  }

  recognizeCommands = async () => {
    const { secuencia } = this.state;
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
  
          console.log("Comando detectado:", comando);
          console.log("Comandos lista:", comandos);

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
          nuevaSecuencia.push(instrucciones[randomInt]);
          nuevosColores.push(listaColores[randomInt])
        }

        
        console.log("Secuencia ronda: ",rondaActual,nuevaSecuencia);

        this.setState(
          {
            secuencia: nuevaSecuencia,
            coloresTarjetas: nuevosColores
          },
          () => {
            // Este callback se ejecuta después de que el estado se ha actualizado
            console.log(`Secuencia completa: ${this.state.secuencia}`);
            this.intervalo = setInterval(this.imprimirValor, 2000);
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

    console.log("colorActual", coloresTarjetas);
    


    if (indiceActual < secuencia.length) {
      console.log(secuencia[indiceActual]); // Imprime el valor actual
      this.setState({ indiceActual: indiceActual + 1, comandoActual:  secuencia[indiceActual], colorActual: coloresTarjetas[indiceActual]  }); // Actualiza al siguiente índice
    } else {
      clearInterval(this.intervalo); // Detiene el intervalo cuando se recorren todos los valores
      console.log("Se terminó de imprimir la secuencia.");
      this.setState({comandoActual: undefined, indiceActual: 0, coloresTarjetas: undefined, jugadorRespondiendo: true})

    }

  };

  validarRespuesta = (comandos, secuencia) => {
    const correcto = comandos.every((element, index) => element === secuencia[index])
    console.log("Los arreglos son iguales? :", correcto);
    this.setState({esCorrecta: correcto})

  }

  componentDidUpdate(prevProps, prevState) {
    // if (this.state.comandosUsuario.length === this.state.secuencia.length ) {

    //   const correcto = arr1.every((element, index) => element === arr2[index])
    //   console.log("Los arreglos son iguales? :", correcto);
      
    // }
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

  iniciarRonda = () => {
    const { rondaActual, cantidadRondas } = this.state;
    this.limpiarValores()
    if (rondaActual < cantidadRondas) {
      this.setState(
        prev => ({
          rondaActual: prev.rondaActual + 1,

        }),
        () => {
          console.log("Nueva ronda:", this.state.rondaActual);
          this.generarSecuencia();
        }
      );
    } else {
      alert("Juego Terminado");
    }
  };


  render() {
    const {
      labels,
      comandoActual,
      colorActual,
      rondaActual,
      jugadorRespondiendo,
      comandoActualUsuario,
      comandosUsuario,
      secuencia,
      esCorrecta,
      dificultad
    } = this.state;

    return (
      <div className="flex flex-col h-screen">
        {/* Barra superior */}
        <div className="flex flex-row justify-between px-5 items-center bg-blue-800 text-white h-10 leading-none">
          <button className="m-0 font-bold hover:scale-[1.03]">Regresar</button>
          <p className="text-md m-0 font-bold">Juego de Memoria!</p>
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
                      className={`mx-10 font-bold text-xl text-${listaColores[index].slice(
                        3,
                        listaColores[index].length
                      )}`}
                    >
                      {` ${c} `}
                    </p>
                  ))}
                </div>
              </div>
            )}
            
          
        </div>
    
        {/* Indicador de resultado */}
        {this.state.esCorrecta !== undefined || true && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 bg-opacity-40 rounded-lg h-1/2 w-1/2 mx-auto my-auto">
            {this.state.esCorrecta || true ? (
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
              </>

            ) : (
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
                <p className="mt-5 text-black text-lg font-medium">¡Incorrecto!</p>
              </div>
            )}
            <button
              className="bg-blue-500 text-white px-10 py-3 mt-5 rounded-lg hover:bg-blue-600 transition"
              onClick={this.iniciarRonda}
            >
              {this.state.esCorrecta ? "Siguiente ronda" : "Intentar de nuevo"}
            </button>
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
                <option value="Facil">Fácil</option>
                <option value="Medio">Medio</option>
                <option value="Dificil">Difícil</option>
              </select>
            </div>
            
            <button
              className="px-5 hover:scale-[1.03] hover:bg-blue-600 py-2 bg-blue-500 text-white font-bold rounded"
              onClick={this.iniciarRonda}
            >
              Empezar!
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
