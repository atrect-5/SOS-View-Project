
import { createContext, useContext } from "react";

export const userContext = createContext()
export const userToggleContext = createContext()

// Funcion para obtener el contexto del usuario
export function useUserContext() {
    return useContext(userContext)
}

// Funcion para cambiar el contexto del usuario
export function useUserToggleContext() {
    return useContext(userToggleContext)
}