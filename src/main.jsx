import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles-utilities.css';
import App from './App.jsx'; // <-- Main router app
// import App from './pages/Edit';
import { ThemeProvider } from './components/ThemeContext'; // <-- Global Theme Provider

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);