import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'   // ← импорт
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>          {/* ← обёртка */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)