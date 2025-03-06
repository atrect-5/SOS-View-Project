
import { useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"

import { useUserContext } from "../../../providers/userContext"
import { Header } from "../../components"

import './userList.scss'

function UserList() {

    const { user: globalUser, isLoading} = useUserContext()

    const navigate = useNavigate()

    useEffect(() => {
        if ((!globalUser.name || (globalUser.userType !== 'admin' && globalUser.userType !== 'company-owner')) && !isLoading) {
            navigate('/') 
        }
    })

    return (
      <div className="user-list-container">
        <Header/>
        <p>Aqui se listaran los usuarios registrados...</p>

        <Link to={`/`}>
                <button>Volver</button>
        </Link>
      </div>
    );
  }
  
  export default UserList