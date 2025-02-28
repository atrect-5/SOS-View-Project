
import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useUserContext, useUserToggleContext } from "../../providers/userContext"

export default function HomePage() {
    const user = useUserContext() // Accede al estado global del usuario
    const { handleLoginChange: toggleUser } = useUserToggleContext()

    const navigate = useNavigate()

    useEffect(() => {
        if (!user.name) {
          navigate('/login') // Redirige a la página de login si el usuario no está registrado
        }
      }, [user, navigate]) // Esto indica que se actualizara cada que cambie el stateGlobal de user o cada que se monta el componente

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