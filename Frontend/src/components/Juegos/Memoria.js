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
      esCorrecta
    } = this.state;

    return (
      <div>
        <div className="justify-around" >
          <h1>Juego de Memoria!</h1>
          <h1>Ronda: {rondaActual}</h1>


        </div>

        <div onClick={this.iniciarRonda} >
          <button className="px-5 py-2 bg-blue-500 text-white font-bold" >Comenzar!</button>
        </div>

        {
          comandoActual && colorActual &&
            <Tarjeta title={comandoActual} bg_color={colorActual} />
        }
        

        {
          comandosUsuario &&
            <div>
              <div className="mx-auto flex flex-row justify-center " >
                {secuencia.map((_, index) => (
                    <div class={`mx-1 w-4 h-4 ${comandosUsuario.length <= index ?  "bg-white" : "bg-slate-600" } border border-gray-300 rounded-full`}></div>
                  ))}
              </div>

              <div className="mx-auto flex flex-row justify-center mt-10" >
                {comandosUsuario.map((c, index) => (
                  <p className={`mx-10 font-bold text-xl  text-${listaColores[index].slice(3,listaColores[index].length)}`} >{` ${c} `}  </p>
                ))}
            </div>
           </div>


        }

        {
          jugadorRespondiendo && 
            <button className="bg-emerald-400 hover:scale-105" onClick={this.recognizeCommands} >
                Decir secuencia!
            </button>
        }


      { esCorrecta!= undefined &&
      
      (esCorrecta ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
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
          </div>
          <p className="mt-5 text-black text-lg font-medium">¡Correcto!</p>
          <button
            className="bg-blue-500 text-white px-10 py-3 mt-5 rounded-lg hover:bg-blue-600 transition"
            onClick={this.iniciarRonda}
          >
            Siguiente ronda
          </button>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
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
            onClick={this.iniciarRonda}
          >
            Intentar de nuevo
          </button>
        </div>
      ))}

        

       
      </div>
    );
  }
}

export default Memoria;
