# Generated data migration to populate SpatialFeature from existing Venue objects

from django.db import migrations


def migrate_venues_to_spatial_features(apps, schema_editor):
    Venue = apps.get_model('institutions', 'Venue')
    SpatialFeature = apps.get_model('institutions', 'SpatialFeature')
    RoomProperties = apps.get_model('institutions', 'RoomProperties')

    for venue in Venue.objects.all():
        if venue.spatial_feature:
            continue

        # Determine category and subcategory
        vtype = venue.venue_type or 'CLASSROOM'
        if vtype in ('CLASSROOM', 'LECTURE_HALL', 'LAB', 'AUDITORIUM'):
            category = 'ROOM'
            subcategory = vtype
        elif vtype == 'ONLINE':
            category = 'FACILITY'
            subcategory = 'ONLINE'
        else:
            category = 'ROOM'
            subcategory = vtype

        # Build GeoJSON geometry (converting legacy [lat, lng] to GeoJSON [lng, lat])
        geojson_geom = None
        if venue.boundary and isinstance(venue.boundary, list) and len(venue.boundary) >= 3:
            geojson_ring = []
            for pt in venue.boundary:
                if isinstance(pt, (list, tuple)) and len(pt) >= 2:
                    lat, lng = float(pt[0]), float(pt[1])
                    geojson_ring.append([lng, lat])
            if len(geojson_ring) >= 3:
                if geojson_ring[0] != geojson_ring[-1]:
                    geojson_ring.append(list(geojson_ring[0]))
                geojson_geom = {
                    'type': 'Polygon',
                    'coordinates': [geojson_ring]
                }

        if not geojson_geom and venue.latitude is not None and venue.longitude is not None:
            geojson_geom = {
                'type': 'Point',
                'coordinates': [float(venue.longitude), float(venue.latitude)]
            }

        if not geojson_geom:
            geojson_geom = {
                'type': 'Point',
                'coordinates': [0.0, 0.0]
            }

        # Create SpatialFeature instance
        sf = SpatialFeature.objects.create(
            name=venue.name,
            code=venue.code,
            category=category,
            subcategory=subcategory,
            description=venue.description,
            geometry_type=geojson_geom.get('type', 'Polygon'),
            geojson_geometry=geojson_geom,
            elevation_m=venue.elevation,
            latitude=venue.latitude,
            longitude=venue.longitude,
            institution=venue.institution,
            college=venue.college,
            verification_method='PHYSICAL_GEOMETRY' if geojson_geom.get('type') == 'Polygon' else 'RADIUS',
            verification_radius_m=venue.verification_radius or venue.gps_radius or 50,
            venue_color=venue.venue_color or '#6366f1',
            venue_opacity=venue.venue_opacity if venue.venue_opacity is not None else 0.15,
            border_width=venue.border_width or 2,
            source='MIGRATED_FROM_VENUE',
            is_active=venue.is_active
        )

        # Create RoomProperties
        RoomProperties.objects.create(
            spatial_feature=sf,
            building_code=venue.building or venue.building_name,
            floor_number=venue.floor_number,
            room_number=venue.room_number,
            capacity=venue.capacity or 0,
            room_type=vtype,
            has_projector=venue.has_projector,
            has_computers=venue.has_computers,
            has_whiteboard=venue.has_whiteboard,
            has_microphone=venue.has_microphone,
        )

        venue.spatial_feature = sf
        venue.save(update_fields=['spatial_feature'])


def reverse_migration(apps, schema_editor):
    Venue = apps.get_model('institutions', 'Venue')
    Venue.objects.update(spatial_feature=None)
    SpatialFeature = apps.get_model('institutions', 'SpatialFeature')
    SpatialFeature.objects.filter(source='MIGRATED_FROM_VENUE').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('institutions', '0036_spatialfeature_roomproperties_roadproperties_and_more'),
    ]

    operations = [
        migrations.RunPython(
            migrate_venues_to_spatial_features,
            reverse_code=reverse_migration
        ),
    ]
