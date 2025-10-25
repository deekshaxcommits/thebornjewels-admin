import api from ".";

/**
 * Request OTP for login or registration
 */
export const requestOtp = async (email: string, purpose: "Login" | "Register" = "Login") => {
    const res = await api.post("/auth/request-otp", { email, purpose });
    return res.data;
};

/**
 * Verify OTP and log in existing user
 */
export const verifyAndLogin = async (email: string, otp: string) => {
    const res = await api.post("/auth/login", { email, otp });
    if (res.data.success) {
        localStorage.setItem("token", res.data.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.data.user));
    }
    return res.data;
};

/**
 * Verify OTP and register a new user
 */
export const verifyAndRegister = async (email: string, otp: string, name?: string) => {
    const res = await api.post("/auth/register", { email, otp, name });
    if (res.data.success) {
        localStorage.setItem("token", res.data.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.data.user));
    }
    return res.data;
};

/**
 * Retrieve stored user data from localStorage
 */
export const getStoredUser = () => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
};

/**
 * Logout user by clearing stored data
 */
export const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};
