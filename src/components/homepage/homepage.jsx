
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useUserContext } from "../../providers/userContext"

export default function HomePage() {
    const user = useUserContext() // Accede al estado global del usuario

    const navigate = useNavigate()

    useEffect(() => {
        if (!user.name) {
          navigate('/login'); // Redirige a la página de login si el usuario no está registrado
        }
      }, [user, navigate]);

    return (
        <>
        <p>Welcome to home page, {user.name}</p>
        </>
    )
}