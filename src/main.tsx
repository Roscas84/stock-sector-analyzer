import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('✅ Main.tsx cargado')
console.log('Root element:', document.getElementById('root'))

const root = document.getElementById('root')
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
  console.log('✅ React renderizado')
} else {
  console.error('❌ No se encontró div#root')
}
