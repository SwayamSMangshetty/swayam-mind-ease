export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  mood: 'happy' | 'sad' | 'neutral' | 'angry';
  notes?: string;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood?: 'happy' | 'sad' | 'neutral' | 'angry';
  created_at: string;
  updated_at: string;
  is_favorite?: boolean;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  response: string;
  sender: 'user' | 'bot';
  flagged?: boolean;
  created_at: string;
}

export interface MeditationSession {
  id: string;
  user_id: string;
  duration: number;
  type: 'guided' | 'unguided' | 'breathing' | 'mindfulness' | 'body-scan';
  completed: boolean;
  created_at: string;
}

export interface MeditationGuide {
  id: string;
  title: string;
  duration: string;
  description?: string;
  image_url?: string;
  audio_url?: string;
  available_offline: boolean;
  created_at: string;
}