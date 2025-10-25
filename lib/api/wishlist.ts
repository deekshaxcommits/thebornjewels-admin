import api from "./index";

export const addToWishlist = async (productId: String) => {
    const res = await api.post(`/wishlist`, {
        productId
    })
    return res.data.data;

}
export const getWishlist = async () => {
    const res = await api.get("/wishlist")
    return res.data.data;
}


export const removeFromWishlist = async (productId: String) => {
    const res = await api.delete(`/wishlist/${productId}`)
    return res.data.data;
}
