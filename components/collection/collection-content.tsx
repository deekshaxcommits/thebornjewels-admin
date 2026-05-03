'use client'

import { Switch } from '@headlessui/react'
import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Plus, Edit2, Trash2, Eye, X, ImageIcon, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DM_Serif_Display } from 'next/font/google'
import { useCollections } from '@/hooks/useCollections'
import {
  deleteCollection,
  deactivateCollection,
  reactivateCollection,
} from '@/lib/api/collections'
import { CollectionModal } from './collection-modal'
import { CollectionDetailsModal } from './collection-details-modal'
import { Collection } from '@/types/collection'
import { API_BASE_URL } from '@/lib/api'

const dmFont = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
})

const collectionTypes = [
  { id: 'all', name: 'All Types' },
  { id: 'occasion', name: 'Occasion' },
  { id: 'campaign', name: 'Campaign' },
  { id: 'look', name: 'Look' },
  { id: 'festival', name: 'Festival' },
  { id: 'category', name: 'Category' },
]

const sortOptions = [
  { id: 'priority', name: 'Priority' },
  { id: 'newest', name: 'Newest' },
  { id: 'oldest', name: 'Oldest' },
  { id: 'name', name: 'Name (A–Z)' },
]

const typeBadgeColors: Record<string, string> = {
  occasion: 'bg-purple-100 text-purple-800',
  campaign: 'bg-blue-100 text-blue-800',
  look: 'bg-pink-100 text-pink-800',
  festival: 'bg-amber-100 text-amber-800',
  category: 'bg-teal-100 text-teal-800',
}

export function CollectionContent() {
  const searchParams = useSearchParams()

  const [selectedType, setSelectedType] = useState('all')
  const [sortBy, setSortBy] = useState('priority')
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [editingCollection, setEditingCollection] = useState<string | null>(null)
  const [zoomImage, setZoomImage] = useState<string | null>(null)

  const { data: collections = [], isLoading, isError, refetch } = useCollections()

  useEffect(() => {
    const search = searchParams.get('search')
    if (search) setSearchQuery(search)
  }, [searchParams])

  const allCollections = collections || []

  const filteredCollections = useMemo(() => {
    let filtered = [...allCollections]

    if (selectedType !== 'all') {
      filtered = filtered.filter((c: any) => c.type === selectedType)
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (c: any) =>
          c.name.toLowerCase().includes(q) ||
          c.slug?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      )
    }

    switch (sortBy) {
      case 'newest':
        filtered.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        break
      case 'oldest':
        filtered.sort(
          (a: any, b: any) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
        break
      case 'name':
        filtered.sort((a: any, b: any) => a.name.localeCompare(b.name))
        break
      case 'priority':
      default:
        filtered.sort((a: any, b: any) => a.priority - b.priority)
        break
    }

    return filtered
  }, [allCollections, selectedType, sortBy, searchQuery])

  const activeFiltersCount = [selectedType !== 'all', searchQuery !== ''].filter(Boolean).length

  const clearFilters = () => {
    setSelectedType('all')
    setSortBy('priority')
    setSearchQuery('')
  }

  const handleAddCollection = () => {
    setEditingCollection(null)
    setIsModalOpen(true)
  }

  const handleEditCollection = (collectionId: string) => {
    setEditingCollection(collectionId)
    setIsModalOpen(true)
  }

  const handleModalSuccess = () => refetch()
  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingCollection(null)
  }

 const handleDeactivate = async (collection: any) => {
  if (!confirm(`Deactivate "${collection.name}"? It will be hidden from customers.`)) return;
  try {
    await deactivateCollection(collection._id);
    alert('Collection deactivated successfully!');
    refetch();
  } catch (err) {
    alert('Error deactivating collection');
    console.error(err);
  }
};

const handleReactivate = async (collection: any) => {
  if (!confirm(`Reactivate "${collection.name}"? It will be visible to customers again.`)) return;
  try {
    await reactivateCollection(collection._id);
    alert('Collection reactivated successfully!');
    refetch();
  } catch (err) {
    alert('Error reactivating collection');
    console.error(err);
  }
};

const handlePermanentDelete = async (id: string, name: string) => {
  if (confirm(`⚠️ PERMANENT DELETE: Are you sure you want to permanently delete "${name}"? This action cannot be undone and will also delete the banner image.`)) {
    try {
      await deleteCollection(id);
      alert('Collection permanently deleted!');
      refetch();
    } catch (err) {
      alert('Error deleting collection');
      console.error(err);
    }
  }
};

  if (isLoading) return <div className="text-center py-16 text-zinc-500">Loading collections...</div>
  if (isError) return <div className="text-center py-16 text-red-500">Error loading collections.</div>

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">

          {/* Header */}
          <div className="mb-6">
            <h1 className={`text-3xl font-bold text-gray-900 mb-2 ${dmFont.className}`}>
              Collection Management
            </h1>
            <p className="text-gray-600">Manage curated product collections and campaigns</p>
          </div>

          {/* Actions Bar */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">

              {/* Search */}
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, slug, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filters & Actions */}
              <div className="flex flex-wrap gap-3 items-center">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  {collectionTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>

                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                    Clear ({activeFiltersCount})
                  </button>
                )}

                <Button
                  onClick={handleAddCollection}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Collection
                </Button>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredCollections.length} of {allCollections.length} collections
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collection</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCollections.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        No collections found
                      </td>
                    </tr>
                  ) : (
                    filteredCollections.map((collection: any) => (
                      <tr key={collection._id} className="hover:bg-gray-50 transition">

                        {/* Collection name + banner */}
                        <td className="px-4 py-4 max-w-[280px]">
                          <div className="flex items-center gap-3">
                            {collection.bannerImage?.url ? (
                              <img
                                src={`${API_BASE_URL}${collection.bannerImage.url}`}
                                alt={collection.name}
                                onClick={() =>
                                  setZoomImage(`${API_BASE_URL}${collection.bannerImage.url}`)
                                }
                                className="w-12 h-12 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <ImageIcon className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1 max-w-[200px]">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {collection.name}
                              </div>
                              {collection.description && (
                                <div className="text-xs text-gray-500 mt-1 truncate">
                                  {collection.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Slug */}
                        <td className="px-4 py-4">
                          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {collection.slug}
                          </span>
                        </td>

                        {/* Type badge */}
                        <td className="px-4 py-4">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded capitalize ${
                              typeBadgeColors[collection.type] ?? 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {collection.type}
                          </span>
                        </td>

                        {/* Items count */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-700">
                            <Layers className="w-4 h-4 text-gray-400" />
                            {collection.items?.length ?? 0}
                          </div>
                        </td>

                        {/* Priority */}
                        <td className="px-4 py-4 text-sm text-gray-700">
                          {collection.priority ?? 0}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4 min-w-[110px]">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              collection.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {collection.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        {/* Actions */}
<td className="px-4 py-4 text-sm font-medium">
  <div className="flex gap-1 items-center">
    <button
      onClick={() => {
        setSelectedCollection(collection);
        setIsDetailModalOpen(true);
      }}
      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
      title="View details"
    >
      <Eye className="w-4 h-4" />
    </button>

    <button
      onClick={() => handleEditCollection(collection._id)}
      className="p-2 text-green-600 hover:bg-green-50 rounded transition"
      title="Edit"
    >
      <Edit2 className="w-4 h-4" />
    </button>

    {/* Status Toggle Switch */}
    <Switch
      checked={collection.isActive}
      onChange={() => collection.isActive ? handleDeactivate(collection) : handleReactivate(collection)}
      className={`${
        collection.isActive ? 'bg-green-500' : 'bg-gray-300'
      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300`}
      title={collection.isActive ? 'Deactivate (Hide from customers)' : 'Reactivate (Show to customers)'}
    >
      <span
        className={`${
          collection.isActive ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300`}
      />
    </Switch>

    {/* Permanent Delete Button */}
    <button
      onClick={() => handlePermanentDelete(collection._id, collection.name)}
      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
      title="Permanently delete (cannot be undone)"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* Banner zoom popup */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center"
          onClick={() => setZoomImage(null)}
        >
          <button
            className="absolute top-6 right-6 bg-white/20 hover:bg-white/40 rounded-full p-2 transition"
            onClick={() => setZoomImage(null)}
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img
            src={zoomImage}
            alt="Zoomed banner"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-xl"
          />
        </div>
      )}

      <CollectionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        collectionId={editingCollection || undefined}
      />

      <CollectionDetailsModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        collection={selectedCollection}
      />
    </>
  )
}