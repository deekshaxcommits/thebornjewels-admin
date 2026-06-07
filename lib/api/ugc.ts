import api from ".";

export interface UGCItem {
    _id: string;
    url: string;
    type: "instagram" | "youtube";
    title: string;
    isActive: boolean;
    order: number;
    createdAt: string;
}

export const getAllUGC = async (): Promise<{ items: UGCItem[] }> => {
    const res = await api.get("/ugc/all");
    return res.data;
};

export const createUGC = async (data: Partial<UGCItem>): Promise<{ item: UGCItem }> => {
    const res = await api.post("/ugc", data);
    return res.data;
};

export const updateUGC = async (id: string, data: Partial<UGCItem>): Promise<{ item: UGCItem }> => {
    const res = await api.patch(`/ugc/${id}`, data);
    return res.data;
};

export const deleteUGC = async (id: string): Promise<void> => {
    await api.delete(`/ugc/${id}`);
};
