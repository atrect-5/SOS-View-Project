

import { ToastContainer } from 'react-toastify'
import { BrowserRouter as Router } from "react-router-dom"
//import { useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'

import RoutesOfApp from './routes/appRoutes'

import 'react-toastify/ReactToastify.css'
import './App.css'

function App() {
  //const [count, setCount] = useState(0)

  return (
    <>
      <Router>
        <div className="main-container">
          <RoutesOfApp/>
        </div>
        <ToastContainer/>
      </Router>
    </>
  )
}

export default App
