"""
Geospatial calculation and GeoJSON validation utilities powered by Shapely.
Provides robust geometry validation, centroid/bbox derivation, coordinate ordering
conversions ([lat, lng] <-> GeoJSON [lng, lat]), area and length calculations.
"""

import math
from typing import Any, Dict, List, Optional, Tuple
from shapely.geometry import shape, mapping, Point, LineString, Polygon, MultiPolygon
from shapely.validation import explain_validity


def validate_geojson_geometry(geometry_data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    Validate GeoJSON geometry object structure, coordinate bounds, ring closure,
    and topological validity via Shapely.
    Returns (is_valid, error_message).
    """
    if not isinstance(geometry_data, dict):
        return False, "Geometry must be a dictionary object."

    gtype = geometry_data.get('type')
    coords = geometry_data.get('coordinates')

    allowed_types = {'Point', 'Polygon', 'MultiPolygon', 'LineString'}
    if gtype not in allowed_types:
        return False, f"Unsupported geometry type '{gtype}'. Must be one of {sorted(allowed_types)}."

    if coords is None:
        return False, "Geometry object missing 'coordinates' field."

    # Validate coordinate values & ranges
    def check_coord(pt: Any) -> Optional[str]:
        if not isinstance(pt, (list, tuple)) or len(pt) < 2:
            return "Coordinate must be [longitude, latitude] array."
        lng, lat = pt[0], pt[1]
        if not isinstance(lng, (int, float)) or not isinstance(lat, (int, float)):
            return f"Non-numeric coordinate found: [{lng}, {lat}]."
        if not (-180.0 <= float(lng) <= 180.0):
            return f"Longitude {lng} out of range [-180, 180]."
        if not (-90.0 <= float(lat) <= 90.0):
            return f"Latitude {lat} out of range [-90, 90]."
        return None

    if gtype == 'Point':
        err = check_coord(coords)
        if err:
            return False, err
    elif gtype == 'LineString':
        if not isinstance(coords, list) or len(coords) < 2:
            return False, "LineString must contain at least 2 points."
        for pt in coords:
            err = check_coord(pt)
            if err:
                return False, err
    elif gtype == 'Polygon':
        if not isinstance(coords, list) or len(coords) < 1:
            return False, "Polygon must contain at least an outer ring."
        for ring in coords:
            if not isinstance(ring, list) or len(ring) < 4:
                return False, "Polygon linear rings must contain at least 4 coordinate pairs."
            for pt in ring:
                err = check_coord(pt)
                if err:
                    return False, err
            # Check ring closure
            if ring[0][0] != ring[-1][0] or ring[0][1] != ring[-1][1]:
                return False, f"Polygon ring is not closed: first point {ring[0]} != last point {ring[-1]}."
    elif gtype == 'MultiPolygon':
        if not isinstance(coords, list) or len(coords) < 1:
            return False, "MultiPolygon must contain at least one Polygon array."
        for poly in coords:
            if not isinstance(poly, list) or len(poly) < 1:
                return False, "MultiPolygon element must contain at least an outer ring."
            for ring in poly:
                if not isinstance(ring, list) or len(ring) < 4:
                    return False, "Polygon linear rings must contain at least 4 coordinate pairs."
                for pt in ring:
                    err = check_coord(pt)
                    if err:
                        return False, err
                if ring[0][0] != ring[-1][0] or ring[0][1] != ring[-1][1]:
                    return False, "MultiPolygon ring is not closed."

    # Perform Shapely topological validation
    try:
        geom = shape(geometry_data)
        if not geom.is_valid:
            return False, f"Topologically invalid geometry: {explain_validity(geom)}"
    except Exception as exc:
        return False, f"Shapely geometry parsing error: {str(exc)}"

    return True, None


def compute_derived_spatial_properties(geometry_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Given a valid GeoJSON geometry dictionary, compute authoritative derived spatial properties:
    - derived_centroid: [longitude, latitude]
    - derived_bbox: [min_lng, min_lat, max_lng, max_lat]
    - derived_area_sqm: area in square meters (approximate planar geodesic)
    - derived_length_m: length in meters for LineString
    """
    geom = shape(geometry_data)
    min_lng, min_lat, max_lng, max_lat = geom.bounds
    centroid = geom.centroid

    derived_centroid = [round(float(centroid.x), 7), round(float(centroid.y), 7)]
    derived_bbox = [round(float(min_lng), 7), round(float(min_lat), 7),
                    round(float(max_lng), 7), round(float(max_lat), 7)]

    # Compute planar geodesic approximations (1 degree lat ~= 111,000 m; lon scaled by cos(lat))
    avg_lat_rad = math.radians(centroid.y)
    m_per_deg_lat = 111000.0
    m_per_deg_lng = 111000.0 * math.cos(avg_lat_rad)

    area_sqm = 0.0
    length_m = 0.0

    if geom.geom_type in ('Polygon', 'MultiPolygon'):
        # Approximate area in square meters
        # Scaling coordinates into local metric projection
        area_sqm = round(float(geom.area * m_per_deg_lat * m_per_deg_lng), 2)
    elif geom.geom_type == 'LineString':
        length_m = round(float(geom.length * math.sqrt((m_per_deg_lat**2 + m_per_deg_lng**2) / 2.0)), 2)

    return {
        'derived_centroid': derived_centroid,
        'derived_bbox': derived_bbox,
        'derived_area_sqm': abs(area_sqm) if area_sqm else None,
        'derived_length_m': abs(length_m) if length_m else None,
    }


def convert_lat_lng_ring_to_geojson_ring(coords: List[List[float]]) -> List[List[float]]:
    """
    Convert backend legacy [lat, lng] array to GeoJSON standard [lng, lat] array.
    Ensures loop closure.
    """
    if not coords:
        return []

    geojson_coords = []
    for pair in coords:
        if len(pair) >= 2:
            lat, lng = float(pair[0]), float(pair[1])
            geojson_coords.append([lng, lat])

    if len(geojson_coords) >= 3:
        if geojson_coords[0] != geojson_coords[-1]:
            geojson_coords.append(list(geojson_coords[0]))

    return geojson_coords


def convert_geojson_ring_to_lat_lng_ring(coords: List[List[float]]) -> List[List[float]]:
    """
    Convert GeoJSON standard [lng, lat] array to legacy [lat, lng] array.
    """
    if not coords:
        return []
    return [[float(pair[1]), float(pair[0])] for pair in coords if len(pair) >= 2]
