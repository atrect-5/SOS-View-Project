
import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { CircularProgress } from "@mui/material"
import { toast } from "react-toastify"

import { useUserContext } from "../../../providers/userContext"
import { getCompanyByIdService, getMachineByIdService, getReadingsByMachineService, updateMachineStatusService } from "../../../services/services"
import { Header } from "../../components"

import './machineDetail.scss'
import MachineCard from "../card/machineCard"

function MachineDetail () {
    const { machineId } = useParams()

    const { user: globalUser, isLoading} = useUserContext()

    const [isReady, setIsReady] = useState(false)
    const [error, setError] = useState('')
    const [hasError, setHasError] = useState(false)
    const [machine, setMachine] = useState([])
    const [company, setCompany] = useState({})
    const [isUpdateingStatus, setIsUpdateingStatus] = useState(false)
    const [isRefreshingTemperatures, setIsRefreshingTemperatures] = useState(false)
    const hasFetchedData = useRef(false)

    const navigate = useNavigate()

    // Maneja el cambio el el Status de ma maquina
      const handleStatusChange = async () => {
        try {
            setIsUpdateingStatus(true)
            // Alterna el estado entre 'active' y 'sleeping'
            const newStatus = machine.status === 'active' ? 'sleeping' : 'active'
        
            // Se actualiza el status en la base de datos 
            const updatedMachine = await updateMachineStatusService(machine._id, {status:newStatus})   
            
            if (updatedMachine.error){
                toast.error(`Hubo un error al cambiar el status: ${updatedMachine.error}`)
                setIsUpdateingStatus(false)
                return
            }
        
            // Actualiza el estado localmente
            setMachine((prevState) => ({
                ...prevState,
                status: updatedMachine.status,
            }))
            setIsUpdateingStatus(false)
        } catch (error) {
            console.error('Error al cambiar el estado de la máquina:', error)
            toast.error('No se pudo cambiar el estado de la máquina. Inténtalo de nuevo.')
        }
    }

    useEffect(() => {
        const fetchMachine = async () => {
            const machineData = await getMachineByIdService(machineId)

            if (globalUser.userType !== 'admin' && globalUser.workingAt !== machineData.belongsTo)
            {
                navigate('/')
            }

            if (machineData.belongsTo){
                const companyData = await getCompanyByIdService(machineData.belongsTo)
                // Obtenemos el posible error del backend
                if (machineData.error || companyData.error) {
                    setHasError(true)
                    setError(machineData.error || companyData.error)
                }else{
                    setCompany(companyData)
                    setMachine(machineData)
                    setIsReady(true)

                    if (hasFetchedData.current) return
                    hasFetchedData.current = true

                    setIsRefreshingTemperatures(true)                    

                    // Se obtinen las temperaturas mas recientes de la maquina
                    getReadingsByMachineService(machineId)
                    .then((data) => {
                        if (data.error){
                        toast.error(`Hubo un error al obtener las lecturas: ${data.error}`)
                        setHasError(true)
                        setError(machineData.error)
                        return
                        }
                        if(data.length === 0){
                        console.log('No hay temperaturas registradas')
                        return          
                        }

                        const temperatureList = []
                            const voltageList = []

                            // Recorremos los datos y los guardamos en la lista de temperaturas y voltajes
                            data.forEach((reading) => {
                            if (reading.field === 'temperature'){
                                temperatureList.push({measure: reading.value, date: reading.time})
                            } else if (reading.field === 'voltage') {
                                voltageList.push({measure: reading.value, date: reading.time})
                            }
                            })

                            // Ordena las listas cronológicamente
                            temperatureList.sort((a, b) => new Date(b.date) - new Date(a.date))
                            voltageList.sort((a, b) => new Date(b.date) - new Date(a.date))

                            // Toma la lectura más reciente de cada lista
                            const lastTemperatureReading = temperatureList[0] || null
                            const lastVoltageReading = voltageList[0] || null

                            // Guardamos la lista de temperaturas y voltajes en el estado de la maquina seleccionada
                            setMachine((prevState) => ({
                                ...prevState,
                                readings: {
                                temperatures: [...temperatureList, ...prevState.readings.temperatures],
                                voltages: [...voltageList, ...prevState.readings.temperatures]
                                },
                                lastReading: {
                                temperature: lastTemperatureReading,
                                voltage: lastVoltageReading
                                }
                            }))
                        })
                        .finally(() => {
                            setIsRefreshingTemperatures(false)
                        })
                }
            } else {
                // Obtenemos el posible error del backend
                if (machineData.error) {
                    setHasError(true)
                    setError(machineData.error)
                }else{
                    setMachine(machineData)
                    setCompany({name:'Maquina sin registrar'})
                    setIsReady(true)
                }
            }

        }

        if (!isLoading){
            if ((!globalUser.name)) {
                navigate('/')
            } else {
                fetchMachine()
            }
        }
        
    }, [globalUser, navigate, isLoading, machineId])

    return(
        <div className="machine-detail-main-container">
            <Header/>
            <h1 className="company-title">Compañia: {company.name}</h1>
            {
                isReady ? 
                    <MachineCard
                        machine={machine}
                        isRefreshingTemperatures={isRefreshingTemperatures}
                        onStatusChange={handleStatusChange}
                        isUpdateingStatus={isUpdateingStatus}
                    />
                    :
                    hasError ?
                        <p className="error-message">Ha ocurrido un error: {error}</p>
                        : <CircularProgress />
                
            }
        
        </div>
    )
}

export default MachineDetail