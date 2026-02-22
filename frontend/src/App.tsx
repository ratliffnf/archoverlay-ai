import Canvas from './components/Canvas'
import Toolbar from './components/Toolbar'
import LayersPanel from './components/LayersPanel'
import PropertiesPanel from './components/PropertiesPanel'
import './index.css'

function App() {
  return (
    <div className="h-screen flex flex-col bg-gray-950">
      <Toolbar />
      
      <div className="flex-1 flex overflow-hidden">
        <Canvas />
        
        <div className="flex">
          <LayersPanel />
          <PropertiesPanel />
        </div>
      </div>
    </div>
  )
}

export default App
