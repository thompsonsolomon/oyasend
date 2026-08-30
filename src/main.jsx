import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'
import './index.css'

import { initializeSentry } from './config/sentry'
import { AuthProvider } from './context/AuthContext'

initializeSentry()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)