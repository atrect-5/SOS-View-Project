
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Link, useNavigate, useLocation } from 'react-router-dom'

import { useUserContext, useUserToggleContext } from '../../../providers/userContext'
import { createUserService, updateUserService, getUserLoginService } from '../../../services/services'

import { userTypes } from '../../../consts'

// Formulario de registro de usuario
function UserRegister() {
    const navigate = useNavigate()
    const location = useLocation()

    const { handleLoginChange: toggleUser, handleDataUpdated: saveUser } = useUserToggleContext()
    const globalUser = useUserContext()

    // Redirije al usuario de '/user/edit' a '/user/create' en caso de no estar registrado
    useEffect(() => {
        if (!globalUser.name && location.pathname === '/user/edit') {
            navigate('/login')
        }
    }, [globalUser, navigate, location])
    

    const initialState = {
        name:'',
        lastName:'',
        workingAt: globalUser.workingAt || '',
        email:'',
        phone:'',
        userType: '',
        accountStatus: '',
        password:''
    }

    // Inicializa el estado del usuario. 
    // Si la ruta actual es '/user/edit', se usa el estado global del usuario, de lo contrario, se usa el estado inicial.
    const [user, setUser] = useState(location.pathname === '/user/edit' ? globalUser : initialState)

    const [confirmPassword, setConfirmPassword] = useState('')
    const [hasError, setHasError] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const [error, setError] = useState('')

    // Actualiza el estado del nuevo usuario cuando el estado global del usuario esté disponible
    useEffect(() => {
        if (globalUser.workingAt && !user.workingAt) {
            setUser(prevUser => ({
                ...prevUser,
                workingAt: globalUser.workingAt
            }))
        }
    }, [globalUser, user.workingAt])

    // Maneja los cambios de los inputs
    const handleChange = e => {
        const { name, value } = e.target
        setUser({
            ...user,
            [name]:value
        })
    }

    // Maneja la creacion/edicion del usuario
    const handleCreate = async () => {

        setError(false)
        setIsReady(false)
        setError('')

        // Validación de campos vacíos
        if (!user.name || !user.lastName || !user.workingAt || !user.email || (location.pathname === '/user/create' && !user.password)){
            setHasError(true)
            setError('Faltan datos')
            toast.error('Faltan datos')
            return
        }

        // Validación de igualdad de contraseña y comprobacion de contraseña
        if (location.pathname === '/user/create' && user.password !== confirmPassword){
            setHasError(true)
            setError('Contraseña y confirmar contraseña deben ser iguales')
            toast.error('Contraseña y confirmar contraseña deben ser iguales')
            return
        }
        
        // Eliminacion de userType y accountStatus para evitar errores del servicio
        if(!user.userType){
            delete user.userType
        }
        if(!user.accountStatus){
            delete user.accountStatus
        }
        
        const { _id, ...userData} = user

        // Creacion o actualizacion de datos segun la ruta
        const userCreated = location.pathname === '/user/create'
            ? await createUserService(userData) 
            : await updateUserService(_id, userData) 

        // Manejo de errores en el registro de usuario
        if(userCreated.error){
            setHasError(true)
            setError(userCreated.error)
            toast.error(`Hubo un error ${userCreated.error}`)
            setIsReady(false)
        }else{
            // Actualización del estado global y redirección a la página principal
            setHasError(false)
            setIsReady(true)
            if (location.pathname === '/user/create'){
                // Se inicia sesion para guardar los datos del usuario
                const loginData = { email: user.email, password: user.password };
                const userLogged = await getUserLoginService(loginData)
                toggleUser(userLogged)
            }else{
                saveUser(userCreated)
            }
            toast.success(location.pathname === '/user/create' ? 'Usuario creado' : 'Usuario actualizado')
            navigate('/')
        }
    }

    return (
        <>
        <div className='form-card'>
        <form>
            {
                location.pathname === '/user/edit' ? <h1>Actualizar información</h1> :
                !globalUser.name ?
                <h1>Resgistrarse</h1>
                :<h1>Registrar usuario</h1>
            }
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
            {
                location.pathname === '/user/create' &&(
                    <>
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
                    </>
                )
            }
            <input
                type="text"
                name="phone"
                placeholder="Telefono"
                value={user.phone}
                onChange={handleChange}
            />

            {
                (globalUser.userType === 'admin' || !globalUser.name) && (
                    <>    
                    <br />
                    <input
                        type="text"
                        name="workingAt"
                        placeholder="Codigo de la compañia para la que trabaja"
                        value={user.workingAt}
                        onChange={handleChange}
                    />
                </>
                )
                
            }
            {
                (globalUser.userType === 'admin') && (
                    <>    
                        <br />
                        <select
                            name="userType"
                            value={user.userType}
                            onChange={handleChange}
                            >
                                <option value="" disabled>Seleccione un tipo de usuario</option>
                                {userTypes.map((type, index) => (
                                    <option key={index} value={type}>
                                    {type}
                                    </option>
                                ))}
                        </select>
                    </>
                )
                
            }
        </form>
            {
                hasError ? 
                    <p>{error}</p> :
                    isReady ? <p>Accediendo...</p>:<></>
            }
            <br />    
            <button onClick={handleCreate}>{location.pathname === '/user/create' ? 'Registrar Usuario' : 'Actualizar Datos'}</button>
            <br />
            {
                !globalUser.name ?
                <Link to={'/login'}>Ya esta registrado?</Link>
                :
                <Link to={'/'}>Volver</Link>
            }
        </div>
        </>
    )
}

export default UserRegister