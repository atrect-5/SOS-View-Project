
import { useState, useEffect } from "react"
import PropTypes from 'prop-types'
import CryptoJS from "crypto-js"

import {  userContext, userToggleContext } from "./userContext"
import { getUserLoginService } from "../services/services"

import { CRYPTO_KEY } from "../consts"

// Proveedor de contexto del usuario
export function UserProvider(props) {
    // Estado global del usuario
    const [user, setGlobalUser] = useState({})
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const encryptedUser = localStorage.getItem('loginUserData')
        if (encryptedUser) {
            const bytes = CryptoJS.AES.decrypt(encryptedUser, CRYPTO_KEY)
            const decryptedUser = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
            verifyUser(decryptedUser)
        }else{
            setIsLoading(false)
        }
    }, [])

    const verifyUser = async (userData) => {
        const response = await getUserLoginService(userData)
        if (!response.error) {
            setGlobalUser(response)
        } else {
            localStorage.removeItem('loginUserData')
        }
        setIsLoading(false)
    }

    /**
     * Maneja el cambio de estado de login del usuario
     * @param {Object} userData - Datos del usuario para iniciar o cerrar sesión
     */
    const handleLoginChange = (userData) => {
        if (user.name) {
            setGlobalUser({})
            localStorage.removeItem('loginUserData')
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
        <userContext.Provider value={{user, isLoading}}>
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