from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Literal
import os
import uuid

app = FastAPI(title="ArchOverlay API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class PlaceRequest(BaseModel):
    x: float
    y: float
    engine: Literal["people", "greenery", "vehicles", "objects", "atmosphere"]
    mode: Literal["plan", "section", "axon", "render"]
    image_width: int = 1920
    image_height: int = 1080

class PlaceResponse(BaseModel):
    scale: float
    rotation: float
    asset_id: str
    surface_type: str = "ground"

# Engine configurations
ENGINE_CONFIGS = {
    "people": {
        "plan": {"scale_range": (0.3, 0.6), "view": "top"},
        "section": {"scale_range": (0.5, 0.8), "view": "side"},
        "axon": {"scale_range": (0.4, 0.7), "view": "iso"},
        "render": {"scale_range": (0.4, 1.0), "view": "perspective"},
    },
    "greenery": {
        "plan": {"scale_range": (0.5, 1.2), "view": "top"},
        "section": {"scale_range": (0.8, 1.5), "view": "side"},
        "axon": {"scale_range": (0.6, 1.3), "view": "iso"},
        "render": {"scale_range": (0.6, 1.8), "view": "perspective"},
    },
    "vehicles": {
        "plan": {"scale_range": (0.8, 1.2), "view": "top"},
        "section": {"scale_range": (1.0, 1.5), "view": "side"},
        "axon": {"scale_range": (0.9, 1.4), "view": "iso"},
        "render": {"scale_range": (0.9, 1.8), "view": "perspective"},
    },
    "objects": {
        "plan": {"scale_range": (0.3, 0.8), "view": "top"},
        "section": {"scale_range": (0.5, 1.0), "view": "side"},
        "axon": {"scale_range": (0.4, 0.9), "view": "iso"},
        "render": {"scale_range": (0.4, 1.2), "view": "perspective"},
    },
    "atmosphere": {
        "plan": {"scale_range": (2.0, 4.0), "view": "top"},
        "section": {"scale_range": (2.0, 4.0), "view": "side"},
        "axon": {"scale_range": (2.0, 4.0), "view": "iso"},
        "render": {"scale_range": (2.0, 5.0), "view": "perspective"},
    },
}

@app.get("/")
def root():
    return {"message": "ArchOverlay API", "version": "2.0.0"}

@app.post("/place", response_model=PlaceResponse)
def place_asset(request: PlaceRequest):
    """Smart placement based on engine and mode"""
    
    config = ENGINE_CONFIGS.get(request.engine, {}).get(request.mode, {})
    scale_range = config.get("scale_range", (0.5, 1.0))
    
    # Calculate scale based on position (for render mode, simulate depth)
    if request.mode == "render":
        # Lower Y = farther away = smaller
        depth_factor = 1 - (request.y / request.image_height) * 0.5
        base_scale = scale_range[0] + (scale_range[1] - scale_range[0]) * 0.5
        scale = base_scale * (0.5 + depth_factor * 0.5)
    else:
        import random
        scale = scale_range[0] + random.random() * (scale_range[1] - scale_range[0])
    
    # Rotation based on mode
    if request.mode == "section":
        rotation = 0  # Upright
    elif request.mode == "plan":
        rotation = random.randint(0, 360)  # Any direction
    else:
        rotation = random.randint(-30, 30)  # Slight variation
    
    return PlaceResponse(
        scale=round(scale, 2),
        rotation=rotation,
        asset_id=f"{request.engine}_{request.mode}_{uuid.uuid4().hex[:8]}",
        surface_type="ground"
    )

@app.get("/assets")
def list_assets(engine: str = None, mode: str = None):
    """List available assets"""
    # Return placeholder assets for now
    assets = []
    engines = [engine] if engine else ["people", "greenery", "vehicles", "objects"]
    
    for eng in engines:
        for i in range(5):
            assets.append({
                "id": f"{eng}_{i}",
                "engine": eng,
                "name": f"{eng.title()} {i+1}",
                "url": None  # Would be actual image URL
            })
    
    return {"assets": assets}

@app.post("/export")
def export_image(layers: list, base_image: str, format: str = "png"):
    """Export composite image"""
    # Placeholder - would composite layers onto base
    return {
        "download_url": "/exports/placeholder.png",
        "format": format
    }

# Static files for uploads/exports
os.makedirs("uploads", exist_ok=True)
os.makedirs("exports", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/exports", StaticFiles(directory="exports"), name="exports")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
