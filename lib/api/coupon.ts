import api from "./index";

/* -------------------------
    CREATE
-------------------------- */
export const createCoupon = async (data: any) => {
    const res = await api.post(`/coupon/add`, data);
    return res.data.coupon;
};

/* -------------------------
    GET ALL
-------------------------- */
export const getAllCoupons = async () => {
    const res = await api.get(`/coupon/all`);
    return res.data.coupons;
};

/* -------------------------
    GET SINGLE
-------------------------- */
export const getCouponById = async (id: string) => {
    const res = await api.get(`/coupon/${id}`);
    return res.data.coupon;
};

/* -------------------------
    UPDATE (EDIT)
-------------------------- */
export const updateCoupon = async (id: string, data: any) => {
    const res = await api.put(`/coupon/update/${id}`, data);
    return res.data.coupon;
};

/* -------------------------
    DELETE
-------------------------- */
export const deleteCoupon = async (id: string) => {
    const res = await api.delete(`/coupon/delete/${id}`);
    return res.data;
};

/* -------------------------
    TOGGLE ACTIVE
-------------------------- */
export const toggleCouponActive = async (id: string) => {
    const res = await api.patch(`/coupon/toggle/${id}`);
    return res.data.coupon;
};

/* -------------------------
    APPLY (USER CART)
-------------------------- */
export const applyCoupon = async (payload: any) => {
    const res = await api.post(`/coupon/apply`, payload);
    return res.data;
};
