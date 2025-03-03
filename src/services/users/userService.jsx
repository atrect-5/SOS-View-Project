
import axios from "axios"

import { API_URL, userEndpoint, API_ACCESS_TOKEN } from '../../consts'

/**
 * Servicio para el login de usuario
 * @param {Object} userData - Objeto que contiene el email y la contraseña del usuario
 * @returns {Object} - Datos del usuario autenticado o mensaje de error
 */
export const getUserLoginService = async (userData) => {
    try{
        // Solicitud POST para iniciar sesión
        const response = await axios.post(`${API_URL}${userEndpoint}login`, userData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_ACCESS_TOKEN
                }
            }
        )
        
        // Verifica si hay un error en la respuesta del servidor
        if(response.data.error){
            return {
                hasError: true,
                error: response.data.error
            }
        }
        // Si la respuesta es válida, retorna los datos del usuario
        if (response.data){
            return response.data.data
        }
    }catch(error){
        // Manejo de errores externos
        return {
            hasError: true,
            error: error.message
        }
    }
}

/**
 * Servicio para crear un nuevo usuario
 * @param {Object} userData - Objeto que contiene los datos del usuario a crear
 * @returns {Object} - Datos del usuario creado o mensaje de error
 */
export const createUserService = async (userData) => {
    try{
        // Solicitud POST para crear un nuevo usuario
        const response = await axios.post(`${API_URL}${userEndpoint}`, userData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_ACCESS_TOKEN
                }
            }
        )

        // Verifica si hay un error en la respuesta del servidor
        if(response.data.error){
            return {
                hasError: true,
                error: response.data.error
            }
        }
        // Si la respuesta es válida, retorna los datos del usuario
        if (response.data){ 
            return response.data.data
        }
    }catch(error){
        // Manejo de errores externos
        return {
            hasError: true,
            error: error.message
        }
    }
}

/**
 * Servicio para actualizar los datos de un usuario existente
 * @param {string} userId - ID del usuario a actualizar
 * @param {Object} userData - Objeto que contiene los datos actualizados del usuario
 * @returns {Object} - Datos del usuario actualizado o mensaje de error
 */
export const updateUserService = async (userId, userData) => {
    try{
        // Solicitud PUT para actualizar un usuario existente
        const response = await axios.put(`${API_URL}${userEndpoint}${userId}`, userData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_ACCESS_TOKEN
                }
            }
        )
        
        // Verifica si hay un error en la respuesta del servidor
        if(response.data.error){
            return {
                hasError: true,
                error: response.data.error
            }
        }
        // Si la respuesta es válida, retorna los datos del usuario
        if (response.data){
            return response.data.data
        }
    }catch(error){
        // Manejo de errores externos
        return {
            hasError: true,
            error: error.message
        }
    }
}