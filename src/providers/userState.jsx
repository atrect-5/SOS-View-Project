
export const userInitialState = {}
/*
{
    name:'',
    lastName:'',
    workingAt:'',
    email:'',
    phone:'',
    userType:'',
    accountStatus:''
}
*/

export const toggleLogin = (user, setUser) => {
    if (user) {
        setUser(userInitialState)
    } else {
        setUser(user)
            /*{
            name: 'user.name',
            email: user.email,
            lastName: user.lastName,
            workingAt: user.workingAt,
            phone: user.phone,
            userType: user.userType,
            accountStatus: user.accountStatus
            
        }*/
    }
}