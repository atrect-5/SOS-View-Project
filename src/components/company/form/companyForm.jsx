
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { CircularProgress, TextField } from '@mui/material'

import { useUserContext } from '../../../providers/userContext'
import { createCompanyService, updateCompanyService, getCompanyByIdService, deleteCompanyService } from '../../../services/services'
import { Header } from '../../components'

import './companyForm.scss'

// Formulario de registro de compañias
function CompanyRegister() {
    const navigate = useNavigate()
    const location = useLocation()

    const { companyId } = useParams()

    const { user: globalUser, userCompany: userCompanyGlobal, setUserCompanyGlobal, isLoading } = useUserContext()

    const initialState = {
        _id: '',
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
        if (!isLoading)
        {
            if (!globalUser.name){
                navigate('/') 
            } else if (location.pathname === '/company/create' && globalUser.userType !== 'admin') {
                navigate('/')
            } else if (location.pathname === '/company/edit' && globalUser.userType !== 'admin' && globalUser.userType !== 'company-owner') {
                navigate('/')
            } else if ( companyId && globalUser.userType !== 'admin' ) {
                navigate('/')
            }
        }
        
    }, [globalUser, navigate, isLoading, companyId, location.pathname])

    // Crea el state de la compañia segun la ruta accedida
    useEffect(() => {

        setIsCreated(false)
        setHasError(false)
        setError('')
        setIsReady(false)

        const setCompanyWithId = async () => {
            const companyData = await getCompanyByIdService(companyId)
            if (companyData.hasError){
                toast.error(`Hubo un error: ${companyData.error}`)
            }else{
                setCompany(companyData)
            }
        }
        const setCompanyEmpty = () => {
            setCompany({
                _id: '',
                name: '',
                description: '',
                address: '',
                email: '',
                phone: ''
            })
        }

        if (location.pathname === '/company/edit' && userCompanyGlobal.name){
            setCompany(userCompanyGlobal)
        } else if (companyId){
            setCompanyWithId()
        } else if (location.pathname === '/company/create'){
            setCompanyEmpty()
        }
    }, [companyId, userCompanyGlobal, location.pathname])

    const handleBack = () => {
        navigate(-1)
    }

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
                navigate('/')
            }else if (location.pathname === '/company/create'){
                toast.success(`Compañia registrada con id: ${createdCompany._id}`)
                setIsCreated(true)
            }else{
                toast.success(`Compañia ${createdCompany.name} actualizada`)
                navigate(-1)
            }
            setCompany(createdCompany)
        }
        

    }

    // Maneja la eliminacion de una commpañia
    const handleDelete = async () => {
        // Si se da clic en eliminar, se pregunta si se esta seguro
        if (!window.confirm(`Esta seguro de eliminar la compañia ${company.name}? (Esto eliminara los usuarios y maquinas registrados en esta compañia)`))
        {
            return
        }

        try {
            // Se llama al servicio que se encarga de eliinar peliculas
            const result = await deleteCompanyService(company._id)

            if (!result.hasError){
                toast.success(`Se ha eliminado la Compañia ${company.name}`)  
                navigate('/company/list', { replace: true })
            }else{
                // Si el servidor respondio con algun error
                toast.error(`Hubo un error al eliminar Compañia -> ${result.error}`)
            }
    
        }catch(error){
            toast.error(`Error del servidor`)
            console.log(error)            
        }
    }

    return (
        <>
        <div className="company-form-body-container">
            <div className="header-fixed">
                <Header />
            </div>
            <div className="company-form-container">
            {
                isLoading 
                    ? <CircularProgress/>
                    :
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
                            (isReady && location.pathname === '/company/create') && (<p className='success-message'>Id al crearse: {company._id}</p>)
                    }
                    <br />
                    <button onClick={iscreated ? handleNewCompany : handleCreate}>{iscreated ? 'Crear otra compañia' : location.pathname === '/company/create' ? 'Registrar' : 'Actualizar'}</button>
                    {
                        globalUser.userType === 'admin' &&
                        <Link to={'/company/list'}>
                            <button>Ver compañias registradas</button>
                        </Link>
                    }
                    {
                        (globalUser.userType === 'admin' && location.pathname !== '/company/create' && location.pathname !== '/company/edit') &&
                            <button className='delete-company-button' onClick={handleDelete}>Eliminar Compañia</button>
                    }
                    <br />
                    <Link onClick={handleBack}>Volver</Link>
                </div>
            }   
            </div>

        </div>
        </>
    )
}

export default CompanyRegister