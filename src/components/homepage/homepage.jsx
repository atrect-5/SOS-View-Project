
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useUserContext, useUserToggleContext } from "../../providers/userContext"

export default function HomePage() {
    const user = useUserContext() // Accede al estado global del usuario
    const toggleUser = useUserToggleContext()

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
        <button onClick={handleCloseSesion}>Cerrar Sesion</button>
        </>
    )
}