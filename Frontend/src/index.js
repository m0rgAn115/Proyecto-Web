import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Administrador from "./components/administrador";
import EditarPartida from "./components/CRUD/editar";
import VerPartida from "./components/CRUD/verPartida";
import CrearPartida from "./components/CRUD/crearPartida"; 
import Login from "./components/login";
import Presentacion from "./presentacion";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./styles/styles.css";
import Memoria from "./components/Juegos/Memoria";
import Juego1 from "./components/Juegos/Juego1"; 
import Juego3 from "./components/Juegos/Juego3"; 
import './index.css';
import { Trivia } from "./components/Juegos/Trivia";

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Login} />
        <Route exact path="/index.html" component={Presentacion} />
        <Route exact path="/Proyecto/administrador" component={Administrador} />
        <Route exact path="/Proyecto/editar/:partidaId" component={EditarPartida} />
        <Route exact path="/Proyecto/verPartida/:partidaId" component={VerPartida} />
        <Route exact path="/Proyecto/CrearPartida" component={CrearPartida} />
        <Route
          exact
          path="/Proyecto/Juegos/:idJuego/:idPartida"
          render={({ match }) => {
            const { idJuego, idPartida } = match.params; // Extrae idJuego y id desde la URL

            if (idJuego === "1") {
              return <Trivia id={idPartida} />;
            } else if (idJuego === "2") {
              return <Memoria id={idPartida} />;
            } else if (idJuego === "3") {
              return <Juego3 id={idPartida} />;
            } else {
              return <h2>Juego no disponible</h2>;
            }
          }}
        />
        <Route path="*" render={() => <h1>RECURSO NO ENCONTRADO</h1>} />
      </Switch>
    </Router>
  );
};

export default App;
