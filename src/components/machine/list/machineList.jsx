
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { CircularProgress } from "@mui/material"
import PropTypes from "prop-types"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { Header } from "../../components"
import { useUserContext } from "../../../providers/userContext"
import { getMachinesByCompanyService, getCompanyByIdService, getMachineWhithoutCompanyService } from "../../../services/services"

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

            if (location.pathname === '/machine/list/unregistered') {
                const machinesData = await getMachineWhithoutCompanyService()
                    
                // Obtenemos el posible error del backend
                if (machinesData.error) {
                    setHasError(true)
                    setError(machinesData.error)
                }else{
                    setCompany({})
                    setMachines(machinesData)
                    setIsReady(true)
                }

            }else{
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
        }

        if (!isLoading){
            if ((!globalUser.name || (globalUser.userType !== 'admin' && globalUser.workingAt !== companyId))) {
                navigate('/')
            } else {
                fetchMachines()
            }
        }
        
    }, [globalUser, navigate, isLoading, companyId])


    // Ajustamos dinamicamente el margin top del contenido para que el header no cubre el contenido
    useEffect(() => {
        const header = document.querySelector('.header-fixed')
        const content = document.querySelector('.top')
        const adjustPadding = () => {
          content.style.paddingTop = `${header.offsetHeight}px`
        }
        adjustPadding()
        window.addEventListener('resize', adjustPadding)
    
        return () => window.removeEventListener('resize', adjustPadding)
    }, [globalUser])

  return (
        <div className="machine-list-main-container">
            <div className="header-fixed">
                <Header />
            </div>
            <div className="top"></div>
            <div className="form-card">
                <h1 className="title-container">
                    {location.pathname === '/machine/list/unregistered' 
                                ? 'Maquinas sin registrar'
                                : <>
                                    Maquinas registradas en: {isReady ? company.name : hasError  ? 'Hubo un error' : <CircularProgress/>} 
                                </> 
                    }
                </h1>
            </div>

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
                        : 
                        <>
                            <h1>Cargando maquinas...</h1>
                            <CircularProgress />
                        </>
                
            }
        
        </div>
    )
}

function ListComponent({machines}) {
    const navigate = useNavigate()
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
    return (
        <div className={machines.length <= 1 ? 'machine-list-container single-item' : 'machine-list-container'}>
            {
                machines.length === 0 ? <p className="error-message">No hay maquinas registradas</p> : (
                machines.map(machine => (
                <div className="machine-card" key={machine._id}>
                    <h2>
                        {machine.name}
                    </h2>
                    <strong>
                            {machine.description ? machine.description : 'Sin descripción'}
                    </strong>
                    {
                        location.pathname !== '/machine/list/unregistered' &&
                        <>
                            <p>Ubicacion: <span>{machine.location ? machine.location : 'Sin locación'}</span></p>
                        </>
                    }
                    
                    <p>Status: <span className={machine.status === 'active' ? 'active-status' : 'sleeping-status'}>{machine.status}</span></p>
                    <br />
                    <div className="container-date-id">
                        <div className="date-container">
                            <p className="contacto">Fecha de instalacion</p>
                            <span>{formatDateTimeForInput(machine.installationDate)}</span>
                        </div>
                        {
                            location.pathname === '/machine/list/unregistered' &&
                            <div className="id-container">
                                <p className="contacto">Id para registro</p>
                                <span>{machine._id}</span>
                            </div>
                        }
                    </div>

                    <br />
                        <hr />
                    <div className="button-machine-container">
                        <button onClick={() => navigate(`/machine/detail/${machine._id}`)}>Ver</button>
                        <button onClick={() => navigate(`/machine/maintenance/create/${machine._id}`)}>Agregar Mantenimiento</button>
                        <button onClick={() => navigate(`/machine/edit/${machine._id}`)}>Editar</button>
                    </div>
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