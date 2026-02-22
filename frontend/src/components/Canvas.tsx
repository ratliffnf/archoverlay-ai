import { useRef, useState, useEffect, useCallback } from 'react'
import { Upload, Image as ImageIcon, MousePointer2 } from 'lucide-react'
import { useStore } from '../lib/store'
import { api } from '../lib/api'

export default function Canvas() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isPainting, setIsPainting] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  
  const {
    baseImage,
    imageSize,
    zoom,
    pan,
    setPan,
    setBaseImage,
    layers,
    activeLayerId,
    activeEngine,
    activeMode,
    brushSize,
    brushDensity,
    addPlacement,
    selectedPlacementId,
    selectPlacement,
    updatePlacement
  } = useStore()

  // Handle file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        setBaseImage(url, { width: img.width, height: img.height })
      }
      img.src = url
    }
  }

  // Convert screen to canvas coordinates
  const screenToCanvas = (screenX: number, screenY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: (screenX - rect.left - pan.x) / zoom,
      y: (screenY - rect.top - pan.y) / zoom
    }
  }

  // Handle painting/placement
  const handleMouseDown = async (e: React.MouseEvent) => {
    if (e.button !== 0) return // Only left click
    
    const pos = screenToCanvas(e.clientX, e.clientY)
    
    // Check if clicking on existing placement
    let clickedPlacement = null
    for (const layer of layers) {
      for (const p of layer.placements) {
        const dx = pos.x - p.x
        const dy = pos.y - p.y
        if (Math.sqrt(dx * dx + dy * dy) < 30 * p.scale) {
          clickedPlacement = p
          break
        }
      }
      if (clickedPlacement) break
    }
    
    if (clickedPlacement) {
      selectPlacement(clickedPlacement.id)
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
      return
    }
    
    // Create new placement
    if (!activeLayerId || !baseImage) return
    
    setIsPainting(true)
    
    // Call backend for smart placement
    try {
      const result = await api.post('/place', {
        x: pos.x,
        y: pos.y,
        engine: activeEngine,
        mode: activeMode,
        image_width: imageSize.width,
        image_height: imageSize.height
      })
      
      addPlacement({
        id: `placement-${Date.now()}`,
        x: pos.x,
        y: pos.y,
        scale: result.data.scale || 0.5 + Math.random() * 0.5,
        rotation: result.data.rotation || (Math.random() - 0.5) * 30,
        engine: activeEngine,
        assetId: result.data.asset_id || 'default',
        layerId: activeLayerId
      })
    } catch (err) {
      // Fallback placement
      addPlacement({
        id: `placement-${Date.now()}`,
        x: pos.x,
        y: pos.y,
        scale: 0.5 + Math.random() * 0.5,
        rotation: (Math.random() - 0.5) * 30,
        engine: activeEngine,
        assetId: 'default',
        layerId: activeLayerId
      })
    }
  }

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const pos = screenToCanvas(e.clientX, e.clientY)
    setMousePos(pos)
    
    if (isDragging && selectedPlacementId) {
      const dx = (e.clientX - dragStart.x) / zoom
      const dy = (e.clientY - dragStart.y) / zoom
      
      updatePlacement(selectedPlacementId, {
        x: pos.x - dx,
        y: pos.y - dy
      })
      
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }, [isDragging, selectedPlacementId, dragStart, zoom, updatePlacement])

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsPainting(false)
  }

  // Pan with middle mouse or space+drag
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      // Zoom
    } else {
      // Pan
      setPan({
        x: pan.x - e.deltaX,
        y: pan.y - e.deltaY
      })
    }
  }

  return (
    <div
      ref={canvasRef}
      className="flex-1 bg-gray-950 relative overflow-hidden cursor-crosshair"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {!baseImage ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-900 rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed border-gray-700">
              <Upload className="h-10 w-10 text-gray-600" />
            </div>
            <p className="text-gray-400 text-lg mb-2">Drop an image to start</p>
            <p className="text-gray-600 text-sm">or click to browse</p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const url = URL.createObjectURL(file)
                  const img = new Image()
                  img.onload = () => setBaseImage(url, { width: img.width, height: img.height })
                  img.src = url
                }
              }}
            />
          </div>
        </div>
      ) : (
        <div
          className="absolute"
          style={{
            width: imageSize.width,
            height: imageSize.height,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0'
          }}
        >
          {/* Base Image */}
          <img
            src={baseImage}
            alt="Base"
            className="absolute inset-0 w-full h-full object-contain"
            draggable={false}
          />

          {/* Grid Overlay */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(to right, #fff 1px, transparent 1px),
                linear-gradient(to bottom, #fff 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />

          {/* Placements */}
          {layers.filter(l => l.visible).map(layer => 
            layer.placements.map(placement => (
              <div
                key={placement.id}
                className={`absolute cursor-move transition-shadow ${
                  selectedPlacementId === placement.id
                    ? 'ring-2 ring-accent-400 ring-offset-2 ring-offset-gray-950'
                    : ''
                }`}
                style={{
                  left: placement.x,
                  top: placement.y,
                  transform: `translate(-50%, -50%) scale(${placement.scale}) rotate(${placement.rotation}deg)`,
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  selectPlacement(placement.id)
                }}
              >
                {/* Placeholder asset visualization */}
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg
                  ${placement.engine === 'people' ? 'bg-blue-500' : ''}
                  ${placement.engine === 'greenery' ? 'bg-green-500' : ''}
                  ${placement.engine === 'vehicles' ? 'bg-red-500' : ''}
                  ${placement.engine === 'objects' ? 'bg-yellow-500' : ''}
                  ${placement.engine === 'atmosphere' ? 'bg-purple-500' : ''}
                `}>
                  {placement.engine.charAt(0).toUpperCase()}
                </div>
                
                {selectedPlacementId === placement.id && (
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="bg-accent-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                      {Math.round(placement.scale * 100)}% · {Math.round(placement.rotation)}°
                    </span>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Brush Preview */}
          {baseImage && !selectedPlacementId && (
            <div
              className="absolute pointer-events-none border-2 border-accent-400 rounded-full opacity-50"
              style={{
                left: mousePos.x,
                top: mousePos.y,
                width: brushSize,
                height: brushSize,
                transform: 'translate(-50%, -50%)'
              }}
            />
          )}
        </div>
      )}

      {/* Info Bar */}
      <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur px-3 py-2 rounded-lg text-xs text-gray-400">
        {baseImage ? (
          <span>{Math.round(mousePos.x)}, {Math.round(mousePos.y)} · {imageSize.width}×{imageSize.height}</span>
        ) : (
          <span>No image loaded</span>
        )}
      </div>
    </div>
  )
}
