import React from 'react'
import ReactDOM from 'react-dom/client'
import Landing from './Landing.jsx'

// If the URL carries an invite token or a password-recovery marker, skip
// the landing page entirely and send the visitor to the app.
const params = new URLSearchParams(window.location.search)
if (params.get('token') || params.get('type') === 'recovery') {
  window.location.replace('/app' + window.location.search)
}

const go = (tab) => {
  window.location.href = `/app?tab=${tab}`
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Landing onSignUp={() => go('signup')} onLogin={() => go('login')} />
  </React.StrictMode>,
)
