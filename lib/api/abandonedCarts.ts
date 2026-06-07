import api from "./index";

export const getAbandonedCarts = async () => {
    const res = await api.get("/admin/abandoned-carts");
    return res.data;
};

export const clearAbandonedCart = async (cartId: string) => {
    const res = await api.delete(`/admin/abandoned-carts/${cartId}`);
    return res.data;
};
