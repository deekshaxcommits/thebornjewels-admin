// types/collection.ts

export type CollectionType = 'occasion' | 'campaign' | 'look' | 'festival' | 'category'

export interface CollectionItem {
  type: 'Product' | 'Combo'
  item: string // ObjectId ref
}

export interface BannerImage {
  url?: string
  key?: string
}

export interface Collection {
  _id: string
  name: string
  slug: string
  description?: string
  type: CollectionType
  bannerImage?: BannerImage
  items: CollectionItem[]
  featuredCombo?: string // ObjectId ref to Combo
  isActive: boolean
  priority: number
  createdAt: string
  updatedAt: string
}