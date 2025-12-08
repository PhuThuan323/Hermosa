import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './styles/index.css'

const root = createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            fontWeight: '500',
            borderRadius: '12px',
            padding: '12px 20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          },
          success: {
            iconTheme: {
              primary: '#EC4899',
              secondary: '#fff',
            },
          },
          error: {
            style: {
              background: '#FECACA',
              color: '#DC2626',
            },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)