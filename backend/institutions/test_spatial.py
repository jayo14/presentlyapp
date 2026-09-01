from django.test import TestCase
from django.contrib.auth import get_user_model
from institutions.models import (
    Institution, College, Department, Venue, SpatialFeature,
    RoomProperties, BuildingProperties, RoadProperties, EntranceProperties,
    SpatialCategory, SpatialGeometryType
)
from institutions.spatial_utils import (
    validate_geojson_geometry,
    compute_derived_spatial_properties,
    convert_lat_lng_ring_to_geojson_ring,
    convert_geojson_ring_to_lat_lng_ring
)

User = get_user_model()


class SpatialUtilsTest(TestCase):
    def test_validate_geojson_geometry_point(self):
        valid_point = {'type': 'Point', 'coordinates': [3.5080, 6.6190]}
        is_valid, err = validate_geojson_geometry(valid_point)
        self.assertTrue(is_valid)
        self.assertIsNone(err)

    def test_validate_geojson_geometry_polygon(self):
        valid_poly = {
            'type': 'Polygon',
            'coordinates': [
                [
                    [3.5080, 6.6190],
                    [3.5090, 6.6190],
                    [3.5090, 6.6200],
                    [3.5080, 6.6200],
                    [3.5080, 6.6190]
                ]
            ]
        }
        is_valid, err = validate_geojson_geometry(valid_poly)
        self.assertTrue(is_valid)
        self.assertIsNone(err)

    def test_validate_geojson_geometry_polygon_with_hole(self):
        poly_with_hole = {
            'type': 'Polygon',
            'coordinates': [
                [
                    [3.5080, 6.6190],
                    [3.5090, 6.6190],
                    [3.5090, 6.6200],
                    [3.5080, 6.6200],
                    [3.5080, 6.6190]
                ],
                [
                    [3.5083, 6.6193],
                    [3.5087, 6.6193],
                    [3.5087, 6.6197],
                    [3.5083, 6.6197],
                    [3.5083, 6.6193]
                ]
            ]
        }
        is_valid, err = validate_geojson_geometry(poly_with_hole)
        self.assertTrue(is_valid)
        self.assertIsNone(err)

    def test_validate_invalid_unclosed_polygon(self):
        invalid_poly = {
            'type': 'Polygon',
            'coordinates': [
                [
                    [3.5080, 6.6190],
                    [3.5090, 6.6190],
                    [3.5090, 6.6200],
                    [3.5080, 6.6200]
                ]
            ]
        }
        is_valid, err = validate_geojson_geometry(invalid_poly)
        self.assertFalse(is_valid)
        self.assertIn("not closed", err)

    def test_compute_derived_spatial_properties(self):
        poly = {
            'type': 'Polygon',
            'coordinates': [
                [
                    [3.5080, 6.6190],
                    [3.5090, 6.6190],
                    [3.5090, 6.6200],
                    [3.5080, 6.6200],
                    [3.5080, 6.6190]
                ]
            ]
        }
        derived = compute_derived_spatial_properties(poly)
        self.assertEqual(derived['derived_centroid'], [3.5085, 6.6195])
        self.assertEqual(derived['derived_bbox'], [3.5080, 6.6190, 3.5090, 6.6200])
        self.assertGreater(derived['derived_area_sqm'], 0)

    def test_coordinate_conversions(self):
        lat_lng = [[6.6190, 3.5080], [6.6190, 3.5090], [6.6200, 3.5090]]
        geojson_ring = convert_lat_lng_ring_to_geojson_ring(lat_lng)
        self.assertEqual(geojson_ring[0], [3.5080, 6.6190])
        self.assertEqual(geojson_ring[-1], [3.5080, 6.6190])


class SpatialFeatureModelTest(TestCase):
    def setUp(self):
        self.institution = Institution.objects.create(
            full_name="Lagos State University of Science and Technology",
            short_name="LASUSTECH",
            abbreviation="LASUSTECH",
            country="Nigeria",
            state_province="Lagos",
            city="Ikorodu",
            address="Ikorodu, Lagos"
        )

    def test_create_spatial_feature_auto_derives_centroid_and_bbox(self):
        poly = {
            'type': 'Polygon',
            'coordinates': [
                [
                    [3.5080, 6.6190],
                    [3.5090, 6.6190],
                    [3.5090, 6.6200],
                    [3.5080, 6.6200],
                    [3.5080, 6.6190]
                ]
            ]
        }
        sf = SpatialFeature.objects.create(
            name="Engineering Block A",
            category=SpatialCategory.BUILDING,
            geojson_geometry=poly,
            institution=self.institution
        )
        self.assertEqual(sf.derived_centroid, [3.5085, 6.6195])
        self.assertEqual(sf.derived_bbox, [3.5080, 6.6190, 3.5090, 6.6200])
        self.assertEqual(float(sf.longitude), 3.5085)
        self.assertEqual(float(sf.latitude), 6.6195)
        self.assertEqual(sf.label_position, [3.5085, 6.6195])

    def test_parent_child_hierarchy(self):
        campus = SpatialFeature.objects.create(
            name="Main Campus",
            category=SpatialCategory.CAMPUS,
            geojson_geometry={'type': 'Point', 'coordinates': [3.5085, 6.6195]},
            institution=self.institution
        )
        building = SpatialFeature.objects.create(
            name="Science Complex",
            category=SpatialCategory.BUILDING,
            parent=campus,
            geojson_geometry={'type': 'Point', 'coordinates': [3.5085, 6.6195]},
            institution=self.institution
        )
        room = SpatialFeature.objects.create(
            name="Lab 101",
            category=SpatialCategory.ROOM,
            parent=building,
            geojson_geometry={'type': 'Point', 'coordinates': [3.5085, 6.6195]},
            institution=self.institution
        )
        self.assertEqual(room.parent, building)
        self.assertEqual(building.parent, campus)
        self.assertIn(building, campus.children.all())
        self.assertIn(room, building.children.all())

    def test_legacy_venue_sync(self):
        venue = Venue.objects.create(
            institution=self.institution,
            name="Main Auditorium",
            code="AUD-01",
            latitude=6.6195,
            longitude=3.5085,
            boundary=[[6.6190, 3.5080], [6.6190, 3.5090], [6.6200, 3.5090], [6.6200, 3.5080], [6.6190, 3.5080]]
        )
        self.assertIsNotNone(venue.spatial_feature)
        sf = venue.spatial_feature
        self.assertEqual(sf.name, "Main Auditorium")
        self.assertEqual(sf.category, SpatialCategory.ROOM)
        self.assertEqual(sf.geojson_geometry['type'], 'Polygon')
        self.assertEqual(sf.geojson_geometry['coordinates'][0][0], [3.5080, 6.6190])
