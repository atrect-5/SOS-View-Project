
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import CircularProgress from '@mui/material/CircularProgress'

import { useUserContext, useUserToggleContext } from "../../providers/userContext"
import { getCompanyByIdService } from "../../services/services"

import './homepage.scss'

// Pagina principal de la app 
export default function HomePage() {
    const { user: globalUser, isLoading } = useUserContext()
    const { handleLoginChange: toggleUser } = useUserToggleContext()

    const navigate = useNavigate()

    const [userCompany, setUserCompany] = useState({})

    // Redirige al login si el usuario no esta registrado
    useEffect(() => {
      const fetchUserCompany = async () => {
        // Esperamos a que carguen los datos del usuario del localStorage
        if (!isLoading) {
          if (!globalUser.name){
            // Si no se cargo el usuario regresamos al login
            navigate('/login')
          } else {
            // Si se cargo el usuario, cargamos los datos de la compañia en la que trabaja
            const company = await getCompanyByIdService(globalUser.workingAt)
            setUserCompany(company)
          }
        }
      }
      fetchUserCompany()
      }, [globalUser, navigate, isLoading])

      // Maneja el cierre de sesion
      const handleCloseSesion = () => {
        toggleUser()
      }

    return (
        <>
        <div className="homepage-container">
          <div className="header-container">
            <div className="functions-container">

              {
                (globalUser.userType === 'admin' || globalUser.userType === 'company-owner') && (
                  <>
                    <Link to={isLoading ? '#' : '/user/create'}>
                      <button>Registrar Usuario</button><br />
                    </Link>
                  </>
                )
              }
              
              <Link to={isLoading ? '#' : '/machine/create'}>
                <button>Registrar Maquina</button><br />
              </Link>

              {
                globalUser.userType === 'admin' && (
                  <>
                    <Link to={isLoading ? '#' :'/company/create'}>
                      <button>Registrar Compañia</button><br />
                    </Link>
                  </>
                )
              }

              <Link to={isLoading ? '#' : '/user/edit'}>
                <button>Actualizar Informacion</button><br />
              </Link>

            </div>
            <button onClick={handleCloseSesion}>Cerrar Sesion</button>
          </div>
          <h1>{userCompany.name}</h1>
          <p>Welcome to home page, {globalUser.name}
          {
            isLoading && <CircularProgress />
          }
          </p>

        </div>
        </>
    )
}