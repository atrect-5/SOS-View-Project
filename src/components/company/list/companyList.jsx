
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
      <div className="company-list-main-container">
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

      </div>
    )
}

function ListComponent({companies}) {
    const navigate = useNavigate()
    return (
        <div className={companies.length <= 1 ? 'company-list-container single-item' : 'company-list-container'}>
            {
                companies.length === 0 ? <p className="error-message">No hay empresas registradas</p> : (
                companies.map(company => (
                <div className="company-card" key={company._id}>
                    <h2>
                        {company.name}
                    </h2>
                    <strong>    
                        {company.description}
                    </strong>
                    <br />
                    <br />
                    <p className="contacto">Contacto </p>
                    <p>Direccion: <span>{company.address} </span></p>
                    <p>Numero: <span>{company.phone}</span></p>
                    <p>Correo: <span><a target="_blank" href={`https://mail.google.com/mail/?view=cm&fs=1&to=${company.email}`}>{company.email}</a></span></p>
                    {/* <p>Correo: <span><a target="_blank" href={`mailto:${company.email}`}>{company.email}</a></span></p> */}
                    <br />
                    <div className="button-company-container">
                        <hr />
                        <button onClick={() => navigate(`/user/list/${company._id}`)}>Ver usuarios</button>
                        <button onClick={() => navigate(`/machine/list/${company._id}`)}>Ver maquinas</button>
                        <button onClick={() => navigate(`/company/detail/${company._id}`)}>Ver informacion</button>
                    </div>
                </div>
                )
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
            <p className="error-message">Ha ocurrido un error: {error}</p>
        </div>
    )
}
ErrorComponent.propTypes = {
    error: PropTypes.string.isRequired
}
  
 export default CompanyList