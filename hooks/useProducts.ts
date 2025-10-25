import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/lib/api/products";

export const useProducts = () => useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
});