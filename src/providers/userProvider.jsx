
import { useState } from "react";
import PropTypes from 'prop-types'; 

// Importamos nuestra funcion y los valores del state del usuario
import { userInitialState, guardaLogin} from './userState'
import {  userContext, userToggleContext } from "./userContext";


export function UserProvider(props) {

    const [user, setUser] = useState(userInitialState)

    const handleLoginChange = (user) => guardaLogin(user, setUser)

    return (
        <userContext.Provider value={user}>
            <userToggleContext.Provider value={handleLoginChange}>
                {props.children}
            </userToggleContext.Provider>
        </userContext.Provider>
    )
}

UserProvider.propTypes = {
    children: PropTypes.node.isRequired,
}