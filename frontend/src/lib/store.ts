import { create } from 'zustand'

export type EngineType = 'people' | 'greenery' | 'vehicles' | 'objects' | 'atmosphere'
export type DrawingMode = 'plan' | 'section' | 'axon' | 'render'

export interface Placement {
  id: string
  x: number
  y: number
  scale: number
  rotation: number
  engine: EngineType
  assetId: string
  layerId: string
}

export interface Layer {
  id: string
  name: string
  engine: EngineType
  visible: boolean
  opacity: number
  placements: Placement[]
}

interface Store {
  // Canvas state
  baseImage: string | null
  imageSize: { width: number; height: number }
  zoom: number
  pan: { x: number; y: number }
  
  // Tools
  activeEngine: EngineType
  activeMode: DrawingMode
  brushSize: number
  brushDensity: number
  
  // Layers
  layers: Layer[]
  activeLayerId: string | null
  selectedPlacementId: string | null
  
  // Actions
  setBaseImage: (url: string | null, size?: { width: number; height: number }) => void
  setZoom: (zoom: number) => void
  setPan: (pan: { x: number; y: number }) => void
  setActiveEngine: (engine: EngineType) => void
  setActiveMode: (mode: DrawingMode) => void
  setBrushSize: (size: number) => void
  setBrushDensity: (density: number) => void
  
  // Layer actions
  addLayer: (engine: EngineType) => string
  deleteLayer: (id: string) => void
  setLayerVisibility: (id: string, visible: boolean) => void
  setLayerOpacity: (id: string, opacity: number) => void
  setActiveLayer: (id: string) => void
  
  // Placement actions
  addPlacement: (placement: Placement) => void
  updatePlacement: (id: string, updates: Partial<Placement>) => void
  deletePlacement: (id: string) => void
  selectPlacement: (id: string | null) => void
}

export const useStore = create<Store>((set, get) => ({
  // Initial state
  baseImage: null,
  imageSize: { width: 1920, height: 1080 },
  zoom: 1,
  pan: { x: 0, y: 0 },
  
  activeEngine: 'people',
  activeMode: 'render',
  brushSize: 50,
  brushDensity: 0.5,
  
  layers: [],
  activeLayerId: null,
  selectedPlacementId: null,
  
  // Canvas actions
  setBaseImage: (url, size) => set({ 
    baseImage: url, 
    imageSize: size || { width: 1920, height: 1080 }
  }),
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),
  setPan: (pan) => set({ pan }),
  
  // Tool actions
  setActiveEngine: (engine) => set({ activeEngine: engine }),
  setActiveMode: (mode) => set({ activeMode: mode }),
  setBrushSize: (size) => set({ brushSize: size }),
  setBrushDensity: (density) => set({ brushDensity: density }),
  
  // Layer actions
  addLayer: (engine) => {
    const id = `layer-${Date.now()}`
    const newLayer: Layer = {
      id,
      name: `${engine.charAt(0).toUpperCase() + engine.slice(1)} Layer`,
      engine,
      visible: true,
      opacity: 1,
      placements: []
    }
    set(state => ({ 
      layers: [...state.layers, newLayer],
      activeLayerId: id
    }))
    return id
  },
  
  deleteLayer: (id) => set(state => ({
    layers: state.layers.filter(l => l.id !== id),
    activeLayerId: state.activeLayerId === id 
      ? state.layers.find(l => l.id !== id)?.id || null 
      : state.activeLayerId
  })),
  
  setLayerVisibility: (id, visible) => set(state => ({
    layers: state.layers.map(l => 
      l.id === id ? { ...l, visible } : l
    )
  })),
  
  setLayerOpacity: (id, opacity) => set(state => ({
    layers: state.layers.map(l => 
      l.id === id ? { ...l, opacity } : l
    )
  })),
  
  setActiveLayer: (id) => set({ activeLayerId: id }),
  
  // Placement actions
  addPlacement: (placement) => set(state => ({
    layers: state.layers.map(l => 
      l.id === placement.layerId 
        ? { ...l, placements: [...l.placements, placement] }
        : l
    )
  })),
  
  updatePlacement: (id, updates) => set(state => ({
    layers: state.layers.map(l => ({
      ...l,
      placements: l.placements.map(p => 
        p.id === id ? { ...p, ...updates } : p
      )
    }))
  })),
  
  deletePlacement: (id) => set(state => ({
    layers: state.layers.map(l => ({
      ...l,
      placements: l.placements.filter(p => p.id !== id)
    })),
    selectedPlacementId: state.selectedPlacementId === id ? null : state.selectedPlacementId
  })),
  
  selectPlacement: (id) => set({ selectedPlacementId: id })
}))
