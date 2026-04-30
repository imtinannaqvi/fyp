import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { LogoProvider } from './context/LogoContext'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <LogoProvider>
          <AuthProvider>
            <Toaster position="top-right" />
            <App />
          </AuthProvider>
        </LogoProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)