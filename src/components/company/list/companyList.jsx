
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import PropTypes from "prop-types";

import { Header } from "../../components";
import { useUserContext } from "../../../providers/userContext";
import { getCompaniesService } from "../../../services/services";

import './companyList.scss'

function CompanyList() {

    const { user: globalUser, isLoading} = useUserContext()

    const [companies, setCompanies] = useState([])
    const [isReady, setIsReady] = useState(false)
    const [error, setError] = useState('')
    const [hasError, setHasError] = useState(false)

    const navigate = useNavigate()

    useEffect(() => {
        const fetchCompanies = async () => {
            const companiesData = await getCompaniesService()
            // Obtenemos el posible error del backend
            if (companiesData.error) {
                setHasError(true)
                setError(companiesData.error)
            }else{
                setCompanies(companiesData)
                setIsReady(true)
            }
        }

        if (!isLoading){
            if ((!globalUser.name || globalUser.userType !== 'admin')) {
                navigate('/')
            } else {
                fetchCompanies()
            }
        }
        
    }, [globalUser, navigate, isLoading])

    return (
      <div className="company-list-container">
        <Header/>
        {
            isReady ? 
                <ListComponent
                    companies={companies}
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

function ListComponent({companies}) {
    return (
        <div>
            {companies.map(company => (
                <div className="company-card" key={company._id}>
                    {company.name}, {company.description}, {company.address}, {company.phone}, {company.email}
                </div>
            ))}
        </div>
    )
}
ListComponent.propTypes = {
    companies: PropTypes.array.isRequired
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
  
 export default CompanyList