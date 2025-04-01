
import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Switch } from "@mui/material"
import CircularProgress from '@mui/material/CircularProgress'
import { toast } from "react-toastify"

import { useUserContext } from "../../providers/userContext"
import { Header } from "../components"
import { getMachinesByCompanyService, updateMachineStatusService, getReadingsByMachineService, getStatusOfMachineService } from "../../services/services"

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
  const [refreshingMachines, setIsRefreshingMachines] = useState(false)
  const [isRefreshingTemperatures, setIsRefreshingTemperatures] = useState(false)
  const [refreshTemperatures, setRefreshTemperatures] = useState(false)
  const lastReadingRef = useRef(null)

  /************* Redirige al login si el usuario no esta registrado **************/
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
          if(machineListData.length > 0){
            setSelectedMachine({
              ...machineListData[0]
            })
          }
          setLoadingMachines(false)
        }
      }
    }
    fetchUser()
  }, [globalUser, navigate, isLoading])

  /************* Guarda la lista de temperaturas cuando se cambia la selectedMachine y obtiene el status actual *************/
  useEffect(() => {

    console.log(`Se escogio la maquina con id: ${selectedMachine._id}`)
    setIsRefreshingTemperatures(true)

    // Actualiza el status al actual de la maquina
    const getStatus = async (machineId) => {

      const newStatus = await getStatusOfMachineService(machineId)      

      // Actualiza el estado localmente
      setSelectedMachine((prevState) => ({
        ...prevState,
        status: newStatus.status,
      }))
      // Actualiza el status en la lista de maquinas
      setMachineList((prevList) =>
        prevList.map((machine) =>
          machine._id === selectedMachine._id
            ? { ...machine, status: newStatus.status }
            : machine
        )
      )
    }

    if (selectedMachine._id){

      getStatus(selectedMachine._id)

      // Referencia para obtener la última lectura
      const lastReadingDate = lastReadingRef.current?.temperature?.date || "";

      // Se obtinen las temperaturas mas recientes de la maquina
      getReadingsByMachineService(selectedMachine._id, lastReadingDate)
        .then((data) => {
          if (data.error){
            toast.error(`Hubo un error al obtener las lecturas: ${data.error}`)
            setIsRefreshingTemperatures(false)
            return
          }
          if(data.length === 0){
            console.log('No hay temperaturas registradas')
            setIsRefreshingTemperatures(false)
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

          // Actualiza la referencia con la nueva última lectura
          lastReadingRef.current = {
            temperature: lastTemperatureReading,
            voltage: lastVoltageReading,
          }
          
          // Guardamos la lista de temperaturas y voltajes en el estado de la maquina seleccionada
          setSelectedMachine((prevState) => ({
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

          // Guardamos los datos en state de la lista de las maquinas
          setMachineList((prevList) =>
            prevList.map((machine) =>
              machine._id === selectedMachine._id
                ? { ...machine, 
                    readings: 
                    { temperatures: [...temperatureList, ...machine.readings.temperatures], voltages: [...voltageList, ...machine.readings.voltages] },
                    lastReading: 
                    { temperature: lastTemperatureReading, voltage: lastVoltageReading }          
                  }
                : machine
            )
          )
          setIsRefreshingTemperatures(false)
      })
    }
  }, [selectedMachine._id, refreshTemperatures])

  /**************************** Maneja los cambios del select ************************************/
  const handleChange = e => {
    const { name, value } = e.target
    setSelectedMachine({
        ...machineList[value],
        [name]:value
    })
    
    // Actualiza la referencia con la última lectura de la nueva máquina
    lastReadingRef.current = {
      temperature: machineList[value].lastReading?.temperature || null,
      voltage: machineList[value].lastReading?.voltage || null,
  }
  }

  /***************************** Maneja el cambio del el Status de la maquina *********************/
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

  /****************************** Maneja el refresco de la lista de maquinas **************************/
  const handleRefreshMachinesList = async () => {
    setIsRefreshingMachines(true)

    // Actualiza la referencia con la nueva última lectura
    lastReadingRef.current = {
      temperature: null,
      voltage: null,
    }

    const actualId = selectedMachine._id

    const machineListData = await getMachinesByCompanyService(globalUser.workingAt)
    if (machineListData.error){
      toast.error(`Hubo un error al refrescar la lista de maquinas: ${machineListData.error}`)
      setIsRefreshingMachines(false)
      return
    }

    // Actualiza la lista de máquinas
    setMachineList( machineListData )
    if (machineListData.length > 0){
      setSelectedMachine({
        ...machineListData[0]
      })
    }

    // Si el id es el mismo, obtiene las temperaturas
    if (actualId === selectedMachine._id){
      setRefreshTemperatures((prev) => !prev)
    }

    toast.success('Lista de maquinas actualizada')
    setIsRefreshingMachines(false)
  }

  /**************************** Ajustamos dinamicamente el margin top del contenido para que el header no cubre el contenido *****************/
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

  /******************** Función para convertir la fecha al formato requerido por el campo datetime-local *********************/
  const formatDateTimeForInput = (datetime, dateFormat) => {
    try {
        const date = new Date(datetime)
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date')
        }
        // Convierte la fecha a la zona horaria local del usuario
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
        const zonedDate = new Date(date.toLocaleString('en-US', { timeZone }))
        // Busca por expresion regular la primer letra y la convierte en mayuscula, dandole un formato parecido a:  Jueves 6 de marzo 2025 a las 10:19 PM
        return format(zonedDate, dateFormat, { locale: es }).replace(/(^\w{1})/g, letter => letter.toUpperCase())
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
            <div className="select-machines-img-refresh-container">
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
              <img className={`refresh-icon ${refreshingMachines ? 'rotation' : ''}`} onClick={handleRefreshMachinesList} alt="refresh" src="/refresh_icon.png"/>
            </div>
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
                        isRefreshingTemperatures ? <CircularProgress/> :
                        !selectedMachine.lastReading ? <p className="caution-message">No hay lecturas registradas aun</p>
                        : <div className="last-reading-info">
                          <p className="last-message">Ultima medicion: </p>
                          <div className="last-reading-detail">
                            {
                              selectedMachine.lastReading.temperature && 
                                (<div className="last-reading-detail-temperature-voltage">
                                  <p>Temperatura: </p>
                                  <div className="measure-card">
                                    {selectedMachine.lastReading.temperature.measure}
                                  </div>
                                  <p className="measure-message">{formatDateTimeForInput(selectedMachine.lastReading.temperature.date, "d'/'MMMM'/'yyyy '-' h:mm:ss a")}</p>
                                </div>)
                            }
                            {
                              selectedMachine.lastReading.voltage && 
                                (<div className="last-reading-detail-temperature-voltage">
                                  <p>Voltage: </p>
                                  <div className="measure-card">
                                    {selectedMachine.lastReading.voltage.measure}
                                  </div>
                                  <p className="measure-message">{formatDateTimeForInput(selectedMachine.lastReading.voltage.date, "d'/'MMMM'/'yyyy '-' h:mm:ss a")}</p>
                                </div>)
                            }
                          </div>
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
                            name="Switch-status"
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
                        <p className="subtitle">Fecha de instalacion </p><span>{formatDateTimeForInput(selectedMachine.installationDate, "EEEE',' d 'de' MMMM 'del' yyyy 'a las' h:mm a")}</span>
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
                                          <p>Fecha: <span>{formatDateTimeForInput(maintenance.date, "EEEE',' d 'de' MMMM 'del' yyyy 'a las' h:mm a")}</span></p>
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