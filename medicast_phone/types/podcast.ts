export interface Episode {
  id: string;
  title: string;
  specialty: string;
  duration: number; // in seconds
  description: string;
  notes: string;
  audioUrl: string;
  imageUrl: string;
  publishedAt: string;
  isLiked?: boolean;
  isDownloaded?: boolean;
}

export interface Podcast {
  id: string;
  title: string;
  author: string;
  description: string;
  imageUrl: string;
  episodes: Episode[];
}