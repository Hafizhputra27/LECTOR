-- ============================================================
-- Migration 002: Row Level Security (RLS) Policies
-- LECTOR Platform - Supabase RLS Configuration
-- ============================================================

-- ============================================================
-- profiles
-- Users can only read and update their own profile
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: select own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: insert own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: update own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- gamification_profiles
-- Users can only read and update their own gamification data
-- ============================================================
ALTER TABLE gamification_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gamification_profiles: select own"
  ON gamification_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "gamification_profiles: insert own"
  ON gamification_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "gamification_profiles: update own"
  ON gamification_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- badges
-- Public read: all authenticated users can view available badges
-- No write access for regular users (managed by admins/seed)
-- ============================================================
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "badges: public read"
  ON badges FOR SELECT
  USING (true);

-- ============================================================
-- user_badges
-- Users can only read their own earned badges
-- Insert is handled by backend (SECURITY DEFINER functions)
-- ============================================================
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_badges: select own"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_badges: insert own"
  ON user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- documents
-- Users can only CRUD their own documents
-- ============================================================
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents: select own"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "documents: insert own"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "documents: update own"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "documents: delete own"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- document_chunks
-- Users can read chunks that belong to their own documents
-- Insert/delete handled by backend during document processing
-- ============================================================
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_chunks: select own"
  ON document_chunks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_chunks.document_id
        AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "document_chunks: insert own"
  ON document_chunks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_chunks.document_id
        AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "document_chunks: delete own"
  ON document_chunks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_chunks.document_id
        AND documents.user_id = auth.uid()
    )
  );

-- ============================================================
-- chat_sessions
-- Users can only CRUD their own chat sessions
-- ============================================================
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_sessions: select own"
  ON chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "chat_sessions: insert own"
  ON chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chat_sessions: update own"
  ON chat_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chat_sessions: delete own"
  ON chat_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- chat_messages
-- Users can only CRUD messages in their own chat sessions
-- ============================================================
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_messages: select own"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
        AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "chat_messages: insert own"
  ON chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
        AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "chat_messages: delete own"
  ON chat_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
        AND chat_sessions.user_id = auth.uid()
    )
  );

-- ============================================================
-- quiz_sessions
-- Users can only CRUD their own quiz/exam sessions
-- ============================================================
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_sessions: select own"
  ON quiz_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "quiz_sessions: insert own"
  ON quiz_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "quiz_sessions: update own"
  ON quiz_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "quiz_sessions: delete own"
  ON quiz_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- activity_records
-- Users can only read and insert their own activity records
-- (no update/delete — immutable audit log)
-- ============================================================
ALTER TABLE activity_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_records: select own"
  ON activity_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "activity_records: insert own"
  ON activity_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);
