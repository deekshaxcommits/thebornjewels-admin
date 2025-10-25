// components/product/product-grid.tsx
import { Product } from '@/types/product'
import { ProductCard } from './product-card'

interface ProductGridProps {
    products: Product[]
    columns?: 2 | 3 | 4 | 5 | 6
}

export function ProductGrid({ products, columns = 4 }: ProductGridProps) {
    const gridCols = {
        2: 'grid-cols-2 md:grid-cols-2',
        3: 'grid-cols-2 md:grid-cols-3',
        4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        5: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-5',
        6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
    }

    return (
        <div className={`grid gap-3 md:gap-5 lg:gap-6 ${gridCols[columns]}`}>
            {products.map((product) => (
                <ProductCard key={product._id} product={product} />
            ))}
        </div>
    )
}
