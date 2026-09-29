export type MediaType = 'image' | 'video';

export interface Author {
  name: string;
  handle: string;
  avatar: string;
}

export interface Prompt {
  id: string;
  title: string;
  type: MediaType;
  prompt: string;
  description: string;
  category: string;
  subcategory: string;
  model: string;
  style: string;
  aspect_ratio: '1:1' | '4:5' | '3:4' | '16:9' | '9:16';
  duration?: string; // For videos: e.g. "8s", "15s", "30s"
  camera?: string; // e.g. "Slow cinematic tracking shot", "FPV drone swoop"
  movement?: string; // e.g. "Fluid hyper-realistic motion"
  lighting?: string; // e.g. "Golden hour warm specular", "Studio softbox"
  lens?: string; // e.g. "35mm Anamorphic T1.5", "85mm f/1.2"
  composition?: string; // e.g. "Rule of thirds centered subject"
  mood?: string; // e.g. "Prestigious & avant-garde", "Moody neon noir"
  preview_url: string;
  video_url?: string;
  thumbnails?: string[];
  tags: string[];
  author: Author;
  copies: number;
  favorites: number;
  views: number;
  rating: number;
  is_pro: boolean;
  is_featured: boolean;
  is_trending: boolean;
  created_at: string;
}

export interface SkillConfigParam {
  name: string;
  type: string;
  default: string;
  description: string;
}

export interface SkillFaq {
  q: string;
  a: string;
}

export interface Skill {
  id: string;
  title: string;
  category: 'Research' | 'Development' | 'Design' | 'Marketing' | 'Business' | 'Content' | 'Automation';
  output_type: 'Research' | 'Code' | 'Websites' | 'Images' | 'Video' | 'Marketing' | 'Content' | 'Data';
  description: string;
  compatible_agents: string[];
  install_prompt: string;
  preview_image: string;
  capabilities: string[];
  instructions: string[];
  config: SkillConfigParam[];
  example_usage: string;
  faq: SkillFaq[];
  tags: string[];
  installs: number;
  rating: number;
  is_pro: boolean;
  is_featured: boolean;
  created_at: string;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  icon: string;
  bg_color: string;
  prompt_count: number;
  skill_count: number;
  featured_image: string;
}

export interface AIModel {
  id: string;
  name: string;
  type: 'image' | 'video' | 'multimodal' | 'agent';
  badge: string;
  description: string;
  prompt_count: number;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  date: string;
  read_time: string;
  cover_image: string;
}

export interface UserSubmission {
  id: string;
  title: string;
  type: 'image' | 'video' | 'skill';
  description: string;
  prompt: string;
  category: string;
  model: string;
  style: string;
  aspect_ratio: string;
  preview_url: string;
  tags: string[];
  submitted_by: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  email: string;
  avatar: string;
  role: 'user' | 'creator' | 'admin';
  is_pro: boolean;
  joined_date: string;
}
