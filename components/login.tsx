"use client"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Logo from "@/public/logo.svg"
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from "@/context/AuthContext"
import Loader from './loader'
import { verifyAndLogin } from '@/lib/api/auth'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'

export default function LoginComponent() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { loginUser, refreshUser } = useAuth()

    const handleLogin = async () => {
        if (!email || !password) return
        setError('')
        setLoading(true)
        try {
            const res = await verifyAndLogin(email, password)
            if (res.success) {
                const { user, token } = res.data
                loginUser(user, token)
                refreshUser()
                router.replace('/')
            } else {
                setError(res.message || "Login failed")
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Login error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {loading && <Loader text="Logging in..." />}
            <section className="flex min-h-screen bg-zinc-50 px-4 py-8 md:py-16">
                <div className="max-w-md m-auto w-full">
                    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-8">
                        <div className="text-center mb-8">
                            <Image src={Logo} width={72} alt="Logo" className="mx-auto" />
                            <h1 className="mb-1.5 mt-6 text-2xl font-semibold text-zinc-900">Admin Panel</h1>
                            <p className="text-sm text-zinc-500">Sign in with your credentials</p>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-zinc-600 uppercase tracking-wide">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                        placeholder="admin@thebornjewels.com"
                                        className="pl-9 h-10 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-zinc-600 uppercase tracking-wide">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                        placeholder="Enter admin password"
                                        className="pl-9 pr-10 h-10 text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
                            )}

                            <Button
                                className="w-full h-10 bg-zinc-900 hover:bg-zinc-700 text-white text-sm font-medium"
                                onClick={handleLogin}
                                disabled={!email || !password || loading}
                            >
                                Sign In
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
