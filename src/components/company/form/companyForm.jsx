
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'
import { TextField } from '@mui/material'

import { useUserContext } from '../../../providers/userContext'
import { createCompanyService } from '../../../services/services'


// Formulario de registro de compañias
function CompanyRegister() {
    const navigate = useNavigate()

    const { user: globalUser} = useUserContext()

    const initialState = {
        id: '',
        name: '',
        description: '',
        address: '',
        email: '',
        phone: ''
    }

    const [company, setCompany] = useState(initialState)

    const [iscreated, setIsCreated] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const [error, setError] = useState('')
 
    // Redirige a la página principal si el usuario no está registrado
    useEffect(() => {
        if (!globalUser.name || globalUser.userType !== 'admin') {
            navigate('/') 
        }
    }, [globalUser, navigate])

    // Maneja los cambios de los inputs
    const handleChange = e => {
        const { name, value } = e.target
        setCompany({
            ...company,
            [name]:value
        })
    }
    
    // Eliminacion de state para crear nueva compañia
    const handleNewCompany = () => {
        setCompany(initialState)
        setHasError(false)
        setIsReady(false)
        setIsCreated(false)
        setError('')
    }

    // Maneja el registro de la nueva compañia
    const handleCreate = async () => {

        setHasError(false)
        setIsReady(false)
        setError('')

        // Validacion de campos vacios
        if (!company.name || !company.description || !company.address || !company.email || !company.phone){
            setHasError(true)
            setError('Faltan datos')
            toast.error('Faltan datos')
            return
        }
        
        const companyData = company
        const createdCompany = await createCompanyService(companyData)
        
        // Maneja la creacion de la nueva compañia
        if(createdCompany.error || !createdCompany){
            setHasError(true)
            setError(createdCompany.error)
            toast.error(`Hubo un error ${createdCompany.error}`)
            setIsReady(false)
        }else{
            // Aviso de correcta creacion
            setHasError(false)
            setIsReady(true)
            toast.success(`Compañia registrada con id: ${createdCompany._id}`)
            setIsCreated(true)
            setCompany(createdCompany)
        }
        

      }

    return (
        <>
        <div className='form-card'>
        <form>
            <h1>Resgistrar Compañia</h1>
            <TextField
                className='text-field'
                size="small"
                type="text"
                name='name'
                label='Nombre'
                value={company.name}
                onChange={handleChange}
            />
            <br />
            <TextField
                className='text-field'
                size="small"
                type="text"
                name="description"
                label="Descripcion"
                multiline
                maxRows={5}
                value={company.description}
                onChange={handleChange}
            />
            <br />
            <TextField
                className='text-field'
                size="small"
                type="text"
                name='address'
                label='Direccion'
                multiline
                maxRows={5}
                value={company.address}
                onChange={handleChange}
            />
            <br />
            <TextField
                className='text-field'
                size="small"
                type="email"
                name='email'
                label='Email'
                value={company.email}
                onChange={handleChange}
            />
            <br />
            <TextField
                className='text-field'
                size="small"
                type="text"
                name="phone"
                label="Telefono"
                value={company.phone}
                onChange={handleChange}
            />
        </form>
            {
                hasError ? 
                    <p className='error-message'>{error}</p> :
                    isReady && (<p>Id al crearse: {company._id}</p>)
            }
            <br />
            <button onClick={iscreated ? handleNewCompany : handleCreate}>{iscreated ? 'Crear otra compañia' : 'Registrar'}</button>
            <br />
            <Link to={'/company/list'}>
                <button>Ver compañias registradas</button>
            </Link>
            <br />
            <Link to={'/'}>Volver</Link>
        </div>
        </>
    )
}

export default CompanyRegister