-- ============================================================
-- Seed Data: badges
-- LECTOR Platform - Initial badge definitions
-- ============================================================

INSERT INTO badges (name, description, icon_url, trigger_type, trigger_value) VALUES

  -- Streak badges
  ('Streak Pemula',    'Belajar selama 3 hari berturut-turut',  NULL, 'streak',        3),
  ('Streak Mingguan',  'Belajar selama 7 hari berturut-turut',  NULL, 'streak',        7),
  ('Streak Master',    'Belajar selama 30 hari berturut-turut', NULL, 'streak',        30),

  -- Quiz count badges
  ('Quiz Pertama',     'Menyelesaikan quiz pertamamu',          NULL, 'quiz_count',    1),
  ('Quiz Enthusiast',  'Menyelesaikan 10 quiz',                 NULL, 'quiz_count',    10),
  ('Quiz Master',      'Menyelesaikan 50 quiz',                 NULL, 'quiz_count',    50),

  -- Perfect score badge
  ('Nilai Sempurna',   'Mendapatkan skor 100 pada quiz atau ujian', NULL, 'perfect_score', 100),

  -- XP milestone badges
  ('Pelajar Rajin',    'Mengumpulkan total 1.000 XP',           NULL, 'xp_milestone',  1000),
  ('Scholar',          'Mengumpulkan total 5.000 XP',           NULL, 'xp_milestone',  5000);
