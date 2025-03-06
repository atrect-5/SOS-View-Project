
import { useEffect, useState } from "react"
import { useNavigate, Link, useParams } from "react-router-dom"
import PropTypes from "prop-types"
import { CircularProgress } from "@mui/material"

import { useUserContext } from "../../../providers/userContext"
import { Header } from "../../components"
import { getUsersByCompanyService } from "../../../services/services"

import './userList.scss'

function UserList() {
    const { companyId } = useParams()

    const { user: globalUser, isLoading} = useUserContext()

    const [isReady, setIsReady] = useState(false)
    const [error, setError] = useState('')
    const [hasError, setHasError] = useState(false)
    const [users, setUsers] = useState([])

    const navigate = useNavigate()

    useEffect(() => {
        const fetchUsers = async () => {
            const usersData = await getUsersByCompanyService(companyId)
            // Obtenemos el posible error del backend
            if (usersData.error) {
                setHasError(true)
                setError(usersData.error)
            }else{
                setUsers(usersData)
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
        
    })

    return (
      <div className="user-list-container">
        <Header/>
            {
                isReady ? 
                    <ListComponent
                        users={users}
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
    );
}

function ListComponent({users}) {
    return (
        <div>
            {
                users.length === 0 ? <p>No hay usuarios registradas</p> : (
                users.map(user => (
                <div className="user-card" key={user._id}>
                    {user.name}, {user.lastName}, {user.workingAt}, {user.email}, {user.phone}, {user.userType}
                </div>
                )
            ))}
        </div>
    )
}
ListComponent.propTypes = {
    users: PropTypes.array.isRequired
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


export default UserList