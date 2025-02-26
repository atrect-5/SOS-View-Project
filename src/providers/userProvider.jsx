
import { useState } from "react";
import PropTypes from 'prop-types'; 

// Importamos nuestra funcion y los valores del state del usuario
import {  userContext, userToggleContext } from "./userContext";


export function UserProvider(props) {

    const [user, setUser] = useState({})

    const handleLoginChange = (userData) => {
        if (user.name) {
            setUser({})
        } else {
            setUser(userData)
        }
    }

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