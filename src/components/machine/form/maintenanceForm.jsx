
import { Link, useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { CircularProgress, TextField } from "@mui/material"
import { toast } from "react-toastify"

import { saveMaintenanceService, getMachineByIdService } from "../../../services/services"
import { useUserContext } from "../../../providers/userContext"
import { Header } from "../../components"

import './machineForm.scss'

function MaintenanceForm () {

    const { machineId } = useParams()

    const navigate = useNavigate()

    const { user: globalUser, isLoading} = useUserContext()

    const initialState = {
        date: '', 
        description: ''
    }

    const [maintenanceData, setMaintenanceData] = useState(initialState)
    const [machine, setMachine] = useState({})

    const [hasError, setHasError] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const [error, setError] = useState('')
    const [isCreated, setIsCreated] = useState(false)

    useEffect(() => {
        const fetchMachineData = async () => {
            if (machineId) {
                const machineData = await getMachineByIdService(machineId)
                const { belongsTo } = machineData

                // Evitamos que alguien de otra compañia registre una entrada de mantenimiento
                if (globalUser.workingAt !== belongsTo && globalUser.userType !== 'admin'){
                    navigate('/')
                }
                
                setMachine({
                    ...machineData,
                    belongsTo: belongsTo || ''
                })
            }
        }

        if (!isLoading){
            if (!globalUser.name){
                navigate('/')
            } else {
                fetchMachineData()
            }
        }
    }, [globalUser, isLoading, navigate, machineId])

    // Maneja los cambios de los inputs
    const handleChange = e => {
        const { name, value } = e.target
        setMaintenanceData(prevState => ({
            ...prevState,
            [name]:value
        }))
    }

    const handleCreate = async () => {

        setHasError(false)
        setIsReady(false)
        setError('')

        //Validacion de campos vacios
        if (!maintenanceData.description){
            setHasError(true)
            setError('La descripcion es requerida')
            toast.error('Faltan datos')
        }

        const maintenanceDataToCreate = maintenanceData

        if(!maintenanceDataToCreate.date){
            delete maintenanceDataToCreate.date
        }

        const createdMaintenance = await saveMaintenanceService(machineId, maintenanceDataToCreate)

        // Manejo de errores en el registro de la nueva maquina
        if(createdMaintenance.error || !createdMaintenance){
            setHasError(true)
            setError(createdMaintenance.error)
            toast.error(`Hubo un error ${createdMaintenance.error}`)
            setIsReady(false)
        }else{
            setIsReady(true)
            setIsCreated(true)
            setMaintenanceData(createdMaintenance.maintenanceHistory[createdMaintenance.maintenanceHistory.length - 1])
        }


    }

    const handleBack = () => {
        navigate(-1)
    }

    const handleNew = () => {
        setMaintenanceData(initialState)
        setHasError(false)
        setIsReady(false)
        setIsCreated(false)
        setError('')
    }

    // Función para convertir la fecha al formato requerido por el campo datetime-local
    const formatDateTimeForInput = (datetime) => {
        const date = new Date(datetime);
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
        return adjustedDate.toISOString().slice(0, 16);
    }

    return(
        <>
        <div className="maintenance-body-container">
            <div className="header-fixed">
                <Header />
            </div>
            <div className="form-maintenance-container">
                {
                    isLoading ? <CircularProgress/> 
                    :
                    <div className="form-card maintenaince">
                        <p className="title-maintenance">Registrar mantenimiento en la maquina: <span>{machine.name}</span></p>
                        <br />
                        <br />
                        <TextField
                            className='text-field'
                            size="small"
                            type="text"
                            name="description"
                            label="Descripcion"
                            multiline
                            value={maintenanceData.description}
                            onChange={handleChange}
                        />
                        <br />
                        <p>Fecha</p>
                        <input 
                            className='date-select'
                            type="datetime-local"
                            name="date"
                            value={maintenanceData.date ? formatDateTimeForInput(maintenanceData.date) : ''}
                            onChange={handleChange} 
                        />
                        {
                            hasError ? 
                                <p className='error-message'>{error}</p> :
                                (isReady) && (<p className='success-message'>Id al crearse: {maintenanceData._id}</p>)
                        }
                        <br />
                        <button onClick={isCreated ? handleNew : handleCreate}>{isCreated ? 'Registrar otro' : 'Guardar' }</button>
                        <br />
                        <Link onClick={handleBack}>Volver</Link>
                    </div>
                }
            </div>
        </div>
        </>
    )
}

export default MaintenanceForm