
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'
import { TextField } from '@mui/material'

import { useUserContext } from '../../../providers/userContext'
import { createCompanyService, updateCompanyService } from '../../../services/services'


// Formulario de registro de compañias
function CompanyRegister() {
    const navigate = useNavigate()

    const { user: globalUser, userCompany: userCompanyGlobal, setUserCompanyGlobal } = useUserContext()

    const initialState = {
        id: '',
        name: '',
        description: '',
        address: '',
        email: '',
        phone: ''
    }

    const [company, setCompany] = useState(location.pathname === '/company/edit' ? userCompanyGlobal : initialState)

    const [iscreated, setIsCreated] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const [error, setError] = useState('')
 
    // Redirige a la página principal si el usuario no está registrado
    useEffect(() => {
        if (!globalUser.name){
            navigate('/') 
        } else if (location.pathname === '/company/create' && globalUser.userType !== 'admin') {
            navigate('/')
        } else if (location.pathname === '/company/edit' && globalUser.userType !== 'admin' && globalUser.userType !== 'company-owner') {
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
        
        const { _id, ...companyData } = company
        const createdCompany = location.pathname === '/company/create' 
            ? await createCompanyService(companyData) 
            : await updateCompanyService(_id, companyData)
        
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
            if (location.pathname === '/company/edit' ){
                toast.success(`Compañia actualizada con exito`)
                setUserCompanyGlobal(createdCompany)
                setIsCreated(false)
            }else{
                toast.success(`Compañia registrada con id: ${createdCompany._id}`)
                setIsCreated(true)
            }
            setCompany(createdCompany)
        }
        

      }

    return (
        <>
        <div className='form-card'>
        <form>
            <h1>{location.pathname === '/company/create' ? 'Resgistrar Compañia': 'Actualizar Compañia'}</h1>
            {
                location.pathname === '/company/edit' &&
                <>
                <TextField
                    className='text-field'
                    size="small"
                    type="text"
                    name='_id'
                    label='Id de la compañia'
                    disabled
                    value={company._id}
                    onChange={handleChange}
                />
                <br />
                </>
            }
            
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
                    (isReady && location.pathname === '/company/create') && (<p>Id al crearse: {company._id}</p>)
            }
            <br />
            <button onClick={iscreated ? handleNewCompany : handleCreate}>{iscreated ? 'Crear otra compañia' : location.pathname === '/company/create' ? 'Registrar' : 'Actualizar'}</button>
            <br />
            {
                globalUser.userType === 'admin' &&
                <Link to={'/company/list'}>
                    <button>Ver compañias registradas</button>
                </Link>
            }
            <br />
            <Link to={'/'}>Volver</Link>
        </div>
        </>
    )
}

export default CompanyRegister