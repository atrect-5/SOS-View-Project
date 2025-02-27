
import axios from "axios"

import { API_URL, userEndpoint } from '../../consts'

export const getUserLoginService = async (userData) => {
    try{
        const response = await axios.post(`${API_URL}${userEndpoint}login`, userData,
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

export const createUserService = async (userData) => {
    try{
        const response = await axios.post(`${API_URL}${userEndpoint}`, userData,
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