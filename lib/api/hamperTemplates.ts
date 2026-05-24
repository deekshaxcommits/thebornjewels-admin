import api from './index'

export const getHamperTemplates = async () => {
  const res = await api.get('/hamper-template')
  return res.data
}

export const getHamperTemplateById = async (
  id: string
) => {
  const res = await api.get(
    `/hamper-template/${id}`
  )

  return res.data
}

export const createHamperTemplate = async (
  payload: any
) => {
  const res = await api.post(
    '/hamper-template',
    payload
  )

  return res.data
}

export const updateHamperTemplate = async (
  id: string,
  payload: any
) => {
  const res = await api.put(
    `/hamper-template/${id}`,
    payload
  )

  return res.data
}

export const deleteHamperTemplate = async (
  id: string
) => {
  const res = await api.delete(
    `/hamper-template/${id}`
  )

  return res.data
}