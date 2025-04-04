
import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { CircularProgress } from "@mui/material"
import { toast } from "react-toastify"
import mqtt from "mqtt"

import { useUserContext } from "../../../providers/userContext"
import { getCompanyByIdService, getMachineByIdService, getReadingsByMachineService, updateMachineStatusService } from "../../../services/services"
import { MQTT_BROKER_PASSWORD, MQTT_BROKER_URL, MQTT_BROKER_USER } from "../../../consts"
import { Header } from "../../components"
import MachineCard from "../card/machineCard"

import './machineDetail.scss'

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

    /***************** Maneja el cambio el el Status de ma maquina *****************/
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

    /***************** Obtiene los datos de la maquina que se visualizara *****************/
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

    /**************************** Hace la conexion a MQTT ****************************/
    useEffect(()=>{
        if(isLoading) return
            if (!globalUser._id) return
            if (!machine._id) return
        
            const clientMQTT = mqtt.connect(MQTT_BROKER_URL, {
            username: MQTT_BROKER_USER,
            password: MQTT_BROKER_PASSWORD,
            clientId: `mqtt_${globalUser._id}_${Math.random().toString(16).slice(3)}`,
            reconnectPeriod: 5000,
            clean: true, 
            })
        
            // Manejar eventos del cliente MQTT
            clientMQTT.on("connect", () => {
            console.log("Conectado al broker MQTT (HiveMQ Cloud)")
            // Suscribirse a un topic
            clientMQTT.subscribe(`atrect5/machines/${machine._id}/reading`, (err) => {
                if (err) {
                console.error("Error al suscribirse al topic:", err)
                } else {
                console.log(`atrect5/machines/${machine._id}/reading`)
                }
            })
            })
        
            clientMQTT.on("message", (topic, message) => {
            console.log(`Mensaje recibido en el topic ${topic}:`, message.toString())
            
            // eslint-disable-next-line no-unused-vars
            const [_, __, machineId, subTopic] = topic.split('/')

            const messageData = JSON.parse(message.toString())
            const temperatureData = { date: new Date().toISOString(), measure: parseFloat( messageData.temperature ) }
            const voltageData = { date: new Date().toISOString(), measure: parseFloat( messageData.voltage ) }

            // Se agrega la lectura a la lista
            setMachine( (prevState) => ({
                ...prevState,
                readings: {
                    temperatures: [temperatureData, ...prevState.readings.temperatures],
                    voltages: [voltageData, ...prevState.readings.voltages]
                },
                lastReading: {
                    temperature: temperatureData,
                    voltage: voltageData
                }
            }))
            })
        
            clientMQTT.on("error", (err) => {
            console.error("Error en la conexión MQTT:", err)
            })
        
            clientMQTT.on("close", () => {
            console.log("Conexión MQTT cerrada")
            })
        
            // Limpiar la conexión al desmontar el componente
            return () => {
            if (clientMQTT) {
                clientMQTT.end()
            }
            }
    },[globalUser, machine._id, isLoading])

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