from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Tuple
import asyncio
from agents.pipeline import run_agent_pipeline
from agents.mock_data import COMMUNITY_REPORTS, get_closest_region
from routing.router import calculate_routes, STORM_ZONE

app = FastAPI(title="INNOWAVE Marine Intelligence API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    lat: Optional[float] = None
    lon: Optional[float] = None

class RouteRequest(BaseModel):
    start: Tuple[float, float]
    end: Tuple[float, float]

class ReportRequest(BaseModel):
    type: str
    text: str
    lat: float
    lon: float

@app.get("/")
def read_root():
    return {"message": "Welcome to INNOWAVE Marine Intelligence API"}

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    try:
        # Deliberate thinking delay for agent calculations (2.5 seconds)
        await asyncio.sleep(2.5)
        response = run_agent_pipeline(req.message, req.lat, req.lon)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/route")
def route_endpoint(req: RouteRequest):
    try:
        routes = calculate_routes(req.start, req.end)
        return routes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reports")
def get_reports_endpoint():
    return COMMUNITY_REPORTS

@app.post("/api/reports")
def post_report_endpoint(req: ReportRequest):
    try:
        closest = get_closest_region(req.lat, req.lon)
        new_report = {
            "id": len(COMMUNITY_REPORTS) + 1,
            "type": req.type,
            "text": req.text,
            "lat": req.lat,
            "lon": req.lon,
            "timestamp": "Just now",
            "region": closest
        }
        COMMUNITY_REPORTS.insert(0, new_report) # Place newest report at first position
        return new_report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/map")
def map_data_endpoint():
    """
    Returns overlay coordinates for the interactive map.
    """
    pfzs = [
        {
            "id": "pfz-mumbai",
            "name": "Mumbai Offshore PFZ",
            "center": [18.70, 72.40],
            "radius_meters": 12000,
            "chlorophyll": 4.8,
            "sst": 28.2,
            "type": "pfz"
        },
        {
            "id": "pfz-goa",
            "name": "Goa Coast PFZ",
            "center": [15.49, 73.82],
            "radius_meters": 9000,
            "chlorophyll": 5.1,
            "sst": 28.5,
            "type": "pfz"
        },
        {
            "id": "pfz-veraval",
            "name": "Saurashtra Coast PFZ",
            "center": [20.65, 70.05],
            "radius_meters": 16000,
            "chlorophyll": 6.2,
            "sst": 27.0,
            "type": "pfz"
        },
        {
            "id": "pfz-chennai",
            "name": "Coromandel Offshore PFZ",
            "center": [12.90, 80.60],
            "radius_meters": 10000,
            "chlorophyll": 3.1,
            "sst": 29.5,
            "type": "pfz"
        },
        {
            "id": "pfz-vizag",
            "name": "Vizag PFZ",
            "center": [17.50, 83.55],
            "radius_meters": 14000,
            "chlorophyll": 5.5,
            "sst": 28.8,
            "type": "pfz"
        }
    ]
    
    hazards = [
        {
            "id": "storm-kochi",
            "name": "Kochi Cyclonic Wind Zone",
            "center": [9.93, 76.15],
            "radius_meters": 35000,
            "severity": "DANGER",
            "description": "Wind speed 28 knots, waves 3.8m. Heavy thunderstorms present.",
            "type": "storm"
        },
        {
            "id": "naval-mumbai",
            "name": "Naval Dockyard Restricted Zone",
            "center": [18.928, 72.846],
            "radius_meters": 3000,
            "severity": "RESTRICTED",
            "description": "Naval vessel movements only. Prohibited for commercial fishing.",
            "type": "military"
        },
        {
            "id": "storm-bypass-mumbai",
            "name": "Active Squall Area (Mumbai Bypass Target)",
            "center": STORM_ZONE["center"],
            "radius_meters": STORM_ZONE["radius_km"] * 1000,
            "severity": "DANGER",
            "description": STORM_ZONE["name"],
            "type": "storm"
        },
        {
            "id": "border-alert-veraval",
            "name": "Sensitive Boundary Buffer Zone",
            "center": [21.5, 68.9],
            "radius_meters": 45000,
            "severity": "CAUTION",
            "description": "Approaching International Maritime Boundary. Coast Guard patrol area.",
            "type": "boundary"
        }
    ]
    
    vessel_path = [
        [18.940, 72.825],
        [18.925, 72.820],
        [18.910, 72.812],
        [18.880, 72.780],
        [18.840, 72.720],
        [18.800, 72.650],
        [18.760, 72.550],
        [18.720, 72.480],
        [18.700, 72.400]
      ]
    
    return {
        "pfzs": pfzs,
        "hazards": hazards,
        "vessel_path": vessel_path,
        "default_center": [18.95, 72.80],
        "reports": COMMUNITY_REPORTS
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
