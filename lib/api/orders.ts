import api from "./index";

export const getOrders = async () => {
    const res = await api.get("/orders/my-orders");
    return res.data.data;
};
