
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import PropTypes from "prop-types"
import { CircularProgress } from "@mui/material"
import { toast } from "react-toastify"

import { useUserContext } from "../../../providers/userContext"
import { Header } from "../../components"
import { getUsersByCompanyService, getCompanyByIdService, deleteUserService } from "../../../services/services"

import './userList.scss'

function UserList() {
    const { companyId } = useParams()

    const { user: globalUser, isLoading} = useUserContext()

    const [isReady, setIsReady] = useState(false)
    const [error, setError] = useState('')
    const [hasError, setHasError] = useState(false)
    const [users, setUsers] = useState([])
    const [company, setCompany] = useState({})

    const navigate = useNavigate()

    useEffect(() => {
        const fetchUsers = async () => {
            const usersData = await getUsersByCompanyService(companyId)
            const companyData = await getCompanyByIdService(companyId)
            // Obtenemos el posible error del backend
            if (usersData.error || companyData.error) {
                setHasError(true)
                setError(usersData.error)
            }else{
                setUsers(usersData)
                setCompany(companyData)
                setIsReady(true)
            }
        }

        if (!isLoading){
            if ((!globalUser.name || (globalUser.userType !== 'admin' && (globalUser.userType !== 'company-owner' || globalUser.workingAt !== companyId)))){
                navigate('/') 
            } else {
                fetchUsers()
            }
        }
        
    }, [globalUser, isLoading, companyId, navigate])

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
      <div className="user-list-main-container">
        <div className="header-fixed">
            <Header/>
        </div>
        <div className="top"></div>
        <div className="form-card">
            <h1 className="title-container">Usuarios registrados en: {isReady ? company.name : hasError  ? 'Hubo un error' : <CircularProgress/>}</h1>
        </div>
            {
                isReady ? 
                    <ListComponent
                        users={users}
                        setUsers={setUsers}
                    />
                    :
                    hasError ?
                        <ErrorComponent
                            error={error}
                        />
                        : 
                        <>
                            <h1>Cargando usuarios...</h1>
                            <CircularProgress />
                        </>
                
            }
      </div>
    )
}

function ListComponent({users, setUsers}) {
    const { user: globalUser} = useUserContext()

    // Maneja la eliminacion de un usuario
    const handleDeleteUser = (user) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar a ${user.name} ${user.lastName}?`)) {
            deleteUserService(user._id)
                .then(() => {
                    // Actualizar el estado eliminando el usuario de la lista
                    setUsers((prevUsers) => prevUsers.filter((u) => u._id !== user._id))
                    toast.success(`Usuario ${user.name} ${user.lastName} eliminado`)
                })
                .catch((error) => {
                    console.error('Error al eliminar el usuario:', error)
                    toast.error('Error al eliminar el usuario:', error)
                })
        }
    }

    return (
        <div className={users.length <= 1 ? 'user-list-container single-item' : 'user-list-container'}>
            {
                users.length === 0 ? <p className="error-message">No hay usuarios registradas</p> : (
                users.map((user, index) => (
                <div className="user-card" key={index}>
                    <h2>
                        {user.name} {user.lastName}
                    </h2>
                    <p className="contacto">Contacto </p>
                    <p>Telefono: <span>{user.phone}</span></p>
                    <p>Correo: <span><a target="_blank" href={`https://mail.google.com/mail/?view=cm&fs=1&to=${user.email}`}>{user.email}</a></span></p>
                    {
                        globalUser.userType === 'admin' && 
                        <>
                            <p className="contacto">Tipo de usuario</p>
                            <span>{user.userType}</span>
                        </>
                    }
                    {
                        (globalUser.userType === 'admin' || globalUser.userType === 'company-owner' ) && 
                        <div className="button-container">
                            <br /><hr />
                            <img onClick={() => handleDeleteUser(user)} src="../../../../trash_icon.png" alt="delete"/>
                        </div>
                    }
                </div>
                )
            ))}
        </div>
    )
}
ListComponent.propTypes = {
    users: PropTypes.array.isRequired,
    setUsers: PropTypes.array.isRequired
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


export default UserList