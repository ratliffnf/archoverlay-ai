import { useState } from 'react'
import { 
  Layers, Eye, EyeOff, Trash2, ChevronDown, ChevronRight,
  Lock, Unlock, Plus, GripVertical
} from 'lucide-react'
import { useStore } from '../lib/store'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function LayersPanel() {
  const { 
    layers, 
    activeLayerId, 
    setActiveLayer, 
    setLayerVisibility, 
    setLayerOpacity,
    deleteLayer,
    selectedPlacementId,
    selectPlacement,
    deletePlacement
  } = useStore()
  
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedLayers)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setExpandedLayers(newSet)
  }

  return (
    <div className="panel w-80 h-full flex flex-col">
      <div className="panel-header flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="h-4 w-4" />
          <span>Layers</span>
        </div>
        <span className="text-xs text-gray-500">{layers.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {layers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No layers</p>
            <p className="text-xs mt-1">Select an engine to create one</p>
          </div>
        ) : (
          [...layers].reverse().map((layer) => {
            const isActive = activeLayerId === layer.id
            const isExpanded = expandedLayers.has(layer.id)
            
            return (
              <div 
                key={layer.id}
                className={cn(
                  "rounded-lg border transition-all",
                  isActive 
                    ? "border-accent-600 bg-accent-600/10" 
                    : "border-gray-800 hover:border-gray-700"
                )}
              >
                {/* Layer Header */}
                <div 
                  className="flex items-center p-2 cursor-pointer"
                  onClick={() => setActiveLayer(layer.id)}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleExpand(layer.id) }}
                    className="p-1 hover:bg-gray-800 rounded mr-1"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-3 w-3 text-gray-500" />
                    )}
                  </button>

                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setLayerVisibility(layer.id, !layer.visible) 
                    }}
                    className="p-1.5 hover:bg-gray-800 rounded mr-2 text-gray-400"
                  >
                    {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate",
                      isActive ? "text-accent-400" : "text-gray-300"
                    )}>
                      {layer.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {layer.placements.length} items · {Math.round(layer.opacity * 100)}%
                    </p>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id) }}
                    className="p-1.5 hover:bg-red-900/50 text-gray-500 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-3">
                    {/* Opacity Slider */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Opacity</span>
                        <span>{Math.round(layer.opacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={layer.opacity}
                        onChange={(e) => setLayerOpacity(layer.id, parseFloat(e.target.value))}
                        className="slider-dark"
                      />
                    </div>

                    {/* Placements List */}
                    {layer.placements.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 mb-2">Items</p>
                        {layer.placements.map((placement) => (
                          <div
                            key={placement.id}
                            onClick={() => selectPlacement(
                              selectedPlacementId === placement.id ? null : placement.id
                            )}
                            className={cn(
                              "flex items-center p-2 rounded text-xs cursor-pointer",
                              selectedPlacementId === placement.id
                                ? "bg-accent-600/20 text-accent-400"
                                : "bg-gray-800/50 text-gray-400 hover:bg-gray-800"
                            )}
                          >
                            <GripVertical className="h-3 w-3 mr-2 opacity-50" />
                            <span className="flex-1 truncate">
                              {placement.engine} · {Math.round(placement.scale * 100)}%
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deletePlacement(placement.id)
                              }}
                              className="p-1 hover:bg-red-900/50 text-red-400 rounded opacity-0 hover:opacity-100"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
