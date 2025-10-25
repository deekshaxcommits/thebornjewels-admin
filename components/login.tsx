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
import { verifyAndLogin } from '@/lib/api/auth' // create a simple login API call

export default function LoginComponent() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { loginUser, refreshUser } = useAuth()

    const handleLogin = async () => {
        if (!email) return
        setLoading(true)

        try {
            const res = await verifyAndLogin(email, "123456") // your API call
            if (res.success) {
                const { user, token } = res.data
                loginUser(user, token)
                refreshUser()
                router.replace('/') // redirect after login
            } else {
                alert(res.message || "Login failed")
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "Login error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {loading && <Loader text="Logging in..." />}

            <section className="flex min-h-screen bg-zinc-50 px-4 py-8 md:py-16 dark:bg-transparent">
                <div className="max-w-md m-auto w-full">
                    <div className="bg-white rounded-lg shadow-sm border p-6 md:p-8">
                        <div className="text-center mb-8">
                            <Image src={Logo} width={80} alt="Logo" className="mx-auto" />
                            <h1 className="mb-2 mt-6 text-2xl font-semibold">Welcome Back</h1>
                            <p className="text-gray-600">
                                Enter your email to log in
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label>Email Address</Label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                />
                            </div>
                            <Button
                                className="w-full"
                                onClick={handleLogin}
                                disabled={!email}
                            >
                                Login
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
