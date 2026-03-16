# Rencana Implementasi: LECTOR Platform

## Gambaran Umum

Implementasi LECTOR Platform sebagai Progressive Web App (PWA) dengan arsitektur client-server. Frontend dibangun dengan React + Vite + TypeScript + Tailwind CSS, backend dengan Node.js + Express + TypeScript, database dan auth menggunakan Supabase, AI menggunakan Google Gemini API dengan RAG Pipeline, dan di-deploy di Vercel.

## Tasks

- [x] 1. Setup Proyek dan Struktur Dasar
  - Inisialisasi monorepo dengan dua workspace: `frontend/` (Vite + React + TypeScript) dan `backend/` (Node.js + Express + TypeScript)
  - Konfigurasi Tailwind CSS dengan design tokens: warna purple `#7c6af7`, cyan `#4fd1c5`, gold `#f6ad55`, background `#090b10`
  - Konfigurasi font: Syne (heading), DM Sans (body), JetBrains Mono (code)
  - Setup PWA manifest dan service worker di frontend
  - Konfigurasi environment variables untuk Supabase URL/Key dan Gemini API Key
  - Setup Supabase client di frontend (`src/services/supabase.ts`) dan backend
  - Konfigurasi Zustand untuk state management (`authStore`, `documentStore`, `gamificationStore`)
  - Setup fast-check sebagai dev dependency untuk property-based testing
  - _Requirements: 11.4, 11.5, 11.6, 12.1_

- [x] 2. Skema Database Supabase
  - Buat migrasi SQL untuk semua tabel: `profiles`, `gamification_profiles`, `badges`, `user_badges`, `documents`, `document_chunks`, `chat_sessions`, `chat_messages`, `quiz_sessions`, `activity_records`
  - Aktifkan ekstensi `pgvector` untuk kolom `embedding VECTOR(768)` pada tabel `document_chunks`
  - Konfigurasi Row Level Security (RLS) policies agar setiap user hanya dapat mengakses data miliknya sendiri
  - Seed data awal untuk tabel `badges` (streak 7 hari, 10 quiz selesai, skor sempurna, dll.)
  - _Requirements: 2.6, 8.7_

- [x] 3. Landing Page
  - [x] 3.1 Buat komponen `LandingPage.tsx` dengan semua seksi
    - Implementasi Navbar dengan logo, tautan navigasi (Fitur, Gamifikasi, Cara Kerja, Tim), dan tombol "Mulai Sekarang"
    - Implementasi smooth scroll saat tautan navigasi diklik
    - Implementasi Hero Section dengan badge "PKM-KC 2025", judul, deskripsi, statistik, dan preview mockup
    - Implementasi seksi Fitur Utama (6 fitur), Gamifikasi (4 mekanisme), Cara Kerja (4 langkah), Tim Pengembang (4 anggota), Tech Stack, CTA, dan Footer
    - Tombol "Mulai Sekarang" dan CTA mengarahkan ke `/auth`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10_

- [x] 4. Autentikasi User
  - [x] 4.1 Buat `AuthPage.tsx` dengan form login dan register
    - Implementasi dua tab: "Masuk" (email + password) dan "Daftar" (nama lengkap + email + password)
    - Integrasi Supabase Auth untuk `signInWithPassword` dan `signUp`
    - Tampilkan pesan error deskriptif untuk kredensial tidak valid dan email duplikat
    - Redirect ke `/dashboard` setelah login/register berhasil
    - Redirect ke `/dashboard` jika user sudah login mengakses `/auth`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.10_
  - [x] 4.2 Implementasi Google OAuth
    - Tambahkan tombol "Masuk dengan Google" menggunakan `supabase.auth.signInWithOAuth({ provider: 'google' })`
    - Tangani OAuth callback dan redirect ke dashboard
    - _Requirements: 2.8, 2.9_
  - [x] 4.3 Implementasi `useAuth.ts` hook dan route protection
    - Buat hook `useAuth` yang membaca session dari Supabase dan menyimpan ke `authStore`
    - Buat komponen `ProtectedRoute` yang redirect ke `/auth` jika tidak ada sesi aktif
    - Simpan sesi menggunakan mekanisme token Supabase (localStorage)
    - _Requirements: 2.11, 11.7_

- [x] 5. Layout Dashboard dan Navigasi
  - [x] 5.1 Buat komponen `Sidebar.tsx` dan `Navbar.tsx`
    - Sidebar berisi tautan navigasi: Chat AI, Quiz & Latihan, Ujian Simulasi, Analitik Pribadi, Riwayat Belajar
    - Kartu info user di sidebar: nama, Level, XP saat ini, nilai Streak
    - Navigasi tanpa full page reload menggunakan React Router
    - _Requirements: 11.1, 11.2, 11.3_
  - [x] 5.2 Buat `DashboardPage.tsx` sebagai layout utama
    - Integrasikan Sidebar dan Navbar
    - Implementasi dark theme dengan warna dan font yang sudah dikonfigurasi
    - _Requirements: 11.4, 11.5_

- [x] 6. Upload dan Pemrosesan Dokumen
  - [x] 6.1 Buat backend endpoint `POST /api/documents/upload`
    - Terima file PDF/PPT/PPTX dengan validasi format dan ukuran maksimum 50MB
    - Ekstrak teks menggunakan `pdf-parse` untuk PDF dan `pptx2json` untuk PPT/PPTX
    - Simpan file ke Supabase Storage dan metadata ke tabel `documents`
    - Pecah teks menjadi chunks dan simpan ke tabel `document_chunks`
    - Kembalikan error deskriptif untuk format tidak didukung atau ukuran melebihi batas
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7_
  - [x] 6.2 Buat backend endpoint `GET /api/documents` dan `DELETE /api/documents/:id`
    - Ambil daftar dokumen milik user yang sedang login
    - Hapus dokumen beserta chunks dan file dari Storage
    - _Requirements: 3.6, 3.8_
  - [x] 6.3 Buat komponen `DocumentUpload.tsx` dan `DocumentList.tsx`
    - Drag-and-drop upload dengan validasi client-side (format dan ukuran)
    - Tampilkan status pemrosesan dokumen (processing/ready/error)
    - Tampilkan daftar dokumen aktif dengan nama file, tanggal unggah, dan opsi pilih/hapus
    - _Requirements: 3.1, 3.4, 3.5, 3.6, 3.8_

- [x] 7. RAG Pipeline dan Chat AI Streaming
  - [x] 7.1 Implementasi RAG Pipeline di backend
    - Buat fungsi `retrieveRelevantChunks(documentId, query)` yang mengambil chunks relevan dari `document_chunks` menggunakan pencarian berbasis keyword atau vector similarity
    - Buat fungsi `buildPrompt(chunks, query)` yang menyusun prompt dengan konteks dokumen
    - _Requirements: 4.2, 3.7_
  - [x] 7.2 Buat backend endpoint `POST /api/chat/stream` dengan SSE
    - Terima `{ documentId, message, sessionId }` dari frontend
    - Jalankan RAG Pipeline untuk mendapatkan konteks relevan
    - Kirim prompt ke Gemini API dengan `streamGenerateContent`
    - Forward token streaming ke frontend via Server-Sent Events (SSE)
    - Simpan pesan user dan respons AI ke tabel `chat_messages`
    - _Requirements: 4.2, 4.3_
  - [x] 7.3 Buat komponen `ChatInterface.tsx`, `MessageBubble.tsx`, dan `QuickActions.tsx`
    - Input teks untuk pertanyaan user
    - Tampilkan pesan streaming token per token menggunakan `EventSource` atau `fetch` dengan `ReadableStream`
    - Tombol quick action: "Jelaskan konsep utama", "Buat ringkasan", "Contoh soal"
    - Panel samping: dokumen aktif, progress materi, target harian
    - Tampilkan pesan jika tidak ada dokumen aktif
    - _Requirements: 4.1, 4.3, 4.4, 4.5, 4.6, 4.7, 4.9_
  - [x] 7.4 Implementasi `useChat.ts` hook
    - Kelola state pesan, status streaming, dan sesi chat
    - Panggil endpoint `/api/chat/stream` dan update state secara real-time
    - Trigger award XP setelah sesi chat selesai
    - _Requirements: 4.8_

- [x] 8. Ringkasan Otomatis
  - [x] 8.1 Buat backend endpoint `POST /api/chat/summary`
    - Ambil semua chunks dari dokumen aktif
    - Kirim prompt ringkasan ke Gemini API dalam Bahasa Indonesia
    - Simpan ringkasan ke `chat_messages` sebagai respons assistant
    - _Requirements: 5.1, 5.2, 5.4_
  - [x] 8.2 Integrasikan ringkasan ke `ChatInterface.tsx`
    - Tombol quick action "Buat ringkasan" memanggil endpoint summary
    - Tampilkan ringkasan dalam format terstruktur dengan hierarki yang jelas
    - _Requirements: 5.3_

- [x] 9. Checkpoint — Pastikan semua tests lulus
  - Pastikan semua tests lulus, tanyakan kepada user jika ada pertanyaan.

- [x] 10. Gamification Engine
  - [x] 10.1 Buat `GamificationEngine` di backend (`src/services/gamificationEngine.ts`)
    - Implementasi konstanta `LEVEL_THRESHOLDS` dan `XP_REWARDS` sesuai design
    - Implementasi fungsi `calculateLevel(xp: number): number` berdasarkan threshold
    - Implementasi fungsi `awardXP(userId, activityType, score?)` yang update `gamification_profiles`
    - Implementasi fungsi `updateStreak(userId)` yang cek `last_active_date` dan update streak
    - Implementasi fungsi `checkAndAwardBadges(userId)` yang cek kondisi badge dan insert ke `user_badges`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_
  - [x] 10.2 Buat backend endpoint `GET /api/gamification/profile` dan `POST /api/gamification/award-xp`
    - Ambil profil gamifikasi lengkap (XP, level, streak, badges)
    - Award XP dan trigger pengecekan level up dan badge
    - Kembalikan notifikasi level up jika terjadi
    - _Requirements: 8.1, 8.2, 8.3, 8.8_
  - [x] 10.3 Tulis property test untuk `calculateLevel`
    - **Property 1: Level selalu dalam rentang valid [1, 10]**
    - **Validates: Requirements 8.2**
    - Gunakan `fc.integer({ min: 0, max: 10000 })` untuk generate XP sembarang
  - [x] 10.4 Tulis property test untuk XP rewards
    - **Property 2: XP yang diberikan selalu non-negatif untuk semua jenis aktivitas**
    - **Validates: Requirements 8.1**
    - Gunakan `fc.integer({ min: 0, max: 100 })` untuk generate skor sembarang
  - [x] 10.5 Tulis property test untuk streak logic
    - **Property 3: Streak tidak pernah bernilai negatif**
    - **Property 4: Streak hanya bertambah 1 jika aktivitas pada hari berturut-turut**
    - **Validates: Requirements 8.4, 8.5, 8.6**
    - Gunakan `fc.date()` untuk generate tanggal sembarang
  - [x] 10.6 Buat komponen gamifikasi frontend
    - `XPBar.tsx`: progress bar XP menuju level berikutnya
    - `BadgeGrid.tsx`: grid semua badge yang dimiliki user
    - `StreakDisplay.tsx`: tampilan streak harian
    - Integrasikan ke Sidebar untuk menampilkan Level, XP, Streak
    - _Requirements: 8.8, 8.9_

- [x] 11. Generator Soal Adaptif (Quiz)
  - [x] 11.1 Buat backend endpoint `POST /api/quiz/generate`
    - Kirim prompt ke Gemini API untuk menghasilkan N soal pilihan ganda (A/B/C/D) dari chunks dokumen aktif
    - Parse respons JSON dari Gemini menjadi array `QuizQuestion[]`
    - Simpan sesi quiz ke tabel `quiz_sessions` dengan status awal
    - _Requirements: 6.1, 6.2_
  - [x] 11.2 Buat backend endpoint `POST /api/quiz/submit` dan `GET /api/quiz/history`
    - Hitung skor berdasarkan jawaban user vs `correctAnswer`
    - Hitung XP earned: `quiz_completed_base + quiz_score_bonus(score)`
    - Update `quiz_sessions` dengan answers, score, xp_earned, completed_at
    - Insert ke `activity_records`
    - Trigger `awardXP` dan `updateStreak` di Gamification Engine
    - _Requirements: 6.6, 6.7, 6.8_
  - [x] 11.3 Tulis property test untuk quiz scoring
    - **Property 5: Skor quiz selalu dalam rentang [0, 100]**
    - **Property 6: XP yang diperoleh dari quiz selalu >= `quiz_completed_base` (20 XP)**
    - **Validates: Requirements 6.7, 8.1**
    - Gunakan `fc.array(fc.boolean())` untuk generate pola jawaban benar/salah sembarang
  - [x] 11.4 Buat komponen `QuizPage.tsx`, `QuizCard.tsx`, `QuizResult.tsx`, dan `QuestionNav.tsx`
    - Tampilkan soal satu per satu dengan progress bar
    - Timer countdown per soal
    - Feedback benar/salah setelah menjawab
    - Navigasi soal (sudah dijawab / belum)
    - Halaman hasil: skor, jumlah benar, ringkasan performa
    - _Requirements: 6.3, 6.4, 6.5, 6.6, 6.9_
  - [x] 11.5 Implementasi `useQuiz.ts` hook
    - Kelola state soal, jawaban, timer, dan hasil quiz
    - _Requirements: 6.3, 6.5_

- [x] 12. Ujian Simulasi
  - [x] 12.1 Buat backend endpoint `POST /api/exam/start` dan `POST /api/exam/submit`
    - `POST /api/exam/start`: generate soal menggunakan Quiz_Generator, simpan ke `quiz_sessions` dengan `session_type='exam'` dan `total_time_seconds`
    - `POST /api/exam/submit`: hitung skor, XP earned (`exam_completed_base + exam_score_bonus(score)`), update sesi, insert activity record, trigger gamifikasi
    - _Requirements: 7.2, 7.6, 7.7, 7.8_
  - [x] 12.2 Buat komponen `ExamPage.tsx`, `ExamSetup.tsx`, `ExamSession.tsx`, dan `ExamResult.tsx`
    - `ExamSetup.tsx`: form konfigurasi jumlah soal
    - `ExamSession.tsx`: tampilan ujian dengan timer countdown keseluruhan yang terlihat jelas, navigasi antar soal
    - Auto-submit saat waktu habis
    - `ExamResult.tsx`: skor, persentase kebenaran, pembahasan per soal
    - _Requirements: 7.1, 7.3, 7.4, 7.5, 7.6_

- [x] 13. Checkpoint — Pastikan semua tests lulus
  - Pastikan semua tests lulus, tanyakan kepada user jika ada pertanyaan.

- [x] 14. Analitik Pribadi
  - [x] 14.1 Buat backend endpoint `GET /api/analytics`
    - Agregasi data dari `gamification_profiles`, `quiz_sessions`, dan `activity_records`
    - Kembalikan `AnalyticsSummary`: totalXP, currentStreak, quizzesCompleted, averageScore, activityByDay, topicPerformance
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.6_
  - [x] 14.2 Buat `AnalyticsPage.tsx` dengan komponen visualisasi
    - `ActivityChart.tsx`: grafik aktivitas harian/mingguan
    - `TopicPerformance.tsx`: performa per dokumen/topik
    - Progress bar XP menuju level berikutnya
    - Metrik utama: total XP, streak, quiz selesai, rata-rata skor
    - `BadgeGrid.tsx`: semua badge dengan deskripsi cara mendapatkannya
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 15. Riwayat Belajar
  - [x] 15.1 Buat backend endpoint `GET /api/history`
    - Ambil `activity_records` milik user dengan pagination (20 item per halaman)
    - Dukung query params: `type` (chat/quiz/exam/summary), `startDate`, `endDate`, `page`
    - Urutkan berdasarkan `created_at DESC`
    - _Requirements: 10.1, 10.4, 10.5_
  - [x] 15.2 Buat `HistoryPage.tsx`
    - Tampilkan daftar aktivitas: jenis, dokumen terkait, skor, XP diperoleh, tanggal
    - Filter berdasarkan jenis aktivitas dan rentang tanggal
    - Pagination jika entri > 20 item
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 16. Performa dan Keandalan
  - [x] 16.1 Implementasi Error Boundary dan offline notification
    - Buat komponen `ErrorBoundary.tsx` yang menangkap error React dan menampilkan fallback UI
    - Buat hook `useOnlineStatus.ts` yang mendeteksi status koneksi dan menampilkan notifikasi saat offline
    - Tambahkan retry button pada komponen yang gagal memanggil AI_Engine
    - _Requirements: 12.3, 12.4, 12.5_
  - [x] 16.2 Optimasi performa PWA
    - Konfigurasi service worker untuk caching aset statis (Workbox atau vite-plugin-pwa)
    - Implementasi lazy loading untuk halaman-halaman utama menggunakan `React.lazy` dan `Suspense`
    - Pastikan PWA manifest lengkap agar aplikasi dapat diinstal di perangkat
    - _Requirements: 12.1, 11.6_

- [x] 17. Integrasi dan Wiring Akhir
  - [x] 17.1 Hubungkan semua komponen frontend ke backend API
    - Pastikan `api.ts` service memiliki semua fungsi untuk memanggil endpoint backend
    - Integrasikan `gamificationStore` dengan respons dari setiap aktivitas (chat, quiz, exam)
    - Pastikan XP Bar dan Streak di Sidebar terupdate setelah setiap aktivitas
    - _Requirements: 4.8, 6.7, 7.7, 8.1, 8.8_
  - [x] 17.2 Implementasi routing lengkap dengan React Router
    - Route: `/` (Landing), `/auth` (Auth), `/dashboard` (Dashboard), `/chat`, `/quiz`, `/exam`, `/analytics`, `/history`
    - Wrap semua route dashboard dengan `ProtectedRoute`
    - _Requirements: 11.3, 11.7_

- [x] 18. Checkpoint Final — Pastikan semua tests lulus
  - Pastikan semua tests lulus, tanyakan kepada user jika ada pertanyaan.

## Catatan

- Tasks bertanda `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Setiap task mereferensikan requirements spesifik untuk keterlacakan
- Property tests menggunakan fast-check memvalidasi properti universal pada Gamification Engine dan Quiz Scoring
- Checkpoint memastikan validasi inkremental di setiap fase utama
