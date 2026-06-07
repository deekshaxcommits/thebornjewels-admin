'use client'

import { useEffect, useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useCreateSection, useUpdateSection } from '@/hooks/useCMS'
import { CMSSection, CMSSectionInput, LinkedItem } from '@/lib/api/cms'
import { cn } from '@/lib/utils'

interface Props {
    open: boolean
    onClose: () => void
    section: CMSSection | null
}

const EMPTY: CMSSectionInput = {
    page: 'home',
    sectionKey: '',
    label: '',
    isActive: true,
    order: 0,
    heading: '',
    subheading: '',
    body: '',
    ctaText: '',
    ctaLink: '',
    badge: '',
    mediaType: 'none',
    mediaUrl: '',
    mediaKey: '',
    theme: 'light',
    linkedItems: [],
}

function field(label: string, children: React.ReactNode, className?: string) {
    return (
        <div className={cn('flex flex-col gap-1', className)}>
            <label className="text-xs font-medium text-zinc-600 uppercase tracking-wide">{label}</label>
            {children}
        </div>
    )
}

const inputCls = 'px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:border-zinc-400 w-full'
const selectCls = inputCls

export function CMSSectionModal({ open, onClose, section }: Props) {
    const [form, setForm] = useState<CMSSectionInput>(EMPTY)
    const [newLinkedId, setNewLinkedId]       = useState('')
    const [newLinkedModel, setNewLinkedModel] = useState<'Product' | 'Collection'>('Product')
    const [newLinkedLabel, setNewLinkedLabel] = useState('')

    const createMut = useCreateSection()
    const updateMut = useUpdateSection()
    const loading   = createMut.isPending || updateMut.isPending

    useEffect(() => {
        if (section) {
            setForm({
                page:        section.page,
                sectionKey:  section.sectionKey,
                label:       section.label,
                isActive:    section.isActive,
                order:       section.order,
                heading:     section.heading ?? '',
                subheading:  section.subheading ?? '',
                body:        section.body ?? '',
                ctaText:     section.ctaText ?? '',
                ctaLink:     section.ctaLink ?? '',
                badge:       section.badge ?? '',
                mediaType:   section.mediaType ?? 'none',
                mediaUrl:    section.mediaUrl ?? '',
                mediaKey:    section.mediaKey ?? '',
                theme:       section.theme ?? 'light',
                linkedItems: section.linkedItems ?? [],
            })
        } else {
            setForm(EMPTY)
        }
    }, [section, open])

    const set = (key: keyof CMSSectionInput, value: any) =>
        setForm((f) => ({ ...f, [key]: value }))

    const addLinkedItem = () => {
        if (!newLinkedId.trim()) return
        const item: LinkedItem = {
            refId: newLinkedId.trim(),
            refModel: newLinkedModel,
            label: newLinkedLabel || undefined,
            order: (form.linkedItems?.length ?? 0),
        }
        set('linkedItems', [...(form.linkedItems ?? []), item])
        setNewLinkedId('')
        setNewLinkedLabel('')
    }

    const removeLinkedItem = (index: number) => {
        set('linkedItems', (form.linkedItems ?? []).filter((_, i) => i !== index))
    }

    const handleSubmit = async () => {
        if (!form.sectionKey.trim() || !form.label.trim() || !form.page) {
            toast.error('Page, Section Key, and Label are required')
            return
        }
        try {
            if (section) {
                await updateMut.mutateAsync({ id: section._id, payload: form })
                toast.success('Section updated')
            } else {
                await createMut.mutateAsync(form)
                toast.success('Section created')
            }
            onClose()
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Something went wrong')
        }
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                    <h2 className="text-base font-semibold text-zinc-900">
                        {section ? 'Edit Section' : 'New Section'}
                    </h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors">
                        <X className="w-4 h-4 text-zinc-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                    {/* Identity */}
                    <div className="grid grid-cols-2 gap-4">
                        {field('Page *',
                            <select value={form.page} onChange={(e) => set('page', e.target.value)} className={selectCls}>
                                <option value="home">Homepage</option>
                                <option value="collections">Collections</option>
                                <option value="gifting">Gifting</option>
                                <option value="global">Global</option>
                            </select>
                        )}
                        {field('Order',
                            <input
                                type="number"
                                value={form.order}
                                onChange={(e) => set('order', Number(e.target.value))}
                                className={inputCls}
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {field('Section Key *',
                            <input
                                value={form.sectionKey}
                                onChange={(e) => set('sectionKey', e.target.value.replace(/\s/g, '-').toLowerCase())}
                                placeholder="e.g. hero, featured-products"
                                className={inputCls}
                                disabled={!!section}
                            />
                        )}
                        {field('Admin Label *',
                            <input
                                value={form.label}
                                onChange={(e) => set('label', e.target.value)}
                                placeholder="e.g. Homepage Hero"
                                className={inputCls}
                            />
                        )}
                    </div>

                    {/* Active + Theme */}
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <div
                                onClick={() => set('isActive', !form.isActive)}
                                className={cn(
                                    'w-10 h-5.5 rounded-full transition-colors relative',
                                    form.isActive ? 'bg-emerald-500' : 'bg-zinc-300'
                                )}
                            >
                                <span className={cn(
                                    'absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform',
                                    form.isActive ? 'translate-x-4.5' : 'translate-x-0.5'
                                )} />
                            </div>
                            <span className="text-xs font-medium text-zinc-700">Active</span>
                        </label>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-zinc-600 uppercase tracking-wide">Theme</span>
                            {(['light', 'dark', 'gold'] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => set('theme', t)}
                                    className={cn(
                                        'px-3 py-1 rounded-full text-xs font-medium border transition-all capitalize',
                                        form.theme === t
                                            ? 'bg-zinc-900 text-white border-zinc-900'
                                            : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                                    )}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Text content */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Text Content</p>

                        {field('Badge / Eyebrow',
                            <input value={form.badge ?? ''} onChange={(e) => set('badge', e.target.value)} placeholder="e.g. New Collection" className={inputCls} />
                        )}
                        {field('Heading',
                            <input value={form.heading ?? ''} onChange={(e) => set('heading', e.target.value)} placeholder="Main headline" className={inputCls} />
                        )}
                        {field('Subheading',
                            <input value={form.subheading ?? ''} onChange={(e) => set('subheading', e.target.value)} placeholder="Supporting text" className={inputCls} />
                        )}
                        {field('Body',
                            <textarea
                                value={form.body ?? ''}
                                onChange={(e) => set('body', e.target.value)}
                                rows={3}
                                placeholder="Longer description or body copy"
                                className={inputCls}
                            />
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            {field('CTA Button Text',
                                <input value={form.ctaText ?? ''} onChange={(e) => set('ctaText', e.target.value)} placeholder="Shop Now" className={inputCls} />
                            )}
                            {field('CTA Link',
                                <input value={form.ctaLink ?? ''} onChange={(e) => set('ctaLink', e.target.value)} placeholder="/products" className={inputCls} />
                            )}
                        </div>
                    </div>

                    {/* Media */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Media</p>

                        {field('Media Type',
                            <select value={form.mediaType ?? 'none'} onChange={(e) => set('mediaType', e.target.value)} className={selectCls}>
                                <option value="none">None</option>
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                                <option value="reel">Reel / Embed</option>
                            </select>
                        )}

                        {form.mediaType !== 'none' && (
                            field('Media URL',
                                <input
                                    value={form.mediaUrl ?? ''}
                                    onChange={(e) => set('mediaUrl', e.target.value)}
                                    placeholder="https://… or /uploads/…"
                                    className={inputCls}
                                />
                            )
                        )}
                    </div>

                    {/* Linked Items */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                            Linked Products / Collections
                        </p>

                        {(form.linkedItems ?? []).length > 0 && (
                            <div className="space-y-1.5">
                                {(form.linkedItems ?? []).map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-zinc-50 px-3 py-2 rounded-lg text-xs">
                                        <span className="font-mono text-zinc-500 truncate flex-1">{item.refId}</span>
                                        <span className="text-[10px] bg-zinc-200 text-zinc-700 px-1.5 py-0.5 rounded">{item.refModel}</span>
                                        {item.label && <span className="text-zinc-600">{item.label}</span>}
                                        <button onClick={() => removeLinkedItem(i)} className="text-red-400 hover:text-red-600 p-0.5">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <select
                                value={newLinkedModel}
                                onChange={(e) => setNewLinkedModel(e.target.value as any)}
                                className="px-2 py-1.5 text-xs border border-zinc-200 rounded-lg bg-white focus:outline-none w-28"
                            >
                                <option value="Product">Product</option>
                                <option value="Collection">Collection</option>
                            </select>
                            <input
                                value={newLinkedId}
                                onChange={(e) => setNewLinkedId(e.target.value)}
                                placeholder="MongoDB ID"
                                className="flex-1 px-3 py-1.5 text-xs border border-zinc-200 rounded-lg bg-white focus:outline-none"
                            />
                            <input
                                value={newLinkedLabel}
                                onChange={(e) => setNewLinkedLabel(e.target.value)}
                                placeholder="Label (optional)"
                                className="w-28 px-3 py-1.5 text-xs border border-zinc-200 rounded-lg bg-white focus:outline-none"
                            />
                            <button
                                onClick={addLinkedItem}
                                className="px-3 py-1.5 bg-zinc-900 text-white text-xs rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" /> Add
                            </button>
                        </div>
                        <p className="text-[10px] text-zinc-400">
                            Paste a product or collection MongoDB _id. These will be fetched and rendered by the frontend.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-100">
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Saving…' : section ? 'Update Section' : 'Create Section'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
