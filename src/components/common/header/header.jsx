

import { Link } from "react-router-dom"

import { useUserContext, useUserToggleContext } from "../../../providers/userContext"

import './header.scss'

function Header () {

    const { user: globalUser, isLoading } = useUserContext()
    const { handleLoginChange: toggleUser } = useUserToggleContext()

    // Maneja el cierre de sesion
    const handleCloseSesion = () => {
        toggleUser()
    }

    return(
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
              <Link to={isLoading ? '#' : '/machine/register'}>
                  <button>Registrar Maquina</button><br />
              </Link>
              {
                globalUser.userType === 'admin' && 
                <Link to={isLoading ? '#' : '/machine/create'}>
                  <button>Crear Maquina</button><br />
                </Link>
              }

              {
                globalUser.userType === 'admin' && (
                  <>
                    <Link to={isLoading ? '#' :'/company/create'}>
                      <button>Registrar Compañia</button><br />
                    </Link>
                  </>
                )
              }
              {
                (globalUser.userType === 'company-owner' || globalUser.userType === 'admin') &&
                <Link to={isLoading ? '#' : '/company/edit'}>
                  <button>Actualizar Compañia</button><br />
                </Link>
              }

            </div>
            <div className="profile-content">

            <button onClick={handleCloseSesion}>Cerrar Sesion</button>
            <Link to={isLoading ? '#' : '/user/edit'}>
                <button>Perfil</button><br />
            </Link>
            </div>
          </div>
    )
}

export default Header