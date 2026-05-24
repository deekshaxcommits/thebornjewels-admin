export interface IAddonImage {
  url: string
  key?: string
}

export interface IAddon {
  _id: string

  title: string

  description?: string

  pricingType: 'free' | 'paid'

  price: number

  images: IAddonImage[]

  isActive: boolean

  createdAt: string

  updatedAt: string
}