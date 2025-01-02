import React, { Component } from "react";
import { Button, Container, Table, Alert, Modal, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import * as tf from "@tensorflow/tfjs"
// const speech = speechCommands.create('BROWSER_FFT');
// import * as speech from "@tensorflow-models/speech-commands"

class Administrador extends Component {
  state = {
    partidas: [
      { id: 1, nombre: "Partida 1", descripcion: "Descripción de la partida 1" },
      { id: 2, nombre: "Partida 2", descripcion: "Descripción de la partida 2" },
      { id: 3, nombre: "Partida 3", descripcion: "Descripción de la partida 3" }
    ],
    showAlert: false,
    alertText: "",
    showDeleteModal: false,
    partidaToDelete: null,
    isLoading: false,
    model: null,
    action: null,
    labels: null
  };

  componentDidMount() {
    this.fetchPartidas();
    this.loadModel()
  }

  fetchPartidas = () => {
    this.setState({ isLoading: true });
    axios
      .get("http://localhost:9999/partidas")
      .then((response) => {
        this.setState({ partidas: response.data, isLoading: false });
        this.showAlertMessage("Datos cargados correctamente.");
      })
      .catch((error) => {
        console.error("Error al cargar las partidas:", error);
        this.setState({
          showAlert: true,
          alertText: "Error en la obtención de datos.",
          isLoading: false,
        });
      });
  };

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
    console.log("Listening for commands");
    this.state.model.listen(result => {
      console.log(result.scores);
      const tensor_resultados = tf.tensor(result.scores)
      const maxValue = tensor_resultados.argMax().dataSync()[0];
      console.log('Máximo:', maxValue);
      console.log('Comando:', this.state.labels[maxValue]);
      
    }, {includeSprectogram:true, probabilityThreshold: 0.9})
    
  }

  showAlertMessage = (message) => {
    this.setState({
      showAlert: true,
      alertText: message,
    });
    setTimeout(() => {
      this.setState({ showAlert: false });
    }, 2000);
  };

  handleDeleteModalShow = (id) => {
    this.setState({
      partidaToDelete: id,
      showDeleteModal: true,
    });
  };

  handleDelete = async () => {
    const { partidaToDelete } = this.state;
    if (!partidaToDelete) return;

    try {
      const response = await axios.delete(
        `http://localhost:9999/partidas/${partidaToDelete}`
      );
      this.fetchPartidas(); 
      this.setState({ showDeleteModal: false, partidaToDelete: null });
      this.showAlertMessage("Partida eliminada correctamente.");
    } catch (error) {
      console.error("Error al eliminar la partida:", error.response || error);
      this.showAlertMessage("Error al eliminar la partida.");
    }
  };

  handleDeleteCancel = () => {
    this.setState({
      showDeleteModal: false,
      partidaToDelete: null,
    });
  };



  render() {
    const {
      partidas,
      showAlert,
      alertText,
      showDeleteModal,
      isLoading,
      model,
      action,
      partidaToDelete,
      labels
    } = this.state;

    return (
      <div>
        <header className="admin-header">
          <span className="admin-welcome">Bienvenido Administrador</span>
          <Button variant="primary" className="logout-button">
            <Link to="/" className="CustomLink">
              Salir
            </Link>
          </Button>
        </header>

        <Container className="admin-container">
          <h1 className="admin-title">CREAR, ALTAS, BAJAS Y CAMBIOS</h1>
          <hr />
          {showAlert && <Alert variant="success">{alertText}</Alert>}

          <Button variant="success" style={{ marginBottom: "12px", width: "100px" }}>
            <Link to="/Proyecto/CrearPartida" className="CustomLink">
              <span className="material-icons ButtonIcon">add</span>
              Agregar Partida
            </Link>
          </Button>

          {isLoading ? (
            <Spinner animation="border" variant="primary" />
          ) : (
            <Table striped bordered className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {partidas.length > 0 ? (
                  partidas.map((partida) => (
                    <tr key={partida.id}>
                      <td>{partida.id}</td>
                      <td>{partida.nombre}</td>
                      <td className="AlignCenter">
                        <Link to={`/Proyecto/verPartida/${partida.id}`} className="CustomLink">
                          <Button variant="success" className="ButtonView">
                            <span className="material-icons ButtonIcon">visibility</span>
                            Ver partida
                          </Button>
                        </Link>
                        <Link to={`/Proyecto/editar/${partida.id}`} className="CustomLink">
                        <Button variant="warning" className="ButtonEdit">
                          <span className="material-icons ButtonIcon">edit</span>
                          Editar
                        </Button>
                        </Link>
                        <Button
                          variant="danger"
                          className="ButtonDelete"
                          onClick={() => this.handleDeleteModalShow(partida.id)}
                        >
                          <span className="material-icons ButtonIcon">delete</span>
                          Eliminar
                        </Button>
                        <Link to={`/Proyecto/${partida.id_juego}`} className="CustomLink">
                          <Button variant="success" className="ButtonProbar">
                            <span className="material-icons ButtonIcon">tab</span>
                            Probar partida
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" align="center">
                      No hay partidas disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}

          <button class="bg-red-500" onClick={this.recognizeCommands}>
            Command
          </button>

          <Modal show={showDeleteModal} onHide={this.handleDeleteCancel}>
            <Modal.Header closeButton>
              <Modal.Title>Confirmar Eliminación</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              ¿Estás seguro de que quieres eliminar esta partida?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.handleDeleteCancel}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={this.handleDelete}>
                Aceptar
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </div>
    );
  }
}

export default Administrador;
