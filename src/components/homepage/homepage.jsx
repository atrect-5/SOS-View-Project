
import { useUserContext, useUserToggleContext } from '../../providers/userContext'

function UserProfile() {
    const user = useUserContext()
    const toggleUser = useUserToggleContext()

    return (
        <>
        <div>
            <h1>User Profile</h1>
            <input type="text" name='email'/>
            {user.name ? (
                <div>
                    <p>Name: {user.name}</p>
                    <p>Email: {user.email}</p>
                    <button onClick={toggleUser}>Logout</button>
                </div>
            ) : (
                <button onClick={toggleUser}>Login</button>
            )}
        </div>
        </>
    )
}

export default UserProfile