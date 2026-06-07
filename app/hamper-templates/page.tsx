'use client'

import { useMemo, useState } from 'react'

import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Gift,
  Package,
  Sparkles,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

import {
  useDeleteHamperTemplate,
  useHamperTemplates,
} from '@/hooks/useHamperTemplates'

import { HamperTemplateModal } from '@/components/hamper-templates/hamper-template-modal'
import { imgUrl } from '@/lib/utils'

export default function HamperTemplatesPage() {
  const { data, isLoading } =
    useHamperTemplates()

  const templates = data?.templates || []

  const [search, setSearch] = useState('')

  const [isModalOpen, setIsModalOpen] =
    useState(false)

  const [editingTemplate, setEditingTemplate] =
    useState<any>(null)

  const { mutateAsync: deleteTemplate } =
    useDeleteHamperTemplate()

  const filteredTemplates = useMemo(() => {
    return templates.filter((template: any) => {
      return (
        template.title
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        template.theme
          ?.toLowerCase()
          .includes(search.toLowerCase())
      )
    })
  }, [templates, search])

  const handleDelete = async (id: string) => {
    const confirmed = confirm(
      'Delete this hamper template?'
    )

    if (!confirmed) return

    try {
      await deleteTemplate(id)
    } catch (err) {
      console.error(err)
    }
  }

  if (isLoading) {
    return (
      <div className='p-10 text-zinc-500'>
        Loading hamper templates...
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
              <h1 className='text-3xl font-bold text-zinc-900 flex items-center gap-3'>
                <Gift className='w-8 h-8 text-pink-500' />
                Hamper Templates
              </h1>

              <p className='text-zinc-500 mt-2'>
                Create curated gifting experiences.
              </p>
            </div>

            <Button
              onClick={() => {
                setEditingTemplate(null)
                setIsModalOpen(true)
              }}
              className='bg-black hover:bg-zinc-800'
            >
              <Plus className='w-4 h-4 mr-2' />
              New Template
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
                placeholder='Search templates...'
                className='w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-black'
              />
            </div>
          </div>

          {/* GRID */}

          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
            {filteredTemplates.map(
              (template: any) => (
                <div
                  key={template._id}
                  className='bg-white rounded-3xl border border-zinc-200 overflow-hidden hover:shadow-xl transition-all'
                >
                  {/* IMAGE */}

                  <div className='aspect-[4/3] bg-zinc-100 overflow-hidden relative'>
                    {template.thumbnail?.url ? (
                      <img
                        src={imgUrl(template.thumbnail.url)}
                        alt={template.title}
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center'>
                        <Sparkles className='w-10 h-10 text-zinc-300' />
                      </div>
                    )}

                    <div className='absolute top-4 right-4'>
                      <span className='bg-white/90 backdrop-blur-sm text-xs px-3 py-1 rounded-full font-medium'>
                        {template.theme}
                      </span>
                    </div>
                  </div>

                  {/* CONTENT */}

                  <div className='p-5'>
                    <h2 className='text-lg font-semibold text-zinc-900 mb-2'>
                      {template.title}
                    </h2>

                    <p className='text-sm text-zinc-500 line-clamp-2 mb-5'>
                      {template.description}
                    </p>

                    {/* STATS */}

                    <div className='flex items-center gap-5 mb-5 text-sm text-zinc-600'>
                      <div className='flex items-center gap-2'>
                        <Package className='w-4 h-4' />
                        {
                          template
                            .includedProducts
                            ?.length
                        }{' '}
                        Products
                      </div>

                      <div className='flex items-center gap-2'>
                        <Gift className='w-4 h-4' />
                        {
                          template
                            .includedAddons
                            ?.length
                        }{' '}
                        Addons
                      </div>
                    </div>

                    {/* FOOTER */}

                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-xs text-zinc-400'>
                          Base Price
                        </p>

                        <p className='text-lg font-bold text-zinc-900'>
                          ₹{template.basePrice}
                        </p>
                      </div>

                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() => {
                            setEditingTemplate(
                              template
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
                              template._id
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
              )
            )}
          </div>
        </div>
      </div>

      <HamperTemplateModal
        isOpen={isModalOpen}
        onClose={() =>
          setIsModalOpen(false)
        }
        editingTemplate={editingTemplate}
      />
    </>
  )
}