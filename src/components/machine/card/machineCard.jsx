
import { Switch, CircularProgress } from "@mui/material"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import PropTypes from "prop-types"

import "./machineCard.scss"

const MachineCard = ({
  machine,
  isRefreshingTemperatures = false,
  onStatusChange = null,
  isUpdateingStatus = false,
}) => {
  const formatDateTimeForInput = (datetime, dateFormat) => {
    try {
      const date = new Date(datetime)
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date")
      }
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const zonedDate = new Date(date.toLocaleString("en-US", { timeZone }))
      return format(zonedDate, dateFormat, { locale: es }).replace(
        /(^\w{1})/g,
        (letter) => letter.toUpperCase()
      )
    } catch (error) {
      console.error("Error formateando la fecha:", error)
      return "Fecha no disponible"
    }
  }

  return (
    <div className="machine-card">
        <div className="principal-info-container">
            <h2>
                Nombre: {machine.name}
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
            isRefreshingTemperatures ? <div id="center-circular-progres-readings"> <CircularProgress/> </div> :
            !machine.lastReading ? <p className="caution-message">No hay lecturas registradas aun</p>
            : <div className="last-reading-info">
                <p className="last-message">Ultima medicion: </p>
                <div className="last-reading-detail">
                {
                    machine.lastReading.temperature && 
                    (<div className="last-reading-detail-temperature-voltage">
                        <p>Temperatura: </p>
                        <div className="measure-card">
                        {machine.lastReading.temperature.measure}
                        </div>
                        <p className="measure-message">{formatDateTimeForInput(machine.lastReading.temperature.date, "d'/'MMMM'/'yyyy '-' h:mm:ss a")}</p>
                    </div>)
                }
                {
                    machine.lastReading.voltage && 
                    (<div className="last-reading-detail-temperature-voltage">
                        <p>Voltage: </p>
                        <div className="measure-card">
                        {machine.lastReading.voltage.measure}
                        </div>
                        <p className="measure-message">{formatDateTimeForInput(machine.lastReading.voltage.date, "d'/'MMMM'/'yyyy '-' h:mm:ss a")}</p>
                    </div>)
                }
                </div>
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
                name="Switch-status"
                onChange={onStatusChange}
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
            <p className="subtitle">Fecha de instalacion </p><span>{formatDateTimeForInput(machine.installationDate, "EEEE',' d 'de' MMMM 'del' yyyy 'a las' h:mm a")}</span>
            </div>

        </div>

        <br /><hr /><br />

        <div className="maintenance-history-container">
            <details>
                <summary >Historial de mantenimiento: </summary>
                {
                    machine.maintenanceHistory.length === 0 ? <p className="caution-message">No hay historial registrado</p> 
                    :
                    (
                        machine.maintenanceHistory.map((maintenance, index) => (
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
  )
}
MachineCard.propTypes = {
    machine: PropTypes.shape({
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        location: PropTypes.string,
        status: PropTypes.string.isRequired,
        installationDate: PropTypes.string.isRequired,
        maintenanceHistory: PropTypes.arrayOf(
            PropTypes.shape({
                description: PropTypes.string.isRequired,
                date: PropTypes.string.isRequired,
            })
        ).isRequired,
        lastReading: PropTypes.shape({
        temperature: PropTypes.shape({
            measure: PropTypes.number.isRequired,
            date: PropTypes.string.isRequired,
        }),
        voltage: PropTypes.shape({
            measure: PropTypes.number.isRequired,
            date: PropTypes.string.isRequired,
        }),
        }),
    }).isRequired,
    isRefreshingTemperatures: PropTypes.bool,
    onStatusChange: PropTypes.func,
    isUpdateingStatus: PropTypes.bool,
}

export default MachineCard