import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";

const Juego1 = () => {
  const { partidaId } = useParams();
  const [partidaData, setPartidaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transcripcion, setTranscripcion] = useState("Aquí se mostrará la transcripción del audio.");
  const [time, setTime] = useState(0); 
  const [isRunning, setIsRunning] = useState(false);
  const [evaluacion, setEvaluacion] = useState("cumple"); 
  const [model, setmodel] = useState(null)
  const [action, setaction] = useState(null)
  const [labels, setlabels] = useState(null)
  const [comandos, setcomandos] = useState([])
  const [isListening, setisListening] = useState(false)


  const loadModel = async () => {
      const recognizer = speechCommands.create('BROWSER_FFT');
      console.log("Model Loaded")
      await recognizer.ensureModelLoaded()
      console.log(recognizer.wordLabels())

      setmodel(recognizer)
      setlabels(recognizer.wordLabels())
    }
  
  const recognizeCommands = async () => {
    
      console.log("Listening for commands");

      model.listen((result) => {
        const tensor_resultados = tf.tensor(result.scores);
        const maxValue = tensor_resultados.argMax().dataSync()[0];
        const comando =  labels[maxValue];
        console.log("comando: ", comando);
        

        setcomandos(prev => (
          [prev,comando]
        ))

      },{ includeSpectrogram: true, probabilityThreshold: 0.99 })
  
    };

  useEffect(() => {
    if (partidaId) {
      setLoading(true);
      axios
        .get(`http://localhost:9999/audios/${partidaId}`)
        .then((response) => {
          setPartidaData(response.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error al obtener los datos del audio", err);
          setError("Error al obtener los datos del audio");
          setLoading(false);
        });
    }
  }, [partidaId]);

  useEffect(() => {
    loadModel()
  }, [])
  

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1); // Incrementa el tiempo cada segundo
      }, 1000);
    } else if (!isRunning && time !== 0) {
      clearInterval(interval); // Detiene el cronómetro cuando isRunning es false
    }
    return () => clearInterval(interval); // Limpia el intervalo al desmontar
  }, [isRunning]);

  const handleProbarAudio = () => {
    if(isListening){
      setisListening(false)
      setIsRunning(false); 
      model.stopListening()
    }else {
      setisListening(true)
      console.log("entro")
      recognizeCommands()
      setTime(0); 
      setIsRunning(true); 
    }
    
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleEvaluacionChange = (event) => {
    setEvaluacion(event.target.value); // Actualiza el estado con la opción seleccionada
  };

  return (
    <div className="page-background-Crear">
      <Container className="probar-audio-container">
        <div className="form-header-Crear">
          <h2>Probar Audio</h2>
          <p>Detalles del archivo de audio.</p>
        </div>

        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="spinner-container">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          partidaData && (
            <div className="Contener_formulario">
              <Form className="crear-audio-form-Crear">
                <div className="upload-area-Crear">
                  <Form.Label htmlFor="fileInput" className="upload-label-Crear">
                    {partidaData.archivoMultimedia
                      ? `Archivo actual: ${partidaData.archivoMultimedia}`
                      : "No hay archivo de audio"}
                  </Form.Label>
                </div>

                <Form.Group controlId="formAudio" className="input-group-Crear">
                  <Form.Label>ID del Audio:</Form.Label>
                  <Form.Control type="text" value={partidaData.id} readOnly />
                </Form.Group>

                <Form.Group controlId="formNombre" className="input-group-Crear">
                  <Form.Label>Nombre del Audio:</Form.Label>
                  <Form.Control type="text" value={partidaData.nombre} readOnly />
                </Form.Group>

                <Form.Group controlId="formAudioFile" className="input-group-Crear">
                  <Form.Label>Archivo de Audio:</Form.Label>
                  <Form.Control type="text" value={partidaData.archivoMultimedia} readOnly />
                </Form.Group>
                  <div className="buttons-crear">
                    <Button
                    variant="secondary"
                    onClick={() => window.history.back()}
                    className="submit-button-Crear"
                    >
                    Regresar
                    </Button>
                    
                    <Button
                        variant="primary"
                        onClick={handleProbarAudio}
                        className="probar-button-Probar"
                    >
                        {isListening ? "Detener Prueba"  :  "Probar Audio"}
                    </Button>
                  </div>
              </Form>
            
                <div className="contenedor__resultados">
                    <p>Texto transcrito:</p>
                    <textarea
                        className="textoAudio"
                        readOnly
                        rows="5"
                        cols="50"
                        value={comandos} 
                    />

                    <div className="cronometro">
                        <p>Cronómetro: {formatTime(time)}</p>
                        <p>Calificar: </p>
                        <Form.Group controlId="formEvaluacion" className="input-group-Crear">
                          <Form.Control
                            as="select"
                            value={evaluacion}
                            onChange={handleEvaluacionChange}
                          >
                            <option value="cumple">Cumple</option>
                            <option value="noCumple">No Cumple</option>
                          </Form.Control>
                        </Form.Group>
                    </div>
                </div>
            </div>
          )
        )}
      </Container>
    </div>
  );
};

export default Juego1;
