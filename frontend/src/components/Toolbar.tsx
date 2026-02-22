import { 
  MousePointer2, Move, Users, TreePine, Car, Box, Cloud,
  Grid3X3, Maximize, Layers, Settings, Download, ZoomIn, ZoomOut,
  Undo, Redo, Trash2, Eye, EyeOff, ChevronDown, Plus
} from 'lucide-react'
import { useStore, EngineType, DrawingMode } from '../lib/store'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const engines: { id: EngineType; icon: any; label: string; color: string }[] = [
  { id: 'people', icon: Users, label: 'People', color: 'bg-blue-500' },
  { id: 'greenery', icon: TreePine, label: 'Greenery', color: 'bg-green-500' },
  { id: 'vehicles', icon: Car, label: 'Vehicles', color: 'bg-red-500' },
  { id: 'objects', icon: Box, label: 'Objects', color: 'bg-yellow-500' },
  { id: 'atmosphere', icon: Cloud, label: 'Atmosphere', color: 'bg-purple-500' },
]

const modes: { id: DrawingMode; label: string }[] = [
  { id: 'plan', label: 'Plan' },
  { id: 'section', label: 'Section' },
  { id: 'axon', label: 'Axon' },
  { id: 'render', label: 'Render' },
]

export default function Toolbar() {
  const { 
    activeEngine, 
    setActiveEngine, 
    activeMode, 
    setActiveMode,
    zoom,
    setZoom,
    layers,
    addLayer
  } = useStore()

  const handleEngineSelect = (engine: EngineType) => {
    setActiveEngine(engine)
    // Auto-create layer if none exists for this engine
    const existingLayer = layers.find(l => l.engine === engine)
    if (!existingLayer) {
      addLayer(engine)
    }
  }

  return (
    <>
      {/* Left Toolbar - Engines */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50">
        <div className="panel py-2 space-y-1">
          {engines.map((engine) => {
            const Icon = engine.icon
            const isActive = activeEngine === engine.id
            return (
              <button
                key={engine.id}
                onClick={() => handleEngineSelect(engine.id)}
                className={cn(
                  "tool-btn w-14 h-14 relative",
                  isActive && "active"
                )}
                title={engine.label}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[9px] mt-1">{engine.label}</span>
                {isActive && (
                  <div className={cn("absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r", engine.color)} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Top Toolbar - Modes & View */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="panel flex items-center px-2 py-1.5 space-x-1">
          {/* Mode Selector */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                  activeMode === mode.id
                    ? "bg-accent-600 text-white"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                )}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-gray-700 mx-2" />

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => setZoom(zoom - 0.1)}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-200"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-400 w-16 text-center">{Math.round(zoom * 100)}%</span>
            
            <button 
              onClick={() => setZoom(zoom + 0.1)}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-200"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-700 mx-2" />

          {/* Grid Toggle */}
          <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-200">
            <Grid3X3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Top Right - Actions */}
      <div className="fixed top-4 right-4 z-50">
        <div className="panel flex items-center p-1 space-x-1">
          <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-200">
            <Undo className="h-4 w-4" />
          </button>
          <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-200">
            <Redo className="h-4 w-4" />
          </button>
          <div className="w-px h-6 bg-gray-700" />
          <button className="flex items-center space-x-2 px-4 py-2 bg-accent-600 hover:bg-accent-500 text-white rounded-lg text-sm font-medium transition-colors">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </>
  )
}
