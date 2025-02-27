
import axios from "axios"

import { API_URL, companyEndpoint } from '../../consts'

export const createCompanyService = async (companyData) => {
    try{
        const response = await axios.post(`${API_URL}${companyEndpoint}`, companyData,
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