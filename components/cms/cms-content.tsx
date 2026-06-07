'use client'

import { useState, useMemo } from 'react'
import {
    Plus, Edit2, Trash2, ToggleLeft, ToggleRight,
    ChevronUp, ChevronDown, Search, Globe, Home, Gift, Layers,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    useCMSSections,
    useToggleSection,
    useDeleteSection,
    useReorderSections,
} from '@/hooks/useCMS'
import { CMSSection } from '@/lib/api/cms'
import { CMSSectionModal } from './cms-section-modal'
import { cn } from '@/lib/utils'

const PAGE_TABS = [
    { id: 'all',         label: 'All',         icon: Globe },
    { id: 'home',        label: 'Homepage',    icon: Home },
    { id: 'collections', label: 'Collections', icon: Layers },
    { id: 'gifting',     label: 'Gifting',     icon: Gift },
    { id: 'global',      label: 'Global',      icon: Globe },
]

const PAGE_BADGE: Record<string, string> = {
    home:        'bg-blue-100 text-blue-800',
    collections: 'bg-purple-100 text-purple-800',
    gifting:     'bg-pink-100 text-pink-800',
    global:      'bg-amber-100 text-amber-800',
}

const THEME_BADGE: Record<string, string> = {
    light: 'bg-zinc-100 text-zinc-700',
    dark:  'bg-zinc-800 text-zinc-100',
    gold:  'bg-amber-100 text-amber-800',
}

export function CMSContent() {
    const [activePage, setActivePage] = useState('all')
    const [search, setSearch]         = useState('')
    const [modalOpen, setModalOpen]   = useState(false)
    const [editing, setEditing]       = useState<CMSSection | null>(null)

    const { data: sections = [], isLoading, isError } = useCMSSections()
    const toggleMut  = useToggleSection()
    const deleteMut  = useDeleteSection()
    const reorderMut = useReorderSections()

    const filtered = useMemo(() => {
        let s = [...sections]
        if (activePage !== 'all') s = s.filter((x) => x.page === activePage)
        if (search) {
            const q = search.toLowerCase()
            s = s.filter((x) =>
                x.label.toLowerCase().includes(q) ||
                x.sectionKey.toLowerCase().includes(q) ||
                x.heading?.toLowerCase().includes(q)
            )
        }
        return s.sort((a, b) => a.order - b.order)
    }, [sections, activePage, search])

    const handleToggle = async (id: string) => {
        try {
            await toggleMut.mutateAsync(id)
            toast.success('Section updated')
        } catch {
            toast.error('Failed to update section')
        }
    }

    const handleDelete = async (id: string, label: string) => {
        if (!confirm(`Delete "${label}"? This cannot be undone.`)) return
        try {
            await deleteMut.mutateAsync(id)
            toast.success('Section deleted')
        } catch {
            toast.error('Failed to delete section')
        }
    }

    const handleMoveUp = async (index: number) => {
        if (index === 0) return
        const reordered = [...filtered]
        const [item] = reordered.splice(index, 1)
        reordered.splice(index - 1, 0, item)
        const orders = reordered.map((s, i) => ({ id: s._id, order: i }))
        try {
            await reorderMut.mutateAsync(orders)
        } catch {
            toast.error('Failed to reorder')
        }
    }

    const handleMoveDown = async (index: number) => {
        if (index === filtered.length - 1) return
        const reordered = [...filtered]
        const [item] = reordered.splice(index, 1)
        reordered.splice(index + 1, 0, item)
        const orders = reordered.map((s, i) => ({ id: s._id, order: i }))
        try {
            await reorderMut.mutateAsync(orders)
        } catch {
            toast.error('Failed to reorder')
        }
    }

    const openCreate = () => { setEditing(null); setModalOpen(true) }
    const openEdit   = (s: CMSSection) => { setEditing(s); setModalOpen(true) }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-zinc-900">Content Manager</h1>
                    <p className="text-sm text-zinc-500 mt-0.5">
                        Manage homepage sections, banners, and page content
                    </p>
                </div>
                <Button onClick={openCreate} className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Section
                </Button>
            </div>

            {/* Page tabs + search */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex gap-1.5 flex-wrap">
                    {PAGE_TABS.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActivePage(tab.id)}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                                    activePage === tab.id
                                        ? 'bg-zinc-900 text-white border-zinc-900'
                                        : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                                )}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>

                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search sections…"
                        className="pl-8 pr-3 py-1.5 text-xs border border-zinc-200 rounded-full bg-white focus:outline-none focus:border-zinc-400 w-52"
                    />
                </div>
            </div>

            {/* Content */}
            {isLoading && (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-zinc-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            )}

            {isError && (
                <div className="text-center py-12 text-zinc-500 text-sm">
                    Failed to load sections. Check your backend connection.
                </div>
            )}

            {!isLoading && !isError && filtered.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-zinc-400 text-sm mb-4">No sections found</p>
                    <Button variant="outline" size="sm" onClick={openCreate}>
                        <Plus className="w-3.5 h-3.5" />
                        Create first section
                    </Button>
                </div>
            )}

            {!isLoading && !isError && filtered.length > 0 && (
                <div className="space-y-2">
                    {filtered.map((section, index) => (
                        <SectionRow
                            key={section._id}
                            section={section}
                            index={index}
                            total={filtered.length}
                            onEdit={() => openEdit(section)}
                            onToggle={() => handleToggle(section._id)}
                            onDelete={() => handleDelete(section._id, section.label)}
                            onMoveUp={() => handleMoveUp(index)}
                            onMoveDown={() => handleMoveDown(index)}
                        />
                    ))}
                </div>
            )}

            <CMSSectionModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                section={editing}
            />
        </div>
    )
}

interface SectionRowProps {
    section: CMSSection
    index: number
    total: number
    onEdit: () => void
    onToggle: () => void
    onDelete: () => void
    onMoveUp: () => void
    onMoveDown: () => void
}

function SectionRow({ section, index, total, onEdit, onToggle, onDelete, onMoveUp, onMoveDown }: SectionRowProps) {
    return (
        <div
            className={cn(
                'flex items-center gap-4 bg-white border rounded-xl px-4 py-3 transition-all',
                section.isActive ? 'border-zinc-200' : 'border-zinc-100 opacity-60'
            )}
        >
            {/* Reorder */}
            <div className="flex flex-col gap-0.5 shrink-0">
                <button
                    onClick={onMoveUp}
                    disabled={index === 0}
                    className="p-0.5 rounded hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
                </button>
                <button
                    onClick={onMoveDown}
                    disabled={index === total - 1}
                    className="p-0.5 rounded hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                </button>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-zinc-900 truncate">{section.label}</span>
                    <span className={cn('text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full', PAGE_BADGE[section.page])}>
                        {section.page}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">{section.sectionKey}</span>
                    {section.theme && section.theme !== 'light' && (
                        <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', THEME_BADGE[section.theme])}>
                            {section.theme}
                        </span>
                    )}
                    {section.mediaType && section.mediaType !== 'none' && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium capitalize">
                            {section.mediaType}
                        </span>
                    )}
                </div>
                {section.heading && (
                    <p className="text-xs text-zinc-500 truncate mt-0.5">{section.heading}</p>
                )}
                {section.linkedItems && section.linkedItems.length > 0 && (
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                        {section.linkedItems.length} linked item{section.linkedItems.length !== 1 ? 's' : ''}
                    </p>
                )}
            </div>

            {/* Order badge */}
            <span className="text-[10px] text-zinc-400 shrink-0">#{section.order}</span>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
                <button
                    onClick={onToggle}
                    title={section.isActive ? 'Disable' : 'Enable'}
                    className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
                >
                    {section.isActive
                        ? <ToggleRight className="w-4.5 h-4.5 text-emerald-500" />
                        : <ToggleLeft className="w-4.5 h-4.5 text-zinc-400" />
                    }
                </button>
                <button
                    onClick={onEdit}
                    className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
                >
                    <Edit2 className="w-3.5 h-3.5 text-zinc-500" />
                </button>
                <button
                    onClick={onDelete}
                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
            </div>
        </div>
    )
}
