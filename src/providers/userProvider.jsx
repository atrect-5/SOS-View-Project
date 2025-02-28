
import { useState } from "react";
import PropTypes from 'prop-types'; 

// Importamos nuestra funcion y los valores del state del usuario
import {  userContext, userToggleContext } from "./userContext";


export function UserProvider(props) {

    const [user, setGlobalUser] = useState({})

    const handleLoginChange = (userData) => {
        if (user.name) {
            setGlobalUser({})
        } else {
            setGlobalUser(userData)
        }
    }

    const handleDataUpdated = (userData) => {
        setGlobalUser(prevUser => ({
            ...prevUser,
            ...userData
        }))
    } 

    return (
        <userContext.Provider value={user}>
            <userToggleContext.Provider value={{handleLoginChange, handleDataUpdated}}>
                {props.children}
            </userToggleContext.Provider>
        </userContext.Provider>
    )
}

UserProvider.propTypes = {
    children: PropTypes.node.isRequired,
}