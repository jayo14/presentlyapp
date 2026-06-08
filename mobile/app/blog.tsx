import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useBlogPosts } from '@/hooks/useApi';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { ChevronLeft, BookOpen } from 'lucide-react-native';

export default function BlogScreen() {
  const { data: posts, isLoading } = useBlogPosts();
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.canGoBack() ? router.back() : router.replace("/") : router.replace('/')}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>University Blog</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
              onPress={() => router.push({ pathname: '/blog/[slug]', params: { slug: item.slug } })}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                <BookOpen size={24} color={colors.primary} />
              </View>
              <View style={styles.content}>
                <Text style={[styles.postTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.excerpt, { color: colors.textSecondary }]} numberOfLines={2}>
                  {item.excerpt}
                </Text>
                <Text style={[styles.meta, { color: colors.primary }]}>
                  {item.category_name} • {new Date(item.published_at).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  card: { flexDirection: 'row', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  iconContainer: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, marginLeft: 16 },
  postTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  excerpt: { fontSize: 14, marginBottom: 8 },
  meta: { fontSize: 12, fontWeight: '600' }
});
