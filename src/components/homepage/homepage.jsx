
import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import CircularProgress from '@mui/material/CircularProgress'
import { toast } from "react-toastify"
import mqtt from "mqtt"

import { useUserContext } from "../../providers/userContext"
import { Header } from "../components"
import MachineCard from "../machine/card/machineCard"
import { getMachinesByCompanyService, updateMachineStatusService, getReadingsByMachineService, getStatusOfMachineService } from "../../services/services"
import { MQTT_BROKER_PASSWORD, MQTT_BROKER_URL, MQTT_BROKER_USER } from "../../consts"

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
  const clientMQTTRef = useRef(null)

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
      const lastReadingDate = lastReadingRef.current?.temperature?.date || ""

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
              voltages: [...voltageList, ...prevState.readings.voltages]
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
                    { 
                      temperatures: [...temperatureList, ...machine.readings.temperatures], 
                      voltages: [...voltageList, ...machine.readings.voltages] 
                    },
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

  /**************************** Hace la conexion a MQTT ****************************/
  useEffect(() => {
    if(isLoading) return
    if (!globalUser._id) return
    if (!selectedMachine._id) return

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
      // Suscribirse al topic de mediciones
      clientMQTT.subscribe(`atrect5/machines/${selectedMachine._id}/reading`, (err) => {
        if (err) {
          console.error("Error al suscribirse al topic readings:", err)
        } else {
          console.log(`atrect5/machines/${selectedMachine._id}/reading`)
        }
      })
      // Suscribirse al topic de status
      clientMQTT.subscribe(`atrect5/machines/${selectedMachine._id}/status`, (err) => {
        if (err) {
          console.error("Error al suscribirse al topic status:", err)
        } else {
          console.log(`atrect5/machines/${selectedMachine._id}/status`)
        }
      })
    })

    // Se almacena el cliente MQTT en la referencia
    clientMQTTRef.current = clientMQTT

    // Se ejecuta al registrar un mensaje
    clientMQTT.on("message", (topic, message) => {
      console.log(`Mensaje recibido en el topic ${topic}:`, message.toString())
      // eslint-disable-next-line no-unused-vars
      const [_, __, machineId, subTopic] = topic.split('/')

      if (subTopic === 'reading'){
        const messageData = JSON.parse(message.toString())
        const temperatureData = { date: new Date().toISOString(), measure: parseFloat( messageData.temperature ) }
        const voltageData = { date: new Date().toISOString(), measure: parseFloat( messageData.voltage ) }
        
        // Se agregan las nuevas temperaturas a la lista
        setSelectedMachine( (prevState) => ({
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

        // Se agregan las nuevas temperaturas a la lista dentro de la lista de maquinas
        setMachineList((prevList) =>
          prevList.map((machine) =>
            machine._id === selectedMachine._id
              ? { ...machine, 
                  readings: 
                  { 
                    temperatures: [temperatureData, ...machine.readings.temperatures], 
                    voltages: [voltageData, ...machine.readings.voltages] 
                  },
                  lastReading: 
                  { temperature: temperatureData, voltage: voltageData }          
                }
              : machine
        ))

      } else if(subTopic === 'status')
      {
        const messageData = JSON.parse(message.toString())

        // Actualiza el estado localmente
        setSelectedMachine((prevState) => ({
          ...prevState,
          status: messageData.status,
        }))
    
    
        // Actualiza la lista de máquinas si es necesario
        setMachineList((prevList) =>
          prevList.map((machine) =>
            machine._id === selectedMachine._id
              ? { ...machine, status: messageData.status }
              : machine
          )
        )
      }


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
  }, [globalUser, selectedMachine._id, isLoading])

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

      if (!clientMQTTRef.current){
        toast.error('Hubo un error al intentar cambiar el status')
        setIsUpdateingStatus(false)
        return
      }

      // Se actualiza el status en la base de datos 
      const updatedMachine = await updateMachineStatusService(selectedMachine._id, {status:newStatus})   
      
      if (updatedMachine.error){
        toast.error(`Hubo un error al cambiar el status: ${updatedMachine.error}`)
        setIsUpdateingStatus(false)
        return
      }

      // Publica el nuevo estado en MQTT
      const topic = `atrect5/machines/${selectedMachine._id}/status`
      const message = JSON.stringify({ status: updatedMachine.status })

      if (clientMQTTRef.current){
        clientMQTTRef.current.publish(topic, message, { qos: 1 }, (err) => {
          if (err) {
            console.error(`Error al publicar en el topic ${topic}:`, err)
          } else {
            console.log(`Publicado en el topic ${topic}: ${message}`)
          }
        })
      } else {
        console.error("El cliente MQTT no está disponible")
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
                : <MachineCard
                    machine={selectedMachine}
                    isRefreshingTemperatures={isRefreshingTemperatures}
                    onStatusChange={handleStatusChange}
                    isUpdateingStatus={isUpdateingStatus}
                  />
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
        <br /><br />

      </div>
      
      </>
  )
}