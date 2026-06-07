import api from "./index";

export interface LinkedItem {
    refId: string;
    refModel: "Product" | "Collection";
    label?: string;
    order?: number;
}

export interface CMSSection {
    _id: string;
    page: "home" | "collections" | "gifting" | "global";
    sectionKey: string;
    label: string;
    isActive: boolean;
    order: number;
    heading?: string;
    subheading?: string;
    body?: string;
    ctaText?: string;
    ctaLink?: string;
    badge?: string;
    mediaType?: "image" | "video" | "reel" | "none";
    mediaUrl?: string;
    mediaKey?: string;
    theme?: "light" | "dark" | "gold";
    linkedItems?: LinkedItem[];
    meta?: Record<string, string>;
    createdAt: string;
    updatedAt: string;
}

export type CMSSectionInput = Omit<CMSSection, "_id" | "createdAt" | "updatedAt">;

export const getSections = async (page?: string): Promise<CMSSection[]> => {
    const params = page ? { page } : {};
    const res = await api.get("/cms", { params });
    return res.data.sections;
};

export const createSection = async (payload: CMSSectionInput): Promise<CMSSection> => {
    const res = await api.post("/cms", payload);
    return res.data.section;
};

export const updateSection = async (id: string, payload: Partial<CMSSectionInput>): Promise<CMSSection> => {
    const res = await api.patch(`/cms/${id}`, payload);
    return res.data.section;
};

export const toggleSection = async (id: string): Promise<CMSSection> => {
    const res = await api.patch(`/cms/${id}/toggle`);
    return res.data.section;
};

export const reorderSections = async (orders: { id: string; order: number }[]): Promise<void> => {
    await api.post("/cms/reorder", { orders });
};

export const deleteSection = async (id: string): Promise<void> => {
    await api.delete(`/cms/${id}`);
};
