
import { useState } from 'react'
import { useUserToggleContext } from '../../../providers/userContext'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'

import { createUserService } from '../../../services/services'

function UserRegister() {
    const navigate = useNavigate()

    const toggleUser = useUserToggleContext()

    const initialState = {
        name:'',
        lastName:'',
        workingAt:'',
        email:'',
        phone:'',
        userType: '',
        accountStatus: '',
        password:''
    }

    const [user, setUser] = useState(initialState)
    const [confirmPassword, setConfirmPassword] = useState('')

    const [hasError, setHasError] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const [error, setError] = useState('')

    const handleChange = e => {
        const { name, value } = e.target
        setUser({
            ...user,
            [name]:value
        })
    }

    const handleCreate = async () => {

        setError(false)
        setIsReady(false)
        setError('')

        if (!user.name || !user.lastName || !user.workingAt || !user.email || !user.password){
            setHasError(true)
            setError('Faltan datos')
            toast.error('Faltan datos')
            return
        }

        if (user.password !== confirmPassword){
            setHasError(true)
            setError('Contraseña y confirmar contraseña deben ser iguales')
            toast.error('Contraseña y confirmar contraseña deben ser iguales')
            return
        }
        
        if(!user.userType){
            delete user.userType
        }

        if(!user.accountStatus){
            delete user.accountStatus
        }
        
        const userData = user
        const userLogged = await createUserService(userData)
        
        if(userLogged.error){
            setHasError(true)
            setError(userLogged.error)
            toast.error(`Hubo un error ${userLogged.error}`)
            setIsReady(false)
        }else{
            setHasError(false)
            setIsReady(true)
            toggleUser(userLogged)
            toast.success('Usuario creado')
            navigate('/')
        }
        

      }

    return (
        <>
        <div>
        <form>
            <h1>Resgistrarse</h1>
            <input
                type="text"
                name='name'
                placeholder='Nombre'
                value={user.name}
                onChange={handleChange}
            />
            <br />
            <input
                type="text"
                name="lastName"
                placeholder="Apellido"
                value={user.lastName}
                onChange={handleChange}
            />
            <br />
            <input
                type="email"
                name='email'
                placeholder='Email'
                value={user.email}
                onChange={handleChange}
            />
            <br />
            <input
                type="password"
                name='password'
                placeholder='Contraseña'
                value={user.password}
                onChange={handleChange}
            />
            <br />
            <input
                type="password"
                name="confirmPassword"
                placeholder="Confirmar constraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <br />
            <input
                type="text"
                name="phone"
                placeholder="Telefono"
                value={user.phone}
                onChange={handleChange}
            />
            <br />
            <input
                type="text"
                name="workingAt"
                placeholder="Codigo de la compañia para la que trabaja"
                value={user.workingAt}
                onChange={handleChange}
            />
        </form>
            {
                hasError ? 
                    <p>{error}</p> :
                    isReady ? <p>Accediendo...</p>:<></>
            }
            <br />
            <button onClick={handleCreate}>Crear Usuario</button>
            <br />
            <Link to={'/login'}>Ya esta registrado?</Link>
        </div>
        </>
    )
}

export default UserRegister