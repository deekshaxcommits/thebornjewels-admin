import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getSections,
    createSection,
    updateSection,
    toggleSection,
    deleteSection,
    reorderSections,
    type CMSSectionInput,
} from "@/lib/api/cms";

const KEY = ["cms-sections"];

export const useCMSSections = (page?: string) =>
    useQuery({
        queryKey: [...KEY, page],
        queryFn: () => getSections(page),
    });

export const useCreateSection = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CMSSectionInput) => createSection(payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

export const useUpdateSection = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<CMSSectionInput> }) =>
            updateSection(id, payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

export const useToggleSection = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => toggleSection(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

export const useDeleteSection = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteSection(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

export const useReorderSections = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (orders: { id: string; order: number }[]) => reorderSections(orders),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};
