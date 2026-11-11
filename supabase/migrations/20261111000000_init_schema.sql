-- ==============================================================================
-- School Board (서귀포대신중학교 패들릿) 초기 데이터베이스 스키마 마이그레이션
-- ==============================================================================

-- 1. ENUM 타입 생성
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE board_layout AS ENUM ('wall', 'shelf', 'canvas');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE attachment_type AS ENUM ('image', 'file', 'link', 'youtube');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('pending', 'resolved', 'dismissed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. 사용자 프로필 테이블 (auth.users 연동)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    approved BOOLEAN NOT NULL DEFAULT false, -- 교사인 경우 관리자 승인 필요
    student_number TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. 학생 사전 초대 명단 (교사/관리자가 CSV 업로드)
CREATE TABLE IF NOT EXISTS public.student_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_code TEXT NOT NULL DEFAULT 'DAESHIN_MS',
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    student_number TEXT NOT NULL,
    grade INT,
    class_num INT,
    is_claimed BOOLEAN NOT NULL DEFAULT false,
    claimed_user_id UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. 학급 (Classes)
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    code TEXT NOT NULL UNIQUE,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. 학급 멤버십
CREATE TABLE IF NOT EXISTS public.class_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(class_id, user_id)
);

-- 6. 보드 (Boards)
CREATE TABLE IF NOT EXISTS public.boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT,
    layout board_layout NOT NULL DEFAULT 'shelf',
    background_color TEXT DEFAULT '#F8FAFC',
    is_locked BOOLEAN NOT NULL DEFAULT false,
    require_approval BOOLEAN NOT NULL DEFAULT false,
    allow_comments BOOLEAN NOT NULL DEFAULT true,
    allow_reactions BOOLEAN NOT NULL DEFAULT true,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. 보드 컬럼 (Columns)
CREATE TABLE IF NOT EXISTS public.columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    position DOUBLE PRECISION NOT NULL DEFAULT 1000.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. 포스트 (Posts)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
    column_id UUID REFERENCES public.columns(id) ON DELETE SET NULL,
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    author_name TEXT NOT NULL,
    title TEXT,
    content TEXT NOT NULL DEFAULT '',
    color TEXT DEFAULT '#FFFFFF',
    position DOUBLE PRECISION NOT NULL DEFAULT 1000.0,
    pos_x INT,
    pos_y INT,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    is_approved BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. 첨부파일 통합 (Attachments)
CREATE TABLE IF NOT EXISTS public.attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    type attachment_type NOT NULL,
    url TEXT NOT NULL,
    storage_path TEXT,
    file_name TEXT,
    file_size INT,
    mime_type TEXT,
    meta_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. 댓글 (Comments)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. 반응 (Reactions)
CREATE TABLE IF NOT EXISTS public.reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL DEFAULT 'like',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(post_id, user_id, reaction_type)
);

-- 12. 신고 (Reports)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status report_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. 감사 로그 (Audit Logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 인덱스 설정
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.student_invitations(email);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON public.classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_boards_class ON public.boards(class_id);
CREATE INDEX IF NOT EXISTS idx_columns_board ON public.columns(board_id, position);
CREATE INDEX IF NOT EXISTS idx_posts_board ON public.posts(board_id, position);
CREATE INDEX IF NOT EXISTS idx_posts_column ON public.posts(column_id, position);
CREATE INDEX IF NOT EXISTS idx_attachments_post ON public.attachments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_post ON public.reactions(post_id);

-- ==============================================================================
-- RLS (Row Level Security) 활성화
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- users 정책
CREATE POLICY "Users can read profiles" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id);

-- boards 정책
CREATE POLICY "Boards readable by authenticated" ON public.boards FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers can insert boards" ON public.boards FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND (role = 'teacher' OR role = 'admin') AND approved = true)
);
CREATE POLICY "Board owners can update boards" ON public.boards FOR UPDATE TO authenticated USING (
    created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- columns 정책
CREATE POLICY "Columns readable by authenticated" ON public.columns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers can manage columns" ON public.columns FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.boards b
        WHERE b.id = columns.board_id AND (
            b.created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
        )
    )
);

-- posts 정책
CREATE POLICY "Posts select policy" ON public.posts FOR SELECT TO authenticated USING (
    is_approved = true OR author_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.boards b
        WHERE b.id = posts.board_id AND (
            b.created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
        )
    )
);
CREATE POLICY "Posts insert policy" ON public.posts FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (SELECT 1 FROM public.boards b WHERE b.id = posts.board_id AND b.is_locked = false)
);
CREATE POLICY "Posts update policy" ON public.posts FOR UPDATE TO authenticated USING (
    author_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.boards b WHERE b.id = posts.board_id AND (b.created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')))
);
CREATE POLICY "Posts delete policy" ON public.posts FOR DELETE TO authenticated USING (
    author_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.boards b WHERE b.id = posts.board_id AND (b.created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')))
);

-- attachments 정책
CREATE POLICY "Attachments readable" ON public.attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Attachments writable by post author" ON public.attachments FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.posts p WHERE p.id = attachments.post_id AND (p.author_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND (u.role = 'teacher' OR u.role = 'admin'))))
);

-- comments 정책
CREATE POLICY "Comments readable" ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Comments writable" ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Comments deletable by author or teacher" ON public.comments FOR DELETE TO authenticated USING (
    author_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND (u.role = 'teacher' OR u.role = 'admin'))
);

-- reactions 정책
CREATE POLICY "Reactions readable" ON public.reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Reactions writable" ON public.reactions FOR ALL TO authenticated USING (auth.uid() = user_id);

-- reports 정책
CREATE POLICY "Reports creatable by authenticated" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Reports viewable by teachers" ON public.reports FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND (role = 'teacher' OR role = 'admin'))
);

-- ==============================================================================
-- 스토리지 버킷 생성 (이미지 및 파일 업로드용)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('board-attachments', 'board-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- 누구나 읽기 허용
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'board-attachments');
-- 로그인 사용자 업로드 허용
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'board-attachments');
-- 본인 업로드 파일 삭제 허용
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'board-attachments' AND auth.uid() = owner);
