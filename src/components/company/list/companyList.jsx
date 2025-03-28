
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

import { Header } from "../../components";
import { useUserContext } from "../../../providers/userContext";
import { getCompaniesService, deleteCompanyService } from "../../../services/services";

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

    // Ajustamos dinamicamente el margin top del contenido para que el header no cubre el contenido
    useEffect(() => {
        const header = document.querySelector('.header-fixed')
        const content = document.querySelector('.top')
        const adjustPadding = () => {
          content.style.paddingTop = `${header.offsetHeight}px`
        }
        adjustPadding()
        window.addEventListener('resize', adjustPadding)
    
        return () => window.removeEventListener('resize', adjustPadding)
      }, [])


    return (
      <div className="company-list-main-container">
        <div className="header-fixed">
            <Header />
        </div>
        <div className="top"></div>
        <div className="form-card">
            <h1 className="title-container">Compañias registradas</h1>
        </div>
        {
            isReady ? 
                <ListComponent
                    companies={companies}
                    setCompanies={setCompanies}
                />
                :
                hasError ?
                    <ErrorComponent
                        error={error}
                    />
                    : 
                    <>
                        <h1>Cargando compañias...</h1>
                        <CircularProgress />
                    </>
            
        }

      </div>
    )
}

function ListComponent({companies, setCompanies}) {
    const navigate = useNavigate()
    const { user: globalUser} = useUserContext()
    
    // Maneja la eliminacion de una compañia
    const handleDeleteCompany = (company) => {
        if (window.confirm(`Esta seguro de eliminar la compañia ${company.name}? (Esto eliminara los usuarios y maquinas registrados en esta compañia)`)) {
            deleteCompanyService(company._id)
                .then(() => {
                    // Actualizar el estado eliminando la compañia de la lista
                    setCompanies((prevcompanys) => prevcompanys.filter((c) => c._id !== company._id))
                    toast.success(`Compañia ${company.name} eliminada`)
                })
                .catch((error) => {
                    console.error('Error al eliminar la copañia:', error)
                    toast.error('Error al eliminar la copañia:', error)
                })
        }
    }
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
                    <div className="company-info">
                        <div className="contact-info">
                            <p className="contacto">Contacto </p>
                            <p>Direccion: <span>{company.address} </span></p>
                            <p>Numero: <span>{company.phone}</span></p>
                            <p>Correo: <span><a target="_blank" href={`https://mail.google.com/mail/?view=cm&fs=1&to=${company.email}`}>{company.email}</a></span></p>
                        </div>
                        <div className="id-info">
                            <p className="contacto">Id de la compa&ntilde;ia</p>
                            <p><span>{company._id} </span></p>
                        </div>
                    </div>
                    {/* <p>Correo: <span><a target="_blank" href={`mailto:${company.email}`}>{company.email}</a></span></p> */}
                    <br />
                    <div className="button-company-container">
                        <hr />
                        <button onClick={() => navigate(`/user/list/${company._id}`)}>Ver usuarios</button>
                        <button onClick={() => navigate(`/machine/list/${company._id}`)}>Ver maquinas</button>
                        <button onClick={() => navigate(`/company/edit/${company._id}`)}>Editar informacion</button>
                        {
                            (globalUser.userType === 'admin' ) && 
                            <div className="button-container">
                                <img onClick={() => handleDeleteCompany(company)} src="../../../../trash_icon.png" alt="delete"/>
                            </div>
                        }
                    </div>
                </div>
                )
            ))}
        </div>
    )
}
ListComponent.propTypes = {
    companies: PropTypes.array.isRequired,
    setCompanies: PropTypes.array.isRequired
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