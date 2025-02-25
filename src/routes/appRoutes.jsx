
import { Routes, Route, Navigate } from "react-router-dom"


// Declaramos las rutas de la app
const RoutesOfApp = () => (
    <Routes>
        <Route exact path="/" element={<p>Bienvenido a la ruta principal</p>}/>
        <Route exact path="/login" element={<p>Login</p>}/>
        <Route path ="*" element = {<Navigate to='/'/>}/>
    </Routes>
)

export default RoutesOfApp