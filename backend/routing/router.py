import math
from typing import List, Tuple, Dict, Any

# Mock Hazard / Storm Zone
STORM_ZONE = {
    "center": [18.82, 72.62],  # Lat, Lon between Mumbai Port and offshore PFZ
    "radius_km": 15.0,
    "name": "Active Squall Area"
}

def haversine_distance(coord1: Tuple[float, float], coord2: Tuple[float, float]) -> float:
    """Calculates geodesic distance in km between two lat/lon coordinates."""
    R = 6371.0 # earth radius in km
    lat1, lon1 = math.radians(coord1[0]), math.radians(coord1[1])
    lat2, lon2 = math.radians(coord2[0]), math.radians(coord2[1])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    return R * c

def check_line_intersection_with_circle(start: Tuple[float, float], end: Tuple[float, float], center: Tuple[float, float], radius_km: float) -> bool:
    """Checks if the line segment between start and end goes close to the circle center (within radius_km)."""
    # Simple sampling along the line segment to see if any point is within the radius
    steps = 30
    for i in range(steps + 1):
        t = i / steps
        lat = start[0] + t * (end[0] - start[0])
        lon = start[1] + t * (end[1] - start[1])
        dist = haversine_distance((lat, lon), center)
        if dist < radius_km:
            return True
    return False

def calculate_routes(start: Tuple[float, float], end: Tuple[float, float]) -> Dict[str, Any]:
    """
    Computes shortest vs safer routes.
    If the shortest route intersects the mock storm/hazard zone, 
    the safer route bypasses it.
    """
    shortest_path = [start, end]
    
    # Calculate shortest route distance
    shortest_dist = haversine_distance(start, end)
    
    # Check if straight line crosses storm zone
    hazard_center = tuple(STORM_ZONE["center"])
    hazard_radius = STORM_ZONE["radius_km"]
    
    intersects = check_line_intersection_with_circle(start, end, hazard_center, hazard_radius)
    
    if intersects:
        # Generate a bypass waypoint.
        # Find the midpoint of start and end
        mid_lat = (start[0] + end[0]) / 2
        mid_lon = (start[1] + end[1]) / 2
        
        # Calculate perpendicular vector to bypass storm
        # Let's offset mid-point away from the storm center
        # Perpendicular vector to (end - start)
        d_lat = end[0] - start[0]
        d_lon = end[1] - start[1]
        
        # Perp vector (-d_lon, d_lat)
        perp_lat = -d_lon
        perp_lon = d_lat
        
        # Normalize perp vector
        length = math.sqrt(perp_lat**2 + perp_lon**2)
        if length > 0:
            perp_lat /= length
            perp_lon /= length
            
        # Shift midpoint in direction away from storm center
        # Calculate vector from storm center to midpoint
        vector_to_mid = [mid_lat - hazard_center[0], mid_lon - hazard_center[1]]
        # Dot product of perp vector and vector_to_mid to align bypass direction
        dot = perp_lat * vector_to_mid[0] + perp_lon * vector_to_mid[1]
        
        sign = 1 if dot >= 0 else -1
        # Shift by ~18km (greater than storm radius of 15km)
        shift_factor = 0.20 * sign # roughly 22km in lat/lon space
        
        waypoint = [mid_lat + perp_lat * shift_factor, mid_lon + perp_lon * shift_factor]
        safer_path = [start, waypoint, end]
    else:
        # If no intersection, safer path can be slightly offset or the same
        # Let's add a slight safety margin offset for visual differentiation
        mid_lat = (start[0] + end[0]) / 2
        mid_lon = (start[1] + end[1]) / 2
        waypoint = [mid_lat + 0.05, mid_lon - 0.05]
        safer_path = [start, waypoint, end]
        
    # Calculate safer route distance
    safer_dist = 0.0
    for i in range(len(safer_path) - 1):
        safer_dist += haversine_distance(safer_path[i], safer_path[i+1])
        
    return {
        "shortest": {
            "path": shortest_path,
            "distance_km": round(shortest_dist, 2),
            "label": "Shortest Route (Crosses Active Squall Zone)",
            "safety_rating": "DANGER / HIGH RISK"
        },
        "safer": {
            "path": safer_path,
            "distance_km": round(safer_dist, 2),
            "label": "Safer Route (Recommended Bypass)",
            "safety_rating": "SAFE"
        },
        "hazard_zone": STORM_ZONE
    }
