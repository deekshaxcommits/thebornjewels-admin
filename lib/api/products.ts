import api from "./index";

export const getProducts = async () => {
    const res = await api.get("/product");
    return res.data.data;
};

export const getProductByID = async (productId: String) => {
    const res = await api.get(`/product/${productId}`)
    return res.data.data;
}

export const createProduct = async (payload: any) => {
    const res = await api.post("/product", payload);
    return res.data.data;
};

export const updateProduct = async (id: string, payload: any) => {
    const res = await api.patch(`/product/${id}`, payload);
    return res.data.data;
};

export const deleteProduct = async (id: string) => {
    const res = await api.delete(`/product/delete/${id}`);
    return res.data.message;
};

export const deactivateProduct = async (id: string) => {
    const res = await api.put(`/product/deactivate/${id}`);
    return res.data.message;
};

export const reactivateProduct = async (id: string) => {
    const res = await api.put(`/product/${id}/reactivate`);
    return res.data.data;
};

export const uploadTempFiles = async (file: File) => {
    try {
        const formData = new FormData()
        formData.append("images", file)
        const res = await api.post(`/product/upload-temp`, formData);

        if (!res.data.success) throw new Error("Upload failed")

        const data = await res.data
        if (!data.success) throw new Error(data.message || "Upload failed")
        console.log("data", data)
        return data.files
    } catch (err: any) {
        console.error(err)
        throw err
    }
}
