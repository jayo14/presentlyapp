import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useBlogPost } from '@/hooks/useApi';
import { useTheme } from '@/hooks/useTheme';
import { ChevronLeft, Calendar, User, Tag } from 'lucide-react-native';

export default function BlogPostDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: post, isLoading } = useBlogPost(slug);
  const { colors } = useTheme();
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!post) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.canGoBack() ? router.back() : router.replace("/") : router.replace('/blog')}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{post.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{post.title}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Calendar size={14} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {new Date(post.published_at).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <User size={14} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{post.author_name}</Text>
          </View>
        </View>

        <View style={styles.tagRow}>
          <Tag size={14} color={colors.primary} />
          <Text style={[styles.tagText, { color: colors.primary }]}>{post.category_name}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.body, { color: colors.text }]}>{post.content}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', flex: 1, textAlign: 'center', marginHorizontal: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 20 },
  tagText: { fontSize: 12, fontWeight: 'bold' },
  divider: { height: 1, marginBottom: 20 },
  body: { fontSize: 16, lineHeight: 24 }
});
