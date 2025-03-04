
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'

import { useUserContext } from '../../../providers/userContext'
import { createMachineService } from '../../../services/services'

// Formulario de registro de una nueva maquina
function MachineRegister() {
    const navigate = useNavigate()

    const globalUser = useUserContext()

    const initialState = {
        belongsTo: globalUser.workingAt,
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
        if (!globalUser.name) {
            navigate('/') 
        }
    }, [globalUser, navigate])

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

    // Eliminacion de state para crear nueva compañia
    const handleNewMachine = () => {
        setMachine(initialState)
        setHasError(false)
        setIsReady(false)
        setIsCreated(false)
        setError('')
    }

    // Maneja la creacion de la nueva maquina
    const handleCreate = async () => {

        setError(false)
        setIsReady(false)
        setError('')

        // Validación de campos vacíos
        if (!machine.name || !machine.description || !machine.location){
            setHasError(true)
            setError('Faltan datos')
            toast.error('Faltan datos')
            return
        }

        // Eliminacion de installationDate para evitar errores del servicio
        if(!machine.installationDate){
            delete machine.installationDate
        }
        
        const machineData = machine
        const createdMachine = await createMachineService(machineData)


        
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
            toast.success(`Maquina registrada con id: ${createdMachine._id}`)
            setIsCreated(true)
            setMachine(createdMachine)
        }
        

      }

    return (
        <>
        <div className='form-card'>
        <form>
            <h1>Resgistrar Maquina</h1>
            <input
                type="text"
                name='name'
                placeholder='Nombre'
                value={machine.name}
                onChange={handleChange}
            />
            <br />
            <input
                type="text"
                name="description"
                placeholder="Descripcion"
                value={machine.description}
                onChange={handleChange}
            />
            <br />
            <input
                type="text"
                name='location'
                placeholder='Locacion'
                value={machine.location}
                onChange={handleChange}
            />
            <br />
            {
                globalUser.userType === 'admin' && (
                    <>
                        <input
                            type="text"
                            name="belongsTo"
                            placeholder="Codigo de la compañia"
                            value={machine.belongsTo}
                            onChange={handleChange}
                        />
                        <br />
                    </>
                )
            }
            <p>Fecha de instalacion</p>
            <input 
                type="datetime-local"
                name="installationDate"
                value={machine.installationDate ? formatDateTimeForInput(machine.installationDate) : ''}
                onChange={handleChange} 
            />
            
        </form>
            {
                hasError ? 
                    <p>{error}</p> :
                    isReady && (<p>Id al crearse: {machine._id}</p>)
            }
            <br />
            <button onClick={iscreated ? handleNewMachine : handleCreate}>{iscreated ? 'Crear otra maquina' : 'Registrar'}</button>
            <br />
            <Link to={'/machine/list'}>
                <button>Ver maquinas registradas</button>
            </Link>
            <br />
            <Link to={'/'}>Volver</Link>
        </div>
        </>
    )
}

export default MachineRegister