

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { CircularProgress } from "@mui/material"

import { useUserContext } from "../../../providers/userContext"
import { getCompanyByIdService } from "../../../services/services"
import { Header } from "../../components"

import './companyDetail.scss'

function CompanyDetail () {
    const { companyId } = useParams()
    
    const { user: globalUser, isLoading} = useUserContext()

    const [company, setCompany] = useState([])
    const [isReady, setIsReady] = useState(false)
    const [error, setError] = useState('')
    const [hasError, setHasError] = useState(false)

    const navigate = useNavigate()

    useEffect(() => {
            const fetchCompany = async () => {
                const companyData = await getCompanyByIdService(companyId)
                // Obtenemos el posible error del backend
                if (companyData.error) {
                    setHasError(true)
                    setError(companyData.error)
                }else{
                    setCompany(companyData)
                    setIsReady(true)
                }
            }
    
            if (!isLoading){
                if ((!globalUser.name || globalUser.userType !== 'admin')) {
                    navigate('/')
                } else {
                    fetchCompany()
                }
            }
            
        }, [globalUser, navigate, isLoading, companyId])

    return(
        <div className="company-detail-main-container">
        <Header/>
        {
            isReady ? 
                <>
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
                    </div>
                </div>
                </>
                :
                hasError ?
                    <p className="error-message">Ha ocurrido un error: {error}</p>
                    : <CircularProgress />
            
        }

      </div>
    )
}

export default CompanyDetail