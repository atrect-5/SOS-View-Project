
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { CircularProgress } from "@mui/material"
import PropTypes from "prop-types"

import { Header } from "../../components"
import { useUserContext } from "../../../providers/userContext"
import { getMachinesByCompanyService, getCompanyByIdService } from "../../../services/services"

import './machineList.scss'

function MachineList() {

    const { companyId } = useParams()

    const { user: globalUser, isLoading} = useUserContext()

    const [isReady, setIsReady] = useState(false)
    const [error, setError] = useState('')
    const [hasError, setHasError] = useState(false)
    const [machines, setMachines] = useState([])
    const [company, setCompany] = useState({})

    const navigate = useNavigate()

    useEffect(() => {
        const fetchMachines = async () => {
            const machinesData = await getMachinesByCompanyService(companyId)
            const companyData = await getCompanyByIdService(companyId)
            // Obtenemos el posible error del backend
            if (machinesData.error || companyData.error) {
                setHasError(true)
                setError(machinesData.error)
            }else{
                setCompany(companyData)
                setMachines(machinesData)
                setIsReady(true)
            }
        }

        if (!isLoading){
            if ((!globalUser.name || (globalUser.userType !== 'admin' && globalUser.workingAt !== companyId))) {
                navigate('/')
            } else {
                fetchMachines()
            }
        }
        
    }, [globalUser, navigate, isLoading, companyId])

  return (
        <div className="machine-list-main-container">
            <Header/>
            <h1>{company.name}</h1>
            {
                isReady ? 
                    <ListComponent
                        machines={machines}
                    />
                    :
                    hasError ?
                        <ErrorComponent
                            error={error}
                        />
                        : <CircularProgress />
                
            }
        
        <button onClick={() => navigate(-1)}>Volver</button>
        </div>
    )
}

function ListComponent({machines}) {
    const navigate = useNavigate()
    // Función para convertir la fecha al formato requerido por el campo datetime-local
    const formatDateTimeForInput = (datetime) => {
        const date = new Date(datetime);
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
        return adjustedDate.toISOString().slice(0, 16);
    }
    return (
        <div className={machines.length <= 1 ? 'machine-list-container single-item' : 'machine-list-container'}>
            {
                machines.length === 0 ? <p className="error-message">No hay maquinas registradas</p> : (
                machines.map(machine => (
                <div className="machine-card" key={machine._id}
                        onClick={() => navigate(`/machine/detail/${machine._id}`)}>
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
                )
            ))}
        </div>
    )
}
ListComponent.propTypes = {
    machines: PropTypes.array.isRequired
}


function ErrorComponent({error}) {
    return (
        <div>
            <p className="error-message">Ha ocurrido un error: {error}</p>
        </div>
    )
}
ErrorComponent.propTypes = {
    error: PropTypes.string.isRequired
}

export default MachineList