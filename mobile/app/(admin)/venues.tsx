import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Switch, TextInput } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/services/api';
import { Venue } from '@/types';
import { Map, Filter, Plus, Minus, Crosshair, DoorOpen, Signal, X, Search } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { CustomModal } from '@/components/CustomModal';
import Svg, { Circle, Path, Rect, G } from 'react-native-svg';
import Slider from '@react-native-community/slider';

export default function ManageVenuesScreen() {
  const { colors, isDark } = useTheme();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [geofenceEnabled, setGeofenceEnabled] = useState(true);
  const [radius, setRadius] = useState(250);
  
  // Create/Edit Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVenue] = useState<Venue | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
  });

  const [confirmModal, setConfirmModal] = useState<{ visible: boolean, venueId: string }>({ visible: false, venueId: '' });

  const loadVenues = async () => {
    try {
      const response: any = await api.venues.list();
      setVenues(response.results || response);
    } catch (error) {
      console.error('Error loading venues:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadVenues();
    }, [])
  );

  const deleteVenue = async (id: string) => {
    try {
      await api.venues.delete(id);
      await loadVenues();
    } catch (error) {
      console.error('Error deleting venue:', error);
    }
    setConfirmModal({ visible: false, venueId: '' });
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

      <ScrollView stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
        {/* Map View */}
        <View style={[styles.mapContainer, { backgroundColor: isDark ? '#1a170d' : '#f0f0f0' }]}>
          {/* Mock Map with SVG */}
          <Svg height="100%" width="100%" viewBox="0 0 400 300">
            <Rect x="0" y="0" width="400" height="300" fill={isDark ? "#12110a" : "#e0e0e0"} />
            <Path d="M50 50 L350 50 L350 250 L50 250 Z" fill={isDark ? "#1a1910" : "#d0d0d0"} />
            <Path d="M100 0 L100 300 M200 0 L200 300 M300 0 L300 300" stroke={isDark ? "#2a281a" : "#c0c0c0"} strokeWidth="1" />
            <Path d="M0 100 L400 100 M0 200 L400 200" stroke={isDark ? "#2a281a" : "#c0c0c0"} strokeWidth="1" />

            {/* Pins */}
            <G transform="translate(130, 80)">
              <Circle r="6" fill={colors.primary} />
              <Circle r="12" fill={colors.primary} opacity="0.2" />
            </G>
            <G transform="translate(260, 150)">
              <Circle r="6" fill={colors.primary} />
            </G>
            <G transform="translate(200, 220)">
              <Circle r="24" fill={colors.primary} opacity="0.1" stroke={colors.primary} strokeWidth="1" />
              <Circle r="3" fill={colors.primary} />
            </G>
          </Svg>

          {/* Labels */}
          <View style={[styles.mapLabel, { top: 40, left: 110 }]}>
            <Text style={styles.mapLabelText}>Hall 7</Text>
          </View>
          <View style={[styles.mapLabel, { top: 110, left: 230 }]}>
            <Text style={styles.mapLabelText}>Auditorium 2</Text>
          </View>

          {/* Map Controls */}
          <View style={styles.mapControls}>
            <TouchableOpacity style={[styles.mapButton, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : '#fff' }]}>
              <Plus size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.mapButton, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : '#fff' }]}>
              <Minus size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.mapButton, { backgroundColor: colors.primary }]}>
              <Crosshair size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Geofence Controls */}
        <View style={[styles.geofenceBar, { backgroundColor: colors.background, borderBottomColor: colors.primary + '1A', borderBottomWidth: 1 }]}>
          <View style={[styles.geofenceBox, { backgroundColor: colors.primary + '0D', borderColor: colors.primary + '33' }]}>
            <View>
              <Text style={[styles.geofenceTitle, { color: colors.primary }]}>Geofence Parameters</Text>
              <Text style={[styles.geofenceSubtitle, { color: colors.textSecondary }]}>Adjust perimeter tracking sensitivity</Text>
            </View>
            <Switch
              value={geofenceEnabled}
              onValueChange={setGeofenceEnabled}
              trackColor={{ false: '#333', true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
              <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>Radius Sensitivity</Text>
              <Text style={[styles.sliderValue, { color: colors.primary }]}>{radius}m</Text>
            </View>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={50}
              maximumValue={1000}
              value={radius}
              onValueChange={setRadius}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={isDark ? '#333' : '#ddd'}
              thumbTintColor={colors.primary}
            />
          </View>
        </View>

        {/* Venue List */}
        <View style={styles.venueListContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>LIVE VENUE STATUS</Text>
          <View style={styles.venueList}>
            {venues.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase())).map((venue) => (
              <VenueItem
                key={venue.id}
                icon={<DoorOpen size={24} color={colors.primary} />}
                name={venue.name}
                status="GPS: Active"
                sessionStatus="IDLE"
                time="Starts 09:00 AM"
                colors={colors}
                isDark={isDark}
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

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setModalVisible(true)}
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
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
              <Input label="Venue Name" placeholder="Main Auditorium" value={formData.name} onChangeText={t => setFormData({...formData, name: t})} />
              <Input label="Latitude" placeholder="0.0000" value={formData.latitude} onChangeText={t => setFormData({...formData, latitude: t})} keyboardType="numeric" />
              <Input label="Longitude" placeholder="0.0000" value={formData.longitude} onChangeText={t => setFormData({...formData, longitude: t})} keyboardType="numeric" />
              <Button title={editingVenue ? "Update Venue" : "Create Venue"} onPress={() => setModalVisible(false)} style={{ marginTop: 24, marginBottom: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function VenueItem({ icon, name, status, sessionStatus, time, colors, isDark, inactive, opacity }: any) {
  const active = sessionStatus === 'ACTIVE SESSION';
  return (
    <View style={[styles.venueItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#eee' }, opacity ? { opacity } : {}]}>
      <View style={styles.venueItemLeft}>
        <View style={[styles.venueIconBox, { backgroundColor: active ? colors.primary + '1A' : (isDark ? '#2a2a2a' : '#f0f0f0') }]}>
          {icon}
        </View>
        <View>
          <Text style={[styles.venueName, { color: colors.text }]}>{name}</Text>
          <View style={styles.statusRow}>
            <Signal size={12} color={active ? '#10B981' : colors.primary} />
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>{status}</Text>
          </View>
        </View>
      </View>
      <View style={styles.venueItemRight}>
        <View style={[styles.sessionBadge, { backgroundColor: active ? colors.primary : (isDark ? '#333' : '#eee') }]}>
          <Text style={[styles.sessionBadgeText, { color: active ? '#000' : colors.textSecondary }]}>{sessionStatus}</Text>
        </View>
        <Text style={[styles.venueTime, { color: colors.textSecondary }]}>{time}</Text>
      </View>
    </View>
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
  mapContainer: { height: 300, width: '100%', position: 'relative' },
  mapLabel: { position: 'absolute', backgroundColor: '#f2b90d', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  mapLabelText: { color: '#000', fontSize: 10, fontWeight: '700' },
  mapControls: { position: 'absolute', bottom: 16, right: 16, gap: 8 },
  mapButton: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  geofenceBar: { padding: 16, gap: 16 },
  geofenceBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1 },
  geofenceTitle: { fontSize: 14, fontWeight: '700' },
  geofenceSubtitle: { fontSize: 12, marginTop: 2 },
  sliderContainer: { paddingHorizontal: 8 },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sliderLabel: { fontSize: 12, fontWeight: '500' },
  sliderValue: { fontSize: 12, fontWeight: '700' },
  venueListContainer: { padding: 16 },
  sectionTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 16 },
  venueList: { gap: 12, paddingBottom: 100 },
  venueItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1 },
  venueItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  venueIconBox: { width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  venueName: { fontSize: 16, fontWeight: '700' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  statusText: { fontSize: 10, fontWeight: '600' },
  venueItemRight: { alignItems: 'flex-end', gap: 6 },
  sessionBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  sessionBadgeText: { fontSize: 10, fontWeight: '800' },
  venueTime: { fontSize: 10, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, height: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  form: { flex: 1 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5 }
});
