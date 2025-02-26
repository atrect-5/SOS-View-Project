
import { useState } from 'react'
import { useUserToggleContext } from '../../providers/userContext'

import { getUserLoginService } from '../../services/services'
import { useNavigate } from 'react-router-dom'

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
            return
        }

        const userData = {email, password}
        const userLogged = await getUserLoginService(userData)

        if(userLogged.error){
            setHasError(true)
            setError(userLogged.error)
            setIsReady(false)
        }else{
            setHasError(false)
            setIsReady(true)
            toggleUser(userLogged)
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
        </div>
        </>
    )
}

export default UserLogin