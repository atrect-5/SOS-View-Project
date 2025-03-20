
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Switch } from "@mui/material"
import CircularProgress from '@mui/material/CircularProgress'
import { toast } from "react-toastify"

import { useUserContext } from "../../providers/userContext"
import { Header } from "../components"
import { getMachinesByCompanyService, updateMachineStatusService } from "../../services/services"

import './homepage.scss'

// Pagina principal de la app 
export default function HomePage() {
  const { user: globalUser, isLoading } = useUserContext()

  const navigate = useNavigate()

  const initialState = {
    belongsTo: '',
    installationDate: '',
    name: '',
    description: '',
    location: '',
    _id: '', 
    index: 0
  }

  const [loadingMachines, setLoadingMachines] = useState(true)
  const [machineList, setMachineList] = useState([])
  const [selectedMachine, setSelectedMachine] = useState(initialState)
  const [isUpdateingStatus, setIsUpdateingStatus] = useState(false)

  // Redirige al login si el usuario no esta registrado
  useEffect(() => {
    const fetchUser = async () => {
      // Esperamos a que carguen los datos del usuario del localStorage
      if (!isLoading) {
        if (!globalUser.name){
          // Si no se cargo el usuario regresamos al login
          navigate('/login')
        } else {
          // Si cargo el usuario, obtenemos la lista de las maquinas de su empresa
          const machineListData = await getMachinesByCompanyService(globalUser.workingAt)
          setMachineList( machineListData )
          setSelectedMachine({
            ...machineListData[0]
          })
          setLoadingMachines(false)
        }
      }
    }
    fetchUser()
  }, [globalUser, navigate, isLoading])

  // Maneja los cambios
  const handleChange = e => {
    const { name, value } = e.target
    setSelectedMachine({
        ...machineList[value],
        [name]:value
    })
  }

  // Maneja el cambio el el Status de ma maquina
  const handleStatusChange = async () => {
    try {
      setIsUpdateingStatus(true)
      // Alterna el estado entre 'active' y 'sleeping'
      const newStatus = selectedMachine.status === 'active' ? 'sleeping' : 'active'

      // Se actualiza el status en la base de datos 
      const updatedMachine = await updateMachineStatusService(selectedMachine._id, {status:newStatus})   
      
      if (updatedMachine.error){
        toast.error(`Hubo un error al cambiar el status: ${updatedMachine.error}`)
        setIsUpdateingStatus(false)
        return
      }
  
      // Actualiza el estado localmente
      setSelectedMachine((prevState) => ({
        ...prevState,
        status: updatedMachine.status,
      }))
  
  
      // Actualiza la lista de máquinas si es necesario
      setMachineList((prevList) =>
        prevList.map((machine) =>
          machine._id === selectedMachine._id
            ? { ...machine, status: updatedMachine.status }
            : machine
        )
      )
      setIsUpdateingStatus(false)
    } catch (error) {
      console.error('Error al cambiar el estado de la máquina:', error)
      toast.error('No se pudo cambiar el estado de la máquina. Inténtalo de nuevo.')
    }
  }

  // Ajustamos dinamicamente el margin top del contenido para que el header no cubre el contenido
  useEffect(() => {
    const header = document.querySelector('.header-fixed')
    const content = document.querySelector('.body-home-page-container')
    const adjustPadding = () => {
      content.style.paddingTop = `${header.offsetHeight}px`
    }
    adjustPadding()
    window.addEventListener('resize', adjustPadding)

    return () => window.removeEventListener('resize', adjustPadding)
  }, [])

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
      <>
      <div className="homepage-container">
        <div className="header-fixed">
          <Header />
        </div>
        <div className="body-home-page-container">
          
          <div className="select-machine-container">
            <p className="info-message">Selecciona la maquina para visualizar</p>
            <select
                name="index"
                disabled={machineList.length === 0}
                value={selectedMachine.index || 0}
                onChange={handleChange}
                >
                    {
                      machineList.length === 0 
                        ? <option value={0} disabled>No hay maquinas registradas</option> 
                        :
                        machineList.map((machine, index) => (
                            <option key={index} value={index}>
                            {`${machine.name} | ${machine.location ? machine.location : 'Sin locación'}`}
                            </option>
                        ))
                    }
            </select>
          </div>
          
          {loadingMachines ? <CircularProgress/> :
            machineList.length === 0 ? <p className="error-message">No hay maquinas registradas</p>
              : !selectedMachine.installationDate ? <CircularProgress/> 
                : <div className="machine-card">
                    <div className="principal-info-container">
                      <h2>
                          Nombre: {selectedMachine.name}
                      </h2>
                      <strong>
                        {
                          selectedMachine.description ? selectedMachine.description : 'Sin descripcion'
                        }
                      </strong><br />
                      {
                        selectedMachine.location && <p>Ubicacion: <span>{selectedMachine.location}</span></p>
                      }
                    </div>

                    <br /><hr /><br />
                    <div className="last-reading-container">
                      {
                        selectedMachine.readings.temperatures.length === 0 ? <p className="caution-message">No hay lecturas registradas aun</p>
                        : <div className="last-reading-info">
                          <p>Ultima medicion: </p>
                          {
                            selectedMachine.lastReading.temperature && 
                              (<>
                                <p>Temperatura: </p>
                                <p>Lectura: {selectedMachine.lastReading.temperature.measure} | Fecha: {formatDateTimeForInput(selectedMachine.lastReading.temperature.date)}</p>
                              </>)
                          }
                          {
                            selectedMachine.lastReading.voltage && 
                              (<>
                                <p>Voltage: </p>
                                <p>Lectura: {selectedMachine.lastReading.voltage.measure} | Fecha: {formatDateTimeForInput(selectedMachine.lastReading.voltage.date)}</p>
                              </>)
                          }
                        </div>
                      }
                    </div>
                    <br />
                    <div className="machine-info">

                      <div className="machine-info-status">
                        <p>Status: <span className={selectedMachine.status === 'active' ? 'active-status' : 'sleeping-status'}>{selectedMachine.status}</span></p>
                        <p>
                          {selectedMachine.status === 'active' ? 'Apagar' : 'Encender' } maquina: 
                          <Switch
                            onChange={handleStatusChange}
                            checked={selectedMachine.status === 'active'}
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
                        <p className="subtitle">Fecha de instalacion </p><span>{formatDateTimeForInput(selectedMachine.installationDate)}</span>
                      </div>

                    </div>

                    <br /><hr /><br />

                    <div className="maintenance-history-container">
                        <details>
                          <summary >Historial de mantenimiento: </summary>
                          {
                              selectedMachine.maintenanceHistory.length === 0 ? <p className="caution-message">No hay historial registrado</p> 
                              :
                              (
                                  selectedMachine.maintenanceHistory.map((maintenance, index) => (
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
          }
          
                      
        </div>
        
        <br />
        <br />
        <hr />
        <br />
        <div className="explore-buttons-container">
          <Link to={`/machine/list/${globalUser.workingAt}`}>
            <button>Ver maquinas registradas</button>
          </Link>
          {
            (globalUser.userType === 'admin' || globalUser.userType === 'company-owner') &&
            <Link to={`/user/list/${globalUser.workingAt}`}>
              <button>Ver usuarios registrados</button>
            </Link>
          }
          {
            globalUser.userType === 'admin' &&
            <Link to={`/company/list`}>
              <button>Ver compañias registradas</button>
            </Link>
          }
        </div>

      </div>
      
      </>
  )
}