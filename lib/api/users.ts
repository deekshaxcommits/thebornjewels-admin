import api from "."


export const getAllUsers = async () => {
    const res = await api.get('/admin/users')
    return res.data.users
}

