
import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
//import CircularProgress from '@mui/material/CircularProgress'

import { useUserContext } from "../../providers/userContext"
import { Header } from "../components"

import './homepage.scss'

// Pagina principal de la app 
export default function HomePage() {
  const { user: globalUser, isLoading } = useUserContext()

  const navigate = useNavigate()

  // Redirige al login si el usuario no esta registrado
  useEffect(() => {
    const fetchUser = async () => {
      // Esperamos a que carguen los datos del usuario del localStorage
      if (!isLoading) {
        if (!globalUser.name){
          // Si no se cargo el usuario regresamos al login
          navigate('/login')
        } 
      }
    }
    fetchUser()
  }, [globalUser, navigate, isLoading])

  // Ajustamos dinamicamente el margin top del contenido para que el header no cubre el contenido
  useEffect(() => {
    const header = document.querySelector('.header-fixed')
    const content = document.querySelector('.body-home-page-container')
    const adjustPadding = () => {
      content.style.paddingTop = `${header.offsetHeight}px`
    }
    adjustPadding()
    window.addEventListener('resize', adjustPadding)

    return () => window.removeEventListener('resize', adjustPadding)
  }, [])

  return (
      <>
      <div className="homepage-container">
        <div className="header-fixed">
          <Header />
        </div>
        <div className="body-home-page-container">

          <Link to={`/machine/list/${globalUser.workingAt}`}>
                <button>Ver maquinas registradas</button>
          </Link>
          {
            (globalUser.userType === 'admin' || globalUser.userType === 'company-owner') &&
            <Link to={`/user/list/${globalUser.workingAt}`}>
              <button>Ver usuarios registrados</button>
            </Link>
          }
          {
            globalUser.userType === 'admin' &&
            <Link to={`/company/list`}>
              <button>Ver compañias registradas</button>
            </Link>
          }

      
                      
        </div>
      </div>
      
      </>
  )
}