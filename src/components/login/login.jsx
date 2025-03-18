
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'
import { TextField } from '@mui/material'

import { useUserToggleContext, useUserContext } from '../../providers/userContext'
import { getUserLoginService } from '../../services/services'

import './login.scss'

// Componente de Login del Usuario
function UserLogin() {
    const navigate = useNavigate()
    
    const { user: globalUser} = useUserContext()
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

        setHasError(false)
        setIsReady(false)
        setError('')

        // Validación de campos vacíos
        if (!email || !password){
            setHasError(true)
            setError('Usuario y contraseña requeridos')
            toast.error('Usuario y contraseña requeridos')
            return
        }

        const loginData = {email, password}
        const userLogged = await getUserLoginService(loginData)

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
        <div className="login-container">
            <img src="../../../public/servicios-soluciones-logo.png" alt="logo" />

            <div className='form-card'>
                <h1>Login</h1>
                <TextField
                    className='text-field'
                    type="text"
                    name='email'
                    label='Email'
                    value={email}
                    size="small"
                    onChange={(e) => setEmail(e.target.value)}
                    />
                <br />
                <TextField
                    className='text-field'
                    type="password"
                    name='password'
                    label='Password'
                    value={password}
                    size="small"
                    onChange={(e) => setPassword(e.target.value)}
                    />
                {
                    hasError ? 
                    <p className='error-message'>{error}</p> :
                    isReady ? <p>Accediendo...</p>:<></>
                }
                <br />
                <button onClick={handleLogin}>Login</button>
                <br />
                <Link to={'/user/create'}>No registrado aun</Link>
            </div>
        </div>
        </>
    )
}

export default UserLogin