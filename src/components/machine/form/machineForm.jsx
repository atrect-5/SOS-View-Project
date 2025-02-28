
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'

import { useUserContext } from '../../../providers/userContext'

import { createMachineService } from '../../../services/services'

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


    useEffect(() => {
        if (!globalUser.name) {
            navigate('/') // Redirige a la página principal si el usuario no está registrado
        }
    }, [globalUser, navigate]) // Esto indica que se actualizara cada que cambie el stateGlobal de user o cada que se monta el componente

    // Funcion que hace el cambio en el state cuando se edita algun input
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

    // Funcion que redirije a la lista de todas las maquinas registradas
    const handleListCompanies = () =>{
        navigate('/machine/list')
    } 


    // Funcion que crea la maquina
    const handleCreate = async () => {

        setError(false)
        setIsReady(false)
        setError('')

        if (!machine.name || !machine.description || !machine.location){
            setHasError(true)
            setError('Faltan datos')
            toast.error('Faltan datos')
            return
        }
        
        const machineData = machine
        const createdMachine = await createMachineService(machineData)
        
        if(createdMachine.error || !createdMachine){
            setHasError(true)
            setError(createdMachine.error)
            toast.error(`Hubo un error ${createdMachine.error}`)
            setIsReady(false)
        }else{
            setHasError(false)
            setIsReady(true)
            toast.success(`Maquina registrada con id: ${createdMachine._id}`)
            setMachine(createdMachine)
        }
        

      }

    return (
        <>
        <div>
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
                value={machine.lastName}
                onChange={handleChange}
            />
            <br />
            <input
                type="text"
                name='location'
                placeholder='Locacion'
                value={machine.password}
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
            <button onClick={handleCreate}>Registrar</button>
            <br />
            <button onClick={handleListCompanies}>Ver maquinas registradas</button>
            <br />
            <Link to={'/'}>Volver</Link>
        </div>
        </>
    )
}

export default MachineRegister