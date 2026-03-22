export type BlogSource = 'mdx' | 'api';

export interface Tag {
  id?: number;
  name: string;
  slug: string;
}

export interface Category {
  id?: number;
  name: string;
  slug: string;
  description?: string;
}

export interface Author {
  name: string;
  avatar?: string;
}

export interface Post {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  author_name: string;
  author_avatar?: string;
  category?: Category | null;
  tags: Tag[];
  status?: 'draft' | 'published';
  is_featured: boolean;
  reading_time: number;
  views?: number;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
  seo_title?: string;
  seo_description?: string;
  source: BlogSource;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface MDXFrontmatter {
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  author?: Author;
  category?: string;
  tags?: string[];
  publishedAt?: string;
  readingTime?: number;
  seoTitle?: string;
  seoDescription?: string;
  featured?: boolean;
}
