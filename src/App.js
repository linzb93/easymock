import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import routerConfig from './router';
import './App.scss';

export default function App() {
  return (
    <Router>
      <Switch>
      {routerConfig.map((route,index) => (
        <Route path={route.path} component={route.component} exact key={route.path}>
        </Route>
      ))}
      </Switch>
    </Router>
  )
}