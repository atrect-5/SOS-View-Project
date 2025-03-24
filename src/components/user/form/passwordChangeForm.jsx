
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TextField } from '@mui/material'
import { toast } from 'react-toastify'

import { useUserContext } from '../../../providers/userContext'
import { getUserLoginService, updateUserPasswordService } from '../../../services/services'

function PasswordChangeForm () {

    const navigate = useNavigate()
    const { user: globalUser, isLoading } = useUserContext()

    const initialState = {
        actualPassword: '',
        newPassword: '',
        confirmPassword: ''
    }

    const [user, setUser] = useState(initialState)
    const [hasError, setHasError] =  useState(false)
    const [error, setError] = useState('')

    useEffect( () => {
        if (!globalUser.name && !isLoading)
        {
            navigate('/')
        }
    })

    // Maneja los cambios de los inputs
    const handleChange = e => {
        const { name, value } = e.target
        setUser({
            ...user,
            [name]:value
        })
    }

    // Maneja el regreso a la pagina anterior
    const handleBack = () => {
        navigate(-1)
    }

    const handleSubmit = async () => {

        // Validacion de campos vacios y espacios
        if ( !user.actualPassword.trim() || !user.newPassword.trim() || !user.confirmPassword.trim()) {
            toast.error('Faltan datos')
            setHasError(true)
            setError('Faltan datos')
            return
        }

        // Validacion de coincidencia de contraseñas
        if (user.newPassword !== user.confirmPassword) {
            toast.error('La nueva contraseña y confirmar contraseña deben ser iguales')
            setHasError(true)
            setError('La nueva contraseña y confirmar contraseña deben ser iguales')
            return
        }

        // Validacion de longitud mínima
        if (user.newPassword.length < 8) {
            toast.error('La nueva contraseña debe tener al menos 8 caracteres')
            setHasError(true)
            setError('La nueva contraseña debe tener al menos 8 caracteres')
            return
        }

        const createdPassword = await updateUserPasswordService(globalUser._id, user)

        if (createdPassword.error)
        {
            setHasError(true)
            setError(createdPassword.error)
            toast.error(`Hubo un error ${createdPassword.error}`)
        }else{
            toast.success('Contraseña Actualizada')
            await getUserLoginService({ email: globalUser.email, password: user.newPassword})
            setHasError(false)
            setError('')
            navigate(-1)
        }

    }

    return (
        <>
        <div className="form-card">
            <h2>Cambio de contraseña</h2>
            <br />
            <TextField
                className='text-field'
                type="password"
                name='actualPassword'
                size="small"
                label='Contraseña Actual'
                value={user.actualPassword}
                onChange={handleChange}
            />
            <br /><br />
            <TextField
                className='text-field'
                type="password"
                name="newPassword"
                size="small"
                label="Nueva Constraseña"
                value={user.newPassword}
                onChange={handleChange}
            />
            <br />
            <TextField
                className='text-field'
                type="password"
                name="confirmPassword"
                size="small"
                label="Confirmar Constraseña"
                value={user.confirmPassword}
                onChange={handleChange}
            />
            {
                hasError &&
                    <p className='error-message'>{error}</p> 
            }
            <br />
            <button onClick={handleSubmit}>Guardar</button>
            <br />

            <Link onClick={handleBack}>Volver</Link>
        </div>
        </>
    )
}

export default PasswordChangeForm