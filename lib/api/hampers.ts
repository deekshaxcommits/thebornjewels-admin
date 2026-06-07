import api from './index'

export const getHamperConfig = async () => {
  const res = await api.get('/hampers/config')
  return res.data
}

export const updateHamperConfig = async (payload: { conversionFee?: number; inclusions?: string[] }) => {
  const res = await api.put('/hampers/config', payload)
  return res.data
}

export const getAllHampers = async (params?: { status?: string; source?: string }) => {
  const res = await api.get('/hampers/all', { params })
  return res.data
}

export const getMyHampers = async () => {
  const res = await api.get('/hampers/my-hampers')
  return res.data
}

export const createCustomHamper = async (payload: any) => {
  const res = await api.post('/hampers/custom', payload)
  return res.data
}

export const createHamperFromTemplate = async (templateId: string, payload: any) => {
  const res = await api.post(`/hampers/template/${templateId}`, payload)
  return res.data
}

export const updateHamperStatus = async (id: string, status: string) => {
  const res = await api.patch(`/hampers/${id}/status`, { status })
  return res.data
}

export const adminCreateHamper = async (payload: any) => {
  const res = await api.post('/hampers/admin/create', payload)
  return res.data
}

export const adminUpdateHamper = async (id: string, payload: any) => {
  const res = await api.put(`/hampers/admin/${id}`, payload)
  return res.data
}

export const adminDeleteHamper = async (id: string) => {
  const res = await api.delete(`/hampers/admin/${id}`)
  return res.data
}
