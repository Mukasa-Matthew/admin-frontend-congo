export interface User {
  id: number;
  email: string;
  role: 'admin' | 'editor' | 'author';
}

export interface Article {
  id: number;
  title: string;
  excerpt: string;
  body: string;
  featured_image: string | null;
  category_id: number | null;
  category_name?: string;
  tags?: string;
  meta_title: string | null;
  meta_description: string | null;
  status: 'draft' | 'published' | 'archived';
  views: number;
  author_id: number | null;
  scheduled_publish_date: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  article_id: number;
  author_name: string;
  author_email: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Media {
  id: number;
  filename: string;
  url: string;
  size: number;
  mime_type: string;
  created_at: string;
}

export interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalCategories: number;
  totalTags: number;
  totalComments: number;
  pendingComments: number;
  totalViews: number;
  newsletterSubscribers: number;
}

export interface NewsletterSubscriber {
  id: number;
  email: string;
  subscribed_at: string;
}

