import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Administrador from "./components/administrador";
import Editar from "./components/CRUD/editar";
import VerPartida from "./components/CRUD/verPartida";
import CrearPartida from "./components/CRUD/crearPartida"; 
import Login from "./components/login";
import ProbarPartida from "./components/CRUD/probarPartida";
import Presentacion from "./presentacion";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./styles/styles.css";
import Memoria from "./components/Juegos/Memoria";
import './index.css';
import EditarPartida from "./components/CRUD/editar";


const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Login} />
        <Route exact path="/index.html" component={Presentacion} />
        <Route exact path="/Proyecto/administrador" component={Administrador} />
        <Route exact path="/Proyecto/editar/:partidaId" component={EditarPartida} />
        <Route exact path="/Proyecto/verPartida/:partidaId" component={VerPartida} />
        <Route exact path="/Proyecto/probarPartida/:partidaId" component={ProbarPartida} />
        <Route exact path="/Proyecto/CrearPartida" component={CrearPartida} />
        <Route exact path="/Juegos" component={Memoria} />
        <Route path="*" render={() => <h1>RECURSO NO ENCONTRADO</h1>} />
      </Switch>
    </Router>
  );
};

export default App;
