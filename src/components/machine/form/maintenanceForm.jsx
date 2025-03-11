import { useParams } from "react-router-dom"


function MaintenanceForm () {

    const { machineId } = useParams()

    return(
        <>
        <p>Aqui se registrara mantenimiento en la maquina {machineId}</p>
        </>
    )
}

export default MaintenanceForm