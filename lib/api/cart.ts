import api from "./index";

export const addToCart = async (productId: String, qty: number) => {
    const res = await api.post(`/cart`, {
        productId,
        quantity: qty
    })
    return res.data.data;

}
export const getCart = async () => {
    const res = await api.get("/cart")
    return res.data.data;
}


export const removeFromCart = async (productId: String) => {
    const res = await api.delete(`/cart/${productId}`)
    return res.data.data;
}


export const increaseQuantity = async (productId: String) => {
    const res = await api.patch(`/cart/${productId}/increase`)
    return res.data.data;
}


export const decreaseQuantity = async (productId: String) => {
    const res = await api.patch(`/cart/${productId}/decrease`)
    return res.data.data;
}
