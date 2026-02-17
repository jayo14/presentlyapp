import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Alert, Image } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { storage } from '@/utils/storage';
import { Venue } from '@/types';
import { Search, Plus, MapPin, Trash2, Edit2, X, Image as ImageIcon, Navigation, Crosshair } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { CustomModal } from '@/components/CustomModal';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

export default function ManageVenuesScreen() {
  const { colors } = useTheme();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Create/Edit Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    radius: '50',
    capacity: '',
    image: ''
  });

  // Alert State
  const [confirmModal, setConfirmModal] = useState<{ visible: boolean, venueId: string }>({ visible: false, venueId: '' });

  const loadVenues = async () => {
    const loadedVenues = await storage.getVenues();
    setVenues(loadedVenues);
  };

  useFocusEffect(
    useCallback(() => {
      loadVenues();
    }, [])
  );

  const filteredVenues = venues.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGetCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Allow location access to use this feature');
      return;
    }

    setLoading(true);
    let location = await Location.getCurrentPositionAsync({});
    setFormData({
      ...formData,
      latitude: location.coords.latitude.toString(),
      longitude: location.coords.longitude.toString()
    });
    setLoading(false);
  };

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });

    if (!result.canceled) {
      setFormData({ ...formData, image: result.assets[0].uri });
    }
  };

  const handleSaveVenue = async () => {
    if (!formData.name || !formData.latitude || !formData.longitude) {
      Alert.alert('Error', 'Name and coordinates are required');
      return;
    }

    setLoading(true);
    const venueToSave: Venue = {
      id: editingVenue?.id || `venue_${Date.now()}`,
      name: formData.name,
      address: formData.address,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      radius: parseFloat(formData.radius) || 50,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      image: formData.image
    };

    await storage.saveVenue(venueToSave);
    await loadVenues();
    setLoading(false);
    setModalVisible(false);
    resetForm();
  };

  const deleteVenue = async (id: string) => {
    await storage.deleteVenue(id);
    await loadVenues();
    setConfirmModal({ visible: false, venueId: '' });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      latitude: '',
      longitude: '',
      radius: '50',
      capacity: '',
      image: ''
    });
    setEditingVenue(null);
  };

  const openEdit = (venue: Venue) => {
    setEditingVenue(venue);
    setFormData({
      name: venue.name,
      address: venue.address,
      latitude: venue.latitude.toString(),
      longitude: venue.longitude.toString(),
      radius: venue.radius.toString(),
      capacity: venue.capacity?.toString() || '',
      image: venue.image || ''
    });
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <CustomModal 
        visible={confirmModal.visible}
        title="Delete Venue"
        message="Are you sure you want to delete this venue?"
        type="confirmation"
        confirmText="Delete"
        onConfirm={() => deleteVenue(confirmModal.venueId)}
        onCancel={() => setConfirmModal({ visible: false, venueId: '' })}
      />

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Venues</Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => { resetForm(); setModalVisible(true); }}
        >
          <Plus size={24} color={colors.background} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput 
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search venues..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList 
        data={filteredVenues}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.venueCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.cardImage} />
            ) : (
              <View style={[styles.imagePlaceholder, { backgroundColor: colors.border + '30' }]}>
                <MapPin size={32} color={colors.textSecondary} />
              </View>
            )}
            <View style={styles.cardInfo}>
              <View style={styles.cardMain}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.venueName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.venueAddress, { color: colors.textSecondary }]}>{item.address}</Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
                    <Edit2 size={18} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setConfirmModal({ visible: true, venueId: item.id })} style={styles.actionBtn}>
                    <Trash2 size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.cardMeta}>
                <View style={styles.metaItem}>
                  <Navigation size={14} color={colors.primary} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}</Text>
                </View>
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>Rad: {item.radius}m • Cap: {item.capacity || '∞'}</Text>
              </View>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingVenue ? 'Edit Venue' : 'New Venue'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
              <TouchableOpacity onPress={handlePickImage} style={[styles.imagePicker, { backgroundColor: colors.border + '20', borderColor: colors.border }]}>
                {formData.image ? (
                  <Image source={{ uri: formData.image }} style={styles.pickerImage} />
                ) : (
                  <View style={styles.pickerPlaceholder}>
                    <ImageIcon size={32} color={colors.textSecondary} />
                    <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Add Venue Image</Text>
                  </View>
                )}
              </TouchableOpacity>

              <Input label="Venue Name" placeholder="Main Auditorium" value={formData.name} onChangeText={t => setFormData({...formData, name: t})} />
              <Input label="Address" placeholder="Science Block, East Wing" value={formData.address} onChangeText={t => setFormData({...formData, address: t})} />
              
              <View style={styles.locationGroup}>
                <View style={{ flex: 1 }}>
                  <Input label="Latitude" placeholder="0.0000" value={formData.latitude} onChangeText={t => setFormData({...formData, latitude: t})} keyboardType="numeric" />
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <Input label="Longitude" placeholder="0.0000" value={formData.longitude} onChangeText={t => setFormData({...formData, longitude: t})} keyboardType="numeric" />
                </View>
                <TouchableOpacity onPress={handleGetCurrentLocation} style={[styles.locationBtn, { backgroundColor: colors.primary }]}>
                  <Crosshair size={24} color={colors.background} />
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Input label="Radius (m)" placeholder="50" value={formData.radius} onChangeText={t => setFormData({...formData, radius: t})} keyboardType="numeric" />
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <Input label="Capacity" placeholder="200" value={formData.capacity} onChangeText={t => setFormData({...formData, capacity: t})} keyboardType="numeric" />
                </View>
              </View>

              <Button title={editingVenue ? "Update Venue" : "Create Venue"} onPress={handleSaveVenue} loading={loading} style={{ marginTop: 24, marginBottom: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: '700' },
  addButton: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  searchSection: { paddingHorizontal: 20, marginBottom: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 48, borderRadius: 14, borderWidth: 1, gap: 8 },
  searchInput: { flex: 1, fontSize: 15 },
  listContent: { paddingHorizontal: 20, gap: 16, paddingBottom: 40 },
  venueCard: { borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
  cardImage: { width: '100%', height: 150 },
  imagePlaceholder: { width: '100%', height: 150, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { padding: 16, gap: 12 },
  cardMain: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  venueName: { fontSize: 18, fontWeight: '700' },
  venueAddress: { fontSize: 14, marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.03)' },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, height: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  form: { flex: 1 },
  imagePicker: { width: '100%', height: 180, borderRadius: 20, borderStyle: 'dashed', borderWidth: 2, overflow: 'hidden', marginBottom: 20 },
  pickerImage: { width: '100%', height: '100%' },
  pickerPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  locationGroup: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 4 },
  locationBtn: { height: 56, width: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8, marginLeft: 12 },
  row: { flexDirection: 'row' }
});
