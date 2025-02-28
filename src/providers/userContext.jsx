
import { createContext, useContext } from "react";

// Crear contextos para el estado global del usuario y el toggle de usuario
export const userContext = createContext()
export const userToggleContext = createContext()

/**
 * Hook para usar el contexto del usuario
 * @returns {Object} - El estado global del usuario
 */
export function useUserContext() {
    return useContext(userContext)
}

/**
 * Hook para usar el contexto de toggle de usuario
 * @returns {Function} - Función para actualizar el estado global del usuario
 */
export function useUserToggleContext() {
    return useContext(userToggleContext)
}