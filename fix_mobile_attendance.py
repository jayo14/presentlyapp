import sys

with open('mobile/app/(student)/mark-attendance.tsx', 'r') as f:
    content = f.read()

# Add getMultipleSamples function to MarkAttendanceScreen
old_get_precise = """  const getPreciseLocation = async (retries = 2): Promise<LocationSample[]> => {
    setLocationStatus('Getting location...');
    for (let i = 0; i <= retries; i++) {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return [];

            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
                timeout: 10000
            });

            const accuracy = loc.coords.accuracy ?? ACCURACY_UNAVAILABLE;

            if (accuracy <= ACCURACY_THRESHOLD || i === retries) {
                return [{
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                    accuracy: accuracy,
                    timestamp: loc.timestamp,
                }];
            }

            setLocationStatus(`Improving accuracy... (${Math.round(accuracy)}m)`);
            # Wait a bit before retry
            await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (e) {
            if (i === retries) return [];
        }
    }
    return [];
  };"""

new_get_precise = """  const getMultipleSamples = async (count = 4, interval = 2000): Promise<LocationSample[]> => {
    const samples: LocationSample[] = [];
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Permission Denied', 'Location access is required to mark attendance.', 'error');
      return [];
    }

    for (let i = 0; i < count; i++) {
      setLocationStatus(`Verifying location (${i + 1}/${count})...`);
      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });

        samples.push({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          accuracy: loc.coords.accuracy ?? 100,
          timestamp: loc.timestamp,
        });
      } catch (e) {
        console.error("Sampling error:", e);
      }
      if (i < count - 1) await new Promise(resolve => setTimeout(resolve, interval));
    }
    return samples;
  };"""

content = content.replace(old_get_precise, new_get_precise)
content = content.replace('const samples = await getPreciseLocation();', 'const samples = await getMultipleSamples(4, 2000);')

with open('mobile/app/(student)/mark-attendance.tsx', 'w') as f:
    f.write(content)
