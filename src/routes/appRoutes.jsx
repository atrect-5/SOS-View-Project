
import { Routes, Route, Navigate } from "react-router-dom"
import { UserLogin, HomePage, UserRegister, CompanyRegister, MachineRegister } from "../components/components"


// Declaramos las rutas de la app
const RoutesOfApp = () => (
    <Routes>
        <Route exact path="/" element={<HomePage/>}/>
        <Route exact path="/login" element={<UserLogin/>}/>

        <Route exact path="/user/create" element={<UserRegister/>}/>
        <Route exact path="/user/edit" element={<UserRegister/>}/>

        <Route exact path="/company/create" element={<CompanyRegister/>}/>
        <Route exact path="/company/edit" element={<CompanyRegister/>}/>

        <Route exact path="/machine/create" element={<MachineRegister/>}/>
        <Route path ="*" element = {<p>Not found</p>}/>
        <Route path ="*" element = {<Navigate to='/'/>}/>
    </Routes>
)

export default RoutesOfApp