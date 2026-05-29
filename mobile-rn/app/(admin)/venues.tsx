import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Switch, TextInput, Platform } from 'react-native';
import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Venue } from '@/types';
import { Map, Filter, Plus, DoorOpen, Signal, X, Search, Edit, Trash2 } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { CustomModal } from '@/components/CustomModal';
import { MapView, Marker, Circle } from '@/components/NativeMaps';
import { venuesService } from '@/services/venues';

export default function ManageVenuesScreen() {
  const { colors, isDark } = useTheme();
  const [venues, setVenues] = useState<any[]>([]);
  const [activeVenueIds, setActiveVenueIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const mapRef = useRef<MapView>(null);

  // Create/Edit Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVenue, setEditingVenue] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    latitude: '',
    longitude: '',
    location_radius: '',
    description: '',
  });

  const [confirmModal, setConfirmModal] = useState<{ visible: boolean, venueId: string }>({ visible: false, venueId: '' });

  const loadVenues = async () => {
    try {
      const response: any = await venuesService.list();
      setVenues(response.results || response);
    } catch (error) {
      console.error('Error loading venues:', error);
    }
  };

  const loadActiveSessions = async () => {
    try {
      const response: any = await venuesService.getActiveSessions();
      setActiveVenueIds(response.active_venue_ids || []);
    } catch (error) {
      console.error('Error loading active sessions:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadVenues();
      loadActiveSessions();
      
      const interval = setInterval(loadActiveSessions, 60000);
      return () => clearInterval(interval);
    }, [])
  );

  const openCreateModal = () => {
    setEditingVenue(null);
    setFormData({ name: '', code: '', latitude: '', longitude: '', location_radius: '', description: '' });
    setModalVisible(true);
  };

  const openEditModal = (venue: any) => {
    setEditingVenue(venue);
    setFormData({
      name: venue.name || '',
      code: venue.code || '',
      latitude: String(venue.latitude || ''),
      longitude: String(venue.longitude || ''),
      location_radius: String(venue.location_radius || ''),
      description: venue.description || '',
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingVenue(null);
    setFormData({ name: '', code: '', latitude: '', longitude: '', location_radius: '', description: '' });
  };

  const handleFormSubmit = async () => {
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
        location_radius: parseInt(formData.location_radius) || 100,
        description: formData.description,
      };
      if (editingVenue) {
        await venuesService.update(editingVenue.id, payload);
      } else {
        await venuesService.create(payload);
      }
      await loadVenues();
      closeModal();
    } catch (error) {
      console.error('Error saving venue:', error);
    }
  };

  const deleteVenue = async (id: string) => {
    try {
      await venuesService.delete(id);
      await loadVenues();
      if (selectedVenue?.id === id) setSelectedVenue(null);
    } catch (error) {
      console.error('Error deleting venue:', error);
    }
    setConfirmModal({ visible: false, venueId: '' });
  };

  const handleVenueSelect = (venue: any) => {
    setSelectedVenue(venue);
    const lat = parseFloat(String(venue.latitude));
    const lon = parseFloat(String(venue.longitude));
    if (lat && lon) {
      mapRef.current?.animateToRegion({
        latitude: lat,
        longitude: lon,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 500);
    }
  };

  const searchLower = searchQuery.toLowerCase();
  const filteredVenues = venues.filter(v => v.name.toLowerCase().includes(searchLower));
  const hasValidCoords = (v: any) => parseFloat(String(v.latitude)) && parseFloat(String(v.longitude));

  const firstVenueWithCoords = venues.find(hasValidCoords);
  const defaultRegion = firstVenueWithCoords
    ? {
        latitude: parseFloat(String(firstVenueWithCoords.latitude)),
        longitude: parseFloat(String(firstVenueWithCoords.longitude)),
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }
    : { latitude: 0, longitude: 0, latitudeDelta: 50, longitudeDelta: 50 };

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

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.primary + '1A', borderBottomWidth: 1 }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Map size={24} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>Venues & Maps</Text>
          </View>
          <TouchableOpacity style={[styles.headerIcon, { backgroundColor: colors.primary + '1A' }]}>
            <Filter size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.searchBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0' }]}>
          <Search size={18} color={colors.textSecondary} />
          <TextInput 
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search venues..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Map View */}
        <View style={styles.mapContainer}>
          {Platform.OS === 'web' ? (
            <View style={[styles.mapContainer, { justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
              <Map size={48} color={colors.textSecondary} style={{ marginBottom: 12 }} />
              <Text style={{ color: colors.textSecondary, fontSize: 16, fontWeight: '600' }}>Interactive Maps Unavailable</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>Maps are only supported on the mobile app</Text>
            </View>
          ) : (
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            initialRegion={defaultRegion}
          >
            {venues.filter(hasValidCoords).map(venue => {
              const lat = parseFloat(String(venue.latitude));
              const lon = parseFloat(String(venue.longitude));
              const isActive = activeVenueIds.includes(venue.id);
              return (
                <Marker
                  key={venue.id}
                  coordinate={{ latitude: lat, longitude: lon }}
                  title={venue.name}
                  description={isActive ? "Active Session in Progress" : ""}
                  pinColor={isActive ? "#EF4444" : colors.primary}
                  onPress={() => handleVenueSelect(venue)}
                />
              );
            })}
            {selectedVenue && hasValidCoords(selectedVenue) && (
              <Circle
                center={{
                  latitude: parseFloat(String(selectedVenue.latitude)),
                  longitude: parseFloat(String(selectedVenue.longitude)),
                }}
                radius={selectedVenue.location_radius || 100}
                strokeColor={colors.primary}
                fillColor={colors.primary + '22'}
              />
            )}
          </MapView>
          )}
        </View>

        {/* Venue List */}
        <View style={styles.venueListContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>VENUE LIST</Text>
          <View style={styles.venueList}>
            {filteredVenues.map((venue) => (
              <VenueItem
                key={venue.id}
                icon={<DoorOpen size={24} color={colors.primary} />}
                name={venue.name}
                code={venue.code}
                colors={colors}
                isDark={isDark}
                selected={selectedVenue?.id === venue.id}
                onPress={() => handleVenueSelect(venue)}
                onEdit={() => openEditModal(venue)}
                onDelete={() => setConfirmModal({ visible: true, venueId: venue.id })}
              />
            ))}
            {venues.length === 0 && (
              <View style={{ alignItems: 'center', padding: 20 }}>
                <Text style={{ color: colors.textSecondary }}>No venues found</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={[styles.legend, { backgroundColor: colors.background + 'E6', borderColor: colors.primary + '33' }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>Active Session</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>Venue</Text>
        </View>
      </View>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={openCreateModal}
      >
        <Plus size={32} color="#000" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingVenue ? 'Edit Venue' : 'New Venue'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
              <Input label="Venue Name *" placeholder="Main Auditorium" value={formData.name} onChangeText={t => setFormData({...formData, name: t})} />
              <Input label="Venue Code" placeholder="HALL-01" value={formData.code} onChangeText={t => setFormData({...formData, code: t})} />
              <Input label="Latitude" placeholder="0.0000" value={formData.latitude} onChangeText={t => setFormData({...formData, latitude: t})} keyboardType="numeric" />
              <Input label="Longitude" placeholder="0.0000" value={formData.longitude} onChangeText={t => setFormData({...formData, longitude: t})} keyboardType="numeric" />
              <Input label="Location Radius (metres)" placeholder="100" value={formData.location_radius} onChangeText={t => setFormData({...formData, location_radius: t})} keyboardType="numeric" />
              <Input label="Description" placeholder="Optional description" value={formData.description} onChangeText={t => setFormData({...formData, description: t})} />
              <Button title={editingVenue ? "Update Venue" : "Create Venue"} onPress={handleFormSubmit} style={{ marginTop: 24, marginBottom: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function VenueItem({ icon, name, code, colors, isDark, selected, onPress, onEdit, onDelete }: any) {
  return (
    <TouchableOpacity
      style={[styles.venueItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff', borderColor: selected ? colors.primary : (isDark ? 'rgba(255,255,255,0.1)' : '#eee') }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.venueItemLeft}>
        <View style={[styles.venueIconBox, { backgroundColor: selected ? colors.primary + '1A' : (isDark ? '#2a2a2a' : '#f0f0f0') }]}>
          {icon}
        </View>
        <View>
          <Text style={[styles.venueName, { color: colors.text }]}>{name}</Text>
          {code ? (
            <View style={styles.statusRow}>
              <Signal size={12} color={colors.primary} />
              <Text style={[styles.statusText, { color: colors.textSecondary }]}>{code}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <View style={styles.venueActions}>
        <TouchableOpacity onPress={onEdit} style={styles.actionBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Edit size={16} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.actionBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Trash2 size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, gap: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 20, fontWeight: '700', letterSpacing: -0.5 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 48, borderRadius: 12, gap: 10 },
  searchInput: { flex: 1, fontSize: 14 },
  headerIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  mapContainer: { height: 300, width: '100%' },
  venueListContainer: { padding: 16 },
  sectionTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 16 },
  venueList: { gap: 12, paddingBottom: 100 },
  venueItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1 },
  venueItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  venueIconBox: { width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  venueName: { fontSize: 16, fontWeight: '700' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  statusText: { fontSize: 10, fontWeight: '600' },
  venueActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  actionBtn: { padding: 4 },
  legend: { 
    position: 'absolute', 
    bottom: 100, 
    right: 16, 
    padding: 8, 
    borderRadius: 8, 
    borderWidth: 1,
    gap: 4
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 10, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, height: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  form: { flex: 1 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5 }
});
