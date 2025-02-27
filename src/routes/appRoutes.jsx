
import { Routes, Route, Navigate } from "react-router-dom"
import { UserLogin, HomePage, UserRegister, CompanyRegister } from "../components/components"


// Declaramos las rutas de la app
const RoutesOfApp = () => (
    <Routes>
        <Route exact path="/" element={<HomePage/>}/>
        <Route exact path="/login" element={<UserLogin/>}/>
        <Route exact path="/user/create" element={<UserRegister/>}/>
        <Route exact path="/company/create" element={<CompanyRegister/>}/>
        <Route path ="*" element = {<Navigate to='/'/>}/>
    </Routes>
)

export default RoutesOfApp