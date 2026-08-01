import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { AlertTriangle, School, ChevronLeft } from 'lucide-react-native';
import Fonts from '@/constants/fonts';
import { useState } from 'react';
import { api } from '@/services/api';

export default function DropCourseConfirmationScreen() {
  const router = useRouter();
  const { id, code, title } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const [dropping, setDropping] = useState(false);

  const bgColor = isDark ? '#231e0f' : colors.background;

  const handleDrop = async () => {
    setDropping(true);
    try {
        await api.courses.drop(id as string);
        router.push({
            pathname: '/(student)/courses/drop-success',
            params: { code, title }
        });
    } catch (e) {
        console.error('Failed to drop course', e);
    } finally {
        setDropping(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/")} style={styles.backButton}>
            <ChevronLeft size={24} color={isDark ? '#FFFFFF' : '#111418'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : colors.text }]}>Course Management</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
            {/* Warning Icon */}
            <View style={styles.warningIconContainer}>
                <AlertTriangle size={48} color="#f9c406" />
            </View>

            <Text style={[styles.title, { color: isDark ? '#FFFFFF' : colors.text }]}>Drop this Course?</Text>

            {/* Course Card */}
            <View style={styles.card}>
                <View style={styles.cardInfo}>
                    <Text style={styles.cardLabel}>SELECTED COURSE</Text>
                    <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : colors.text }]}>{code} - {title}</Text>
                    <Text style={styles.cardSubtitle}>Spring 2024 • 4 Credit Units</Text>
                </View>
                <View style={styles.cardIcon}>
                    <School size={32} color="#f9c406" />
                </View>
            </View>

            <Text style={styles.warningText}>
                Dropping this course will remove your attendance records and enrollment. This action may affect your credit units for the semester.
            </Text>

            <View style={styles.buttonGroup}>
                <TouchableOpacity
                    style={styles.keepBtn}
                    onPress={() => router.canGoBack() ? router.back() : router.replace("/")}
                >
                    <Text style={styles.keepBtnText}>Keep Course</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.dropBtn}
                    onPress={handleDrop}
                    disabled={dropping}
                >
                    <Text style={styles.dropBtnText}>{dropping ? 'Dropping...' : 'Confirm Drop'}</Text>
                </TouchableOpacity>
            </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(249, 196, 6, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 40,
  },
  content: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  warningIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(249, 196, 6, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#f9c406',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontFamily: Fonts.lexend.bold,
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: 'rgba(249, 196, 6, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(249, 196, 6, 0.2)',
    padding: 20,
    marginBottom: 32,
  },
  cardInfo: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    color: '#f9c406',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: Fonts.lexend.bold,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.lexend.medium,
    color: 'rgba(249, 196, 6, 0.7)',
  },
  cardIcon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: 'rgba(249, 196, 6, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  warningText: {
    fontSize: 16,
    fontFamily: Fonts.lexend.regular,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  buttonGroup: {
    width: '100%',
    gap: 16,
    marginBottom: 40,
  },
  keepBtn: {
    height: 64,
    backgroundColor: '#f9c406',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  keepBtnText: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
    color: '#231e0f',
  },
  dropBtn: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropBtnText: {
    fontSize: 16,
    fontFamily: Fonts.lexend.semiBold,
    color: '#F43F5E',
  }
});
