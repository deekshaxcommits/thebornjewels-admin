import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllUGC, createUGC, updateUGC, deleteUGC, reorderUGC, UGCItem } from "@/lib/api/ugc";

export const useUGC = () =>
    useQuery({ queryKey: ["ugc"], queryFn: getAllUGC });

export const useCreateUGC = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createUGC,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["ugc"] }),
    });
};

export const useUpdateUGC = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<UGCItem> }) => updateUGC(id, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["ugc"] }),
    });
};

export const useDeleteUGC = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteUGC,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["ugc"] }),
    });
};

export const useReorderUGC = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: reorderUGC,
        onSuccess: (data) => qc.setQueryData(["ugc"], data),
    });
};
