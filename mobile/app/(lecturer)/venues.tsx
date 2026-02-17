import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { storage } from '@/utils/storage';
import { Venue } from '@/types';
import { Plus, MapPin, Trash2, X } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { mockVenues } from '@/mocks/venues';
import { CustomModal } from '@/components/CustomModal';

export default function VenuesScreen() {
  const { colors } = useTheme();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  // Alert State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'info' | 'confirmation' | 'error' | 'success';
    onConfirm: () => void;
    onCancel?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {},
  });

  const showAlert = (
    title: string, 
    message: string, 
    type: 'info' | 'confirmation' | 'error' | 'success' = 'info', 
    onConfirm?: () => void,
    onCancel?: () => void
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      onConfirm: () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
        if (onConfirm) onConfirm();
      },
      onCancel: onCancel ? () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
        onCancel();
      } : () => setAlertConfig(prev => ({ ...prev, visible: false })),
    });
  };

  // Form State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState('50');
  const [capacity, setCapacity] = useState('');

  const loadVenues = async () => {
    let storedVenues = await storage.getVenues();
    if (storedVenues.length === 0) {
      // Initialize with mocks if empty
      storedVenues = mockVenues;
      for (const v of mockVenues) {
        await storage.saveVenue(v);
      }
    }
    setVenues(storedVenues);
  };

  useFocusEffect(
    useCallback(() => {
      loadVenues();
    }, [])
  );

  const handleCreate = async () => {
    if (!name || !latitude || !longitude) {
      showAlert('Error', 'Name and coordinates are required', 'error');
      return;
    }

    setLoading(true);
    const newVenue: Venue = {
      id: Date.now().toString(),
      name,
      address,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius: parseFloat(radius) || 50,
      capacity: capacity ? parseInt(capacity) : undefined,
    };

    await storage.saveVenue(newVenue);
    await loadVenues();
    setLoading(false);
    setIsCreating(false);
    resetForm();
    showAlert('Success', 'Venue created successfully', 'success');
  };

  const handleDelete = (id: string) => {
    showAlert(
      'Delete Venue',
      'Are you sure you want to delete this venue? This action cannot be undone.',
      'confirmation',
      async () => {
        await storage.deleteVenue(id);
        loadVenues();
      }
    );
  };

  const resetForm = () => {
    setName('');
    setAddress('');
    setLatitude('');
    setLongitude('');
    setRadius('50');
    setCapacity('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <CustomModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
      />
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Venues</Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setIsCreating(true)}
        >
          <Plus size={24} color={colors.background} />
        </TouchableOpacity>
      </View>

      {isCreating ? (
        <ScrollView style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={[styles.formTitle, { color: colors.text }]}>New Venue</Text>
            <TouchableOpacity onPress={() => setIsCreating(false)}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.form}>
            <Input 
              label="Venue Name" 
              placeholder="e.g. Lecture Hall 1" 
              value={name} 
              onChangeText={setName} 
            />
            <Input 
              label="Address/Description" 
              placeholder="e.g. Science Block" 
              value={address} 
              onChangeText={setAddress} 
            />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Input 
                  label="Latitude" 
                  placeholder="6.5244" 
                  value={latitude} 
                  onChangeText={setLatitude} 
                  keyboardType="numeric"
                />
              </View>
              <View style={{ width: 16 }} />
              <View style={{ flex: 1 }}>
                <Input 
                  label="Longitude" 
                  placeholder="3.3792" 
                  value={longitude} 
                  onChangeText={setLongitude} 
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Input 
                  label="Radius (meters)" 
                  placeholder="50" 
                  value={radius} 
                  onChangeText={setRadius} 
                  keyboardType="numeric"
                />
              </View>
              <View style={{ width: 16 }} />
              <View style={{ flex: 1 }}>
                <Input 
                  label="Capacity" 
                  placeholder="100" 
                  value={capacity} 
                  onChangeText={setCapacity} 
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Button 
              title="Create Venue" 
              onPress={handleCreate} 
              loading={loading}
              style={{ marginTop: 16 }}
            />
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={venues}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIcon}>
                  <MapPin size={24} color={colors.primary} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>{item.address}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Trash2 size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
              <View style={styles.cardDetails}>
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                  Cap: {item.capacity || 'N/A'} • Rad: {item.radius}m
                </Text>
                <Text style={[styles.detailText, { color: colors.textSecondary, fontFamily: 'monospace' }]}>
                  {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={{ color: colors.textSecondary }}>No venues found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 20,
    gap: 16,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 14,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  detailText: {
    fontSize: 12,
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  form: {
    gap: 16,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
});
