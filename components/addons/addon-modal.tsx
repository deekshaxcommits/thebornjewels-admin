'use client'

import { useEffect, useRef, useState, useCallback, KeyboardEvent } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCreateAddon, useUpdateAddon } from '@/hooks/useAddons'
import { Package, X, Upload, Loader2, ImagePlus, AlertCircle } from 'lucide-react'
import { cn, imgUrl } from '@/lib/utils'

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface AddonImage {
  url: string
  key?: string
  file?: File
  uploading?: boolean
  error?: string
}

interface FormData {
  title: string
  description: string
  pricingType: 'free' | 'paid'
  price: string
  inputType: 'standard' | 'message' | 'image_upload'
  allowQuantity: boolean
  maxQuantity: string
}

interface FormErrors {
  title?: string
  price?: string
}

interface AddonModalProps {
  isOpen: boolean
  onClose: () => void
  editingAddon?: any
}

const MAX_IMAGES = 4
const MAX_FILE_SIZE_MB = 5

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export function AddonModal({ isOpen, onClose, editingAddon }: AddonModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    pricingType: 'paid',
    price: '',
    inputType: 'standard',
    allowQuantity: false,
    maxQuantity: '10',
  })
  const [images, setImages] = useState<AddonImage[]>([])
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  const { mutateAsync: createAddon, isPending: creating } = useCreateAddon()
  const { mutateAsync: updateAddon, isPending: updating } = useUpdateAddon()
  const isPending = creating || updating

  /* ── Reset / populate on open ── */
  useEffect(() => {
    if (!isOpen) return
    setErrors({})
    setSubmitError(null)

    if (!editingAddon) {
      setFormData({ title: '', description: '', pricingType: 'paid', price: '', inputType: 'standard', allowQuantity: false, maxQuantity: '10' })
      setImages([])
    } else {
      setFormData({
        title: editingAddon.title ?? '',
        description: editingAddon.description ?? '',
        pricingType: editingAddon.pricingType ?? 'paid',
        price: editingAddon.price != null ? String(editingAddon.price) : '',
        inputType: editingAddon.inputType ?? 'standard',
        allowQuantity: editingAddon.allowQuantity ?? false,
        maxQuantity: editingAddon.maxQuantity != null ? String(editingAddon.maxQuantity) : '10',
      })
      setImages(
        (editingAddon.images ?? []).map((img: any) => ({ url: img.url, key: img.key }))
      )
    }

    // Focus title after transition
    setTimeout(() => titleRef.current?.focus(), 80)
  }, [isOpen, editingAddon])

  /* ── Validation ── */
  const validate = (): boolean => {
    const next: FormErrors = {}
    if (!formData.title.trim()) next.title = 'Title is required'
    if (formData.pricingType === 'paid') {
      const p = Number(formData.price)
      if (!formData.price.trim() || isNaN(p) || p < 0) next.price = 'Enter a valid price'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  /* ── Image handling ── */
  const processFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files)
      const remaining = MAX_IMAGES - images.length
      if (remaining <= 0) return

      list.slice(0, remaining).forEach((file) => {
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return // silently skip oversized; show inline error per image if needed
        if (!file.type.startsWith('image/')) return

        const url = URL.createObjectURL(file)
        const newImage: AddonImage = { url, file, uploading: false }
        setImages((prev) => [...prev, newImage])
      })
    },
    [images.length]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    processFiles(e.dataTransfer.files)
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      const next = [...prev]
      const removed = next.splice(index, 1)[0]
      if (removed.file) URL.revokeObjectURL(removed.url)
      return next
    })
  }

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitError(null)
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        pricingType: formData.pricingType,
        price: formData.pricingType === 'free' ? 0 : Number(formData.price),
        inputType: formData.inputType,
        allowQuantity: formData.allowQuantity,
        maxQuantity: Number(formData.maxQuantity) || 10,
        images: images
          .filter((img) => !img.file)
          .map(({ url, key }) => ({ url, key })),
      }
      if (editingAddon) {
        await updateAddon({ id: editingAddon._id, payload })
      } else {
        await createAddon(payload)
      }
      onClose()
    } catch (err: any) {
      setSubmitError(err?.message ?? 'Something went wrong. Please try again.')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
  }

  /* ── Field helpers ── */
  const field = (key: keyof FormData) => ({
    value: formData[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [key]: e.target.value }))
      if (errors[key as keyof FormErrors]) setErrors((prev) => ({ ...prev, [key]: undefined }))
    },
  })

  const canUploadMore = images.length < MAX_IMAGES

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-[500px] p-0 overflow-hidden rounded-2xl border border-zinc-200/80 shadow-2xl gap-0 focus:outline-none"
        onKeyDown={handleKeyDown}
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">
          {editingAddon ? 'Edit addon' : 'Create addon'}
        </DialogTitle>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
              <Package className="w-4.5 h-4.5 text-teal-600" aria-hidden />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-zinc-900 leading-none">
                {editingAddon ? 'Edit addon' : 'New addon'}
              </h2>
              <p className="text-[12px] text-zinc-400 mt-0.5">
                Optional extra customers can add to gift sets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            aria-label="Close modal"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <ScrollArea className="max-h-[calc(90vh-130px)]">
          <div className="px-6 py-5 space-y-5">

            {/* Submit error */}
            {submitError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="text-[13px] leading-relaxed">{submitError}</p>
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <Label
                htmlFor="addon-title"
                className="text-[12px] font-medium text-zinc-600"
              >
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="addon-title"
                ref={titleRef}
                placeholder="e.g., Luxury Candle"
                autoComplete="off"
                aria-required="true"
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? 'addon-title-error' : undefined}
                className={cn(
                  'h-10 text-[13px] border-zinc-200 rounded-xl focus-visible:ring-2 focus-visible:ring-teal-500/30 focus-visible:border-teal-500 transition-colors',
                  errors.title && 'border-red-400 focus-visible:ring-red-200 focus-visible:border-red-400'
                )}
                {...field('title')}
              />
              {errors.title && (
                <p id="addon-title-error" className="text-[11.5px] text-red-500 flex items-center gap-1" role="alert">
                  <AlertCircle className="w-3 h-3" />{errors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label
                htmlFor="addon-description"
                className="text-[12px] font-medium text-zinc-600"
              >
                Description
                <span className="ml-1.5 font-normal text-zinc-400">(optional)</span>
              </Label>
              <Textarea
                id="addon-description"
                placeholder="What makes this addon special…"
                rows={3}
                className="text-[13px] border-zinc-200 rounded-xl resize-none focus-visible:ring-2 focus-visible:ring-teal-500/30 focus-visible:border-teal-500 transition-colors leading-relaxed"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              <Label className="text-[12px] font-medium text-zinc-600">Pricing</Label>
              <div
                className="grid grid-cols-2 gap-2"
                role="radiogroup"
                aria-label="Pricing type"
              >
                {(['free', 'paid'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    role="radio"
                    aria-checked={formData.pricingType === type}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        pricingType: type,
                        price: type === 'free' ? '0' : prev.price,
                      }))
                    }
                    className={cn(
                      'py-2.5 rounded-xl border text-[13px] font-medium capitalize transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40',
                      formData.pricingType === type
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700'
                    )}
                  >
                    {type === 'free' ? 'Free' : 'Paid'}
                  </button>
                ))}
              </div>
            </div>

            {/* Price input */}
            {formData.pricingType === 'paid' && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="addon-price"
                  className="text-[12px] font-medium text-zinc-600"
                >
                  Price <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-zinc-400 font-medium pointer-events-none select-none">
                    ₹
                  </span>
                  <Input
                    id="addon-price"
                    type="number"
                    min={0}
                    step={1}
                    placeholder="0"
                    aria-required="true"
                    aria-invalid={!!errors.price}
                    aria-describedby={errors.price ? 'addon-price-error' : undefined}
                    className={cn(
                      'h-10 pl-7 text-[13px] border-zinc-200 rounded-xl focus-visible:ring-2 focus-visible:ring-teal-500/30 focus-visible:border-teal-500 transition-colors',
                      errors.price && 'border-red-400 focus-visible:ring-red-200 focus-visible:border-red-400'
                    )}
                    {...field('price')}
                  />
                </div>
                {errors.price && (
                  <p id="addon-price-error" className="text-[11.5px] text-red-500 flex items-center gap-1" role="alert">
                    <AlertCircle className="w-3 h-3" />{errors.price}
                  </p>
                )}
              </div>
            )}

            {/* Input Type */}
            <div className="space-y-2">
              <Label className="text-[12px] font-medium text-zinc-600">Addon Type</Label>
              <p className="text-[11px] text-zinc-400">How does the customer interact with this addon?</p>
              <div className="grid grid-cols-3 gap-2" role="radiogroup">
                {([
                  { value: 'standard', label: 'Standard', desc: 'Just select it' },
                  { value: 'message', label: 'Message', desc: 'Customer writes text' },
                  { value: 'image_upload', label: 'Photos', desc: 'Customer uploads images' },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={formData.inputType === opt.value}
                    onClick={() => setFormData((prev) => ({ ...prev, inputType: opt.value }))}
                    className={cn(
                      'py-2 px-2 rounded-xl border text-center text-[12px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40',
                      formData.inputType === opt.value
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-zinc-200 text-zinc-500 hover:border-zinc-300'
                    )}
                  >
                    <p className="font-medium">{opt.label}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Allow Quantity */}
            <div className="flex items-center justify-between bg-zinc-50 rounded-xl border border-zinc-200 px-4 py-3">
              <div>
                <p className="text-[13px] font-medium text-zinc-700">Allow quantity selection</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">e.g. polaroids — ₹10 per piece</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, allowQuantity: !prev.allowQuantity }))}
                className={cn(
                  'relative w-10 h-5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50',
                  formData.allowQuantity ? 'bg-teal-500' : 'bg-zinc-300'
                )}
                role="switch"
                aria-checked={formData.allowQuantity}
              >
                <span className={cn(
                  'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                  formData.allowQuantity ? 'translate-x-5' : 'translate-x-0.5'
                )} />
              </button>
            </div>

            {/* Max Quantity */}
            {formData.allowQuantity && (
              <div className="space-y-1.5">
                <Label htmlFor="addon-max-qty" className="text-[12px] font-medium text-zinc-600">
                  Max quantity per order
                </Label>
                <Input
                  id="addon-max-qty"
                  type="number"
                  min={1}
                  max={100}
                  placeholder="10"
                  className="h-10 text-[13px] border-zinc-200 rounded-xl w-32"
                  value={formData.maxQuantity}
                  onChange={(e) => setFormData((prev) => ({ ...prev, maxQuantity: e.target.value }))}
                />
              </div>
            )}

            {/* Images */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[12px] font-medium text-zinc-600">
                  Images
                  <span className="ml-1.5 font-normal text-zinc-400">(up to {MAX_IMAGES})</span>
                </Label>
                <span className="text-[11px] text-zinc-400">{images.length}/{MAX_IMAGES}</span>
              </div>

              {/* Image grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {images.map((img, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-xl overflow-hidden border border-zinc-200 relative group"
                    >
                      <img
                        src={imgUrl(img.url)}
                        alt={`Addon image ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {img.uploading && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                          <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />
                        </div>
                      )}
                      <button
                        onClick={() => removeImage(i)}
                        aria-label={`Remove image ${i + 1}`}
                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Drop zone */}
              {canUploadMore && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? fileInputRef.current?.click() : undefined}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload images — click or drag and drop"
                  className={cn(
                    'border-2 border-dashed rounded-xl py-6 flex flex-col items-center gap-2 cursor-pointer transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40',
                    isDragging
                      ? 'border-teal-400 bg-teal-50'
                      : 'border-zinc-200 hover:border-teal-300 hover:bg-teal-50/50'
                  )}
                >
                  <div className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
                    isDragging ? 'bg-teal-100' : 'bg-zinc-100'
                  )}>
                    <ImagePlus className={cn('w-4.5 h-4.5', isDragging ? 'text-teal-600' : 'text-zinc-400')} />
                  </div>
                  <div className="text-center">
                    <p className="text-[13px] font-medium text-zinc-600">
                      {isDragging ? 'Drop to upload' : 'Click or drag to upload'}
                    </p>
                    <p className="text-[11.5px] text-zinc-400 mt-0.5">
                      PNG, JPG, WebP · max {MAX_FILE_SIZE_MB}MB each
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileChange}
                    aria-hidden="true"
                    tabIndex={-1}
                  />
                </div>
              )}
            </div>

          </div>
        </ScrollArea>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between gap-3 bg-zinc-50/60">
          <button
            onClick={onClose}
            disabled={isPending}
            className="text-[13px] text-zinc-500 hover:text-zinc-800 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded px-1"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              ⌘ + Enter to save
            </p>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className={cn(
                'flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold transition-all min-w-[130px] justify-center',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50',
                isPending
                  ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                  : 'bg-zinc-900 text-white hover:bg-zinc-700 active:scale-[0.98]'
              )}
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isPending ? 'Saving…' : editingAddon ? 'Update addon' : 'Create addon'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}