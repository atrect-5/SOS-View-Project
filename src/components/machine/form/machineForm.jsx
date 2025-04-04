
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { TextField } from '@mui/material'

import { useUserContext } from '../../../providers/userContext'
import { createMachineService, updateMachineService, getMachineByIdService, registerMachineService } from '../../../services/services'
import { Header } from '../../components'

import './machineForm.scss'

// Formulario de registro de una nueva maquina
function MachineRegister() {
    const navigate = useNavigate()
    const location = useLocation()

    const { machineId } = useParams()

    const { user: globalUser, isLoading} = useUserContext()

    const initialState = {
        belongsTo: '',
        installationDate: '',
        name: '',
        description: '',
        location: '',
        _id: ''
    }

    const [machine, setMachine] = useState(initialState)

    const [hasError, setHasError] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const [error, setError] = useState('')
    const [iscreated, setIsCreated] = useState(false)

    // Redirige a la página principal si el usuario no está registrado
    useEffect(() => {
        if (!isLoading){
            if ((location.pathname === '/machine/create' && globalUser.userType !== 'admin') || !globalUser.name ) {
                navigate('/') 
            } else if (location.pathname === '/machine/register' || location.pathname === '/machine/create' ) {
                setMachine({
                    installationDate: '',
                    name: '',
                    description: '',
                    location: '',
                    _id: '',
                    belongsTo: location.pathname === '/machine/register' ? globalUser.workingAt : ''
                })
            } 
        }
    }, [globalUser, navigate, isLoading, location.pathname])

    // Carga los datos de la máquina si machineId está disponible
    useEffect(() => {
        const fetchMachineData = async () => {
            if (machineId) {
                const machineData = await getMachineByIdService(machineId)
                const { belongsTo } = machineData

                // Evitamos que si se esta editando, sea alguien diferente de la empresa
                if (globalUser.workingAt !== belongsTo && globalUser.userType !== 'admin'){
                    navigate('/')
                }
                
                setMachine({
                    ...machineData,
                    belongsTo: belongsTo || ''
                })
            }
        }
        setIsCreated(false)
        setHasError(false)
        setError('')
        setIsReady(false)

        fetchMachineData()
    }, [machineId, navigate, globalUser, location])

    // Maneja los cambios de los inputs
    const handleChange = e => {
        const { name, value } = e.target
        setMachine({
            ...machine,
            [name]:value
        })
    }

    // Función para convertir la fecha al formato requerido por el campo datetime-local
    const formatDateTimeForInput = (datetime) => {
        const date = new Date(datetime);
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
        return adjustedDate.toISOString().slice(0, 16);
    }

    // Eliminacion de state para crear nueva maquina
    const handleNewMachine = () => {
        setMachine(initialState)
        setHasError(false)
        setIsReady(false)
        setIsCreated(false)
        setError('')
    }

    // Maneja la creacion de la nueva maquina
    const handleCreate = async () => {

        setHasError(false)
        setIsReady(false)
        setError('')

        // Validación de campos vacíos
        if ((location.pathname === '/machine/register' && !machine._id) ||
            (location.pathname !== '/machine/register' && !machine.name)) 
        {
            setHasError(true)
            setError('Faltan datos')
            toast.error('Faltan datos')
            return
        }
        
        const { _id, ...machineData} = machine
        
        // Eliminacion de installationDate para evitar errores del servicio
        if (!machineData.installationDate) {
            delete machineData.installationDate
        }
        
        // Eliminacion de belongsTo si no existe para evitar errores del servicio
        if (!machineData.belongsTo) {
            delete machineData.belongsTo
        }

        const createdMachine = location.pathname === '/machine/create'
            ? await createMachineService(machineData)
            : location.pathname === '/machine/register'
                ? await registerMachineService(machine.belongsTo, _id) 
                : await updateMachineService(_id, machineData)

        
        // Manejo de errores en el registro de la nueva maquina
        if(createdMachine.error || !createdMachine){
            setHasError(true)
            setError(createdMachine.error)
            toast.error(`Hubo un error ${createdMachine.error}`)
            setIsReady(false)
        }else{
            // Aviso de correcta creacion
            setHasError(false)
            setIsReady(true)
            if (location.pathname === '/machine/create'){
                toast.success(`Maquina registrada con id: ${createdMachine._id}`)
            }else if(location.pathname === '/machine/register'){
                toast.success(`Maquina ${createdMachine._id} registrada a la compañia ${createdMachine.belongsTo}`)
                navigate(`/machine/edit/${createdMachine._id}`)
            }else{
                toast.success(`Maquina actualizada`)
                navigate(`/machine/detail/${createdMachine._id}`)
            }
            setIsCreated(true)
            setMachine(prevState => ({
                ...prevState,
                ...createdMachine
            }))
        }
    }

    const handleBack = () => {
        navigate(-1)
    }

    return (
        <>
        <div className="body-machine-form-container">
            <div className="header-fixed">
                <Header />
            </div>
            <div className='form-card'>
            <form>
                <h1>{location.pathname === '/machine/create' 
                            ? 'Crear Maquina' 
                            : location.pathname === '/machine/register'
                                    ? 'Registrar Maquina'
                                    : 'Actualizar Maquina'}</h1>
                {
                location.pathname !== '/machine/register' ?
                <>
                <TextField
                    className='text-field'
                    size="small"
                    type="text"
                    name='name'
                    label='Nombre'
                    value={machine.name}
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
                    value={machine.description}
                    onChange={handleChange}
                />
                <br />
                <TextField
                    className='text-field'
                    size="small"
                    type="text"
                    name='location'
                    label='Locacion'
                    multiline
                    maxRows={5}
                    value={machine.location}
                    onChange={handleChange}
                />
                <br />
                </>
                :
                <>
                <TextField
                    className='text-field'
                    size="small"
                    type="text"
                    name="_id"
                    label="id de la maquina a registrar"
                    value={machine._id}
                    onChange={handleChange}
                />
                <br />
                </>
                }
                <TextField
                    className='text-field'
                    size="small"
                    type="text"
                    name="belongsTo"
                    disabled= {globalUser.userType !== 'admin'}
                    label="Codigo de la compañia"
                    value={machine.belongsTo}
                    onChange={handleChange}
                />
                <br />
                {
                    location.pathname !== '/machine/register' && 
                    <>
                    <p>Fecha de instalacion</p>
                    <input 
                        className='date-select'
                        type="datetime-local"
                        name="installationDate"
                        value={machine.installationDate ? formatDateTimeForInput(machine.installationDate) : ''}
                        onChange={handleChange} 
                    />
                    </>
                }

                
            </form>
                {
                    hasError ? 
                        <p className='error-message'>{error}</p> :
                        (isReady && location.pathname === '/machine/create') && (<p className='success-message'>Id al crearse: {machine._id}</p>)
                }
                <br />
                <button onClick={iscreated ? handleNewMachine : handleCreate}>{location.pathname === '/machine/create'
                                                                                    ? iscreated ? 'Crear otra maquina' : 'Registrar'
                                                                                    : location.pathname === '/machine/register' 
                                                                                    ? 'Registrar'
                                                                                    : 'Actualizar'            
                                                                            }</button>                                      
                <Link to={`/machine/list/${globalUser.workingAt}`}>
                    <button>Ver maquinas registradas</button>
                </Link>
                <br />
                <Link onClick={handleBack}>Volver</Link>
            </div>
        </div>

        </>
    )
}

export default MachineRegister