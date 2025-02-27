
import { useState, useEffect } from 'react'
import { useUserContext } from '../../../providers/userContext'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'

import { createCompanyService } from '../../../services/services'

function CompanyRegister() {
    const navigate = useNavigate()
    const globalUser = useUserContext()

    const initialState = {}

    const [company, setCompany] = useState(initialState)

    const [hasError, setHasError] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const [error, setError] = useState('')


    useEffect(() => {
        if (!globalUser.name || globalUser.userType !== 'admin') {
            navigate('/') // Redirige a la página principal si el usuario no está registrado
        }
    }, [globalUser, navigate]) // Esto indica que se actualizara cada que cambie el stateGlobal de user o cada que se monta el componente



    const handleChange = e => {
        const { name, value } = e.target
        setCompany({
            ...company,
            [name]:value
        })
    }

    const handleListCompanies = () =>{
        navigate('/company/list')
    } 

    const handleCreate = async () => {

        setError(false)
        setIsReady(false)
        setError('')

        if (!company.name || !company.description || !company.address || !company.email || !company.phone){
            setHasError(true)
            setError('Faltan datos')
            toast.error('Faltan datos')
            return
        }
        
        const companyData = company
        const createdCompany = await createCompanyService(companyData)
        
        if(createdCompany.error || !createdCompany){
            setHasError(true)
            setError(createdCompany.error)
            toast.error(`Hubo un error ${createdCompany.error}`)
            setIsReady(false)
        }else{
            setHasError(false)
            setIsReady(true)
            toast.success(`Compañia registrada con id: ${createdCompany._id}`)
            setCompany(createdCompany)
        }
        

      }

    return (
        <>
        <div>
        <form>
            <h1>Resgistrar Compañia</h1>
            <input
                type="text"
                name='name'
                placeholder='Nombre'
                value={company.name}
                onChange={handleChange}
            />
            <br />
            <input
                type="text"
                name="description"
                placeholder="Descripcion"
                value={company.lastName}
                onChange={handleChange}
            />
            <br />
            <input
                type="text"
                name='address'
                placeholder='Direccion'
                value={company.password}
                onChange={handleChange}
            />
            <br />
            <input
                type="email"
                name='email'
                placeholder='Email'
                value={company.email}
                onChange={handleChange}
            />
            <br />
            <input
                type="text"
                name="phone"
                placeholder="Telefono"
                value={company.phone}
                onChange={handleChange}
            />
        </form>
            {
                hasError ? 
                    <p>{error}</p> :
                    isReady && (<p>Id al crearse: {company._id}</p>)
            }
            <br />
            <button onClick={handleCreate}>Registrar</button>
            <br />
            <button onClick={handleListCompanies}>Ver compañias registradas</button>
            <br />
            <Link to={'/'}>Volver</Link>
        </div>
        </>
    )
}

export default CompanyRegister