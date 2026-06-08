import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from './client';

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author_name: string;
  category_name: string;
  tags: string[];
  published_at: string;
  featured_image: string | null;
}

export const blogService = {
  getPosts: async (params?: any): Promise<BlogPost[]> => {
    return apiClient.get<BlogPost[]>(API_ENDPOINTS.BLOG.POSTS, params);
  },
  getPostDetail: async (slug: string): Promise<BlogPost> => {
    return apiClient.get<BlogPost>(API_ENDPOINTS.BLOG.POST_DETAIL(slug));
  },
  getTags: async () => {
    return apiClient.get(API_ENDPOINTS.BLOG.TAGS);
  },
  getCategories: async () => {
    return apiClient.get(API_ENDPOINTS.BLOG.CATEGORIES);
  },
  subscribeNewsletter: async (email: string) => {
    return apiClient.post(API_ENDPOINTS.BLOG.SUBSCRIBE, { email });
  },
};
