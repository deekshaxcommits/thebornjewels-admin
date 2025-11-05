export interface User {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
    googleId?: string;
    otp?: string;
    otpExpiry?: string | Date;
    isAdmin?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
