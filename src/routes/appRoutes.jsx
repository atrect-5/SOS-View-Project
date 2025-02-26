
import { Routes, Route, Navigate } from "react-router-dom"
import { UserLogin, HomePage } from "../components/components"


// Declaramos las rutas de la app
const RoutesOfApp = () => (
    <Routes>
        <Route exact path="/" element={<HomePage/>}/>
        <Route exact path="/login" element={<UserLogin/>}/>
        <Route path ="*" element = {<Navigate to='/'/>}/>
    </Routes>
)

export default RoutesOfApp