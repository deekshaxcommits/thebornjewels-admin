import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAbandonedCarts, clearAbandonedCart } from "@/lib/api/abandonedCarts";

export const useAbandonedCarts = () =>
    useQuery({
        queryKey: ["abandoned-carts"],
        queryFn: getAbandonedCarts,
    });

export const useClearAbandonedCart = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (cartId: string) => clearAbandonedCart(cartId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["abandoned-carts"] }),
    });
};
