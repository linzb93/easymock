import React, {useState} from 'react';
import logo from './logo.svg';
import './App.css';

function Button(props) {
  return <div className="button" ref={props.inputRef}>
    <button>{props.children}</button>
  </div>
}

class App extends React.PureComponent {
  componentDidMount() {
    console.log(this.inputEle.innerHTML);
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          <Button inputRef={el => this.inputEle = el}>123</Button>
        </header>
      </div>
    );
  }
}

export default App;
