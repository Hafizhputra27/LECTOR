-- Seed badges as titles/achievements
-- trigger_type: 'streak' | 'quiz_count' | 'perfect_score' | 'xp_milestone'
-- trigger_value: threshold number

INSERT INTO badges (name, description, trigger_type, trigger_value) VALUES
  -- Streak titles
  ('Pelajar Konsisten',   'Belajar 3 hari berturut-turut',          'streak',       3),
  ('Pejuang Mingguan',    'Belajar 7 hari berturut-turut',          'streak',       7),
  ('Dedikasi Tinggi',     'Belajar 14 hari berturut-turut',         'streak',       14),
  ('Legenda Belajar',     'Belajar 30 hari berturut-turut',         'streak',       30),

  -- Quiz count titles
  ('Pemula Aktif',        'Menyelesaikan 1 quiz pertama',           'quiz_count',   1),
  ('Penjelajah Ilmu',     'Menyelesaikan 5 quiz',                   'quiz_count',   5),
  ('Juara Quiz',          'Menyelesaikan 10 quiz',                  'quiz_count',   10),
  ('Master Latihan',      'Menyelesaikan 25 quiz',                  'quiz_count',   25),

  -- Perfect score titles
  ('Nilai Sempurna',      'Mendapatkan skor 100% dalam satu quiz',  'perfect_score', 1),

  -- XP milestone titles (kept for compatibility, won't show in UI)
  ('Rajin Belajar',       'Mengumpulkan 100 poin aktivitas',        'xp_milestone', 100),
  ('Tekun & Gigih',       'Mengumpulkan 500 poin aktivitas',        'xp_milestone', 500)

ON CONFLICT DO NOTHING;
