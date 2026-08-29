# Mock datasets for coastal regions in India

MOCK_REGIONS = {
    "mumbai": {
        "name": "Mumbai Coast",
        "lat": 18.95,
        "lon": 72.80,
        "weather": {
            "wind_speed": 12.5,
            "wind_direction": "WSW",
            "precipitation": 15.0,
            "air_temperature": 29.5,
            "condition": "Partly Cloudy",
            "warnings": []
        },
        "ocean": {
            "wave_height": 1.2,
            "sst": 28.2,
            "swell_period": 8.0,
            "sea_state": "Slightly Rough",
            "current_speed": 0.6
        },
        "satellite": {
            "chlorophyll": 4.8,
            "sst_anomaly": 0.4,
            "pfz_status": "High Potential Zone",
            "plankton_density": "High"
        },
        "tide": {
            "high_tide_1": "05:42 AM (3.8m)",
            "low_tide_1": "11:58 AM (1.1m)",
            "high_tide_2": "18:15 PM (3.5m)",
            "low_tide_2": "23:49 PM (0.8m)"
        },
        "gis": {
            "distance_to_imbl": 320.0,
            "restricted_zones": [
                {"name": "Naval Dockyard Zone", "distance_km": 8.5, "status": "Restricted"}
            ]
        }
    },
    "goa": {
        "name": "Goa Coast",
        "lat": 15.49,
        "lon": 73.82,
        "weather": {
            "wind_speed": 9.8,
            "wind_direction": "NW",
            "precipitation": 10.0,
            "air_temperature": 30.2,
            "condition": "Sunny and Clear",
            "warnings": []
        },
        "ocean": {
            "wave_height": 0.8,
            "sst": 28.5,
            "swell_period": 7.2,
            "sea_state": "Calm",
            "current_speed": 0.4
        },
        "satellite": {
            "chlorophyll": 5.1,
            "sst_anomaly": 0.6,
            "pfz_status": "High Potential Zone",
            "plankton_density": "High"
        },
        "tide": {
            "high_tide_1": "06:15 AM (1.8m)",
            "low_tide_1": "12:20 PM (0.3m)",
            "high_tide_2": "18:40 PM (1.6m)",
            "low_tide_2": "00:45 AM (0.2m)"
        },
        "gis": {
            "distance_to_imbl": 380.0,
            "restricted_zones": [
                {"name": "Mormugao Port Limit", "distance_km": 11.5, "status": "Permitted"}
            ]
        }
    },
    "kochi": {
        "name": "Kochi Coast",
        "lat": 9.93,
        "lon": 76.15,
        "weather": {
            "wind_speed": 28.0,
            "wind_direction": "W",
            "precipitation": 85.0,
            "air_temperature": 25.0,
            "condition": "Severe Thunderstorm",
            "warnings": ["Gale warning in effect", "Heavy squall alerts"]
        },
        "ocean": {
            "wave_height": 3.8,
            "sst": 26.5,
            "swell_period": 12.0,
            "sea_state": "Rough to Very Rough",
            "current_speed": 1.8
        },
        "satellite": {
            "chlorophyll": 1.2,
            "sst_anomaly": -1.2,
            "pfz_status": "Low Potential Zone",
            "plankton_density": "Low"
        },
        "tide": {
            "high_tide_1": "04:12 AM (1.4m)",
            "low_tide_1": "10:30 AM (0.4m)",
            "high_tide_2": "16:45 PM (1.3m)",
            "low_tide_2": "22:50 PM (0.3m)"
        },
        "gis": {
            "distance_to_imbl": 280.0,
            "restricted_zones": [
                {"name": "Port Channel Area", "distance_km": 1.2, "status": "Caution"}
            ]
        }
    },
    "veraval": {
        "name": "Veraval / Gujarat Coast",
        "lat": 20.90,
        "lon": 70.37,
        "weather": {
            "wind_speed": 18.0,
            "wind_direction": "NW",
            "precipitation": 40.0,
            "air_temperature": 27.8,
            "condition": "Overcast",
            "warnings": ["Moderate swell advisory"]
        },
        "ocean": {
            "wave_height": 2.2,
            "sst": 27.0,
            "swell_period": 9.5,
            "sea_state": "Moderate",
            "current_speed": 0.9
        },
        "satellite": {
            "chlorophyll": 6.2,
            "sst_anomaly": 0.8,
            "pfz_status": "High Potential Zone",
            "plankton_density": "Very High"
        },
        "tide": {
            "high_tide_1": "07:10 AM (2.8m)",
            "low_tide_1": "13:20 PM (0.8m)",
            "high_tide_2": "19:35 PM (2.6m)",
            "low_tide_2": "01:40 AM (0.6m)"
        },
        "gis": {
            "distance_to_imbl": 78.0,
            "restricted_zones": [
                {"name": "International Maritime Boundary Line", "distance_km": 78.0, "status": "High Alert"}
            ]
        }
    },
    "chennai": {
        "name": "Chennai Coast",
        "lat": 13.08,
        "lon": 80.30,
        "weather": {
            "wind_speed": 9.5,
            "wind_direction": "SE",
            "precipitation": 5.0,
            "air_temperature": 31.0,
            "condition": "Sunny / Clear",
            "warnings": []
        },
        "ocean": {
            "wave_height": 0.8,
            "sst": 29.5,
            "swell_period": 7.0,
            "sea_state": "Calm",
            "current_speed": 0.4
        },
        "satellite": {
            "chlorophyll": 3.1,
            "sst_anomaly": 0.2,
            "pfz_status": "Medium Potential Zone",
            "plankton_density": "Moderate"
        },
        "tide": {
            "high_tide_1": "06:30 AM (1.2m)",
            "low_tide_1": "12:45 PM (0.2m)",
            "high_tide_2": "18:50 PM (1.1m)",
            "low_tide_2": "00:55 AM (0.1m)"
        },
        "gis": {
            "distance_to_imbl": 210.0,
            "restricted_zones": [
                {"name": "Ennore Port Limit", "distance_km": 12.0, "status": "Permitted"}
            ]
        }
    },
    "vizag": {
        "name": "Visakhapatnam Coast",
        "lat": 17.68,
        "lon": 83.30,
        "weather": {
            "wind_speed": 14.0,
            "wind_direction": "ENE",
            "precipitation": 20.0,
            "air_temperature": 30.2,
            "condition": "Light Drizzle",
            "warnings": []
        },
        "ocean": {
            "wave_height": 1.4,
            "sst": 28.8,
            "swell_period": 8.5,
            "sea_state": "Slightly Rough",
            "current_speed": 0.7
        },
        "satellite": {
            "chlorophyll": 5.5,
            "sst_anomaly": 0.5,
            "pfz_status": "High Potential Zone",
            "plankton_density": "High"
        },
        "tide": {
            "high_tide_1": "05:15 AM (1.6m)",
            "low_tide_1": "11:30 AM (0.3m)",
            "high_tide_2": "17:35 PM (1.5m)",
            "low_tide_2": "23:40 PM (0.2m)"
        },
        "gis": {
            "distance_to_imbl": 450.0,
            "restricted_zones": [
                {"name": "Naval Base Prohibited Area", "distance_km": 4.2, "status": "Restricted"}
            ]
        }
    }
}

COMMUNITY_REPORTS = [
    {
        "id": 1,
        "type": "Good Catch",
        "text": "Spotted large school of mackerel 12km out.",
        "lat": 18.78,
        "lon": 72.50,
        "timestamp": "2 hours ago",
        "region": "mumbai"
    },
    {
        "id": 2,
        "type": "Calm Seas",
        "text": "Calm and clear seas today, perfect for fishing.",
        "lat": 15.42,
        "lon": 73.75,
        "timestamp": "5 hours ago",
        "region": "goa"
    },
    {
        "id": 3,
        "type": "Storm Warning",
        "text": "Sudden strong winds and dark storm clouds forming.",
        "lat": 9.98,
        "lon": 76.08,
        "timestamp": "1 hour ago",
        "region": "kochi"
    },
    {
        "id": 4,
        "type": "High Waves",
        "text": "Slightly high waves swell, but manageable for large vessels.",
        "lat": 13.12,
        "lon": 80.45,
        "timestamp": "4 hours ago",
        "region": "chennai"
    },
    {
        "id": 5,
        "type": "Good Catch",
        "text": "Rich plankton density, caught massive haul of tuna.",
        "lat": 20.85,
        "lon": 70.25,
        "timestamp": "6 hours ago",
        "region": "veraval"
    }
]

def get_closest_region(lat: float, lon: float) -> str:
    """Finds the closest mock region based on distance."""
    import math
    closest_key = "mumbai"
    min_dist = float("inf")
    
    for key, data in MOCK_REGIONS.items():
        dist = math.sqrt((data["lat"] - lat)**2 + (data["lon"] - lon)**2)
        if dist < min_dist:
            min_dist = dist
            closest_key = key
            
    return closest_key
