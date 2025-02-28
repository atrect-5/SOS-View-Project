
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'

import { useUserToggleContext, useUserContext } from '../../providers/userContext'
import { getUserLoginService } from '../../services/services'

// Componente de Login del Usuario
function UserLogin() {
    const navigate = useNavigate()
    
    const globalUser = useUserContext()
    const { handleLoginChange: toggleUser } = useUserToggleContext()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [hasError, setHasError] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const [error, setError] = useState('')

    // Redirige a la página principal si el usuario ya está registrado
    useEffect(() => {
        if (globalUser.name) {
            navigate('/')
        }
    }, [globalUser, navigate])

    // Maneja el proceso de inicio de sesión del usuario
    const handleLogin = async () => {

        setError(false)
        setIsReady(false)
        setError('')

        // Validación de campos vacíos
        if (!email || !password){
            setHasError(true)
            setError('Usuario y contraseña requeridos')
            toast.error('Usuario y contraseña requeridos')
            return
        }

        const userData = {email, password}
        const userLogged = await getUserLoginService(userData)

        // Manejo de errores en el inicio de sesión
        if(userLogged.error || !userLogged){
            setHasError(true)
            setError(userLogged.error)
            toast.error(`Hubo un error ${userLogged.error}`)
            setIsReady(false)
        }else{
            // Actualización del estado global y redirección a la página principal
            setHasError(false)
            setIsReady(true)
            toggleUser(userLogged)
            toast.success('Sesion iniciada')
            navigate('/')
        }

      }

    return (
        <>
        <div>
            <h1>Login</h1>
            <input
                type="text"
                name='email'
                placeholder='Email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <br />
            <input
                type="password"
                name='password'
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            {
                hasError ? 
                    <p>{error}</p> :
                    isReady ? <p>Accediendo...</p>:<></>
            }
            <br />
            <button onClick={handleLogin}>Login</button>
            <br />
            <Link to={'/user/create'}>No registrado aun</Link>
        </div>
        </>
    )
}

export default UserLogin