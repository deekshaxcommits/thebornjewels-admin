'use client'

import { CMSContent } from '@/components/cms/cms-content'
import { Suspense } from 'react'

export default function CMSPage() {
    return (
        <Suspense fallback={<CMSLoading />}>
            <CMSContent />
        </Suspense>
    )
}

function CMSLoading() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-zinc-200 rounded w-48" />
            {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-zinc-200 rounded-xl" />
            ))}
        </div>
    )
}
