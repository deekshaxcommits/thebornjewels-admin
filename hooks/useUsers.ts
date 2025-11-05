import { useQuery } from '@tanstack/react-query'
import { getAllUsers } from '@/lib/api/users'

export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: getAllUsers,
    })
}
