
import { Header } from "../../components"
import { Link } from "react-router-dom";

import './machineList.scss'

function MachineList() {

  return (
    <div className="machine-list-container">
        <Header/>
      <p>Aqui se listaran las maquinas registradas...</p>

      <Link to={`/`}>
                <button>Volver</button>
        </Link>
    </div>
  );
}

export default MachineList