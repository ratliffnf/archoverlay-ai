# ArchOverlay v2

Architectural entourage tool with brush-based placement.

## Features
- 5 engines: People, Greenery, Vehicles, Objects, Atmosphere
- 4 modes: Plan, Section, Axon, Render
- Brush tool for painting entourage
- Non-destructive layers
- Dark UI (Blender/Rhino style)

## Deploy
1. Push to GitHub
2. Connect to Render.com
3. Blueprint auto-detects render.yaml

## Local Dev
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```
