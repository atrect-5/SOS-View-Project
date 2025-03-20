
import axios from "axios"

import { API_URL, companyEndpoint, API_ACCESS_TOKEN } from '../../consts'

/**
 * Servicio para crear una nueva compañia
 * @param {Object} companyData - Objeto que contiene los datos de la compañia a crear
 * @returns {Object} - Datos de la compañia creada o mensaje de error
 */
export const createCompanyService = async (companyData) => {
    try{
        // Solicitud post para guardar los datos de la compañia
        const response = await axios.post(`${API_URL}${companyEndpoint}`, companyData,
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
        // Si la respuesta es válida, retorna los datos de la maquina
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
 * Servicio para ontener todas las compañias
 * @returns {Object} - Datos de todas las compañias
 */
export const getCompaniesService = async () => {
    try{
        // Solicitud get para obtener los datos de todas las compañias
        const response = await axios.get(`${API_URL}${companyEndpoint}`,
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
        // Si la respuesta es válida, retorna los datos de la maquina
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
 * Servicio para ontener una compañia por id
 * @param {Object} companyId - Objeto que contiene los datos de la compañia a crear
 * @returns {Object} - Datos de la compañia
 */
export const getCompanyByIdService = async (companyId) => {
    try{
        // Solicitud get para obtener los datos de la compañia
        const response = await axios.get(`${API_URL}${companyEndpoint}/${companyId}`,
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
        // Si la respuesta es válida, retorna los datos de la maquina
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
 * Servicio para actualizar una compañia
 * @param {Object} companyId - Objeto que contiene el id de la compañia a actualizar
 * @param {Object} companyData - Objeto que contiene los datos de la compañia a actualizar
 * @returns {Object} - Datos de la compañia actualizada o mensaje de error
 */
export const updateCompanyService = async (companyId, companyData) => {
    try{
        // Solicitud put para actualizar los datos de la compañia
        const response = await axios.put(`${API_URL}${companyEndpoint}/${companyId}`, companyData,
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
        // Si la respuesta es válida, retorna los datos de la maquina
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
 * Servicio para eliminar una compañia
 * @param {Object} companyId - Objeto que contiene el id de la compañia a eliminar
 * @returns {Object} - Id de la compañia eliminada o mensaje de error
 */
export const deleteCompanyService = async (companyId) => {
    try{
        // Solicitud delete para eliminar los datos de la compañia
        const response = await axios.delete(`${API_URL}${companyEndpoint}/${companyId}`,
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
        // Si la respuesta es válida, retorna los datos de la compañia
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