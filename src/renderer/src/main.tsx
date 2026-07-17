import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import WorkspaceApp from './workspace/WorkspaceApp'
import './styles/globals.css'
import './styles/components.css'
import './styles/workspace.css'

const isWorkspace = window.location.hash === '#workspace'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>{isWorkspace ? <WorkspaceApp /> : <App />}</React.StrictMode>
)
