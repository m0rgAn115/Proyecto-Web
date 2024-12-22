import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import axios from "axios";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";

const EditarAudio = () => {
  const { audioId } = useParams();
  const history = useHistory();
  const [audioData, setAudioData] = useState(null);
  const [nombreAudio, setNombreAudio] = useState("");
  const [archivoMultimedia, setArchivoMultimedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); 

  useEffect(() => {
    if (audioId) {
     // console.log("audioId recibido:", audioId); 
      setLoading(true);
      axios
        .get(`http://localhost:9999/audios/${audioId}`)
        .then((response) => {
          const { nombreAudio, archivoMultimedia } = response.data;
          setAudioData(response.data);
          setNombreAudio(nombreAudio || "");
          setArchivoMultimedia(archivoMultimedia || null);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error al obtener los datos del audio", err);
          setError("Error al obtener los datos del audio.");
          setLoading(false);
        });
    }
  }, [audioId]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!nombreAudio) {
      setError("El nombre del audio es obligatorio.");
      return;
    }

    setIsSubmitting(true); 

    // Crear el FormData
    const formData = new FormData();
    formData.append("nombreAudio", nombreAudio);

    if (archivoMultimedia) {
      formData.append("archivoMultimedia", archivoMultimedia);
    }

    console.log("FormData a enviar:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    // Enviar la solicitud
    axios
      .put(`http://localhost:9999/audios/${audioId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        setSuccessMessage("Los cambios se han guardado correctamente.");
        setTimeout(() => {
          history.push("/Proyecto/administrador");
        }, 2000);
      })
      .catch((err) => {
        console.error("Error al guardar los cambios", err);
        if (err.response) {
          console.error("Detalles del error:", err.response.data);
          setError(`Error al guardar los cambios: ${err.response.data.error || 'Desconocido'}`);
        } else {
          setError("Error al conectar con el servidor.");
        }
      })
      .finally(() => {
        setIsSubmitting(false); // Habilitar el botón de nuevo
      });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      setError("Por favor selecciona un archivo.");
      return;
    }

    // Verifica si el archivo es de tipo audio
    const validTypes = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3"];
    if (!validTypes.includes(file.type)) {
      setError("Por favor selecciona un archivo de audio válido (MP3, WAV, OGG).");
      setTimeout(() => setError(null), 3000);
      setArchivoMultimedia(null);
      return;
    }

    // tamaño del archivo, esto lo podemos modificar si quieren xd
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError("El archivo es demasiado grande. El tamaño máximo es 10MB.");
      setArchivoMultimedia(null); 
      return;
    }

    console.log("Archivo seleccionado:", file);
    setArchivoMultimedia(file);
    setError(null); 
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="page-background-Crear">
      <Container className="crear-audio-container-Crear">
        <div className="form-header-Crear">
          <h2>Editar Audio</h2>
          <p>Modifica los detalles del archivo de audio.</p>
        </div>

        {successMessage && (
          <Alert variant="success" className="mb-3">
            {successMessage}
          </Alert>
        )}

        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        <Form className="crear-audio-form-Crear" onSubmit={handleSubmit}>
          <Form.Group controlId="formAudio" className="input-group-Crear">
            <Form.Label>ID del Audio:</Form.Label>
            <Form.Control type="text" value={audioData?.id_audio} readOnly />
          </Form.Group>

          <Form.Group controlId="formNombre" className="input-group-Crear">
            <Form.Label>Nombre del Audio:</Form.Label>
            <Form.Control
              type="text"
              value={nombreAudio}
              onChange={(e) => setNombreAudio(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formAudioFile" className="input-group-Crear">
            <Form.Label>Archivo de Audio:</Form.Label>
            <Form.Control
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
            />
            {archivoMultimedia ? (
              <Form.Text className="text-muted">
                Archivo seleccionado: {archivoMultimedia.name}
              </Form.Text>
            ) : (
              <Form.Text className="text-warning">
                No se ha seleccionado un archivo nuevo.
              </Form.Text>
            )}
            {audioData?.archivoMultimedia && (
              <Form.Text className="text-muted">
                Archivo actual: {audioData.archivoMultimedia}
              </Form.Text>
            )}
          </Form.Group>

          <div className="form-buttons-Crear">
            <Button
              variant="primary"
              type="submit"
              className="submit-button-Crear"
              disabled={isSubmitting}  
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </Form>
      </Container>
    </div>
  );
};

export default EditarAudio;