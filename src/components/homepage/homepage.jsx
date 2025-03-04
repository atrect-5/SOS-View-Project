
import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import CircularProgress from '@mui/material/CircularProgress'

import { useUserContext, useUserToggleContext } from "../../providers/userContext"

import './homepage.scss'

// Pagina principal de la app 
export default function HomePage() {
    const { user, isLoading } = useUserContext()
    const { handleLoginChange: toggleUser } = useUserToggleContext()

    const navigate = useNavigate()

    // Redirige al login si el usuario no esta registrado
    useEffect(() => {
        if (!isLoading && !user.name) {
          navigate('/login')
        }
      }, [user, navigate, isLoading])

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
                (user.userType === 'admin' || user.userType === 'company-owner') && (
                  <>
                    <Link to={isLoading ? '#' : '/user/create'}>
                      <button>Registrar Usuario</button><br />
                    </Link>
                  </>
                )
              }
              {
                user.userType === 'admin' && (
                  <>
                    <Link to={isLoading ? '#' :'/company/create'}>
                      <button>Registrar Compañia</button><br />
                    </Link>
                  </>
                )
              }

              <Link to={isLoading ? '#' : '/machine/create'}>
                <button>Registrar Maquina</button><br />
              </Link>

              <Link to={isLoading ? '#' : '/user/edit'}>
                <button>Actualizar Informacion</button><br />
              </Link>

            </div>
            <button onClick={handleCloseSesion}>Cerrar Sesion</button>
          </div>
          <p>Welcome to home page, {user.name}
          {
            isLoading && <CircularProgress />
          }
          </p>

        </div>
        </>
    )
}