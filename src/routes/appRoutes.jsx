
import { Routes, Route, Navigate } from "react-router-dom"
import { UserLogin, 
    HomePage, 
    UserRegister, 
    CompanyRegister, 
    MachineRegister, 
    UserList, 
    CompanyList, 
    MachineList, 
    UserDetail, 
    CompanyDetail, 
    MachineDetail, 
    MaintenanceForm, 
    PasswordChangeForm} from "../components/components"


// Declaramos las rutas de la app
const RoutesOfApp = () => (
    <Routes>
        <Route exact path="/" element={<HomePage/>}/>
        <Route exact path="/login" element={<UserLogin/>}/>

        <Route exact path="/user/create" element={<UserRegister/>}/>
        <Route exact path="/user/edit" element={<UserRegister/>}/>
        <Route exact path="/user/edit/password" element={<PasswordChangeForm/>}/>
        <Route exact path="/user/list/:companyId" element={<UserList/>}/>
        <Route exact path="/user/detail/:userId" element={<UserDetail/>}/>

        <Route exact path="/company/create" element={<CompanyRegister/>}/>
        <Route exact path="/company/edit" element={<CompanyRegister/>}/>
        <Route exact path="/company/edit/:companyId" element={<CompanyRegister/>}/>
        <Route exact path="/company/list/" element={<CompanyList/>}/>
        <Route exact path="/company/detail/:companyId" element={<CompanyDetail/>}/>

        <Route exact path="/machine/create" element={<MachineRegister/>}/>
        <Route exact path="/machine/edit/:machineId" element={<MachineRegister/>}/>
        <Route exact path="/machine/register" element={<MachineRegister/>}/>
        <Route exact path="/machine/list/unregistered" element={<MachineList/>}/>
        <Route exact path="/machine/list/:companyId" element={<MachineList/>}/>
        <Route exact path="/machine/detail/:machineId" element={<MachineDetail/>}/>
        <Route exact path="/machine/maintenance/create/:machineId" element={<MaintenanceForm/>}/>
        
        <Route path ="*" element = {<p>Not found</p>}/>
        <Route path ="*" element = {<Navigate to='/'/>}/>
    </Routes>
)

export default RoutesOfApp