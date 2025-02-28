
import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"

import { useUserContext, useUserToggleContext } from "../../providers/userContext"

// Pagina principal de la app 
export default function HomePage() {
    const user = useUserContext()
    const { handleLoginChange: toggleUser } = useUserToggleContext()

    const navigate = useNavigate()

    // Redirige al login si el usuario no esta registrado
    useEffect(() => {
        if (!user.name) {
          navigate('/login')
        }
      }, [user, navigate])

      // Maneja el cierre de sesion
      const handleCloseSesion = () => {
        toggleUser()
      }

    return (
        <>
        <p>Welcome to home page, {user.name}</p>
        {
          (user.userType === 'admin' || user.userType === 'company-owner') && (
            <>
              <Link to={'/user/create'}>
                <button>Registrar Usuario</button><br />
              </Link>
            </>
          )
        }
        {
          user.userType === 'admin' && (
            <>
              <Link to={'/company/create'}>
                <button>Registrar Compañia</button><br />
              </Link>
            </>
          )
        }

        <Link to={'/machine/create'}>
          <button>Registrar Maquina</button><br />
        </Link>

        <Link to={'/user/edit'}>
          <button>Actualizar Informacion</button><br />
        </Link>

        <button onClick={handleCloseSesion}>Cerrar Sesion</button>
        </>
    )
}