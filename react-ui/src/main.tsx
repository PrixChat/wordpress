import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from "react-router-dom";
import './index.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('pc-root') as HTMLElement).render(
  <HashRouter>
    <App />
  </HashRouter>
)
