// Import React's StrictMode, which helps highlight potential problems
// during development (does NOT affect production builds).
import { StrictMode } from 'react'

// Import createRoot from React 18 — the modern way of rendering apps.
import { createRoot } from 'react-dom/client'

// Import global CSS styles applied to the entire application.
import './index.css'

// Import the main application component.
import App from './App.jsx'


createRoot(document.getElementById('root')).render(
  // StrictMode wraps the application and enables extra checks/warnings
  // to help developers catch potential bugs early.
  <StrictMode>
    <App />
  </StrictMode>,
)
