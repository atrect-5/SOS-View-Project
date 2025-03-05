
import { useState, useEffect } from "react"
import PropTypes from 'prop-types'
import CryptoJS from "crypto-js"

import {  userContext, userToggleContext } from "./userContext"
import { getUserLoginService, getCompanyByIdService } from "../services/services"

import { CRYPTO_KEY } from "../consts"

// Proveedor de contexto del usuario
export function UserProvider(props) {
    // Estado global del usuario
    const [user, setGlobalUser] = useState({})
    
    // Estado global de la compañia del usuario
    const [userCompany, setUserCompanyGlobal] = useState({})
    
    const [isLoading, setIsLoading] = useState(true)

    // Cuando carga la página, verifica si hay un usuario en el localStorage y carga sus datos en el estado global
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
            const company = await getCompanyByIdService(response.workingAt)
            setUserCompanyGlobal(company)
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
            setUserCompanyGlobal({})
            localStorage.removeItem('loginUserData')
        } else {
            setGlobalUser(userData)
            setUserCompanyGlobal(userData.workingAt)
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

    // Actualiza los datos de la compañía cuando el usuario cambia
    useEffect(() => {
        const fetchCompanyData = async () => {
            if (user.workingAt) {
                const company = await getCompanyByIdService(user.workingAt)
                setUserCompanyGlobal(company)
            } else {
                setUserCompanyGlobal({})
            }
        }
        fetchCompanyData()
    }, [user])

    return (
        <userContext.Provider value={{user, isLoading, userCompany, setUserCompanyGlobal}}>
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