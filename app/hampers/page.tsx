'use client'

import { useMemo, useState } from 'react'
import {
  Gift, Search, Package, Sparkles, User, Calendar,
  ChevronDown, ChevronUp, Filter, RefreshCw, Plus,
  Trash2, Edit2, X, Check, Loader2, AlertCircle, Settings,
  Download, Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAllHampers, useUpdateHamperStatus, useAdminCreateHamper, useAdminUpdateHamper, useAdminDeleteHamper, useHamperConfig, useUpdateHamperConfig } from '@/hooks/useHampers'
import { useProducts } from '@/hooks/useProducts'
import { useAddons } from '@/hooks/useAddons'
import { toast } from 'sonner'
import { cn, imgUrl } from '@/lib/utils'
import DateFilter, { DateFilterState, isInDateRange } from '@/components/ui/DateFilter'

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

const STATUS_OPTIONS = ['all', 'draft', 'active', 'ordered', 'abandoned']
const SOURCE_OPTIONS = ['all', 'custom', 'template', 'converted_cart']

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  active: 'bg-blue-100 text-blue-700',
  ordered: 'bg-green-100 text-green-700',
  abandoned: 'bg-red-100 text-red-600',
}

const SOURCE_LABELS: Record<string, string> = {
  custom: 'Custom',
  template: 'Template',
  converted_cart: 'Cart Convert',
}

// ── Hamper Create / Edit Modal ───────────────────────────────────────────────

interface HamperFormProduct { productId: string; title: string; price: number; quantity: number }
interface HamperFormAddon   { addonId: string; title: string; price: number; inputType: string; allowQuantity: boolean; quantity: number }

interface HamperForm {
  title: string
  theme: string
  customMessage: string
  status: 'draft' | 'active' | 'ordered' | 'abandoned'
  visibility: 'private' | 'public' | 'featured'
  selectedProducts: HamperFormProduct[]
  selectedAddons: HamperFormAddon[]
}

const EMPTY_FORM: HamperForm = {
  title: '',
  theme: '',
  customMessage: '',
  status: 'active',
  visibility: 'private',
  selectedProducts: [],
  selectedAddons: [],
}

// ── Hamper Config Panel ──────────────────────────────────────────────────────

function HamperConfigPanel() {
  const { data, isLoading } = useHamperConfig()
  const updateConfig = useUpdateHamperConfig()
  const config = data?.config

  const [fee, setFee] = useState('')
  const [inclusions, setInclusions] = useState<string[]>([])
  const [newInclusion, setNewInclusion] = useState('')
  const [editing, setEditing] = useState(false)

  useMemo(() => {
    if (config && !editing) {
      setFee(String(config.conversionFee ?? 150))
      setInclusions(config.inclusions ?? [])
    }
  }, [config, editing])

  const handleSave = async () => {
    try {
      await updateConfig.mutateAsync({ conversionFee: Number(fee), inclusions })
      toast.success('Hamper config saved')
      setEditing(false)
    } catch {
      toast.error('Failed to save config')
    }
  }

  const addInclusion = () => {
    const val = newInclusion.trim()
    if (!val || inclusions.includes(val)) return
    setInclusions((prev) => [...prev, val])
    setNewInclusion('')
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-amber-600" />
          <h2 className="font-semibold text-gray-800 text-sm">Hamper Package Settings</h2>
        </div>
        {!editing ? (
          <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="h-7 text-xs">
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditing(false)} className="h-7 text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={updateConfig.isPending} className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white">
              {updateConfig.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="h-12 bg-gray-100 rounded animate-pulse" />
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Conversion fee */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Conversion Fee (₹)</p>
            {editing ? (
              <input
                type="number"
                min={0}
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            ) : (
              <p className="text-2xl font-bold text-gray-800">₹{config?.conversionFee ?? 150}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">Flat fee added to every hamper order</p>
          </div>

          {/* Inclusions */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">What's Included</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {inclusions.map((inc) => (
                <span key={inc} className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs px-2 py-0.5 rounded-full">
                  {inc}
                  {editing && (
                    <button onClick={() => setInclusions((prev) => prev.filter((i) => i !== inc))}>
                      <X className="h-3 w-3 hover:text-red-500" />
                    </button>
                  )}
                </span>
              ))}
              {inclusions.length === 0 && <span className="text-xs text-gray-400 italic">No inclusions set</span>}
            </div>
            {editing && (
              <div className="flex gap-2 mt-1">
                <input
                  value={newInclusion}
                  onChange={(e) => setNewInclusion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addInclusion()}
                  placeholder="e.g. Fairy lights"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
                <button onClick={addInclusion} className="px-3 py-1.5 bg-amber-600 text-white text-xs rounded-lg hover:bg-amber-700">
                  Add
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function HamperModal({
  open,
  onClose,
  editing,
}: {
  open: boolean
  onClose: () => void
  editing?: any
}) {
  const [form, setForm] = useState<HamperForm>(EMPTY_FORM)
  const { data: configData } = useHamperConfig()
  const conversionFee: number = configData?.config?.conversionFee ?? 150
  const [productSearch, setProductSearch] = useState('')
  const [addonSearch, setAddonSearch] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [inspirationReels, setInspirationReels] = useState<string[]>([])
  const [newReel, setNewReel] = useState('')

  const { data: productsData } = useProducts()
  const { data: addonsData } = useAddons()
  const createMutation = useAdminCreateHamper()
  const updateMutation = useAdminUpdateHamper()
  const isPending = createMutation.isPending || updateMutation.isPending

  // Populate form when opening for edit
  useMemo(() => {
    if (!open) return
    setSubmitError('')
    setProductSearch('')
    setAddonSearch('')
    if (editing) {
      setForm({
        title: editing.title ?? '',
        theme: editing.theme ?? '',
        customMessage: editing.customMessage ?? '',
        status: editing.status ?? 'active',
        visibility: editing.visibility ?? 'private',
        selectedProducts: (editing.products ?? []).map((p: any) => ({
          productId: p.product?._id ?? p.product,
          title: p.snapshot?.title ?? p.product?.title ?? '',
          price: p.snapshot?.price ?? p.product?.price ?? 0,
          quantity: p.quantity ?? 1,
        })),
        selectedAddons: (editing.addons ?? []).map((a: any) => ({
          addonId: a.addon?._id ?? a.addon,
          title: a.snapshot?.title ?? a.addon?.title ?? '',
          price: a.snapshot?.price ?? a.addon?.price ?? 0,
          inputType: a.snapshot?.inputType ?? a.addon?.inputType ?? 'standard',
          allowQuantity: a.addon?.allowQuantity ?? false,
          quantity: a.quantity ?? 1,
        })),
      })
      setInspirationReels(editing.inspirationReels ?? [])
    } else {
      setForm(EMPTY_FORM)
      setInspirationReels([])
    }
  }, [open, editing])

  const allProducts: any[] = Array.isArray(productsData) ? productsData : (productsData?.products ?? [])
  const allAddons: any[] = addonsData?.addons ?? []

  const filteredProducts = allProducts.filter(
    (p: any) =>
      p.title?.toLowerCase().includes(productSearch.toLowerCase()) &&
      !form.selectedProducts.find((sp) => sp.productId === p._id)
  )

  const filteredAddons = allAddons.filter(
    (a: any) =>
      a.isActive &&
      a.title?.toLowerCase().includes(addonSearch.toLowerCase()) &&
      !form.selectedAddons.find((sa) => sa.addonId === a._id)
  )

  const addProduct = (p: any) => {
    setForm((prev) => ({
      ...prev,
      selectedProducts: [...prev.selectedProducts, { productId: p._id, title: p.title, price: p.price, quantity: 1 }],
    }))
    setProductSearch('')
  }

  const removeProduct = (id: string) =>
    setForm((prev) => ({ ...prev, selectedProducts: prev.selectedProducts.filter((p) => p.productId !== id) }))

  const updateProductQty = (id: string, qty: number) =>
    setForm((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.map((p) => p.productId === id ? { ...p, quantity: Math.max(1, qty) } : p),
    }))

  const addAddon = (a: any) => {
    setForm((prev) => ({
      ...prev,
      selectedAddons: [...prev.selectedAddons, {
        addonId: a._id, title: a.title,
        price: a.pricingType === 'free' ? 0 : a.price,
        inputType: a.inputType ?? 'standard',
        allowQuantity: a.allowQuantity ?? false,
        quantity: 1,
      }],
    }))
    setAddonSearch('')
  }

  const removeAddon = (id: string) =>
    setForm((prev) => ({ ...prev, selectedAddons: prev.selectedAddons.filter((a) => a.addonId !== id) }))

  const updateAddonQty = (id: string, qty: number) =>
    setForm((prev) => ({
      ...prev,
      selectedAddons: prev.selectedAddons.map((a) => a.addonId === id ? { ...a, quantity: Math.max(1, qty) } : a),
    }))

  const productsTotal = form.selectedProducts.reduce((s, p) => s + p.price * p.quantity, 0)
  const addonsTotal = form.selectedAddons.reduce((s, a) => s + a.price * a.quantity, 0)
  const grandTotal = productsTotal + addonsTotal + conversionFee

  const handleSubmit = async () => {
    if (!form.title.trim()) { setSubmitError('Title is required'); return }
    if (!form.selectedProducts.length) { setSubmitError('Add at least one product'); return }
    setSubmitError('')

    const payload = {
      title: form.title,
      theme: form.theme,
      customMessage: form.customMessage,
      status: form.status,
      visibility: form.visibility,
      products: form.selectedProducts.map((p) => ({ product: p.productId, quantity: p.quantity })),
      addons: form.selectedAddons.map((a) => ({ addon: a.addonId, quantity: a.quantity })),
      inspirationReels,
    }

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing._id, payload })
        toast.success('Hamper updated')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success('Hamper created')
      }
      onClose()
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message ?? 'Something went wrong')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl border border-zinc-200 shadow-2xl gap-0">
        <DialogTitle className="sr-only">{editing ? 'Edit hamper' : 'Create hamper'}</DialogTitle>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
              <Gift className="w-4.5 h-4.5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-zinc-900">{editing ? 'Edit Hamper' : 'Create Hamper'}</h2>
              <p className="text-[12px] text-zinc-400 mt-0.5">Curate products and add-ons for this gift set</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <ScrollArea className="max-h-[75vh]">
          <div className="px-6 py-5 space-y-6">

            {submitError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-[13px]">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{submitError}
              </div>
            )}

            {/* Basic info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-[12px] font-medium text-zinc-600">Title <span className="text-red-500">*</span></label>
                <Input
                  placeholder="e.g. Anniversary Gift Set"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="h-10 text-[13px] border-zinc-200 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-zinc-600">Theme <span className="text-zinc-400 font-normal">(optional)</span></label>
                <Input
                  placeholder="e.g. Romantic, Minimal..."
                  value={form.theme}
                  onChange={(e) => setForm((p) => ({ ...p, theme: e.target.value }))}
                  className="h-10 text-[13px] border-zinc-200 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-zinc-600">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as any }))}
                  className="w-full h-10 text-[13px] border border-zinc-200 rounded-xl px-3 bg-white"
                >
                  {['draft', 'active', 'ordered', 'abandoned'].map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-zinc-600">Visibility</label>
                <select
                  value={form.visibility}
                  onChange={(e) => setForm((p) => ({ ...p, visibility: e.target.value as any }))}
                  className="w-full h-10 text-[13px] border border-zinc-200 rounded-xl px-3 bg-white"
                >
                  <option value="private">Private</option>
                  <option value="public">Public — shows as ready-made template</option>
                  <option value="featured">Featured — highlighted template</option>
                </select>
                {(form.visibility === 'public' || form.visibility === 'featured') && (
                  <p className="text-[11px] text-amber-600 flex items-center gap-1">
                    <Eye className="h-3 w-3" /> This hamper will appear in the "Ready-Made Hamper" customer flow.
                  </p>
                )}
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-[12px] font-medium text-zinc-600">Gift message <span className="text-zinc-400 font-normal">(optional)</span></label>
                <textarea
                  placeholder="A personal message for this hamper..."
                  value={form.customMessage}
                  onChange={(e) => setForm((p) => ({ ...p, customMessage: e.target.value }))}
                  rows={2}
                  className="w-full text-[13px] border border-zinc-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>
              {/* Reels Inspo */}
              <div className="space-y-1.5 col-span-2">
                <label className="text-[12px] font-medium text-zinc-600">Instagram Reels Inspo <span className="text-zinc-400 font-normal">(optional)</span></label>
                <div className="flex gap-2">
                  <input
                    placeholder="https://www.instagram.com/reel/..."
                    value={newReel}
                    onChange={e => setNewReel(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newReel.trim()) {
                        setInspirationReels(prev => [...prev, newReel.trim()])
                        setNewReel('')
                      }
                    }}
                    className="flex-1 h-9 text-[13px] border border-zinc-200 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                  <button
                    type="button"
                    onClick={() => { if (newReel.trim()) { setInspirationReels(prev => [...prev, newReel.trim()]); setNewReel('') } }}
                    className="h-9 px-3 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-600 hover:bg-zinc-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {inspirationReels.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-1">
                    {inspirationReels.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 bg-pink-50 border border-pink-100 rounded-lg px-3 py-1.5 text-[11px] text-pink-700">
                        <span className="flex-1 truncate">{r}</span>
                        <button onClick={() => setInspirationReels(prev => prev.filter((_, idx) => idx !== i))} className="text-pink-400 hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Products */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-semibold text-zinc-700 uppercase tracking-wide">
                  Products <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-zinc-400">{form.selectedProducts.length} selected</span>
              </div>

              {/* Selected products */}
              {form.selectedProducts.length > 0 && (
                <div className="space-y-2">
                  {form.selectedProducts.map((p) => (
                    <div key={p.productId} className="flex items-center gap-3 bg-amber-50 rounded-xl border border-amber-100 px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-zinc-800 truncate">{p.title}</p>
                        <p className="text-[11px] text-zinc-500">₹{p.price} × {p.quantity} = ₹{(p.price * p.quantity).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateProductQty(p.productId, p.quantity - 1)} className="w-6 h-6 rounded-md bg-white border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50">−</button>
                        <span className="w-6 text-center text-[13px] font-medium">{p.quantity}</span>
                        <button onClick={() => updateProductQty(p.productId, p.quantity + 1)} className="w-6 h-6 rounded-md bg-white border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50">+</button>
                      </div>
                      <button onClick={() => removeProduct(p.productId)} className="text-red-400 hover:text-red-600 ml-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Product search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <Input
                  placeholder="Search products to add..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-8 h-9 text-[13px] border-zinc-200 rounded-xl"
                />
              </div>
              {productSearch && filteredProducts.length > 0 && (
                <div className="border border-zinc-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  {filteredProducts.slice(0, 8).map((p: any) => (
                    <button
                      key={p._id}
                      onClick={() => addProduct(p)}
                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-zinc-50 text-left border-b border-zinc-100 last:border-0"
                    >
                      <span className="text-[13px] text-zinc-700 truncate">{p.title}</span>
                      <span className="text-[12px] text-zinc-500 ml-2 shrink-0">₹{p.price}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Addons */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-semibold text-zinc-700 uppercase tracking-wide">Add-ons</label>
                <span className="text-[11px] text-zinc-400">{form.selectedAddons.length} selected</span>
              </div>

              {form.selectedAddons.length > 0 && (
                <div className="space-y-2">
                  {form.selectedAddons.map((a) => (
                    <div key={a.addonId} className="flex items-center gap-3 bg-zinc-50 rounded-xl border border-zinc-100 px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-zinc-800 truncate">{a.title}</p>
                        <p className="text-[11px] text-zinc-500">
                          {a.price === 0 ? 'Free' : `₹${a.price} × ${a.quantity} = ₹${(a.price * a.quantity).toLocaleString('en-IN')}`}
                          {a.inputType !== 'standard' && <span className="ml-1.5 text-blue-500">{a.inputType === 'message' ? '✍ message' : '📷 photos'}</span>}
                        </p>
                      </div>
                      {a.allowQuantity && (
                        <div className="flex items-center gap-1">
                          <button onClick={() => updateAddonQty(a.addonId, a.quantity - 1)} className="w-6 h-6 rounded-md bg-white border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50">−</button>
                          <span className="w-6 text-center text-[13px] font-medium">{a.quantity}</span>
                          <button onClick={() => updateAddonQty(a.addonId, a.quantity + 1)} className="w-6 h-6 rounded-md bg-white border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50">+</button>
                        </div>
                      )}
                      <button onClick={() => removeAddon(a.addonId)} className="text-red-400 hover:text-red-600 ml-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <Input
                  placeholder="Search add-ons to include..."
                  value={addonSearch}
                  onChange={(e) => setAddonSearch(e.target.value)}
                  className="pl-8 h-9 text-[13px] border-zinc-200 rounded-xl"
                />
              </div>
              {addonSearch && filteredAddons.length > 0 && (
                <div className="border border-zinc-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                  {filteredAddons.slice(0, 6).map((a: any) => (
                    <button
                      key={a._id}
                      onClick={() => addAddon(a)}
                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-zinc-50 text-left border-b border-zinc-100 last:border-0"
                    >
                      <span className="text-[13px] text-zinc-700 truncate">{a.title}</span>
                      <span className="text-[12px] text-zinc-500 ml-2 shrink-0">
                        {a.pricingType === 'free' ? 'Free' : `₹${a.price}`}
                        {a.inputType !== 'standard' && <span className="ml-1">{a.inputType === 'message' ? '✍' : '📷'}</span>}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing summary */}
            <div className="bg-amber-50 rounded-xl border border-amber-100 p-4 space-y-2 text-[13px]">
              <p className="font-semibold text-amber-900 text-[12px] uppercase tracking-wide mb-3">Pricing Summary</p>
              <div className="flex justify-between text-zinc-600">
                <span>Products</span>
                <span>₹{productsTotal.toLocaleString('en-IN')}</span>
              </div>
              {addonsTotal > 0 && (
                <div className="flex justify-between text-zinc-600">
                  <span>Add-ons</span>
                  <span>₹{addonsTotal.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-600">
                <span>Gift hamper fee</span>
                <span>₹{conversionFee}</span>
              </div>
              <div className="flex justify-between font-bold text-amber-800 border-t border-amber-200 pt-2 mt-1">
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/60">
          <button onClick={onClose} disabled={isPending} className="text-[13px] text-zinc-500 hover:text-zinc-800 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className={cn(
              'flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold transition-all min-w-[140px] justify-center',
              isPending ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed' : 'bg-zinc-900 text-white hover:bg-zinc-700'
            )}
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isPending ? 'Saving…' : editing ? 'Save changes' : 'Create hamper'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Hamper Card ──────────────────────────────────────────────────────────────

function HamperCard({ hamper, onEdit, onDelete }: { hamper: any; onEdit: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const { mutate: updateStatus } = useUpdateHamperStatus()

  const pricing = hamper.pricing ?? {}
  const total = pricing.total ?? 0
  const convFee = pricing.conversionFee ?? pricing.packagingFee ?? 0

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-zinc-900 text-sm truncate">{hamper.title || 'Untitled Hamper'}</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[hamper.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {hamper.status}
              </span>
              {hamper.source && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 font-medium">
                  {SOURCE_LABELS[hamper.source] ?? hamper.source}
                </span>
              )}
              {(hamper.visibility === 'public' || hamper.visibility === 'featured') && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${hamper.visibility === 'featured' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                  <Eye className="h-2.5 w-2.5" />
                  {hamper.visibility === 'featured' ? 'Featured Template' : 'Public Template'}
                </span>
              )}
            </div>
            {hamper.createdBy && (
              <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                <User className="h-3 w-3" />
                {hamper.createdBy.name ?? hamper.createdBy.email ?? 'Unknown'}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-zinc-100 text-blue-600 transition-colors">
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-zinc-100 text-red-500 transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Pricing row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-zinc-50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-zinc-400">Products</p>
            <p className="text-xs font-semibold text-zinc-700">₹{(pricing.productsTotal ?? 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-zinc-50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-zinc-400">Add-ons</p>
            <p className="text-xs font-semibold text-zinc-700">₹{(pricing.addonsTotal ?? 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-amber-600">Total</p>
            <p className="text-xs font-bold text-amber-700">₹{total.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[11px] text-zinc-400 flex items-center gap-1">
            <Calendar className="h-3 w-3" />{fmtDate(hamper.createdAt)}
          </p>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-[11px] text-zinc-500 hover:text-zinc-800 flex items-center gap-1"
          >
            {expanded ? <><ChevronUp className="h-3 w-3" />Hide</> : <><ChevronDown className="h-3 w-3" />Details</>}
          </button>
        </div>

        {expanded && (
          <div className="mt-4 border-t border-zinc-100 pt-4 space-y-3">
            {hamper.products?.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1">
                  <Package className="h-3 w-3" /> Products ({hamper.products.length})
                </p>
                {hamper.products.map((p: any, i: number) => (
                  <p key={i} className="text-[12px] text-zinc-600 py-0.5">
                    {p.snapshot?.title ?? p.product?.title} × {p.quantity} — ₹{((p.snapshot?.price ?? p.product?.price ?? 0) * p.quantity).toLocaleString('en-IN')}
                  </p>
                ))}
              </div>
            )}
            {hamper.addons?.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Add-ons ({hamper.addons.length})
                </p>
                {hamper.addons.map((a: any, i: number) => (
                  <div key={i} className="py-1">
                    <p className="text-[12px] text-zinc-600">
                      {a.snapshot?.title ?? a.addon?.title} × {a.quantity}
                      {a.snapshot?.inputType === 'message' && ' (✍ message)'}
                      {a.snapshot?.inputType === 'image_upload' && ' (📷 photos)'}
                      {' — '}{a.snapshot?.price === 0 ? 'Free' : `₹${((a.snapshot?.price ?? 0) * a.quantity).toLocaleString('en-IN')}`}
                    </p>
                    {a.inputValue && (
                      <p className="text-[11px] text-zinc-500 italic mt-0.5 pl-2 border-l-2 border-amber-200">"{a.inputValue}"</p>
                    )}
                    {a.uploadedImages?.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {a.uploadedImages.map((url: string, j: number) => (
                          <div key={j} className="relative group">
                            <img src={imgUrl(url)} alt={`upload-${j}`} className="w-12 h-12 object-cover rounded border border-zinc-200" />
                            <a
                              href={imgUrl(url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                              title="Download"
                            >
                              <Download className="h-3.5 w-3.5 text-white" />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {hamper.customMessage && (
              <p className="text-[12px] text-zinc-500 italic border-l-2 border-amber-200 pl-3">"{hamper.customMessage}"</p>
            )}
            {/* Status buttons */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Update status</p>
              <div className="flex flex-wrap gap-1.5">
                {['draft', 'active', 'ordered', 'abandoned'].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus({ id: hamper._id, status: s })}
                    className={cn(
                      'text-[11px] px-2.5 py-1 rounded-full border font-medium transition-colors',
                      hamper.status === s
                        ? STATUS_COLORS[s] + ' border-current'
                        : 'border-zinc-200 text-zinc-500 hover:border-zinc-400'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function HampersPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState<DateFilterState>({ from: '', to: '', preset: '' })
  const [modalOpen, setModalOpen] = useState(false)
  const [editingHamper, setEditingHamper] = useState<any>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const params = useMemo(() => {
    const p: any = {}
    if (statusFilter !== 'all') p.status = statusFilter
    if (sourceFilter !== 'all') p.source = sourceFilter
    return p
  }, [statusFilter, sourceFilter])

  const { data, isLoading, refetch } = useAllHampers(params)
  const deleteMutation = useAdminDeleteHamper()

  const hampers: any[] = data?.hampers ?? []

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return hampers.filter((h) => {
      if (q && !(
        h.title?.toLowerCase().includes(q) ||
        h.createdBy?.name?.toLowerCase().includes(q) ||
        h.createdBy?.email?.toLowerCase().includes(q)
      )) return false
      if (!isInDateRange(h.createdAt, dateFilter.from, dateFilter.to, dateFilter.preset)) return false
      return true
    })
  }, [hampers, search, dateFilter])

  const stats = useMemo(() => ({
    total: hampers.length,
    active: hampers.filter((h) => h.status === 'active').length,
    ordered: hampers.filter((h) => h.status === 'ordered').length,
    orderedRevenue: hampers.filter((h) => h.status === 'ordered').reduce((s, h) => s + (h.pricing?.total ?? 0), 0),
  }), [hampers])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this hamper? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Hamper deleted')
    } catch {
      toast.error('Failed to delete hamper')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Gift className="h-6 w-6 text-amber-600" /> Hampers
          </h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage gift hampers</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button size="sm" onClick={() => { setEditingHamper(null); setModalOpen(true) }} className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white">
            <Plus className="h-3.5 w-3.5" /> New Hamper
          </Button>
        </div>
      </div>

      {/* Config Panel */}
      <HamperConfigPanel />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total },
          { label: 'Active', value: stats.active },
          { label: 'Ordered', value: stats.ordered },
          { label: 'Revenue', value: `₹${stats.orderedRevenue.toLocaleString('en-IN')}` },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{s.label}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 w-64"
          />
        </div>
        <div className="flex gap-1">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn('px-3 py-1.5 text-xs rounded-lg font-medium transition-colors', statusFilter === s ? 'bg-amber-100 text-amber-800' : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-300')}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {SOURCE_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setSourceFilter(s)}
              className={cn('px-3 py-1.5 text-xs rounded-lg font-medium transition-colors', sourceFilter === s ? 'bg-zinc-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400')}
            >
              {SOURCE_LABELS[s] ?? s}
            </button>
          ))}
        </div>
        <DateFilter value={dateFilter} onChange={setDateFilter} />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-40 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Gift className="h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-semibold text-gray-600">No hampers found</h3>
          <p className="text-sm text-gray-400 mt-1">Create your first hamper to get started.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((hamper) => (
            <HamperCard
              key={hamper._id}
              hamper={hamper}
              onEdit={() => { setEditingHamper(hamper); setModalOpen(true) }}
              onDelete={() => handleDelete(hamper._id)}
            />
          ))}
        </div>
      )}

      <HamperModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingHamper(null) }}
        editing={editingHamper}
      />
    </div>
  )
}
