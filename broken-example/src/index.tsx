import React from 'react'
import { createRoot } from 'react-dom/client'

const App = () => {
  return (
    <div>
      There will be dragons
    </div>
  )
}

const container = document.getElementById('root')
if(container) {
  const root = createRoot(container)
  root.render(<App />)
}
