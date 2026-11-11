export type UserRole = 'admin' | 'teacher' | 'student';
export type BoardLayout = 'wall' | 'shelf' | 'canvas';
export type AttachmentType = 'image' | 'file' | 'link' | 'youtube';
export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  approved: boolean;
  student_number?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentInvitation {
  id: string;
  school_code: string;
  email: string;
  full_name: string;
  student_number: string;
  grade?: number | null;
  class_num?: number | null;
  is_claimed: boolean;
  claimed_user_id?: string | null;
  created_at: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  description?: string | null;
  teacher_id: string;
  code: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Board {
  id: string;
  class_id?: string | null;
  created_by: string;
  title: string;
  description?: string | null;
  layout: BoardLayout;
  background_color: string;
  is_locked: boolean;
  require_approval: boolean;
  allow_comments: boolean;
  allow_reactions: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface BoardColumn {
  id: string;
  board_id: string;
  title: string;
  position: number;
  created_at: string;
}

export interface Post {
  id: string;
  board_id: string;
  column_id?: string | null;
  author_id: string;
  author_name: string;
  title?: string | null;
  content: string;
  color: string;
  position: number;
  pos_x?: number | null;
  pos_y?: number | null;
  is_pinned: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  attachments?: Attachment[];
  comments_count?: number;
  reactions_count?: number;
}

export interface Attachment {
  id: string;
  post_id: string;
  type: AttachmentType;
  url: string;
  storage_path?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  mime_type?: string | null;
  meta_data?: Record<string, any>;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
}

export interface Report {
  id: string;
  post_id: string;
  reporter_id: string;
  reason: string;
  status: ReportStatus;
  created_at: string;
}
