
import { useState } from 'react'
import { useUserContext, useUserToggleContext } from '../../providers/userContext'

function UserProfile() {
    const user = useUserContext()
    const toggleUser = useUserToggleContext()

    const [email, setEmail] = useState('')

    const handleLogin = () => {
        const name = user.name
        toggleUser({email, name})
      }

    return (
        <>
        <div>
            <h1>User Profile</h1>
            <input type="text" 
                name='email' 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                />
            <br />
            {user.name ? (
                <div>
                    <p>Name: {user.name}</p>
                    <p>Email: {user.email}</p>
                    <button onClick={handleLogin}>Logout</button>
                </div>
            ) : (
                <button onClick={handleLogin}>Login</button>
            )}
        </div>
        </>
    )
}

export default UserProfile