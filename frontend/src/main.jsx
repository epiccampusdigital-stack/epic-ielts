import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import App from './App.jsx'
import './index.css'

// If the server says the login is no longer valid (expired after a while, or signed out), don't show
// empty pages: clear the old login and send the student back to log in, with a short message.
axios.interceptors.response.use(r => r, err => {
  const sent = err?.config?.headers?.Authorization || err?.config?.headers?.authorization;
  const url = String(err?.config?.url || '');
  if (err?.response?.status === 401 && sent && !/\/api\/auth\//.test(url)) {
    try { localStorage.removeItem('token'); localStorage.removeItem('user'); sessionStorage.setItem('session-expired', '1'); } catch { /* storage blocked */ }
    if (window.location.pathname !== '/') window.location.assign('/');
  }
  return Promise.reject(err);
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
