import api from "./index";

export const getAllOffers = async () => {
    const res = await api.get("/offers");
    return res.data.offers;
};

export const getOfferById = async (id: string) => {
    const res = await api.get(`/offers/${id}`);
    return res.data.offer;
};

export const createOffer = async (payload: {
    slug: string;
    title: string;
    products: string[];
    freeGiftName: string;
    freeGiftValue: number;
    isActive?: boolean;
}) => {
    const res = await api.post("/offers", payload);
    return res.data.offer;
};

export const updateOffer = async (
    id: string,
    payload: {
        title?: string;
        products?: string[];
        freeGiftName?: string;
        freeGiftValue?: number;
        isActive?: boolean;
    }
) => {
    const res = await api.put(`/offers/${id}`, payload);
    return res.data.offer;
};

export const deleteOffer = async (id: string) => {
    const res = await api.delete(`/offers/${id}`);
    return res.data;
};
