from django.test import TestCase
from .attendance_logic import _validate_sample_stability

class StabilityTestCase(TestCase):
    def test_stable_samples(self):
        # Samples with minor jitter (~2m) over 6 seconds
        samples = [
            {'latitude': 7.519700, 'longitude': 4.526700, 'timestamp': 1000},
            {'latitude': 7.519702, 'longitude': 4.526702, 'timestamp': 3000},
            {'latitude': 7.519701, 'longitude': 4.526701, 'timestamp': 5000},
            {'latitude': 7.519703, 'longitude': 4.526703, 'timestamp': 7000},
        ]
        is_stable, reason, drift = _validate_sample_stability(samples)
        self.assertTrue(is_stable, f"Stable samples rejected: {reason}")
        self.assertIsNone(reason)

    def test_mock_detection(self):
        samples = [
            {'latitude': 7.5197, 'longitude': 4.5267, 'timestamp': 1000},
            {'latitude': 7.5198, 'longitude': 4.5268, 'timestamp': 3000, 'is_mock': True},
        ]
        is_stable, reason, drift = _validate_sample_stability(samples)
        self.assertFalse(is_stable)
        self.assertEqual(reason, "Mock location detected")

    def test_jump_detection(self):
        samples = [
            {'latitude': 7.5197, 'longitude': 4.5267, 'timestamp': 1000},
            {'latitude': 7.6197, 'longitude': 4.6267, 'timestamp': 3000}, # Massive jump > 10km
        ]
        is_stable, reason, drift = _validate_sample_stability(samples)
        self.assertFalse(is_stable)
        self.assertIn("jump", reason)

    def test_speed_detection(self):
        samples = [
            {'latitude': 7.51970, 'longitude': 4.52670, 'timestamp': 1000},
            {'latitude': 7.51990, 'longitude': 4.52690, 'timestamp': 1010}, # ~30m in 0.01s = 3000m/s
        ]
        is_stable, reason, drift = _validate_sample_stability(samples)
        self.assertFalse(is_stable)
        # It might be a jump or speed depending on exact calculation
        self.assertTrue("speed" in reason or "jump" in reason)

    def test_drift_detection(self):
        samples = [
            {'latitude': 7.5197, 'longitude': 4.5267, 'timestamp': 1000},
            {'latitude': 7.5205, 'longitude': 4.5275, 'timestamp': 10000}, # ~120m from first in 9s
        ]
        is_stable, reason, drift = _validate_sample_stability(samples)
        self.assertFalse(is_stable)
        self.assertTrue("drift" in reason or "jump" in reason or "speed" in reason)
