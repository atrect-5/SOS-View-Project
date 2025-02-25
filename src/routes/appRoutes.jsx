
import { Routes, Route, Navigate } from "react-router-dom"
import UserProfile from "../components/homepage/homepage"


// Declaramos las rutas de la app
const RoutesOfApp = () => (
    <Routes>
        <Route exact path="/" element={<UserProfile/>}/>
        <Route exact path="/login" element={<p>Login</p>}/>
        <Route path ="*" element = {<Navigate to='/'/>}/>
    </Routes>
)

export default RoutesOfApp