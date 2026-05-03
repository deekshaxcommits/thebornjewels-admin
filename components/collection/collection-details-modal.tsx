'use client'

import { X, Layers, ImageIcon, Star } from 'lucide-react'
import { Collection } from '@/types/collection'
import { API_BASE_URL } from '@/lib/api'

interface Props {
  isOpen: boolean
  onClose: () => void
  collection: Collection | null
}

const typeBadgeColors: Record<string, string> = {
  occasion: 'bg-purple-100 text-purple-800',
  campaign: 'bg-blue-100 text-blue-800',
  look: 'bg-pink-100 text-pink-800',
  festival: 'bg-amber-100 text-amber-800',
  category: 'bg-teal-100 text-teal-800',
}

export function CollectionDetailsModal({ isOpen, onClose, collection }: Props) {
  if (!isOpen || !collection) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">{collection.name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">

          {/* Banner */}
          {collection.bannerImage?.url ? (
            <img
              src={`${API_BASE_URL}${collection.bannerImage.url}`}
              alt={collection.name}
              className="w-full h-48 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-gray-300" />
            </div>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-500 mb-1">Slug</p>
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {collection.slug}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Type</p>
              <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${typeBadgeColors[collection.type] ?? 'bg-gray-100 text-gray-700'}`}>
                {collection.type}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Priority</p>
              <p className="text-gray-900 font-medium">{collection.priority}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <span className={`px-2 py-1 text-xs font-medium rounded ${collection.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {collection.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Created</p>
              <p className="text-gray-900">{new Date(collection.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Updated</p>
              <p className="text-gray-900">{new Date(collection.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Description */}
          {collection.description && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed">{collection.description}</p>
            </div>
          )}

          {/* Featured Combo */}
          {collection.featuredCombo && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Featured Combo</p>
              <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                <Star className="w-4 h-4" />
                <span className="font-mono text-xs">{
                  typeof collection.featuredCombo === 'object'
                    ? (collection.featuredCombo as any)._id
                    : collection.featuredCombo
                }</span>
              </div>
            </div>
          )}

          {/* Items */}
          <div>
            <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
              <Layers className="w-3 h-3" /> Items ({collection.items?.length ?? 0})
            </p>
            {collection.items?.length > 0 ? (
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                {collection.items.map((entry, idx) => {
                  const item = entry.item as any
                  return (
                    <div key={idx} className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition">
                      {/* image if populated */}
                      {item?.images?.[0]?.url || item?.image ? (
                        <img
                          src={`${API_BASE_URL}${item.images?.[0]?.url || item.image}`}
                          alt={item.title || item.name}
                          className="w-10 h-10 object-cover rounded-md flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-md flex-shrink-0 flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item?.title || item?.name || (typeof item === 'string' ? item : 'Unknown')}
                        </p>
                        {item?.price !== undefined && (
                          <p className="text-xs text-gray-500">₹{item.price?.toFixed(2)}</p>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 text-xs rounded font-medium flex-shrink-0 ${entry.type === 'Product' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                        {entry.type}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No items in this collection.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}