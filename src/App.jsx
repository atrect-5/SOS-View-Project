

import { ToastContainer } from 'react-toastify'
import { BrowserRouter as Router } from "react-router-dom"
import { ThemeProvider } from '@mui/material/styles';
//import { useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'

import { UserProvider } from './providers/userProvider'
import { theme } from './consts'
import RoutesOfApp from './routes/appRoutes'
import Footer from './components/common/footer/footer'

import 'react-toastify/ReactToastify.css'
import './App.css'

function App() {
  //const [count, setCount] = useState(0)

  return (
    <>
    <UserProvider>
      <ThemeProvider theme={theme}>
        <Router>
          <div className="main-container">
            <RoutesOfApp/>
          </div>
          <ToastContainer/>
        </Router>
        <Footer/>
      </ThemeProvider>
    </UserProvider>
    </>
  )
}

export default App
