
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { CircularProgress } from "@mui/material"

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
            //if ((!globalUser.name || (globalUser.userType !== 'admin' && globalUser.workingAt !== machineId))) {
            if ((!globalUser.name)) {
                navigate('/')
            } else {
                fetchMachine()
            }
        }
        
    }, [globalUser, navigate, isLoading, machineId])


    // Función para convertir la fecha al formato requerido por el campo datetime-local
    const formatDateTimeForInput = (datetime) => {
        const date = new Date(datetime);
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
        return adjustedDate.toISOString().slice(0, 16);
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