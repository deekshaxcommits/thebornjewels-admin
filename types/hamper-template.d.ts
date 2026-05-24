import { IAddon } from './addon'
import { IProduct } from './product'

export interface IHamperTemplateProduct {
  product: IProduct
  quantity: number
}

export interface IHamperTemplateAddon {
  addon: IAddon
  quantity: number
}

export interface IHamperTemplate {
  _id: string

  title: string

  slug: string

  description?: string

  thumbnail?: {
    url: string
    key?: string
  }

  theme?: string

  basePrice: number

  includedProducts: IHamperTemplateProduct[]

  includedAddons: IHamperTemplateAddon[]

  isCustomizable: boolean

  suggestedOccasions: string[]

  tags: string[]

  isActive: boolean

  createdAt: string

  updatedAt: string
}