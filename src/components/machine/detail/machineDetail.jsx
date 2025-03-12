
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { CircularProgress } from "@mui/material"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { useUserContext } from "../../../providers/userContext"
import { getCompanyByIdService, getMachineByIdService } from "../../../services/services"
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

    const navigate = useNavigate()

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
            <h1>{company.name}</h1>
            {
                isReady ? 
                    <>
                    <div className="machine-card" key={machine._id}>
                        <h2>
                            {machine.name}
                        </h2>
                        <strong>
                            {machine.description}
                        </strong>
                        <p>Ubicacion: <span>{machine.location}</span></p>
                        <p>Status: <span>{machine.status}</span></p>
                        <p>Fecha de instalacion: <span>{formatDateTimeForInput(machine.installationDate)}</span></p>

                        <div className="maintenance-history-container">
                            <details>
                            <summary>Historial de mantenimiento: </summary>
                            {
                                machine.maintenanceHistory.length === 0 ? <p className="error-message">No hay historial registrado</p> 
                                :
                                (
                                    machine.maintenanceHistory.map((maintenance, index) => (
                                        <div key={index}>
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