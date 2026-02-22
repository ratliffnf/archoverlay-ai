import { useStore } from '../lib/store'
import { Slider } from './ui/Slider'

export default function PropertiesPanel() {
  const { 
    activeEngine, 
    activeMode, 
    brushSize, 
    setBrushSize,
    brushDensity,
    setBrushDensity,
    selectedPlacementId,
    layers,
    updatePlacement
  } = useStore()

  // Find selected placement
  let selectedPlacement = null
  for (const layer of layers) {
    selectedPlacement = layer.placements.find(p => p.id === selectedPlacementId)
    if (selectedPlacement) break
  }

  return (
    <div className="panel w-72 h-full flex flex-col">
      <div className="panel-header">Properties</div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {selectedPlacement ? (
          // Placement Properties
          <>
            <div>
              <label className="text-xs text-gray-500 mb-2 block">Selected Item</label>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-200 capitalize">{selectedPlacement.engine}</p>
                <p className="text-xs text-gray-500">
                  {Math.round(selectedPlacement.x)}, {Math.round(selectedPlacement.y)}
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-2 block">Scale</label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={selectedPlacement.scale}
                onChange={(e) => updatePlacement(selectedPlacement.id, { scale: parseFloat(e.target.value) })}
                className="slider-dark"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10%</span>
                <span>{Math.round(selectedPlacement.scale * 100)}%</span>
                <span>300%</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-2 block">Rotation</label>
              <input
                type="range"
                min="-180"
                max="180"
                step="5"
                value={selectedPlacement.rotation}
                onChange={(e) => updatePlacement(selectedPlacement.id, { rotation: parseFloat(e.target.value) })}
                className="slider-dark"
              />
              <div className="text-center text-xs text-gray-500 mt-1">
                {Math.round(selectedPlacement.rotation)}°
              </div>
            </div>
          </>
        ) : (
          // Brush Properties
          <>
            <div>
              <label className="text-xs text-gray-500 mb-2 block">Active Engine</label>
              <div className="bg-gray-800/50 rounded-lg p-3 flex items-center space-x-3">
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  ${activeEngine === 'people' ? 'bg-blue-500/20 text-blue-400' : ''}
                  ${activeEngine === 'greenery' ? 'bg-green-500/20 text-green-400' : ''}
                  ${activeEngine === 'vehicles' ? 'bg-red-500/20 text-red-400' : ''}
                  ${activeEngine === 'objects' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                  ${activeEngine === 'atmosphere' ? 'bg-purple-500/20 text-purple-400' : ''}
                `}>
                  {activeEngine.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-200 capitalize">{activeEngine}</p>
                  <p className="text-xs text-gray-500 capitalize">{activeMode} mode</p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-2 block">Brush Size</label>
              <input
                type="range"
                min="10"
                max="200"
                step="10"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="slider-dark"
              />
              <div className="text-center text-xs text-gray-500 mt-1">{brushSize}px</div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-2 block">Density</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={brushDensity}
                onChange={(e) => setBrushDensity(parseFloat(e.target.value))}
                className="slider-dark"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Sparse</span>
                <span>{Dense</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800">
              <label className="text-xs text-gray-500 mb-2 block">Mode Settings</label>
              
              {activeMode === 'plan' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Top-down view</span>
                    <span className="text-xs text-accent-400">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Uniform scale</span>
                    <span className="text-xs text-accent-400">Active</span>
                  </div>
                </div>
              )}

              {activeMode === 'section' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Side view</span>
                    <span className="text-xs text-accent-400">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Ground line snap</span>
                    <span className="text-xs text-accent-400">Active</span>
                  </div>
                </div>
              )}

              {activeMode === 'render' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Perspective view</span>
                    <span className="text-xs text-accent-400">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Depth-based scale</span>
                    <span className="text-xs text-accent-400">Active</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
