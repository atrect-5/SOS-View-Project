
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { TextField } from '@mui/material'

import { useUserContext } from '../../../providers/userContext'
import { createMachineService, updateMachineService, getMachineByIdService } from '../../../services/services'

// Formulario de registro de una nueva maquina
function MachineRegister() {
    const navigate = useNavigate()

    const { machineId } = useParams()

    const { user: globalUser} = useUserContext()

    const initialState = {
        belongsTo: '',
        installationDate: '',
        name: '',
        description: '',
        location: ''
    }

    const [machine, setMachine] = useState(initialState)

    const [hasError, setHasError] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const [error, setError] = useState('')
    const [iscreated, setIsCreated] = useState(false)

    // Redirige a la página principal si el usuario no está registrado
    useEffect(() => {
        if (globalUser.userType !== 'admin' && location.pathname === '/machine/create') {
            navigate('/') 
        }
    }, [globalUser, navigate])

    // Carga los datos de la máquina si machineId está disponible
    useEffect(() => {
        const fetchMachineData = async () => {
            if (machineId) {
                const machineData = await getMachineByIdService(machineId)
                setMachine(machineData)
            }
        }
        fetchMachineData()
    }, [machineId])

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
        if (!machine.name){
            setHasError(true)
            setError('Faltan datos')
            toast.error('Faltan datos')
            return
        }

        // Eliminacion de installationDate para evitar errores del servicio
        if(!machine.installationDate){
            delete machine.installationDate
        }

        // Eliminacion de belongsTo si no existe para evitar errores del servicio
        if (!machine.belongsTo){
            delete machine.belongsTo
        }
        
        const { _id, ...machineData} = machine
        const createdMachine = location.pathname === '/machine/create'
            ? await createMachineService(machineData)
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
            }else{
                toast.success(`Maquina actualizada`)
                navigate(`/machine/detail/${createdMachine._id}`)
            }
            setIsCreated(true)
            setMachine(createdMachine)
        }
        

      }

    return (
        <>
        <div className='form-card'>
        <form>
            <h1>{location.pathname === '/machine/create' ? 'Crear Maquina' : 'Actualizar Maquina'}</h1>
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
            {
                globalUser.userType === 'admin' && (
                    <>
                        <TextField
                            className='text-field'
                            size="small"
                            type="text"
                            name="belongsTo"
                            label="Codigo de la compañia"
                            value={machine.belongsTo}
                            onChange={handleChange}
                        />
                        <br />
                    </>
                )
            }
            <p>Fecha de instalacion</p>
            <input 
                className='date-select'
                type="datetime-local"
                name="installationDate"
                value={machine.installationDate ? formatDateTimeForInput(machine.installationDate) : ''}
                onChange={handleChange} 
            />
            
        </form>
            {
                hasError ? 
                    <p className='error-message'>{error}</p> :
                    (isReady && location.pathname === '/machine/create') && (<p>Id al crearse: {machine._id}</p>)
            }
            <br />
            <button onClick={iscreated ? handleNewMachine : handleCreate}>{location.pathname !== '/machine/create'
                                                                                ? 'Actualizar'                                                  
                                                                                :iscreated ? 'Crear otra maquina' : 'Registrar'}</button>
            <br />
            <Link to={`/machine/list/${globalUser.workingAt}`}>
                <button>Ver maquinas registradas</button>
            </Link>
            <br />
            <Link to={'/'}>Volver</Link>
        </div>
        </>
    )
}

export default MachineRegister