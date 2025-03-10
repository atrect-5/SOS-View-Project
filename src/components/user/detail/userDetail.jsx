
import { useState, useEffect } from "react"
import { useNavigate, useParams} from "react-router-dom"
import { CircularProgress } from "@mui/material"

import { useUserContext } from "../../../providers/userContext"
import { Header } from "../../components"
import { getCompanyByIdService, getUserByIdService } from "../../../services/services"

import './userDetail.scss'

function UserDetail () {

    const { userId } = useParams()

    const { user: globalUser, isLoading} = useUserContext()

    const [isReady, setIsReady] = useState(false)
    const [error, setError] = useState('')
    const [hasError, setHasError] = useState(false)
    const [user, setUser] = useState([])
    const [company, setCompany] = useState({})

    const navigate = useNavigate()

    useEffect(() => {
        const fetchUser = async () => {
            const userData = await getUserByIdService(userId)
            const companyData = await getCompanyByIdService(userData.workingAt)
            // Obtenemos el posible error del backend
            if (userData.error || companyData.error) {
                setHasError(true)
                setError(userData.error)
            }else{
                setUser(userData)
                setCompany(companyData)
                setIsReady(true)
            }
        }

        if (!isLoading){
            //if ((!globalUser.name || (globalUser.userType !== 'admin' && (globalUser.userType !== 'company-owner' || globalUser.workingAt !== companyId)))){
            if ((!globalUser.name)){
                navigate('/') 
            } else {
                fetchUser()
            }
        }
        
    }, [globalUser, isLoading, userId, navigate])

    return(
        <div className="user-detail-main-container">
        <Header/>
        <h1>{company.name}</h1>
            {
                isReady ? 
                    <>
                    <div className="user-card" key={user._id}>
                    <h2>
                        {user.name} {user.lastName}
                    </h2>
                    <p className="contacto">Contacto </p>
                    <p>Telefono: <span>{user.phone}</span></p>
                    <p>Correo: <span><a target="_blank" href={`https://mail.google.com/mail/?view=cm&fs=1&to=${user.email}`}>{user.email}</a></span></p>
                    {
                        globalUser.userType === 'admin' && 
                        <p>Tipo de usuario: <span>{user.userType}</span></p>
                    }
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

export default UserDetail