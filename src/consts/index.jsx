
// Rutas del backend
export const API_URL = import.meta.env.VITE_APP_API_URL_DEV
export const userEndpoint = '/api/user/'
export const machineEndpoint = '/api/machine/'
export const companyEndpoint = '/api/company/'

// Tokens
export const API_ACCESS_TOKEN = import.meta.env.VITE_API_ACCESS_TOKEN
export const CRYPTO_KEY = import.meta.env.VITE_CRYPTO_KEY

// Tipos de usuario
export const userTypes = [
    'user', 
    'admin', 
    'company-owner'
]