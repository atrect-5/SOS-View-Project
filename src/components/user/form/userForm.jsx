
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { TextField } from '@mui/material'

import { useUserContext, useUserToggleContext } from '../../../providers/userContext'
import { createUserService, updateUserService, getUserLoginService } from '../../../services/services'

import { userTypes } from '../../../consts'

// Formulario de registro de usuario
function UserRegister() {
    const navigate = useNavigate()
    const location = useLocation()

    const { handleLoginChange: toggleUser, handleDataUpdated: saveUser } = useUserToggleContext()
    const { user: globalUser} = useUserContext()

    // Redirije al usuario de '/user/edit' a '/user/create' en caso de no estar registrado
    useEffect(() => {
        if (!globalUser.name && location.pathname === '/user/edit') {
            navigate('/login')
        }
        if (globalUser.userType !== 'admin' && globalUser.userType !== 'company-owner' && location.pathname === '/user/create' && globalUser.name) {
            navigate('/')
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
    const [isCreate, setIsCreate] = useState(false)

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

    const handleNewUser = () => {
        setIsCreate(false)
        setUser(initialState)
        setHasError(false)
        setIsReady(false)
        setError('')
        setConfirmPassword('')
    }

    // Maneja la creacion/edicion del usuario
    const handleCreate = async () => {

        setHasError(false)
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
            if (location.pathname === '/user/create' && !globalUser.name){
                // Se inicia sesion para guardar los datos del usuario en caso de que el usuario se crea a si mismo (no registrado)
                const loginData = { email: user.email, password: user.password }
                const userLogged = await getUserLoginService(loginData)
                toggleUser(userLogged)
                navigate('/')
            }else if (location.pathname === '/user/edit'){
                saveUser(userCreated)
                navigate('/')
            }else {
                setIsCreate(true)
            }
            toast.success(location.pathname === '/user/create' ? 'Usuario creado' : 'Usuario actualizado')
        }
    }

    const handleCloseSesion = () =>{
        toggleUser()
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
            <TextField
                className='text-field'
                type="text"
                name='name'
                size="small"
                label='Nombre'
                value={user.name}
                onChange={handleChange}
            />
            <br />
            <TextField
                className='text-field'
                type="text"
                name="lastName"
                size="small"
                label="Apellido"
                value={user.lastName}
                onChange={handleChange}
            />
            <br />
            <TextField
                disabled={location.pathname === '/user/edit'}
                className='text-field'
                type="email"
                name='email'
                size="small"
                label='Email'
                value={user.email}
                onChange={handleChange}
            />
            <br />
            {
                location.pathname === '/user/create' &&(
                    <>
                    <TextField
                        className='text-field'
                        type="password"
                        name='password'
                        size="small"
                        label='Contraseña'
                        value={user.password}
                        onChange={handleChange}
                    />
                    <br />
                    <TextField
                        className='text-field'
                        type="password"
                        name="confirmPassword"
                        size="small"
                        label="Confirmar constraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <br />
                    </>
                )
            }
            <TextField
                className='text-field'
                type="text"
                name="phone"
                size="small"
                label="Telefono"
                value={user.phone}
                onChange={handleChange}
            />

            {
                (globalUser.userType === 'admin' || !globalUser.name) && (
                    <>    
                    <br />
                    <TextField
                        className='text-field'
                        type="text"
                        name="workingAt"
                        size="small"
                        label="Codigo de la compañia para la que trabaja"
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
                    <p className='error-message'>{error}</p> :
                    isReady && (location.pathname === '/user/create' ? !isCreate && <p>Accediendo...</p> : <p>Actualizando...</p>)
            }
            <br />    
            <button onClick={isCreate ? handleNewUser : handleCreate}>{isCreate ? 'Registrar Otro Usuario' : location.pathname === '/user/create' ? 'Registrar Usuario' : 'Actualizar Datos'}</button>
            {
                (globalUser.userType === 'admin' || globalUser.userType === 'company-owner') && (location.pathname === '/user/create') &&
                (<>
                <Link to={`/user/list/${globalUser.workingAt}`}>
                    <button>Ver usuarios registradas</button>
                </Link>
                </>)
            }
            {
                (globalUser.name && location.pathname !== '/user/create' ) && 
                     <button onClick={handleCloseSesion}>Cerrar Sesion</button>
            }
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