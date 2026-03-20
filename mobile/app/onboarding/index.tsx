import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, ImageBackground, FlatList, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { ShieldCheck, MapPin, ArrowRight, Zap } from 'lucide-react-native';
import Fonts from '@/constants/fonts';

const { width } = Dimensions.get('window');

const screens = [
  {
    id: '1',
    title: 'GPS-Verified Attendance',
    description: 'Ensuring your presence where it matters most.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZufrBqqKAwn1w33MqcCoUcdi9B7Nschfo8_P3hldH_F_MPcgIvNjsIsIcAZYlonoi1wzpviKsYJf4vNvm41OkUHM3N7x_aA-IGMVO3o4FjsVyJW_McBq0qvv8Io-qJU1l6waKcTNxfhpccWb2Du81UUFnqE8WQOSKFNIJ6zYHwjA14IVM3S6Kg_Hd2Pb2Vzx415P2KxKzrfyDTNrrBa1JuKh41hf_9w1MnnnARdjYAKopYJiuGsz9YyCf-LvWGdsgixLA7jdf0QdK',
    type: 'illustration'
  },
  {
    id: '2',
    title: 'Real-time Class\nValidation',
    description: 'Instant updates for students and lecturers. Never miss a check-in with our live sync technology.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8PC0Ha6kyKs_KBSg76maklbiavgkuFCFV4UCFydryHo1XG8ZfcukrGzqgyXD5HNKsVOS9GPR6nBPX4gt8OfHY-g1YEGgzX2S-PjwRIjvR-1OoLQStVhrJj_2GXfUNO8QVCbXysMEAHGSXq_ZzVavoHzElC9WOsJCnJwmJFtTkkuo48i0IEZWI5-HoF3jFIF_NS9olsP_2a7niV3S1-iXcQKZ5z_vbimtiJKJyT1HBxWNBel1fdYyBYZmuNwlJ9VJ1Z8vcjlu958Uz',
    type: 'stats'
  },
  {
    id: '3',
    title: 'No Proxy, No Stress',
    description: 'Secure, fraud-proof attendance tracking.',
    type: 'shield'
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const router = useRouter();
  const { colors } = useTheme();
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < screens.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace('/onboarding/role-selection');
    }
  };

  const handleSkip = () => {
    router.replace('/onboarding/role-selection');
  };

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / width);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const renderItem = ({ item, index }: { item: typeof screens[0], index: number }) => {
    return (
      <View style={[styles.screenContainer, { width }]}>
        <View style={styles.imageSection}>
          {item.type === 'illustration' && (
            <ImageBackground source={{ uri: item.image }} style={styles.heroImage} resizeMode="contain">
              <View style={[styles.gradientOverlay, { backgroundColor: colors.background + '00' }]} />
              <View style={[styles.bottomOverlay, { backgroundColor: colors.background }]} />
            </ImageBackground>
          )}

          {item.type === 'stats' && (
            <View style={styles.statsContainer}>
              <ImageBackground source={{ uri: item.image }} style={styles.statsBg} resizeMode="cover">
                  <View style={[styles.statsBgOverlay, { backgroundColor: 'rgba(35, 30, 15, 0.8)' }]} />
              </ImageBackground>
              <View style={styles.statsOverlay}>
                  <View style={styles.statsRow}>
                      <View style={[styles.statsCard, { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: colors.primary + '4D' }]}>
                          <View style={styles.statsIconRow}>
                              <MapPin size={18} color={colors.primary} />
                              <Text style={[styles.statsCardLabel, { color: colors.text }]}>Attendance</Text>
                          </View>
                          <Text style={[styles.statsCardValue, { color: colors.text }]}>98%</Text>
                          <View style={styles.tagWrapper}>
                              <Zap size={12} color="#0bda1d" />
                              <Text style={styles.liveTagText}>LIVE</Text>
                          </View>
                      </View>
                      <View style={[styles.statsCard, { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: colors.primary + '4D' }]}>
                          <View style={styles.statsIconRow}>
                              <Zap size={18} color={colors.primary} />
                              <Text style={[styles.statsCardLabel, { color: colors.text }]}>Speed</Text>
                          </View>
                          <Text style={[styles.statsCardValue, { color: colors.text }]}>0.2s</Text>
                          <View style={styles.tagWrapper}>
                              <ShieldCheck size={12} color="#0bda1d" />
                              <Text style={styles.liveTagText}>SYNCED</Text>
                          </View>
                      </View>
                  </View>
              </View>
            </View>
          )}

          {item.type === 'shield' && (
            <View style={styles.shieldSection}>
              <View style={styles.glowShield} />
              <View style={styles.shieldCircle}>
                  <ShieldCheck size={140} color={colors.primary} strokeWidth={1} />
              </View>
              <View style={[styles.dotDecoration, { top: 40, right: 40, width: 12, height: 12, backgroundColor: colors.primary, opacity: 0.6 }]} />
              <View style={[styles.dotDecoration, { bottom: 48, left: 48, width: 8, height: 8, backgroundColor: colors.primary, opacity: 0.4 }]} />
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {item.description}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {currentIndex === 1 && (
        <TouchableOpacity style={styles.skipTop} onPress={handleSkip}>
          <Text style={[styles.skipText, { color: colors.primary }]}>Skip</Text>
        </TouchableOpacity>
      )}

      <FlatList
        ref={flatListRef}
        data={screens}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        bounces={false}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {screens.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === currentIndex ? colors.primary : '#6a5d2f',
                  width: index === currentIndex ? (index === 2 ? 32 : 10) : 10,
                },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            { borderColor: colors.primary, borderWidth: 2 }
          ]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: colors.primary }]}>
            {currentIndex === 2 ? 'Get Started' : 'Next'}
          </Text>
          {currentIndex < 2 && <ArrowRight size={20} color={colors.primary} style={{ marginLeft: 8 }} />}
        </TouchableOpacity>

        {currentIndex === 2 && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipBottom}>
            <Text style={[styles.skipBottomText, { color: colors.textSecondary }]}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={{ height: 40 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  skipTop: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
  },
  skipText: {
    fontSize: 16,
    fontFamily: Fonts.lexend.bold,
  },
  imageSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomOverlay: {
    height: 100,
    width: '100%',
  },
  statsContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  statsBg: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    height: 260,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2d281a',
  },
  statsBgOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  statsOverlay: {
    marginTop: 100,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statsCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  statsIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statsCardLabel: {
    fontSize: 14,
    fontFamily: Fonts.lexend.medium,
  },
  statsCardValue: {
    fontSize: 32,
    fontFamily: Fonts.lexend.bold,
    marginBottom: 4,
  },
  tagWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 4,
  },
  liveTagText: {
    fontSize: 12,
    fontFamily: Fonts.lexend.bold,
    color: '#0bda1d',
  },
  shieldSection: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 300,
  },
  glowShield: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(249, 196, 6, 0.1)',
  },
  shieldCircle: {
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: '#2a2515',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDecoration: {
    position: 'absolute',
    borderRadius: 10,
  },
  content: {
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 40,
    height: 140,
  },
  title: {
    fontSize: 32,
    fontFamily: Fonts.lexend.bold,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    fontFamily: Fonts.lexend.regular,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.7,
  },
  footer: {
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 32,
  },
  pagination: {
    flexDirection: 'row',
    gap: 12,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: Fonts.lexend.bold,
  },
  skipBottom: {
    marginTop: -16,
  },
  skipBottomText: {
    fontSize: 14,
    fontFamily: Fonts.lexend.medium,
  },
});
