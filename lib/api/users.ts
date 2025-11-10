import api from "."

// ✅ Get all users
export const getAllUsers = async () => {
    const res = await api.get("/admin/users")
    return res.data.users
}

// ✅ Create user (admin only, no OTP)
export const createUserByAdmin = async (data: any) => {
    const res = await api.post("/admin/users/new", { ...data })
    return res.data
}

// ✅ Delete user (admin only)
export const deleteUser = async (userId: string) => {
    const res = await api.delete(`/admin/users/${userId}/delete`)
    return res.data
}

