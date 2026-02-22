import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Placement API
export const placeAsset = async (
  x: number, 
  y: number, 
  engine: string, 
  mode: string,
  baseImage?: string
) => {
  const res = await api.post('/place', {
    x, y, engine, mode, base_image: baseImage
  })
  return res.data
}

// Asset API  
export const getAssets = async (engine: string, mode: string) => {
  const res = await api.get(`/assets?engine=${engine}&mode=${mode}`)
  return res.data
}

// Export API
export const exportComposite = async (layers: any[], baseImage: string, format: 'png' | 'jpg' = 'png') => {
  const res = await api.post('/export', { layers, base_image: baseImage, format })
  return res.data
}
