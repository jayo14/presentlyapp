import apiClient from '../../services/api/client';
import type { Category, Post, Tag } from '../types/blog';

interface GetAllPostsOptions {
  category?: string;
  tag?: string;
  search?: string;
  page?: number;
}

export async function getAllPosts(options: GetAllPostsOptions = {}): Promise<Post[]> {
  const { category, tag, search, page = 1 } = options;
  const params: Record<string, string | number> = { page };
  if (category) params.category = category;
  if (tag) params.tag = tag;
  if (search) params.search = search;

  const response = await apiClient.get('/blog/posts/', { params });
  const data = response.data;
  const results: Post[] = Array.isArray(data) ? data : data.results ?? [];
  return results.map((post) => ({ ...post, source: 'api' as const }));
}

export async function getAllCategories(): Promise<Category[]> {
  const response = await apiClient.get('/blog/categories/');
  const data = response.data;
  return Array.isArray(data) ? data : data.results ?? [];
}

export async function getAllTags(): Promise<Tag[]> {
  const response = await apiClient.get('/blog/tags/');
  const data = response.data;
  return Array.isArray(data) ? data : data.results ?? [];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const response = await apiClient.get(`/blog/posts/${slug}/`);
    const post: Post = response.data;
    return { ...post, source: 'api' as const };
  } catch {
    return null;
  }
}

export async function getRelatedPosts(currentSlug: string, tags: string[]): Promise<Post[]> {
  if (!tags.length) return [];
  try {
    const posts = await getAllPosts({ tag: tags[0] });
    return posts.filter((post) => post.slug !== currentSlug).slice(0, 3);
  } catch {
    return [];
  }
}

export async function subscribeToNewsletter(
  email: string,
  source: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.post('/blog/newsletter/subscribe/', { email, source });
    return { success: true };
  } catch (err: any) {
    const message =
      err?.response?.data?.error ||
      err?.response?.data?.detail ||
      'Unable to subscribe right now.';
    return { success: false, error: message };
  }
}
