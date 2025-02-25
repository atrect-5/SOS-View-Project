
export const userInitialState ={
    name:'',
    lastName:'',
    workingAt:'',
    email:'',
    phone:'',
    userType:'',
    accountStatus:''
}

export const guardaLogin = (user, setUser) => {
    if (user.name) {
        setUser(userInitialState)
    } else {
        setUser({
            name: 'Alejandro',
            email: user.email,
            /*
            lastName: user.lastName,
            workingAt: user.workingAt,
            phone: user.phone,
            userType: user.userType,
            accountStatus: user.accountStatus
            */
        })
    }
}