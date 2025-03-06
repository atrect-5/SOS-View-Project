
import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import CircularProgress from '@mui/material/CircularProgress'

import { useUserContext } from "../../providers/userContext"
import { Header } from "../components"

import './homepage.scss'

// Pagina principal de la app 
export default function HomePage() {
    const { user: globalUser, isLoading, userCompany: userCompanyGlobal } = useUserContext()

    const navigate = useNavigate()

    // Redirige al login si el usuario no esta registrado
    useEffect(() => {
      const fetchUserCompany = async () => {
        // Esperamos a que carguen los datos del usuario del localStorage
        if (!isLoading) {
          if (!globalUser.name){
            // Si no se cargo el usuario regresamos al login
            navigate('/login')
          } 
        }
      }
      fetchUserCompany()
      }, [globalUser, navigate, isLoading])

    return (
        <>
        <div className="homepage-container">
        <Header />
          <div className="body-home-page-container">
            <div className="name-container">
              {userCompanyGlobal.name ? (
                <h1>{userCompanyGlobal.name}</h1>
              ) : (
                <h1>Cargando...</h1>
              )}
              {
                isLoading ? <CircularProgress />
                  : <h2>{`${globalUser.name} ${globalUser.lastName}`}</h2>
              }
            </div>
            <hr />

            <Link to={`/machine/list/${globalUser.workingAt}`}>
                  <button>Ver maquinas registradas</button>
            </Link>
            {
              (globalUser.userType === 'admin' || globalUser.userType === 'company-owner') &&
              <Link to={`/user/list/${globalUser.workingAt}`}>
                <button>Ver usuarios registradas</button>
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