
import axios from "axios"

import { API_URL, companyEndpoint, API_ACCESS_TOKEN } from '../../consts'

/**
 * Servicio para crear una nueva compañia
 * @param {Object} companyData - Objeto que contiene los datos de la compañia a crear
 * @returns {Object} - Datos de la compañia creada o mensaje de error
 */
export const createCompanyService = async (companyData) => {
    try{
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