'use client'

import { useMemo, useState } from 'react'

import {
  Gift,
  Plus,
  Search,
  Trash2,
  Edit2,
  Sparkles,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

import {
  useAddons,
  useDeleteAddon,
} from '@/hooks/useAddons'

import { AddonModal } from '@/components/addons/addon-modal'
import { imgUrl } from '@/lib/utils'

export default function AddonsPage() {
  const { data, isLoading } =
    useAddons()

  const addons = data?.addons || []

  const [search, setSearch] = useState('')

  const [isModalOpen, setIsModalOpen] =
    useState(false)

  const [editingAddon, setEditingAddon] =
    useState<any>(null)

  const { mutateAsync: deleteAddon } =
    useDeleteAddon()

  const filteredAddons = useMemo(() => {
    return addons.filter((addon: any) =>
      addon.title
        ?.toLowerCase()
        .includes(search.toLowerCase())
    )
  }, [addons, search])

  const handleDelete = async (id: string) => {
    const confirmed = confirm(
      'Delete this addon?'
    )

    if (!confirmed) return

    try {
      await deleteAddon(id)
    } catch (err) {
      console.error(err)
    }
  }

  if (isLoading) {
    return (
      <div className='p-10 text-zinc-500'>
        Loading addons...
      </div>
    )
  }

  return (
    <>
      <div className='min-h-screen bg-zinc-50 p-6'>
        <div className='max-w-7xl mx-auto'>
          {/* HEADER */}

          <div className='flex items-center justify-between mb-8'>
            <div>
              <h1 className='text-3xl font-bold flex items-center gap-3'>
                <Gift className='w-8 h-8 text-pink-500' />
                Addons
              </h1>

              <p className='text-zinc-500 mt-2'>
                Manage gifting add-ons.
              </p>
            </div>

            <Button
              onClick={() => {
                setEditingAddon(null)
                setIsModalOpen(true)
              }}
              className='bg-black hover:bg-zinc-800'
            >
              <Plus className='w-4 h-4 mr-2' />
              Add Addon
            </Button>
          </div>

          {/* SEARCH */}

          <div className='bg-white rounded-2xl border border-zinc-200 p-4 mb-6'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400' />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder='Search addons...'
                className='w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-2xl'
              />
            </div>
          </div>

          {/* GRID */}

          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6'>
            {filteredAddons.map((addon: any) => (
              <div
                key={addon._id}
                className='bg-white rounded-3xl border border-zinc-200 overflow-hidden hover:shadow-xl transition-all'
              >
                {/* IMAGE */}

                <div className='aspect-square bg-zinc-100 overflow-hidden'>
                  {addon.images?.[0]?.url ? (
                    <img
                      src={imgUrl(addon.images[0].url)}
                      alt={addon.title}
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center'>
                      <Sparkles className='w-10 h-10 text-zinc-300' />
                    </div>
                  )}
                </div>

                {/* CONTENT */}

                <div className='p-5'>
                  <div className='flex items-start justify-between mb-4'>
                    <div>
                      <h2 className='font-semibold text-zinc-900'>
                        {addon.title}
                      </h2>

                      <p className='text-sm text-zinc-500 mt-1 line-clamp-2'>
                        {addon.description}
                      </p>
                    </div>
                  </div>

                  {/* PRICE + TYPE BADGES */}
                  <div className='mb-4 flex flex-wrap gap-2'>
                    {addon.pricingType === 'free' ? (
                      <span className='inline-flex px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium'>
                        Free
                      </span>
                    ) : (
                      <span className='inline-flex px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-medium'>
                        ₹{addon.price}{addon.allowQuantity ? ' / unit' : ''}
                      </span>
                    )}
                    {addon.inputType === 'message' && (
                      <span className='inline-flex px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium'>
                        ✍ Message
                      </span>
                    )}
                    {addon.inputType === 'image_upload' && (
                      <span className='inline-flex px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium'>
                        📷 Photos
                      </span>
                    )}
                    {addon.allowQuantity && (
                      <span className='inline-flex px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium'>
                        Qty up to {addon.maxQuantity}
                      </span>
                    )}
                  </div>

                  {/* FOOTER */}

                  <div className='flex items-center justify-between'>
                    <div>
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          addon.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {addon.isActive
                          ? 'Active'
                          : 'Inactive'}
                      </span>
                    </div>

                    <div className='flex items-center gap-2'>
                      <button
                        onClick={() => {
                          setEditingAddon(
                            addon
                          )

                          setIsModalOpen(true)
                        }}
                        className='p-2 rounded-xl hover:bg-zinc-100 transition'
                      >
                        <Edit2 className='w-4 h-4 text-blue-600' />
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            addon._id
                          )
                        }
                        className='p-2 rounded-xl hover:bg-zinc-100 transition'
                      >
                        <Trash2 className='w-4 h-4 text-red-600' />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AddonModal
        isOpen={isModalOpen}
        onClose={() =>
          setIsModalOpen(false)
        }
        editingAddon={editingAddon}
      />
    </>
  )
}