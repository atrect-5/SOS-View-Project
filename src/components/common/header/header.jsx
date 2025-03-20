

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { CircularProgress } from "@mui/material"

import { useUserContext } from "../../../providers/userContext"

import './header.scss'

function Header () {

  const navigate = useNavigate()

  const { user: globalUser, isLoading, userCompany: userCompanyGlobal } = useUserContext()

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Cambia el valor del menu cuando esta abierto o cerrado
  const toggleOpenMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  // Actualiza el estado de navegación
  useEffect(() => {
    // Verifica si se puede ir hacia atrás o hacia adelante
    const updateNavigationState = () => {
      setCanGoBack(window.history.state?.idx > 0);
      setCanGoForward(window.history.state?.idx < window.history.length - 1);
    };

    // Inicializa el estado al cargar el componente
    updateNavigationState();

    // Escucha cambios en el historial
    window.addEventListener("popstate", updateNavigationState);

    // Limpia el listener al desmontar el componente
    return () => {
      window.removeEventListener("popstate", updateNavigationState);
    };
  }, []);
  

  return(
    <div className="header-container">


      <div className="next-back-buttons">
        <img onClick={toggleOpenMenu} id="menu-button" className={`${isMenuOpen ? 'img-menu-despleyed' : ''}`} src="../../../../menu_icon.png" alt="menu" />
        <img className={canGoBack ? '' : 'no-next-back'} onClick={() => navigate(-1)} src="../../../../back_icon.png" alt="back" />
        <img onClick={() => navigate('/')} src="../../../../home_icon.png" alt="home" />
        <img className={canGoForward ? '' : 'no-next-back'} onClick={() => navigate(+1)} src="../../../../next_icon.png" alt="next" /> 
      </div>

      <div className={`menu ${isMenuOpen ? "open" : ''}`}>
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
          globalUser.userType === 'admin' && 
          <Link to={isLoading ? '#' : '/machine/list/unregistered'}>
            <button>Ver Maquinas sin registrar</button><br />
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

      <div className="user-info">
        {userCompanyGlobal.name ? (
          <h1>{userCompanyGlobal.name}</h1>
        ) : (
          <h1>Cargando...</h1>
        )}
        {
          isLoading ? <CircularProgress/>
            : <h2>{`${globalUser.name} ${globalUser.lastName}`}</h2>
        }
      </div>

      <div className="profile-content">

        <img onClick={() => navigate(isLoading ? '#' : '/user/edit')} src="../../../../profile_icon.png" alt="profile" />
      </div>
    </div>
  )
}

export default Header