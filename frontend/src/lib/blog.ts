import apiClient from '../../services/api/client';
import type { Category, Post, Tag, NewsletterSubscriber, PaginatedResponse } from '../types/blog';

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

// --- ADMIN API ---

export async function adminGetAllPosts(options: GetAllPostsOptions = {}): Promise<PaginatedResponse<Post>> {
  const { category, tag, search, page = 1 } = options;
  const params: Record<string, string | number> = { page };
  if (category) params.category = category;
  if (tag) params.tag = tag;
  if (search) params.search = search;

  const response = await apiClient.get('/blog/admin/posts/', { params });
  return response.data;
}

export async function adminGetPostBySlug(slug: string): Promise<Post> {
  const response = await apiClient.get(`/blog/admin/posts/${slug}/`);
  return response.data;
}

export async function uploadBlogImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await apiClient.post('/auth/upload-avatar/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.data?.success || !response.data?.avatar_url) {
    throw new Error(response.data?.error || 'Image upload failed');
  }

  return response.data.avatar_url as string;
}

export async function createPost(data: Partial<Post>): Promise<Post> {
  const response = await apiClient.post('/blog/admin/posts/', data);
  return response.data;
}

export async function updatePost(slug: string, data: Partial<Post>): Promise<Post> {
  const response = await apiClient.patch(`/blog/admin/posts/${slug}/`, data);
  return response.data;
}

export async function deletePost(slug: string): Promise<void> {
  await apiClient.delete(`/blog/admin/posts/${slug}/`);
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  const response = await apiClient.post('/blog/admin/categories/', data);
  return response.data;
}

export async function updateCategory(slug: string, data: Partial<Category>): Promise<Category> {
  const response = await apiClient.patch(`/blog/admin/categories/${slug}/`, data);
  return response.data;
}

export async function deleteCategory(slug: string): Promise<void> {
  await apiClient.delete(`/blog/admin/categories/${slug}/`);
}

export async function createTag(data: Partial<Tag>): Promise<Tag> {
  const response = await apiClient.post('/blog/admin/tags/', data);
  return response.data;
}

export async function updateTag(slug: string, data: Partial<Tag>): Promise<Tag> {
  const response = await apiClient.patch(`/blog/admin/tags/${slug}/`, data);
  return response.data;
}

export async function deleteTag(slug: string): Promise<void> {
  await apiClient.delete(`/blog/admin/tags/${slug}/`);
}

export async function getAllSubscribers(page: number = 1): Promise<PaginatedResponse<NewsletterSubscriber>> {
  const response = await apiClient.get('/blog/admin/subscribers/', { params: { page } });
  return response.data;
}

export async function unsubscribeUser(id: number): Promise<void> {
  await apiClient.patch(`/blog/admin/subscribers/${id}/`, { is_active: false });
}
