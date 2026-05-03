import api from "./index";

export const getCollections = async () => {
    const res = await api.get("/collection");
    return res.data.data;
};

export const getCollectionByID = async (collectionId: string) => {
    const res = await api.get(`/collection/${collectionId}`);
    return res.data.data;
};

export const getCollectionBySlug = async (slug: string) => {
    const res = await api.get(`/collection/slug/${slug}`);
    return res.data.data;
};

export const createCollection = async (payload: any) => {
    const res = await api.post("/collection", payload);
    return res.data.data;
};

export const updateCollection = async (id: string, payload: any) => {
    const res = await api.put(`/collection/${id}`, payload);
    return res.data.data;
};

export const deleteCollection = async (id: string) => {
    const res = await api.delete(`/collection/${id}`);
    return res.data.message;
};

export const deactivateCollection = async (id: string) => {
    const res = await api.put(`/collection/${id}/deactivate`);
    return res.data.message;
};

export const reactivateCollection = async (id: string) => {
    const res = await api.put(`/collection/${id}/reactivate`);
    return res.data.data;
};

export const uploadCollectionBanner = async (file: File) => {
    try {
        const formData = new FormData();
        formData.append("images", file);
        const res = await api.post(`/upload`, formData);

        if (!res.data.success) throw new Error("Upload failed");

        const data = res.data;
        if (!data.success) throw new Error(data.message || "Upload failed");
        return data.files;
    } catch (err: any) {
        console.error(err);
        throw err;
    }
};