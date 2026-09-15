import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types matching our database schema
export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  xp: number;
  level: number;
  current_streak: number;
  max_streak: number;
  last_activity_date: string | null;
  preferred_lang: string;
  created_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  title: string;
  file_path: string | null;
  file_type: string | null;
  extracted_text: string | null;
  status: 'pending' | 'processing' | 'ready' | 'error';
  created_at: string;
}

export interface Lesson {
  id: string;
  document_id: string | null;
  user_id: string;
  title: string;
  description: string | null;
  lesson_type: 'flashcard' | 'quiz' | 'essay';
  content: FlashCard[] | QuizQuestion[] | EssayQuestion[];
  difficulty: number;
  created_at: string;
}

export interface LessonAttempt {
  id: string;
  lesson_id: string;
  user_id: string;
  score: number;
  max_score: number;
  xp_earned: number;
  answers: any;
  completed_at: string;
}

// Lesson content types
export interface FlashCard {
  front: string;
  back: string;
  known?: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface EssayQuestion {
  question: string;
  rubric: string;
  sample_answer: string;
}
