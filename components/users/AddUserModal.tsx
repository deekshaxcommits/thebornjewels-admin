'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createUserByAdmin } from '@/lib/api/users'

interface AddUserModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export const AddUserModal = ({ isOpen, onClose, onSuccess }: AddUserModalProps) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        isAdmin: false,
    })
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        try {
            setLoading(true)
            await createUserByAdmin(formData)
            onSuccess()
            onClose()
        } catch (err: any) {
            alert(err.message || 'Error creating user')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg relative">
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-semibold mb-4">Add New User</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 mt-1"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 mt-1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 mt-1"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="isAdmin"
                            checked={formData.isAdmin}
                            onChange={handleChange}
                            id="isAdmin"
                            className="h-4 w-4"
                        />
                        <label htmlFor="isAdmin" className="text-sm text-gray-700">Make Admin</label>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading ? 'Adding...' : 'Add User'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
