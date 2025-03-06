
import { useState, useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { CircularProgress } from "@mui/material"
import PropTypes from "prop-types"

import { Header } from "../../components"
import { useUserContext } from "../../../providers/userContext"
import { getMachinesByCompanyService } from "../../../services/services"

import './machineList.scss'

function MachineList() {

    const { companyId } = useParams()

    const { user: globalUser, isLoading} = useUserContext()

    const [isReady, setIsReady] = useState(false)
    const [error, setError] = useState('')
    const [hasError, setHasError] = useState(false)
    const [machines, setMachines] = useState([])

    const navigate = useNavigate()

    useEffect(() => {
        const fetchMachines = async () => {
            const machinesData = await getMachinesByCompanyService(companyId)
            // Obtenemos el posible error del backend
            if (machinesData.error) {
                setHasError(true)
                setError(machinesData.error)
            }else{
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
        <div className="machine-list-container">
            <Header/>
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
        
        <Link to={`/`}>
                <button>Volver</button>
        </Link>
        </div>
    )
}

function ListComponent({machines}) {
    return (
        <div>
            {
                machines.length === 0 ? <p>No hay maquinas registradas</p> : (
                machines.map(machine => (
                <div className="machine-card" key={machine._id}>
                    {machine.name}, {machine.belongsTo}, {machine.description}, {machine.location}, {machine.status}
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
            <p>Ha ocurrido un error: {error}</p>
        </div>
    )
}
ErrorComponent.propTypes = {
    error: PropTypes.string.isRequired
}

export default MachineList