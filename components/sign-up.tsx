"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/logo.svg";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { requestOtp, verifyAndRegister } from "@/lib/api/auth";
import Loader from "@/components/loader"; // your loader component
import { useAuth } from "@/context/AuthContext";


type SignupStep = "method" | "input" | "otp" | "complete";
type AuthMethod = "email" | "phone";

export default function SignUp() {
    const [step, setStep] = useState<SignupStep>("method");
    const [authMethod, setAuthMethod] = useState<AuthMethod>("email");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { loginUser, refreshUser } = useAuth();

    // Transition animation settings
    const transitionProps = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
        transition: { duration: 0.25 },
    };

    const handleMethodSelect = (method: AuthMethod) => {
        setAuthMethod(method);
        setStep("input");
    };

    const handleSendOtp = async () => {
        try {
            setLoading(true);
            await requestOtp(email, "Register");
            toast.success("OTP sent to your email");
            setStep("otp");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) return toast.error("Please enter OTP");
        setStep("complete");
    };

    const handleCompleteSignup = async () => {
        if (!name.trim()) return toast.error("Name is required");
        try {
            setLoading(true);
            const res = await verifyAndRegister(email, otp, name);
            if (res.success) {
                toast.success("Registration successful!");
                loginUser(res.data.user, res.data.token);
                refreshUser()
                router.replace("/");
            } else {
                toast.error(res.message || "Registration failed");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Invalid OTP or registration failed");
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (step === "input") setStep("method");
        else if (step === "otp") setStep("input");
    };

    return (
        <section className="flex min-h-screen bg-zinc-50 px-4 py-8 md:py-16">
            <div className="max-w-md w-full m-auto">
                <div className="bg-white rounded-lg shadow-sm border p-6 md:p-8">
                    <div className="text-center mb-8">
                        <Link href="/" aria-label="go home" className="inline-block">
                            <Image src={Logo} width={80} alt="Logo" className="mx-auto" />
                        </Link>
                        <h1 className="mb-2 mt-6 text-2xl font-semibold">
                            {step === "method" && "Create Account"}
                            {step === "input" && `Continue with ${authMethod === "email" ? "Email" : "Phone"}`}
                            {step === "otp" && "Verify OTP"}
                            {step === "complete" && "Complete Profile"}
                        </h1>
                        <p className="text-gray-600 text-sm">
                            {step === "method" && "Welcome! Create an account to get started"}
                            {step === "input" &&
                                `Enter your ${authMethod === "email" ? "email address" : "phone number"} to continue`}
                            {step === "otp" && `Enter the OTP sent to your ${authMethod === "email" ? email : phone}`}
                            {step === "complete" && "Add your basic information to complete registration"}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === "method" && (
                            <motion.div {...transitionProps} key="method">
                                <div className="space-y-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full h-12"
                                        onClick={() => handleMethodSelect("email")}
                                    >
                                        <svg
                                            className="w-5 h-5 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                        Continue with Email
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === "input" && (
                            <motion.div {...transitionProps} key="input">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium">
                                            Email Address
                                        </Label>
                                        <Input
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <Button variant="outline" className="flex-1" onClick={handleBack}>
                                            Back
                                        </Button>
                                        <Button
                                            className="flex-1"
                                            onClick={handleSendOtp}
                                            disabled={!email || loading}
                                        >
                                            {loading ? <Loader /> : "Send OTP"}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === "otp" && (
                            <motion.div {...transitionProps} key="otp">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="otp" className="text-sm font-medium">
                                            Enter OTP
                                        </Label>
                                        <Input
                                            id="otp"
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="Enter 6-digit OTP"
                                            maxLength={6}
                                            className="text-center text-lg tracking-widest"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <Button variant="outline" className="flex-1" onClick={handleBack}>
                                            Back
                                        </Button>
                                        <Button
                                            className="flex-1"
                                            onClick={handleVerifyOtp}
                                            disabled={otp.length !== 6}
                                        >
                                            Verify OTP
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === "complete" && (
                            <motion.div {...transitionProps} key="complete">
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <Label htmlFor="name" className="text-sm font-medium">
                                            Full Name
                                        </Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter your full name"
                                            className="w-full"
                                        />
                                    </div>

                                    <Button
                                        className="w-full"
                                        onClick={handleCompleteSignup}
                                        disabled={!name || loading}
                                    >
                                        {loading ? <Loader /> : "Complete Registration"}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <p className="text-center text-sm mt-6 text-gray-700">
                    Have an account?
                    <Button asChild variant="link" className="px-2">
                        <Link href="/auth/login">Sign In</Link>
                    </Button>
                </p>
            </div>
        </section>
    );
}
