
import { useState } from 'react'
import { useUserToggleContext } from '../../providers/userContext'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'

import { getUserLoginService } from '../../services/services'

function UserLogin() {
    const navigate = useNavigate()

    const toggleUser = useUserToggleContext()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [hasError, setHasError] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const [error, setError] = useState('')

    const handleLogin = async () => {

        setError(false)
        setIsReady(false)
        setError('')

        if (!email || !password){
            setHasError(true)
            setError('Usuario y contraseña requeridos')
            toast.error('Usuario y contraseña requeridos')
            return
        }

        const userData = {email, password}
        const userLogged = await getUserLoginService(userData)

        if(userLogged.error){
            setHasError(true)
            setError(userLogged.error)
            toast.error(`Hubo un error ${userLogged.error}`)
            setIsReady(false)
        }else{
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