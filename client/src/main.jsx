import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import App from './App'

// This catches ALL silent errors
window.onerror = (msg, src, line, col, err) => {
  document.body.innerHTML = `
    <div style="padding:40px;font-family:monospace;background:#fff">
      <h2 style="color:red">Error Found:</h2>
      <pre style="background:#fee;padding:20px;border-radius:8px;white-space:pre-wrap">${msg}\n\nFile: ${src}\nLine: ${line}</pre>
    </div>
  `
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
)