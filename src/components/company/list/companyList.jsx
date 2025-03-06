
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import { Header } from "../../components";
import { useUserContext } from "../../../providers/userContext";

import './companyList.scss'

function CompanyList() {

    const { user: globalUser, isLoading} = useUserContext()

    const navigate = useNavigate()

    useEffect(() => {
        if ((!globalUser.name || globalUser.userType !== 'admin') && !isLoading) {
            navigate('/') 
        }
    })

    return (
      <div className="company-list-container">
        <Header/>
        <p>Aqui se listaran las compañias registradas...</p>

        <Link to={`/`}>
                <button>Volver</button>
        </Link>
      </div>
    );
  }
  
  export default CompanyList