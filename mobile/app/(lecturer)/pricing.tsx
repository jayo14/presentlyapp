import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Check, ArrowLeft, Sparkles } from 'lucide-react-native';
import Fonts from '@/constants/fonts';
import { useCurrentPlan, useCheckout } from '@/hooks/useApi';
import * as WebBrowser from 'expo-web-browser';

const FREE_FEATURES = [
  'Up to 1 course',
  'Unlimited students',
  'Unlimited sessions',
  'Basic attendance tracking',
  'Presently branding',
];

const PRO_FEATURES = [
  'Unlimited courses',
  'Advanced analytics & insights',
  'CSV/PDF export',
  'AI-powered insights',
  'No Presently branding',
  'Priority support',
];

export default function PricingScreen() {
  const { colors, isDark } = useTheme();
  const { data: currentPlan } = useCurrentPlan();
  const checkout = useCheckout();

  const isPro = currentPlan?.plan?.code === 'lecturer_pro_monthly';
  const bgColor = isDark ? '#0A0A0A' : colors.background;
  const surfaceColor = isDark ? '#1A1A1A' : '#FFFFFF';
  const cardBorder = isDark ? '#2A2A2A' : '#E5E5E5';

  const handleUpgrade = async () => {
    try {
      const result = await checkout.mutateAsync('lecturer_pro_monthly');
      await WebBrowser.openAuthSessionAsync(result.authorization_url);
    } catch {
      // handle error silently
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Plans</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.text }]}>Choose your plan</Text>
        <Text style={[styles.subtitle, { color: colors.text + '99' }]}>
          Start free, upgrade when you need more.
        </Text>

        {/* Free Plan */}
        <View style={[styles.card, { backgroundColor: surfaceColor, borderColor: cardBorder }]}>
          <Text style={[styles.planName, { color: colors.text }]}>Free</Text>
          <Text style={[styles.price, { color: colors.text }]}>
            ₦0<Text style={styles.pricePeriod}> /forever</Text>
          </Text>
          {FREE_FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Check size={16} color="#F9C406" />
              <Text style={[styles.featureText, { color: colors.text + 'CC' }]}>{f}</Text>
            </View>
          ))}
        </View>

        {/* Pro Plan */}
        <View style={[styles.card, styles.proCard, { backgroundColor: surfaceColor, borderColor: '#F9C406' }]}>
          <View style={styles.proBadge}>
            <Sparkles size={12} color="#000" />
            <Text style={styles.proBadgeText}>Most popular</Text>
          </View>
          <Text style={[styles.planName, { color: colors.text }]}>Lecturer Pro</Text>
          <Text style={[styles.price, { color: colors.text }]}>
            ₦3,000<Text style={styles.pricePeriod}> /month</Text>
          </Text>
          <Text style={[styles.priceNote, { color: colors.text + '99' }]}>
            Or ₦30,000/year (save 2 months)
          </Text>
          {PRO_FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Check size={16} color="#F9C406" />
              <Text style={[styles.featureText, { color: colors.text }]}>{f}</Text>
            </View>
          ))}

          {isPro ? (
            <View style={[styles.upgradeBtn, { backgroundColor: '#F9C406', opacity: 0.5 }]}>
              <Text style={styles.upgradeBtnText}>Active plan</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.upgradeBtn, { backgroundColor: '#F9C406' }]}
              onPress={handleUpgrade}
              disabled={checkout.isPending}
            >
              {checkout.isPending ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.upgradeBtnText}>Upgrade to Pro</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: Fonts.lexend.semiBold },
  scrollContent: { padding: 24, paddingBottom: 60 },
  title: { fontSize: 28, fontFamily: Fonts.lexend.bold, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, fontFamily: Fonts.lexend.regular, textAlign: 'center', marginBottom: 32 },
  card: {
    borderWidth: 1, borderRadius: 16, padding: 24, marginBottom: 16,
  },
  proCard: { borderWidth: 2, position: 'relative' },
  proBadge: {
    position: 'absolute', top: -12, alignSelf: 'center',
    backgroundColor: '#F9C406', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 4,
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  proBadgeText: { fontSize: 11, fontFamily: Fonts.lexend.semiBold, color: '#000' },
  planName: { fontSize: 20, fontFamily: Fonts.lexend.semiBold, marginBottom: 8 },
  price: { fontSize: 36, fontFamily: Fonts.lexend.bold, marginBottom: 4 },
  pricePeriod: { fontSize: 14, fontFamily: Fonts.lexend.regular },
  priceNote: { fontSize: 12, fontFamily: Fonts.lexend.regular, marginBottom: 20 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  featureText: { fontSize: 14, fontFamily: Fonts.lexend.regular, flex: 1 },
  upgradeBtn: {
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
    justifyContent: 'center', marginTop: 16, minHeight: 48,
  },
  upgradeBtnText: { fontSize: 16, fontFamily: Fonts.lexend.semiBold, color: '#000' },
});
