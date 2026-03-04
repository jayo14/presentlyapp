"""
Geolocation utilities for attendance verification.
Includes support for point-in-polygon checking and distance calculations with elevation.
"""
from haversine import haversine, Unit
from math import sqrt
from typing import Tuple, List, Optional


def calculate_distance(
    lat1: float, 
    lon1: float, 
    lat2: float, 
    lon2: float,
    elevation1: Optional[float] = None,
    elevation2: Optional[float] = None
) -> float:
    """
    Calculate distance between two points using haversine formula.
    If elevations are provided, calculates 3D distance including vertical component.
    """
    # Calculate horizontal distance
    horizontal_distance = haversine(
        (lat1, lon1), 
        (lat2, lon2), 
        unit=Unit.METERS
    )
    
    # If elevations provided, calculate 3D distance
    if elevation1 is not None and elevation2 is not None:
        vertical_distance = abs(elevation2 - elevation1)
        # Use pythagorean theorem for 3D distance
        return sqrt(horizontal_distance ** 2 + vertical_distance ** 2)
    
    return horizontal_distance


def point_in_polygon(point: Tuple[float, float], polygon: List[List[float]]) -> bool:
    """
    Check if a point is inside a polygon using ray casting algorithm.
    This implementation is more robust and explicitly handles edge cases.
    
    Args:
        point: Tuple of (latitude, longitude)
        polygon: List of [longitude, latitude] coordinate pairs defining the polygon
    
    Returns:
        True if point is inside polygon, False otherwise
    """
    if not polygon or len(polygon) < 3:
        return False
    
    lat, lon = point
    inside = False
    
    # Ensure polygon is closed for the calculation if it isn't already
    # Most GeoJSON-like polygons repeat the first point at the end
    n = len(polygon)
    
    # Ray casting algorithm
    j = n - 1
    for i in range(n):
        pi_lon, pi_lat = polygon[i]
        pj_lon, pj_lat = polygon[j]
        
        # Check if point is on the horizontal line between vertex i and j
        # and if the point is to the left of the edge between them
        if ((pi_lat > lat) != (pj_lat > lat)) and \
           (lon < (pj_lon - pi_lon) * (lat - pi_lat) / (pj_lat - pi_lat + 1e-10) + pi_lon):
            inside = not inside
        j = i
        
    return inside


def verify_location(
    student_lat: float,
    student_lon: float,
    student_elevation: Optional[float],
    venue_lat: float,
    venue_lon: float,
    venue_elevation: Optional[float],
    boundary_coords: Optional[List[List[float]]],
    radius: int
) -> Tuple[bool, float]:
    """
    Verify if student's location is within acceptable range of venue.
    Uses polygon boundary if available, otherwise uses radius-based verification.
    """
    # Calculate distance from venue center
    distance = calculate_distance(
        student_lat, student_lon,
        venue_lat, venue_lon,
        student_elevation, venue_elevation
    )
    
    # Check if boundary is defined
    if boundary_coords and len(boundary_coords) >= 3:
        # Use polygon-based verification
        inside_boundary = point_in_polygon(
            (student_lat, student_lon),
            boundary_coords
        )
        
        # Additional elevation check if both elevations are available
        if inside_boundary and student_elevation is not None and venue_elevation is not None:
            # Allow 10 meters elevation tolerance (accounts for multi-floor buildings)
            elevation_diff = abs(student_elevation - venue_elevation)
            if elevation_diff > 10:
                inside_boundary = False
        
        return (inside_boundary, distance)
    else:
        # Use radius-based verification
        is_verified = distance <= radius
        return (is_verified, distance)
