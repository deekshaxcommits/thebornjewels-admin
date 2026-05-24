import api from './index'

export const getMyHampers = async () => {
  const res = await api.get('/hamper/my-hampers')
  return res.data
}

export const createCustomHamper = async (
  payload: any
) => {
  const res = await api.post(
    '/hamper/custom',
    payload
  )

  return res.data
}

export const createHamperFromTemplate = async (
  templateId: string,
  payload: any
) => {
  const res = await api.post(
    `/hamper/template/${templateId}`,
    payload
  )

  return res.data
}