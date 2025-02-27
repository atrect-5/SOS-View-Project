
import axios from "axios"

import { API_URL, machineEndpoint } from '../../consts'

export const createMachineService = async (machineData) => {
    try{
        const response = await axios.post(`${API_URL}${machineEndpoint}`, machineData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
        
        if(response.data.error){
            // El servidor manda error
            return {
                hasError: true,
                error: response.data.error
            }
        }
        if (response.data){
            console.log(response.data.message)
            //console.log(response)        
            return response.data.data
        }
    }catch(error){
        // Si hay algun error externo
        return {
            hasError: true,
            error: error.message
        }
    }
}