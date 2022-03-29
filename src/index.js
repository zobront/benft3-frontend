import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import EthereumProvider from "./providers/EthereumProvider"
import ContractProvider from "./providers/ContractProvider"
import 'bootstrap/dist/css/bootstrap.min.css';


ReactDOM.render(
  <React.StrictMode>
    <EthereumProvider>
      <ContractProvider>
        <App />
      </ContractProvider>
    </EthereumProvider>
  </React.StrictMode>,
  document.getElementById('root')
);