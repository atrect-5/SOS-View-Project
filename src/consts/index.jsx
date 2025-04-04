
// Rutas del backend
export const API_URL = import.meta.env.VITE_APP_API_URL_DEV
export const userEndpoint = '/api/user/'
export const machineEndpoint = '/api/machine/'
export const companyEndpoint = '/api/company/'

// Variables MQTT
export const MQTT_BROKER_URL = import.meta.env.VITE_MQTT_BROKER_URL
export const MQTT_BROKER_PORT = import.meta.env.VITE_MQTT_BROKER_PORT
export const MQTT_BROKER_USER = import.meta.env.VITE_MQTT_BROKER_USER
export const MQTT_BROKER_PASSWORD = import.meta.env.VITE_MQTT_BROKER_PASSWORD

// Tokens
export const API_ACCESS_TOKEN = import.meta.env.VITE_API_ACCESS_TOKEN
export const CRYPTO_KEY = import.meta.env.VITE_CRYPTO_KEY

// Tipos de usuario
export const userTypes = [
    'user', 
    'admin', 
    'company-owner'
]

import { createTheme } from "@mui/material"

export const theme = createTheme({
    palette: {
      secondary: {
        main: '#ffffff6e',
      },
      primary: {
        main: '#1a1a1a',
      },
    },
  })