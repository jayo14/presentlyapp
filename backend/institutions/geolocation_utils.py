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
    
    n = len(polygon)

    # polygon is [[lng, lat], [lng, lat], ...]
    p1_lon, p1_lat = polygon[0]
    
    for i in range(1, n + 1):
        p2_lon, p2_lat = polygon[i % n]
        
        # Check if point's latitude is between the two vertices' latitudes
        if min(p1_lat, p2_lat) < lat <= max(p1_lat, p2_lat):
            # Calculate the longitude of polygon edge at point's latitude
            if p2_lat != p1_lat:  # Avoid division by zero
                # Calculate where the horizontal ray at 'lat' intersects the edge
                # (lon - p1_lon) / (p2_lon - p1_lon) = (lat - p1_lat) / (p2_lat - p1_lat)
                lon_intersection = p1_lon + (lat - p1_lat) * (p2_lon - p1_lon) / (p2_lat - p1_lat)
                
                # If point's longitude is to the left of the intersection, toggle inside/outside
                if lon <= lon_intersection:
                    inside = not inside
        
        p1_lon, p1_lat = p2_lon, p2_lat
    
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
