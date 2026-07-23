import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import WorkspaceApp from './workspace/WorkspaceApp'
import OnboardingApp from './onboarding/OnboardingApp'
import '@fontsource/instrument-sans/400.css'
import '@fontsource/instrument-sans/500.css'
import '@fontsource/instrument-sans/600.css'
import './styles/globals.css'
import './styles/components.css'
import './styles/workspace.css'
import './styles/onboarding.css'

const hash = window.location.hash

function Root() {
  if (hash === '#workspace') return <WorkspaceApp />
  if (hash === '#onboarding') return <OnboardingApp />
  return <App />
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
