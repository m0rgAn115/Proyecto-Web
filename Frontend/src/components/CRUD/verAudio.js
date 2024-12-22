import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; 
import axios from "axios";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";

const VerAudio = () => {
  const { audioId } = useParams();  // Obtiene el audioId desde la URL
  const [audioData, setAudioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (audioId) {
      setLoading(true); 
      axios
        .get(`http://localhost:9999/audios/${audioId}`)
        .then((response) => {
          setAudioData(response.data); 
          setLoading(false); 
        })
        .catch((err) => {
          console.error("Error al obtener los datos del audio", err);
          setError("Error al obtener los datos del audio");
          setLoading(false); 
        });
    }
  }, [audioId]); 

  return (
    <div className="page-background-Crear">
      <Container className="crear-audio-container-Crear">
        <div className="form-header-Crear">
          <h2>Ver Audio</h2>
          <p>Visualiza los detalles del archivo de audio.</p>
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
          audioData && (
            <Form className="crear-audio-form-Crear">
              <div className="upload-area-Crear">
                <Form.Label htmlFor="fileInput" className="upload-label-Crear">
                  {audioData.archivoMultimedia ? `Archivo actual: ${audioData.archivoMultimedia}` : "No hay archivo de audio"}
                </Form.Label>
              </div>

              <Form.Group controlId="formAudio" className="input-group-Crear">
                <Form.Label>ID del Audio:</Form.Label>
                <Form.Control type="text" value={audioData.id_audio} readOnly />
              </Form.Group>

              <Form.Group controlId="formNombre" className="input-group-Crear">
                <Form.Label>Nombre del Audio:</Form.Label>
                <Form.Control
                  type="text"
                  value={audioData.nombreAudio}
                  readOnly
                />
              </Form.Group>

              <Form.Group controlId="formAudioFile" className="input-group-Crear">
                <Form.Label>Archivo de Audio:</Form.Label>
                <Form.Control
                  type="text"
                  value={audioData.archivoMultimedia}
                  readOnly
                />
              </Form.Group>

              <Button variant="secondary" onClick={() => window.history.back()} className="submit-button-Crear">
                Regresar
              </Button>
            </Form>
          )
        )}
      </Container>
    </div>
  );
};

export default VerAudio;
