import { IAddon } from './addon'
export interface IHamperProduct {
  product: IProduct

  quantity: number

  snapshot: {
    title: string
    image: string
    price: number
  }
}

export interface IHamperAddon {
  addon: IAddon

  quantity: number

  snapshot: {
    title: string
    image: string
    price: number
  }
}

export interface IHamper {
  _id: string

  createdBy?: string

  source: 'template' | 'custom' | 'converted_cart'

  template?: IHamperTemplate

  title?: string

  theme?: string

  products: IHamperProduct[]

  addons: IHamperAddon[]

  customMessage?: string

  packagingType: 'standard' | 'premium' | 'luxury'

  pricing: {
    productsTotal: number
    addonsTotal: number
    packagingFee: number
    total: number
  }

  visibility: 'private' | 'public' | 'featured'

  status: 'draft' | 'active' | 'ordered' | 'abandoned'

  createdAt: string

  updatedAt: string
}