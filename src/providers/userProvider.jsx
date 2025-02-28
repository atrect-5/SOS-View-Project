
import { useState } from "react";
import PropTypes from 'prop-types'; 

import {  userContext, userToggleContext } from "./userContext";

// Proveedor de contexto del usuario
export function UserProvider(props) {
    // Estado global del usuario
    const [user, setGlobalUser] = useState({})

    /**
     * Maneja el cambio de estado de login del usuario
     * @param {Object} userData - Datos del usuario para iniciar o cerrar sesión
     */
    const handleLoginChange = (userData) => {
        if (user.name) {
            setGlobalUser({})
        } else {
            setGlobalUser(userData)
        }
    }

    /**
     * Actualiza los datos del usuario en el estado global
     * @param {Object} userData - Nuevos datos del usuario
     */
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

// Validación de los tipos de propiedades
UserProvider.propTypes = {
    children: PropTypes.node.isRequired,
}