import api from './index'

export const getAddons = async () => {
  const res = await api.get('/addon')
  return res.data
}

export const getAddonById = async (id: string) => {
  const res = await api.get(`/addon/${id}`)
  return res.data
}

export const createAddon = async (payload: any) => {
  const res = await api.post('/addon', payload)
  return res.data
}

export const updateAddon = async (
  id: string,
  payload: any
) => {
  const res = await api.put(
    `/addon/${id}`,
    payload
  )

  return res.data
}

export const deleteAddon = async (
  id: string
) => {
  const res = await api.delete(`/addon/${id}`)
  return res.data
}