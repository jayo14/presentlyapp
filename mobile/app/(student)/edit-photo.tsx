import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, Camera, Image as ImageIcon, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { api } from '@/services/api';
import Fonts from '@/constants/fonts';

export default function EditPhotoScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user, updateProfilePicture, refreshUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPreviewUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPreviewUri(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!previewUri) return;
    setUploading(true);
    try {
      const filename = previewUri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      const formData = new FormData();
      formData.append('avatar', { uri: previewUri, name: filename, type } as any);

      const response: any = await api.auth.uploadAvatar(formData);
      if (response?.avatar_url) {
        await updateProfilePicture(response.avatar_url);
        await refreshUser();
        router.canGoBack() ? router.back() : router.replace("/");
      } else {
        Alert.alert('Upload Failed', 'Could not save profile photo. Please try again.');
      }
    } catch (err) {
      Alert.alert('Upload Failed', 'Could not save profile photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const currentPhoto = previewUri || user?.profilePicture;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/")} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Photo</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        {/* Avatar Preview */}
        <View style={[styles.avatarContainer, { borderColor: colors.primary }]}>
          {currentPhoto ? (
            <Image source={{ uri: currentPhoto }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.initials, { color: colors.primary }]}>
                {user?.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          {previewUri && (
            <View style={[styles.previewBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.previewBadgeText}>Preview</Text>
            </View>
          )}
        </View>

        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Choose a clear photo for your profile
        </Text>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: isDark ? '#2d2714' : '#F1F5F9', borderColor: colors.border }]}
            onPress={takePhoto}
          >
            <Camera size={24} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: isDark ? '#2d2714' : '#F1F5F9', borderColor: colors.border }]}
            onPress={pickFromGallery}
          >
            <ImageIcon size={24} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Choose from Gallery</Text>
          </TouchableOpacity>

          {user?.profilePicture && !previewUri && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2', borderColor: '#FCA5A5' }]}
              onPress={() => {
                Alert.alert('Remove Photo', 'Remove your current profile photo?', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                      await updateProfilePicture('');
                      await refreshUser();
                    },
                  },
                ]);
              }}
            >
              <Trash2 size={24} color="#EF4444" />
              <Text style={[styles.actionText, { color: '#EF4444' }]}>Remove Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Save Button */}
        {previewUri && (
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: uploading ? 0.7 : 1 }]}
            onPress={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#0A0A0A" />
            ) : (
              <Text style={styles.saveBtnText}>Save Photo</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: Fonts.lexend.bold },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 40 },
  avatarContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  avatar: { width: '100%', height: '100%' },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontSize: 48, fontFamily: Fonts.lexend.bold },
  previewBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 4,
    alignItems: 'center',
  },
  previewBadgeText: { color: '#000', fontSize: 11, fontFamily: Fonts.lexend.bold },
  hint: { fontSize: 14, fontFamily: Fonts.lexend.regular, textAlign: 'center', marginBottom: 40 },
  actions: { width: '100%', gap: 12 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionText: { fontSize: 16, fontFamily: Fonts.lexend.medium },
  saveBtn: {
    marginTop: 32,
    width: '100%',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: { fontSize: 16, fontFamily: Fonts.lexend.bold, color: '#0A0A0A' },
});
