import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles-utilities.css'
// import App from './App.jsx'
import App from './pages/Dashboard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
