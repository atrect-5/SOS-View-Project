
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