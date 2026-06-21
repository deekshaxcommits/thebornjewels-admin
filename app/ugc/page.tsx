'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Eye, EyeOff, Instagram, Youtube, RefreshCw, ExternalLink, ChevronUp, ChevronDown, Save, Pencil, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUGC, useCreateUGC, useUpdateUGC, useDeleteUGC, useReorderUGC } from '@/hooks/useUGC'
import { UGCItem } from '@/lib/api/ugc'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function extractEmbedUrl(url: string, type: 'instagram' | 'youtube'): string {
    if (type === 'instagram') {
        // Extract reel shortcode: instagram.com/reel/SHORTCODE/
        const match = url.match(/instagram\.com\/reel\/([A-Za-z0-9_-]+)/)
        if (match) return `https://www.instagram.com/reel/${match[1]}/embed/`
        return url
    }
    // YouTube: extract video ID from various URL formats
    const match = url.match(/(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]+)/)
    if (match) return `https://www.youtube.com/embed/${match[1]}`
    return url
}

function detectType(url: string): 'instagram' | 'youtube' {
    if (url.includes('instagram.com')) return 'instagram'
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
    return 'instagram'
}

function EmbedPreview({ url, type }: { url: string; type: 'instagram' | 'youtube' }) {
    const embedUrl = extractEmbedUrl(url, type)
    const isInstagram = type === 'instagram'
    return (
        <div
            className={cn(
                'relative overflow-hidden bg-black rounded-xl',
                isInstagram ? 'w-full aspect-[9/16]' : 'w-full aspect-video'
            )}
        >
            <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allowFullScreen
                scrolling="no"
                title="embed preview"
            />
        </div>
    )
}

function UGCCard({
    item,
    index,
    total,
    onMove,
    moving,
}: {
    item: UGCItem
    index: number
    total: number
    onMove: (index: number, direction: -1 | 1) => void
    moving: boolean
}) {
    const updateMutation = useUpdateUGC()
    const deleteMutation = useDeleteUGC()
    const [editing, setEditing] = useState(false)
    const [editUrl, setEditUrl] = useState(item.url)
    const [editTitle, setEditTitle] = useState(item.title)
    const [editType, setEditType] = useState<'instagram' | 'youtube'>(item.type)

    const cancelEdit = () => {
        setEditUrl(item.url)
        setEditTitle(item.title)
        setEditType(item.type)
        setEditing(false)
    }

    const saveEdit = async () => {
        if (!editUrl.trim()) {
            toast.error('A reel URL is required')
            return
        }
        try {
            await updateMutation.mutateAsync({
                id: item._id,
                data: { url: editUrl.trim(), title: editTitle.trim(), type: editType },
            })
            setEditing(false)
            toast.success('Reel updated')
        } catch {
            toast.error('Failed to update reel')
        }
    }

    const toggleActive = async () => {
        try {
            await updateMutation.mutateAsync({ id: item._id, data: { isActive: !item.isActive } })
            toast.success(item.isActive ? 'Hidden from homepage' : 'Showing on homepage')
        } catch {
            toast.error('Failed to update')
        }
    }

    const handleDelete = async () => {
        if (!confirm('Delete this embed?')) return
        try {
            await deleteMutation.mutateAsync(item._id)
            toast.success('Deleted')
        } catch {
            toast.error('Failed to delete')
        }
    }

    return (
        <div className={cn(
            'bg-white rounded-2xl border shadow-sm overflow-hidden transition-opacity',
            !item.isActive && 'opacity-50'
        )}>
            {/* Preview */}
            <div className="p-3 bg-gray-50">
                <EmbedPreview url={item.url} type={item.type} />
            </div>

            {/* Info */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Position {index + 1}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => onMove(index, -1)}
                            disabled={index === 0 || moving}
                            aria-label={`Move ${item.title || item.type} earlier`}
                            className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            {moving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronUp className="w-4 h-4" />}
                        </button>
                        <button
                            type="button"
                            onClick={() => onMove(index, 1)}
                            disabled={index === total - 1 || moving}
                            aria-label={`Move ${item.title || item.type} later`}
                            className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            {moving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
                {editing ? (
                    <div className="space-y-2 mb-3">
                        <Input value={editUrl} onChange={event => setEditUrl(event.target.value)} placeholder="Reel URL" />
                        <Input value={editTitle} onChange={event => setEditTitle(event.target.value)} placeholder="Label (optional)" />
                        <select
                            value={editType}
                            onChange={event => setEditType(event.target.value as 'instagram' | 'youtube')}
                            className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm"
                        >
                            <option value="instagram">Instagram</option>
                            <option value="youtube">YouTube</option>
                        </select>
                        <div className="flex gap-2">
                            <Button size="sm" onClick={saveEdit} disabled={updateMutation.isPending} className="gap-1.5">
                                <Save className="w-3.5 h-3.5" /> Save changes
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit} className="gap-1.5">
                                <X className="w-3.5 h-3.5" /> Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                            {item.type === 'instagram'
                                ? <Instagram className="w-3.5 h-3.5 text-pink-500" />
                                : <Youtube className="w-3.5 h-3.5 text-red-500" />
                            }
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                {item.type}
                            </span>
                        </div>
                        {item.title && (
                            <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                        )}
                        <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5 truncate"
                        >
                            {item.url} <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                    </div>
                </div>
                )}

                <div className="flex items-center gap-2 mt-3">
                    <button
                        onClick={toggleActive}
                        className={cn(
                            'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                            item.isActive
                                ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                        )}
                    >
                        {item.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {item.isActive ? 'Visible' : 'Hidden'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors ml-auto"
                    >
                        <Trash2 className="w-3 h-3" /> Remove
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function UGCPage() {
    const { data, isLoading, refetch } = useUGC()
    const createMutation = useCreateUGC()
    const reorderMutation = useReorderUGC()

    const [url, setUrl] = useState('')
    const [title, setTitle] = useState('')
    const [adding, setAdding] = useState(false)

    const items: UGCItem[] = data?.items ?? []
    const [orderedItems, setOrderedItems] = useState<UGCItem[]>([])

    useEffect(() => {
        setOrderedItems(items)
    }, [items])

    const moveItem = async (index: number, direction: -1 | 1) => {
        const nextIndex = index + direction
        if (nextIndex < 0 || nextIndex >= orderedItems.length || reorderMutation.isPending) return

        const previous = orderedItems
        const next = [...orderedItems]
        ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
        setOrderedItems(next)
        try {
            await reorderMutation.mutateAsync(next.map(item => item._id))
            toast.success('Display order updated')
        } catch {
            setOrderedItems(previous)
            toast.error('Could not update the order. Please refresh and try again.')
        }
    }

    const handleAdd = async () => {
        if (!url.trim()) return
        const type = detectType(url.trim())
        setAdding(true)
        try {
            await createMutation.mutateAsync({ url: url.trim(), type, title: title.trim(), isActive: true, order: items.length })
            setUrl('')
            setTitle('')
            toast.success('Added!')
        } catch {
            toast.error('Failed to add')
        } finally {
            setAdding(false)
        }
    }

    const instagram = orderedItems.filter(i => i.type === 'instagram')
    const youtube = orderedItems.filter(i => i.type === 'youtube')

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">UGC / Social Embeds</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Instagram Reels & YouTube Shorts shown on the homepage
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
                        <RefreshCw className="h-4 w-4" /> Refresh
                    </Button>
                </div>
            </div>

            {/* Add form */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <p className="text-sm font-semibold text-gray-700 mb-3">Add new embed</p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                        placeholder="Paste Instagram reel or YouTube Shorts URL…"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        className="flex-1"
                        onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    />
                    <Input
                        placeholder="Label (optional)"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="sm:w-48"
                        onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    />
                    <Button onClick={handleAdd} disabled={!url.trim() || adding} className="gap-2 shrink-0">
                        <Plus className="h-4 w-4" /> Add
                    </Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    Supported: instagram.com/reel/… · youtube.com/shorts/… · youtu.be/…
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Embeds', value: orderedItems.length },
                    { label: 'Instagram', value: instagram.length, icon: <Instagram className="w-4 h-4 text-pink-500" /> },
                    { label: 'YouTube', value: youtube.length, icon: <Youtube className="w-4 h-4 text-red-500" /> },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center gap-1.5 mb-1">
                            {s.icon}
                            <p className="text-xs text-gray-500 uppercase tracking-wide">{s.label}</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse" />
                    ))}
                </div>
            ) : orderedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center mb-4">
                        <Instagram className="w-8 h-8 text-pink-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700">No embeds yet</h3>
                    <p className="text-sm text-gray-400 mt-1">Add your first Instagram reel or YouTube Short above.</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {orderedItems.map((item, index) => (
                        <UGCCard
                            key={item._id}
                            item={item}
                            index={index}
                            total={orderedItems.length}
                            onMove={moveItem}
                            moving={reorderMutation.isPending}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
