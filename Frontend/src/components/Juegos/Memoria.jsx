import React, { useEffect } from 'react'
import * as tf from "@tensorflow/tfjs"

export const Memoria = () => {

  useEffect(() => {
    loadModel()
  
    
  }, [])

  const loadModel = async () => {
    const recognizer = speechCommands.create('BROWSER_FFT');
    console.log("Model Loaded")
    await recognizer.ensureModelLoaded()
    console.log(recognizer.wordLabels())
    this.setState({
      model: recognizer,
      labels: recognizer.wordLabels()
    })
  }

  const recognizeCommands = async () => {
    console.log("Listening for commands");
    this.state.model.listen(result => {
      console.log(result.scores);
      const tensor_resultados = tf.tensor(result.scores)
      const maxValue = tensor_resultados.argMax().dataSync()[0];
      console.log('Máximo:', maxValue);
      console.log('Comando:', this.state.labels[maxValue]);
      
    }, {includeSprectogram:true, probabilityThreshold: 0.9})
    
  }
  


  return (
    <div  >


    </div>
  )
}
