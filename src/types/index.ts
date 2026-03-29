export interface Tutorial {
  id: string;
  title: string;
  slug: string;
  category: string;
  categorySlug: string;
  languages: string[];
  languageSlugs: string[];
  url: string;
  contentType: 'article' | 'video' | 'repository';
  sourcePlatform: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  youtubeVideoId?: string | null;
  youtubePlaylistId?: string | null;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  tutorialCount: number;
}

export interface Language {
  id: string;
  name: string;
  slug: string;
  brandColor: string;
  tutorialCount: number;
}

export interface SearchResult {
  id: string;
  title: string;
  category: string;
  languages: string[];
  difficulty: string;
  contentType: string;
}

export type ContentType = 'article' | 'video' | 'repository';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
