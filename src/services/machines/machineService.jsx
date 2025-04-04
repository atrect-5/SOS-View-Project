
import axios from "axios"

import { API_URL, machineEndpoint, API_ACCESS_TOKEN } from '../../consts'

/**
 * Servicio para crear una nueva maquina
 * @param {Object} machineData - Objeto que contiene los datos de la maquina a crear
 * @returns {Object} - Datos de la maquina creada o mensaje de error
 */
export const createMachineService = async (machineData) => {
    try{
        // Solicitud POST para crear la nueva maquina
        const response = await axios.post(`${API_URL}${machineEndpoint}`, machineData,
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
 * Servicio para obtener los datos de una maquina
 * @param {String} machineId - Id de la maquina a obtener
 * @returns {Object} - Datos de la maquina o mensaje de error
 */
export const getMachineByIdService = async (machineId) => {
    try{
        // Solicitud GET para obtener los datos de la maquina
        const response = await axios.get(`${API_URL}${machineEndpoint}/${machineId}`,
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
 * Servicio para obtener las maquinas sin registrar
 * @returns {Object} - Datos de la maquina o mensaje de error
 */
export const getMachineWhithoutCompanyService = async () => {
    try{
        // Solicitud GET para obtener los datos de la maquina
        const response = await axios.get(`${API_URL}${machineEndpoint}/unregistered`,
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
 * Servicio para obtener las maquinas de una empresa
 * @param {String} companyId - Id de la empresa a la que pertenecen las maquinas
 * @returns {Object} - Datos de las maquinas o mensaje de error
 */
export const getMachinesByCompanyService = async (companyId) => {
    try{
        // Solicitud GET para obtener las maquinas de la empresa
        const response = await axios.get(`${API_URL}${machineEndpoint}/company/${companyId}`,
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
        // Si la respuesta es válida, retorna los datos de las maquinas
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
 * Servicio para obtener las lecturas de una maquina
 * @param {String} machineId - Id de la maquina a obtener las lecturas
 * @param {String} lastDate - Fecha de las lecturas a obtener (opcional)
 * @return {Object} - Datos de las lecturas de la maquina o mensaje de error
 */
export const getReadingsByMachineService = async (machineId, lastDate) => {
    try{
        // Solicitud GET para obtener las lecturas de la maquina
        const response = await axios.get(`${API_URL}${machineEndpoint}influx/${machineId}${lastDate? `?lastDate=${encodeURIComponent(lastDate)}` : ''}`,
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
        // Si la respuesta es válida, retorna los datos de las lecturas de la maquina
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
 * Servicio para obtener el status de una maquina
 * @param {String} machineId - Id de la maquina a obtener las lecturas
 * @return {Sting} - Status de la maquina o mensaje de error
 */
export const getStatusOfMachineService = async (machineId) => {
    try{
        // Solicitud GET para obtener el status
        const response = await axios.get(`${API_URL}${machineEndpoint}status/${machineId}`,
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
        // Si la respuesta es válida, retorna el status de la maquina
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
 * Servicio para guardar una entrada de mantenimiento en una maquina
 * @param {String} machineId - Id de la maquina 
 * @param {Object} machineData - Objeto que contiene los datos de la entrada de mantenimiento ({date: Date, description: String})
 * @returns {Object} - Datos de la maquina actualizada o mensaje de error
 */
export const saveMaintenanceService = async (machineId, maintenanceData) => {
    try{
        // Solicitud POST para crear la entrada de mantenimiento
        const response = await axios.post(`${API_URL}${machineEndpoint}/maintenance/${machineId}`, maintenanceData,
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
        // Si la respuesta es válida, retorna los datos de la entrada de mantenimiento
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
 * Servicio para actualizar una maquina
 * @param {String} machineId - Id de la maquina a actualizar
 * @param {Object} machineData - Objeto que contiene los datos de la maquina a actualizar
 * @returns {Object} - Datos de la maquina actualizada o mensaje de error
 */
export const updateMachineService = async (machineId, machineData) => {
    try{
        // Solicitud PUT para actualizar la maquina
        const response = await axios.put(`${API_URL}${machineEndpoint}/${machineId}`, machineData,
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
 * Servicio para actualizar el status una maquina
 * @param {String} machineId - Id de la maquina a actualizar
 * @param {String} status - El nuevo status de la maquina 
 * @returns {Object} - Datos de la maquina actualizada o mensaje de error
 */
export const updateMachineStatusService = async (machineId, status) => {
    try{
        // Solicitud PUT para actualizar la maquina
        const response = await axios.put(`${API_URL}${machineEndpoint}status/${machineId}`, status,
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
 * Servicio para registrar una maquina a una empresa
 * @param {String} companyId - Id de la empresa a la que se registrará la maquina
 * @param {String} machineId - Id de la maquina a registrar
 * @returns {Object} - Datos de la maquina registrada o mensaje de error
 */
export const registerMachineService = async (companyId, machineId) => {
    try{
        // Solicitud PUT para registrar la maquina
        const response = await axios.put(`${API_URL}${machineEndpoint}/machine-company/${companyId}/${machineId}`,
            {},
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
 * Servicio para eliminar una maquina 
 * @param {String} machineId - Id de la maquina a eliminar
 * @returns {Object} - Id de la maquina eliminada o mensaje de error
 */
export const deleteMachineService = async (machineId) => {
    try{
        // Solicitud DELETE para eliminar la maquina
        const response = await axios.delete(`${API_URL}${machineEndpoint}${machineId}`,
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