'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { X, ImageIcon, Plus, Trash2, Loader2, Search, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  createCollection,
  updateCollection,
  getCollectionByID,
  uploadCollectionBanner,
} from '@/lib/api/collections'
import { getProducts } from '@/lib/api/products'
// import { getCombos } from '@/lib/api/combos'
import { API_BASE_URL } from '@/lib/api'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  collectionId?: string // if provided → edit mode
}

const COLLECTION_TYPES = ['occasion', 'campaign', 'look', 'festival', 'category']

const emptyForm = {
  name: '',
  description: '',
  type: 'campaign',
  priority: 0,
  bannerImage: null as { key: string; url: string } | null,
  items: [] as { type: 'Product' | 'Combo'; item: string }[],
  featuredCombo: '',
  inspirationReels: [] as string[],
}

// ─── Searchable picker for a single item row ──────────────────────────────────

interface CatalogEntry { _id: string; title?: string; name?: string; images?: any[]; image?: string }

interface ItemPickerProps {
  entryType: 'Product' | 'Combo'
  selectedId: string
  catalog: CatalogEntry[]
  loadingCatalog: boolean
  onChangeType: (t: 'Product' | 'Combo') => void
  onChangeItem: (id: string) => void
  onRemove: () => void
}

function ItemPicker({ entryType, selectedId, catalog, loadingCatalog, onChangeType, onChangeItem, onRemove }: ItemPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return catalog.filter((c) => {
      const label = (c.title || c.name || '').toLowerCase()
      return label.includes(q)
    })
  }, [catalog, search])

  const selected = catalog.find((c) => c._id === selectedId)
  const label = selected ? (selected.title || selected.name || selected._id) : 'Select…'
  const thumb = selected
    ? `${API_BASE_URL}${selected.images?.[0]?.url || selected.image || ''}`
    : null

  return (
    <div className="flex items-center gap-2">
      {/* Type toggle */}
      <select
        value={entryType}
        onChange={(e) => { onChangeType(e.target.value as 'Product' | 'Combo'); onChangeItem('') }}
        className="px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-28 flex-shrink-0"
      >
        <option value="Product">Product</option>
        <option value="Combo">Combo</option>
      </select>

      {/* Dropdown picker */}
      <div ref={ref} className="relative flex-1">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-left hover:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        >
          {thumb && selectedId ? (
            <img src={thumb} alt="" className="w-6 h-6 rounded object-cover flex-shrink-0" />
          ) : (
            <div className="w-6 h-6 rounded bg-gray-100 flex-shrink-0" />
          )}
          <span className={`flex-1 truncate ${selectedId ? 'text-gray-900' : 'text-gray-400'}`}>
            {loadingCatalog ? 'Loading…' : label}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </button>

        {open && (
          <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Options */}
            <ul className="max-h-52 overflow-y-auto">
              {filtered.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-gray-400">No results</li>
              ) : (
                filtered.map((c) => {
                  const imgSrc = `${API_BASE_URL}${c.images?.[0]?.url || c.image || ''}`
                  const name = c.title || c.name || c._id
                  return (
                    <li
                      key={c._id}
                      onClick={() => { onChangeItem(c._id); setOpen(false); setSearch('') }}
                      className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-blue-50 transition ${selectedId === c._id ? 'bg-blue-50' : ''}`}
                    >
                      {(c.images?.[0]?.url || c.image) ? (
                        <img src={imgSrc} alt={name} className="w-8 h-8 rounded object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                      <span className="text-sm text-gray-800 truncate">{name}</span>
                      {selectedId === c._id && (
                        <span className="ml-auto text-blue-500 text-xs font-medium">✓</span>
                      )}
                    </li>
                  )
                })
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Remove row */}
      <button
        type="button"
        onClick={onRemove}
        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition flex-shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export function CollectionModal({ isOpen, onClose, onSuccess, collectionId }: Props) {
  const isEdit = !!collectionId
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState(emptyForm)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [bannerUploading, setBannerUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Catalog
  const [products, setProducts] = useState<CatalogEntry[]>([])
  const [combos, setCombos] = useState<CatalogEntry[]>([])
  const [catalogLoading, setCatalogLoading] = useState(false)

  // ─── Load catalog (products + combos) ─────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return
    const fetchCatalog = async () => {
      setCatalogLoading(true)
      try {
        const [p] = await Promise.all([getProducts()])
        setProducts(p || [])
        // setCombos(c || [])
      } catch {
        // non-fatal — picker just shows empty
      } finally {
        setCatalogLoading(false)
      }
    }
    fetchCatalog()
  }, [isOpen])

// ─── Load existing data in edit mode ──────────────────────────────────────
useEffect(() => {
  if (!isOpen) return
  if (!isEdit) {
    setForm(emptyForm)
    setBannerPreview(null)
    setError(null)
    return
  }

  const load = async () => {
    setFetching(true)
    try {
      const data = await getCollectionByID(collectionId)
      
      // Transform items to extract just the IDs from populated objects
      const transformedItems = (data.items || []).map((item: any) => ({
        type: item.type,
        item: typeof item.item === 'object' ? item.item._id : item.item
      }))
      
      setForm({
        name: data.name ?? '',
        description: data.description ?? '',
        type: data.type ?? 'campaign',
        priority: data.priority ?? 0,
        bannerImage: data.bannerImage?.key ? data.bannerImage : null,
        items: transformedItems,
        featuredCombo: typeof data.featuredCombo === 'object'
          ? data.featuredCombo?._id ?? ''
          : data.featuredCombo ?? '',
        inspirationReels: data.inspirationReels ?? [],
      })
      
      if (data.bannerImage?.url) {
        setBannerPreview(`${API_BASE_URL}${data.bannerImage.url}`)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load collection')
    } finally {
      setFetching(false)
    }
  }
  load()
}, [isOpen, collectionId, isEdit])

  // ─── Banner upload ─────────────────────────────────────────────────────────
  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setBannerPreview(URL.createObjectURL(file))
    setBannerUploading(true)
    try {
      const files = await uploadCollectionBanner(file)
      const uploaded = files?.[0]
      if (!uploaded) throw new Error('Upload returned no file')
      setForm((prev) => ({ ...prev, bannerImage: { key: uploaded.key, url: uploaded.url } }))
    } catch (err: any) {
      setError(err.message || 'Banner upload failed')
      setBannerPreview(null)
    } finally {
      setBannerUploading(false)
    }
  }

  const removeBanner = () => {
    setForm((prev) => ({ ...prev, bannerImage: null }))
    setBannerPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ─── Items management ──────────────────────────────────────────────────────
  const getCatalogFor = (type: 'Product' | 'Combo') => type === 'Product' ? products : combos

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { type: 'Product', item: '' }],
    }))
  }

  const updateItemType = (idx: number, type: 'Product' | 'Combo') => {
    setForm((prev) => {
      const updated = [...prev.items]
      updated[idx] = { type, item: '' }
      return { ...prev, items: updated }
    })
  }

  const updateItemId = (idx: number, id: string) => {
    setForm((prev) => {
      const updated = [...prev.items]
      updated[idx] = { ...updated[idx], item: id }
      return { ...prev, items: updated }
    })
  }

  const removeItem = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }))
  }

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError(null)

    if (!form.name.trim()) {
      setError('Name is required.')
      return
    }

    // Strip empty item rows
    const validItems = form.items.filter((it) => it.item.trim() !== '')

    const payload: Record<string, any> = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      type: form.type,
      priority: Number(form.priority),
      items: validItems,
      featuredCombo: form.featuredCombo.trim() || undefined,
      inspirationReels: form.inspirationReels,
    }

    if (form.bannerImage?.key) {
      payload.bannerImage = form.bannerImage
    }

    setLoading(true)
    try {
      if (isEdit) {
        await updateCollection(collectionId, payload)
      } else {
        await createCollection(payload)
      }
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit Collection' : 'Add Collection'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {fetching ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading...
          </div>
        ) : (
          <div className="px-6 py-5 space-y-5">

            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">
                Name <span className="text-red-500">*</span>
              </Label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Diwali Collection 2025"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">Description</Label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Short description shown on the collection page..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Type + Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">Type</Label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {COLLECTION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">Priority</Label>
                <input
                  type="number"
                  min={0}
                  value={form.priority}
                  onChange={(e) => setForm((p) => ({ ...p, priority: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">Lower number = shown first</p>
              </div>
            </div>

            {/* Banner Image */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">Banner Image</Label>
              {bannerPreview ? (
                <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                  />
                  {bannerUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                  {!bannerUploading && (
                    <button
                      onClick={removeBanner}
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-1 transition"
                    >
                      <X className="w-4 h-4 text-gray-700" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition text-gray-400"
                >
                  <ImageIcon className="w-7 h-7" />
                  <span className="text-sm">Click to upload banner</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                className="hidden"
              />
            </div>

            {/* Reels Inspo */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">
                Instagram Reels Inspo
                <span className="text-gray-400 font-normal ml-1">(optional)</span>
              </Label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://www.instagram.com/reel/..."
                  id="new-reel-col"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value.trim()
                      if (val) {
                        setForm((p) => ({ ...p, inspirationReels: [...p.inspirationReels, val] }));
                        (e.target as HTMLInputElement).value = ''
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('new-reel-col') as HTMLInputElement
                    if (input?.value.trim()) {
                      setForm((p) => ({ ...p, inspirationReels: [...p.inspirationReels, input.value.trim()] }))
                      input.value = ''
                    }
                  }}
                  className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {form.inspirationReels.length > 0 && (
                <div className="flex flex-col gap-1.5 mt-2">
                  {form.inspirationReels.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 bg-pink-50 border border-pink-100 rounded-lg px-3 py-1.5 text-xs text-pink-700">
                      <span className="flex-1 truncate">{r}</span>
                      <button
                        onClick={() => setForm((p) => ({ ...p, inspirationReels: p.inspirationReels.filter((_, idx) => idx !== i) }))}
                        className="text-pink-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Featured Combo */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">
                Featured Combo ID
                <span className="text-gray-400 font-normal ml-1">(optional)</span>
              </Label>
              <input
                type="text"
                value={form.featuredCombo}
                onChange={(e) => setForm((p) => ({ ...p, featuredCombo: e.target.value }))}
                placeholder="MongoDB ObjectId of the featured combo"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium text-gray-700">Items</Label>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" /> Add item
                </button>
              </div>

              {form.items.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">
                  No items added yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {form.items.map((entry, idx) => (
                    <ItemPicker
                      key={idx}
                      entryType={entry.type}
                      selectedId={entry.item}
                      catalog={getCatalogFor(entry.type)}
                      loadingCatalog={catalogLoading}
                      onChangeType={(t) => updateItemType(idx, t)}
                      onChangeItem={(id) => updateItemId(idx, id)}
                      onRemove={() => removeItem(idx)}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-white">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || fetching || bannerUploading}
            className="bg-blue-600 hover:bg-blue-700 min-w-[110px]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {isEdit ? 'Saving...' : 'Creating...'}
              </span>
            ) : isEdit ? 'Save Changes' : 'Create Collection'}
          </Button>
        </div>

      </div>
    </div>
  )
}