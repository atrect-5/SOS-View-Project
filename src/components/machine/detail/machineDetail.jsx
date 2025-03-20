
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { CircularProgress, Switch } from "@mui/material"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from "react-toastify"
import { io } from "socket.io-client"

import { useUserContext } from "../../../providers/userContext"
import { getCompanyByIdService, getMachineByIdService, updateMachineStatusService } from "../../../services/services"
import { Header } from "../../components"

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
    const [hasShownWebError, setHasShownWebError] = useState(false)
    const [hasShownWebConection, setHasShownWebConection] = useState(false)

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
                    setMachine(machineData)
                    setCompany(companyData)
                    setIsReady(true)
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

    // Realiza la conexion al webSocket
    useEffect(() => {
        const socket = io('http://localhost:3000') // Cambia la URL según tu configuración
    
        // Notifica cuando el socket se conecta
        socket.on('connect', () => {
            if (!hasShownWebConection) {
                toast.success('Conectado al servidor de datos en tiempo real')
                setHasShownWebConection(true)
            }
            setHasShownWebError(false)
        })
    
        // Notifica cuando el socket se desconecta
        socket.on('disconnect', () => {
            toast.warning('Desconectado del servidor de datos en tiempo real')
            setHasShownWebError(false)
            setHasShownWebConection(false)
        })
    
        // Notifica si ocurre un error al intentar conectarse
        socket.on('connect_error', (error) => {
            if (!hasShownWebError) {
                toast.error(`Error al conectar con el servidor: ${error.message}`)
                setHasShownWebError(true)
            }
            setHasShownWebConection(false)
        })
    
        // Maneja los datos recibidos para la máquina actual
        socket.on('machineData', (data) => {
            if (data.machineId === machineId) { // Filtra los datos para la máquina actual
                setMachine((prevState) => ({
                    ...prevState,
                    lastReading: data.lastReading,
                    readings: {
                        ...prevState.readings,
                        temperatures: data.temperatures || prevState.readings.temperatures,
                        voltage: data.voltage || prevState.readings.voltage,
                    },
                }))
            }
        })
    
        // Limpia el socket al desmontar el componente
        return () => {
            socket.disconnect()
        }
    }, [machineId, hasShownWebError, hasShownWebConection])


    // Función para convertir la fecha al formato requerido por el campo datetime-local
    const formatDateTimeForInput = (datetime) => {
        try {
            const date = new Date(datetime)
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date')
            }
            // Convierte la fecha a la zona horaria local del usuario
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
            const zonedDate = new Date(date.toLocaleString('en-US', { timeZone }))
            // Busca por expresion regular la primer letra y la convierte en mayuscula, dandole un formato parecido a:  Jueves 6 de marzo 2025 a las 10:19 PM
            return format(zonedDate, "EEEE',' d 'de' MMMM 'del' yyyy 'a las' h:mm a", { locale: es }).replace(/(^\w{1})/g, letter => letter.toUpperCase())
        } catch (error) {
            console.error('Error formateando la fecha:', error)
            return 'Fecha no disponible'
        }
    }

    return(
        <div className="machine-detail-main-container">
            <Header/>
            <h1 className="company-title">Compañia: {company.name}</h1>
            {
                isReady ? 
                    <>
                    <div className="machine-card" key={machine._id}>
                        <div className="principal-info-container">
                            <h2>
                                {machine.name}
                            </h2>
                            <strong>
                            {
                                machine.description ? machine.description : 'Sin descripcion'
                            }
                            </strong><br />
                            {
                                machine.location && <p>Ubicacion: <span>{machine.location}</span></p>
                            }
                        </div>
                        <br /><hr /><br />
                        <div className="last-reading-container">
                            {
                                machine.readings.temperatures.length === 0 ? <p className="caution-message">No hay lecturas registradas aun</p>
                                : <div className="last-reading-info">
                                <p>Ultima medicion: </p>
                                {
                                    machine.lastReading.temperature && 
                                    (<>
                                        <p>Temperatura: </p>
                                        <p>Lectura: {machine.lastReading.temperature.measure} | Fecha: {formatDateTimeForInput(machine.lastReading.temperature.date)}</p>
                                    </>)
                                }
                                {
                                    machine.lastReading.voltage && 
                                    (<>
                                        <p>Voltage: </p>
                                        <p>Lectura: {machine.lastReading.voltage.measure} | Fecha: {formatDateTimeForInput(machine.lastReading.voltage.date)}</p>
                                    </>)
                                }
                                </div>
                            }
                        </div>
                        <br />
                        <div className="machine-info">


                            <div className="machine-info-status">
                                <p>Status: <span className={machine.status === 'active' ? 'active-status' : 'sleeping-status'}>{machine.status}</span></p>

                                <p>
                                    {machine.status === 'active' ? 'Apagar' : 'Encender' } maquina: 
                                <Switch
                                    onChange={handleStatusChange}
                                    checked={machine.status === 'active'}
                                    sx={{
                                    '& .MuiSwitch-switchBase': {
                                        top: 3,
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                        color: '#00c917',
                                        '& + .MuiSwitch-track': {
                                        backgroundColor: '#048f14d0', 
                                        opacity: 1
                                        },
                                    },
                                    '& .MuiSwitch-track': {
                                        borderRadius: 13, 
                                        backgroundColor: '#404258', 
                                        height: 20, 
                                    }
                                    }}
                                />
                                </p>
                                {
                                    isUpdateingStatus && <CircularProgress/>
                                }
                            </div>
                            <div className="machine-info-instalationdate">
                                <p className="subtitle">Fecha de instalacion </p><span>{formatDateTimeForInput(machine.installationDate)}</span>
                            </div>
                        </div>
                        <br /><hr /><br />
                        <div className="maintenance-history-container">
                            <details>
                            <summary>Historial de mantenimiento: </summary>
                            {
                                machine.maintenanceHistory.length === 0 ? <p className="caution-message">No hay historial registrado</p> 
                                :
                                (
                                    machine.maintenanceHistory.map((maintenance, index) => (
                                        <div key={index} className="history-container">
                                            <br />
                                            <p>Descripcion: <span>{maintenance.description}</span></p>
                                            <p>Fecha: <span>{formatDateTimeForInput(maintenance.date)}</span></p>
                                        </div>
                                    ))
                                )
                            }
                            
                            </details>
                        </div>
                    </div>
                    
                    </>
                    :
                    hasError ?
                        <p className="error-message">Ha ocurrido un error: {error}</p>
                        : <CircularProgress />
                
            }
        
        </div>
    )
}

export default MachineDetail