'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Plus, Edit2, Trash2, Eye, X, Shield, ShieldOff } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { DM_Serif_Display } from "next/font/google"
import { useUsers } from '@/hooks/useUsers'
import { getAllUsers } from '@/lib/api/users'

const dmFont = DM_Serif_Display({
    subsets: ["latin"],
    weight: "400",
})

const sortOptions = [
    { id: 'newest', name: 'Newest' },
    { id: 'name', name: 'Name' },
    { id: 'email', name: 'Email' },
]

export function UserContent() {
    const searchParams = useSearchParams()
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState('newest')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [editingUser, setEditingUser] = useState<string | null>(null)

    const { data: users = [], isLoading, isError, refetch } = useUsers()

    useEffect(() => {
        const search = searchParams.get('search')
        if (search) setSearchQuery(search)
    }, [searchParams])

    // filter + sort users
    const filteredUsers = useMemo(() => {
        let filtered = [...users]

        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            filtered = filtered.filter(
                (u) =>
                    u.name?.toLowerCase().includes(q) ||
                    u.email?.toLowerCase().includes(q) ||
                    u.phone?.toLowerCase().includes(q)
            )
        }

        switch (sortBy) {
            case 'name':
                filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                break
            case 'email':
                filtered.sort((a, b) => (a.email || '').localeCompare(b.email || ''))
                break
            case 'newest':
            default:
                filtered.sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
        }

        return filtered
    }, [users, searchQuery, sortBy])

    const clearFilters = () => {
        setSearchQuery('')
        setSortBy('newest')
    }

    const handleAddUser = () => {
        setEditingUser(null)
        setIsModalOpen(true)
    }

    const handleEditUser = (id: string) => {
        setEditingUser(id)
        setIsModalOpen(true)
    }

    const handleModalSuccess = () => refetch()
    const handleModalClose = () => {
        setIsModalOpen(false)
        setEditingUser(null)
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                // await deleteUser(id)
                alert('User deleted successfully!')
                refetch()
            } catch (err) {
                alert('Error deleting user.')
                console.error(err)
            }
        }
    }

    const handleToggleAdmin = async (user: any) => {
        try {
            // await toggleAdmin(user._id)
            alert(`${user.name} is now ${user.isAdmin ? 'no longer an admin' : 'an admin'}`)
            refetch()
        } catch (err) {
            alert('Error updating admin status.')
            console.error(err)
        }
    }

    if (isLoading)
        return <div className="text-center py-16 text-zinc-500">Loading users...</div>

    if (isError)
        return <div className="text-center py-16 text-red-500">Error loading users.</div>

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className={`text-3xl font-bold text-gray-900 mb-2 ${dmFont.className}`}>
                            User Management
                        </h1>
                        <p className="text-gray-600">
                            Manage your registered users and admins
                        </p>
                    </div>

                    {/* Action bar */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                            {/* Search */}
                            <div className="relative flex-1 max-w-md w-full">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or phone..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex flex-wrap gap-3 items-center">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                >
                                    {sortOptions.map(opt => (
                                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                                    ))}
                                </select>

                                {searchQuery && (
                                    <button
                                        onClick={clearFilters}
                                        className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                                    >
                                        <X className="w-4 h-4" /> Clear
                                    </button>
                                )}

                                <Button
                                    onClick={handleAddUser}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="w-4 h-4" /> Add User
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="mb-4 text-sm text-gray-600">
                        Showing {filteredUsers.length} of {users.length} users
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                            Email
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                            Phone
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                        No users found
                                                    </h3>
                                                    <p className="text-gray-500 mb-4">
                                                        Try adjusting your filters or search terms
                                                    </p>
                                                    <Button onClick={clearFilters} size="sm">
                                                        Clear All Filters
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user: any) => (
                                            <tr key={user._id} className="hover:bg-gray-50 transition">
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                                    {user.name || '—'}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-700 hidden sm:table-cell">
                                                    {user.email || '—'}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-700 hidden md:table-cell">
                                                    {user.phone || '—'}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 py-1 text-xs font-medium rounded-full ${user.isAdmin
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-gray-100 text-gray-700'
                                                            }`}
                                                    >
                                                        {user.isAdmin ? 'Admin' : 'User'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedUser(user)
                                                                setIsDetailModalOpen(true)
                                                            }}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                                            title="View"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditUser(user._id)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded transition"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleAdmin(user)}
                                                            className={`p-2 ${user.isAdmin ? 'text-yellow-600 hover:bg-yellow-50' : 'text-gray-600 hover:bg-gray-50'} rounded transition`}
                                                            title={user.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                                                        >
                                                            {user.isAdmin ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals
            <UserModal
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                userId={editingUser || undefined}
                isOpen={isModalOpen}
            />
            <UserDetailsModal
                onClose={() => setIsDetailModalOpen(false)}
                user={selectedUser}
                isOpen={isDetailModalOpen}
            /> */}
        </>
    )
}
