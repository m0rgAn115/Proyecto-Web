import React from "react";
import { Redirect } from "react-router-dom";
import backgroundImage from '../img/background_login.jpg';
import "../styles/styles_Login.css";
import { Alert } from 'react-bootstrap';

class Login extends React.Component {
  constructor() {
    super();
    this.state = {
      condition: false,
      tipousuario: '',
      usuario: '',
      password: '',
      error: '',
      validado: false,
      showModal: false,
    };
  }

  validar = () => {
    const { usuario, password } = this.state;

    if (!usuario || !password) {
      this.setState({ error: "Por favor, complete todos los campos." });
      return;
    }

    fetch(`http://localhost:9999?User=${usuario}&password=${password}`)
      .then(response => response.json())
      .then(data => {
        if (data.status === "yes") {
          this.setState(
            { 
              tipousuario: data.tipo,
              usuario: '',
              password: '',
              error: '',
              showModal: true,
              validado: true 
            },
            () => {
              setTimeout(() => {
                this.setState({ showModal: false, condition: true });
              }, 2000);
            }
          );
        } else {
          this.setState({ 
            error: "Usuario o contraseña incorrectos.",
            usuario: '',
            password: '',
            showModal: true,
          });

          setTimeout(() => {
            this.setState({ showModal: false });
          }, 2000);
        }
      })
      .catch(error => {
        console.error("Error:", error);
        this.setState({ 
          error: "Error en la conexión. Inténtelo de nuevo más tarde.",
          usuario: '',
          password: '',
          showModal: true,
        });

        setTimeout(() => {
          this.setState({ showModal: false });
        }, 5000);
      });
  }

  render() {
    const styles = {
      backgroundColor: '#e5e5e6',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      margin: '0',
      padding: '0',
    };

    const { condition, tipousuario, usuario, password, error, showModal, validado } = this.state;

    if (condition) {
      return <Redirect to={`/Proyecto/${tipousuario}`} />;
    } //

    return (
      <div style={styles}>
        <div className="login-container">
          <div className="image-section">
            <img src={backgroundImage} alt="Imagen de fondo" />
          </div>

          <div className="form-section">
            <h1>Hola<br />Bienvenido</h1>
            {error && (
              <div className="error-message">{error}</div>
            )}
            <div className="form-group">
              <label htmlFor="usuario">Usuario</label>
              <input
                placeholder="Ingrese el usuario"
                type="text"
                id="usuario"
                value={usuario}
                onChange={(e) => this.setState({ usuario: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                placeholder="Ingrese su contraseña"
                type="password"
                id="password"
                value={password}
                onChange={(e) => this.setState({ password: e.target.value })}
              />
            </div>
            <button
              onClick={this.validar}
              className="login-button"
            >
              Login
            </button>
          </div>

          {/* Modal de error */}
          {showModal && (
            <div style={{
              position: 'absolute',
              top: '10%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              padding: '20px 50px',
              color: 'white',
              borderRadius: '5px',
              opacity: '0.8',
              zIndex: 1000,
            }}>
              <Alert variant={validado ? "success" :"danger"}>
                <b>{validado ? 'Usuario Validado, redirigiendo...' : 'Usuario incorrecto'}</b>
              </Alert>
            </div>
          )}
        </div>
        <footer className="footer">
          <p>&copy; Buendia Rodriguez Valentina | Mondragon Orta Angel Damian | Sanchez Corona Rodrigo.</p>
        </footer>
      </div>
    );
  }
}

export default Login;
