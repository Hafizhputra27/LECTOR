# Requirements Document

## Introduction

LECTOR adalah platform belajar cerdas berbasis AI untuk mahasiswa Indonesia. Platform ini memungkinkan mahasiswa mengunggah materi kuliah (PPT/PDF), mendapatkan penjelasan AI secara streaming, membuat ringkasan otomatis, mengerjakan soal adaptif, dan memantau progres belajar melalui sistem gamifikasi. LECTOR dibangun sebagai Progressive Web App (PWA) dengan tech stack modern: React.js + Vite (frontend), Node.js + Express (backend), Supabase (database & auth), Gemini API (AI), dan di-deploy di Vercel.

---

## Glossary

- **LECTOR**: Nama platform edukasi berbasis AI yang dibangun untuk mahasiswa Indonesia.
- **User**: Mahasiswa yang terdaftar dan menggunakan platform LECTOR.
- **AI_Engine**: Komponen sistem yang mengintegrasikan Gemini API untuk menghasilkan penjelasan, ringkasan, dan soal.
- **Document_Processor**: Komponen yang memproses file PPT/PDF yang diunggah User menjadi teks terstruktur.
- **Quiz_Generator**: Komponen yang menghasilkan soal pilihan ganda adaptif berdasarkan materi dokumen.
- **Exam_Simulator**: Komponen yang mengelola sesi ujian simulasi dengan timer dan konfigurasi soal.
- **Gamification_Engine**: Komponen yang mengelola sistem XP, level, streak, dan badge User.
- **Analytics_Engine**: Komponen yang mengumpulkan dan menampilkan data performa belajar User.
- **Auth_Service**: Komponen yang mengelola autentikasi User via email/password dan OAuth Google.
- **RAG_Pipeline**: Arsitektur Retrieval-Augmented Generation yang menggabungkan dokumen User dengan kemampuan Gemini API.
- **XP**: Experience Points — poin yang diperoleh User dari aktivitas belajar.
- **Streak**: Jumlah hari berturut-turut User aktif belajar di platform.
- **Badge**: Penghargaan virtual yang diberikan kepada User atas pencapaian tertentu.
- **Level**: Tingkatan User berdasarkan akumulasi XP.
- **PWA**: Progressive Web App — aplikasi web yang dapat diinstal dan digunakan secara offline.

---

## Requirements

### Requirement 1: Landing Page

**User Story:** Sebagai calon pengguna, saya ingin melihat halaman utama yang informatif tentang LECTOR, sehingga saya dapat memahami fitur dan manfaat platform sebelum mendaftar.

#### Acceptance Criteria

1. THE LECTOR SHALL menampilkan navbar dengan logo, tautan navigasi ke seksi Fitur, Gamifikasi, Cara Kerja, dan Tim, serta tombol "Mulai Sekarang".
2. THE LECTOR SHALL menampilkan hero section dengan badge "PKM-KC 2025", judul utama, deskripsi singkat platform, statistik pengguna, dan preview mockup antarmuka aplikasi.
3. THE LECTOR SHALL menampilkan seksi Fitur Utama yang mencakup enam fitur: Upload PPT/PDF, Penjelasan AI Streaming, Ringkasan Otomatis, Generator Soal Adaptif, Mode Ujian + Timer, dan Riwayat Dokumen.
4. THE LECTOR SHALL menampilkan seksi Gamifikasi yang menjelaskan empat mekanisme: Level & XP, Streak Harian, Badge & Pencapaian, dan Analytics Pribadi.
5. THE LECTOR SHALL menampilkan seksi Cara Kerja dengan empat langkah berurutan dari unggah dokumen hingga belajar interaktif.
6. THE LECTOR SHALL menampilkan seksi Tim Pengembang dengan informasi empat anggota tim.
7. THE LECTOR SHALL menampilkan seksi Tech Stack yang mencantumkan teknologi: Gemini API, React.js + Vite, Node.js + Express, Supabase, RAG Architecture, PWA, TypeScript, dan Vercel.
8. THE LECTOR SHALL menampilkan CTA section dan footer dengan tautan relevan.
9. WHEN User mengklik tombol "Mulai Sekarang" atau CTA, THE LECTOR SHALL mengarahkan User ke halaman login/register.
10. WHEN User mengklik tautan navigasi di navbar, THE LECTOR SHALL melakukan smooth scroll ke seksi yang sesuai pada halaman yang sama.

---

### Requirement 2: Autentikasi User

**User Story:** Sebagai mahasiswa, saya ingin dapat mendaftar dan masuk ke LECTOR dengan mudah, sehingga data belajar saya tersimpan dan terlindungi.

#### Acceptance Criteria

1. THE Auth_Service SHALL menyediakan halaman autentikasi dengan dua tab: "Masuk" dan "Daftar".
2. WHEN User memilih tab "Masuk", THE Auth_Service SHALL menampilkan form dengan field email dan password serta tombol submit.
3. WHEN User memilih tab "Daftar", THE Auth_Service SHALL menampilkan form dengan field nama lengkap, email, dan password serta tombol submit.
4. WHEN User mengisi form login dengan kredensial valid dan mengklik submit, THE Auth_Service SHALL mengautentikasi User dan mengarahkan ke halaman dashboard.
5. IF User mengisi form login dengan kredensial tidak valid, THEN THE Auth_Service SHALL menampilkan pesan kesalahan yang deskriptif tanpa mengungkap detail keamanan.
6. WHEN User mengisi form register dengan data valid dan mengklik submit, THE Auth_Service SHALL membuat akun baru, menginisialisasi data gamifikasi (XP=0, Level=1, Streak=0), dan mengarahkan ke halaman dashboard.
7. IF User mengisi form register dengan email yang sudah terdaftar, THEN THE Auth_Service SHALL menampilkan pesan bahwa email sudah digunakan.
8. THE Auth_Service SHALL menyediakan tombol "Masuk dengan Google" yang menggunakan OAuth Google untuk autentikasi.
9. WHEN User mengklik tombol "Masuk dengan Google", THE Auth_Service SHALL memulai alur OAuth Google dan, setelah berhasil, mengarahkan User ke halaman dashboard.
10. WHEN User yang sudah login mengakses halaman autentikasi, THE Auth_Service SHALL mengarahkan User langsung ke halaman dashboard.
11. THE Auth_Service SHALL menyimpan sesi User secara aman menggunakan mekanisme token yang disediakan Supabase.

---

### Requirement 3: Upload dan Pemrosesan Dokumen

**User Story:** Sebagai mahasiswa, saya ingin mengunggah materi kuliah dalam format PPT atau PDF, sehingga AI dapat membantu saya memahami dan mempelajari materi tersebut.

#### Acceptance Criteria

1. THE Document_Processor SHALL menerima file dalam format PDF dan PPT/PPTX dengan ukuran maksimum 50MB per file.
2. WHEN User mengunggah file yang valid, THE Document_Processor SHALL mengekstrak teks dan struktur konten dari file tersebut.
3. WHEN User mengunggah file yang valid, THE Document_Processor SHALL menyimpan metadata dokumen (nama file, tanggal unggah, jumlah halaman) ke Supabase.
4. IF User mengunggah file dengan format tidak didukung, THEN THE Document_Processor SHALL menampilkan pesan kesalahan yang menyebutkan format yang didukung.
5. IF User mengunggah file yang melebihi batas ukuran 50MB, THEN THE Document_Processor SHALL menampilkan pesan kesalahan dengan informasi batas ukuran.
6. WHEN pemrosesan dokumen selesai, THE Document_Processor SHALL menampilkan dokumen di daftar "Dokumen Aktif" User.
7. THE Document_Processor SHALL memproses konten dokumen melalui RAG_Pipeline untuk mempersiapkan konteks bagi AI_Engine.
8. THE LECTOR SHALL menampilkan daftar riwayat dokumen yang pernah diunggah User, termasuk nama file, tanggal unggah, dan opsi untuk memilih dokumen aktif.

---

### Requirement 4: Chat AI dengan Penjelasan Streaming

**User Story:** Sebagai mahasiswa, saya ingin bertanya kepada AI tentang materi yang saya unggah dan mendapatkan penjelasan secara real-time, sehingga saya dapat memahami materi dengan lebih baik.

#### Acceptance Criteria

1. THE AI_Engine SHALL menyediakan antarmuka chat di mana User dapat mengetik pertanyaan tentang dokumen yang aktif.
2. WHEN User mengirim pertanyaan, THE AI_Engine SHALL menghasilkan respons menggunakan RAG_Pipeline yang menggabungkan konteks dokumen aktif dengan kemampuan Gemini API.
3. WHEN AI_Engine menghasilkan respons, THE AI_Engine SHALL menampilkan teks secara streaming (karakter per karakter atau token per token) sehingga User dapat membaca respons sebelum selesai sepenuhnya.
4. THE AI_Engine SHALL menyediakan tombol quick action untuk pertanyaan umum seperti "Jelaskan konsep utama", "Buat ringkasan", dan "Contoh soal".
5. WHEN User mengklik tombol quick action, THE AI_Engine SHALL mengirim prompt yang sesuai secara otomatis.
6. THE AI_Engine SHALL menampilkan panel samping yang menunjukkan dokumen aktif yang sedang digunakan sebagai konteks.
7. THE AI_Engine SHALL menampilkan progress materi dan target harian User di panel samping.
8. WHEN User menyelesaikan sesi chat, THE Gamification_Engine SHALL memberikan XP kepada User berdasarkan aktivitas yang dilakukan.
9. IF tidak ada dokumen aktif yang dipilih, THEN THE AI_Engine SHALL menampilkan pesan yang meminta User untuk memilih atau mengunggah dokumen terlebih dahulu.

---

### Requirement 5: Ringkasan Otomatis

**User Story:** Sebagai mahasiswa, saya ingin mendapatkan ringkasan otomatis dari materi yang saya unggah, sehingga saya dapat menghemat waktu dalam memahami poin-poin penting.

#### Acceptance Criteria

1. WHEN User meminta ringkasan dokumen aktif, THE AI_Engine SHALL menghasilkan ringkasan terstruktur yang mencakup poin-poin utama dari dokumen.
2. THE AI_Engine SHALL menghasilkan ringkasan dalam Bahasa Indonesia secara default.
3. WHEN ringkasan selesai dihasilkan, THE AI_Engine SHALL menampilkan ringkasan dalam format yang mudah dibaca dengan hierarki yang jelas.
4. THE AI_Engine SHALL menyimpan ringkasan yang dihasilkan ke riwayat chat User di Supabase.

---

### Requirement 6: Generator Soal Adaptif (Quiz)

**User Story:** Sebagai mahasiswa, saya ingin mengerjakan soal latihan yang dibuat dari materi yang saya pelajari, sehingga saya dapat menguji pemahaman saya secara efektif.

#### Acceptance Criteria

1. THE Quiz_Generator SHALL menghasilkan soal pilihan ganda berdasarkan konten dokumen aktif menggunakan AI_Engine.
2. THE Quiz_Generator SHALL menghasilkan soal dengan empat pilihan jawaban (A, B, C, D) dan satu jawaban yang benar.
3. WHEN User memulai sesi quiz, THE Quiz_Generator SHALL menampilkan soal satu per satu dengan progress bar yang menunjukkan posisi soal saat ini.
4. THE Quiz_Generator SHALL menampilkan timer countdown untuk setiap soal.
5. WHEN User memilih jawaban, THE Quiz_Generator SHALL merekam pilihan User dan menampilkan umpan balik (benar/salah) sebelum melanjutkan ke soal berikutnya.
6. WHEN User menyelesaikan semua soal, THE Quiz_Generator SHALL menampilkan hasil quiz dengan skor, jumlah jawaban benar, dan ringkasan performa.
7. WHEN User menyelesaikan quiz, THE Gamification_Engine SHALL memberikan XP kepada User berdasarkan skor yang diperoleh.
8. THE Quiz_Generator SHALL menyimpan hasil quiz ke riwayat belajar User di Supabase.
9. THE Quiz_Generator SHALL menyediakan navigasi soal sehingga User dapat melihat soal mana yang sudah dijawab.

---

### Requirement 7: Ujian Simulasi

**User Story:** Sebagai mahasiswa, saya ingin melakukan simulasi ujian dengan kondisi yang menyerupai ujian nyata, sehingga saya dapat mempersiapkan diri dengan lebih baik.

#### Acceptance Criteria

1. THE Exam_Simulator SHALL menyediakan halaman setup ujian di mana User dapat mengkonfigurasi jumlah soal yang diinginkan.
2. WHEN User memulai ujian simulasi, THE Exam_Simulator SHALL menghasilkan soal dari dokumen aktif menggunakan Quiz_Generator dan memulai timer keseluruhan ujian.
3. THE Exam_Simulator SHALL menampilkan timer countdown yang terlihat jelas selama sesi ujian berlangsung.
4. WHILE sesi ujian berlangsung, THE Exam_Simulator SHALL memungkinkan User untuk berpindah antar soal menggunakan navigasi soal.
5. WHEN waktu ujian habis, THE Exam_Simulator SHALL secara otomatis mengakhiri sesi dan menampilkan hasil ujian.
6. WHEN User menyelesaikan ujian simulasi, THE Exam_Simulator SHALL menampilkan hasil dengan skor, persentase kebenaran, dan pembahasan per soal.
7. WHEN User menyelesaikan ujian simulasi, THE Gamification_Engine SHALL memberikan XP kepada User berdasarkan skor yang diperoleh.
8. THE Exam_Simulator SHALL menyimpan hasil ujian ke riwayat belajar User di Supabase.

---

### Requirement 8: Sistem Gamifikasi

**User Story:** Sebagai mahasiswa, saya ingin mendapatkan reward atas aktivitas belajar saya, sehingga saya termotivasi untuk belajar secara konsisten.

#### Acceptance Criteria

1. THE Gamification_Engine SHALL menghitung dan memperbarui XP User setiap kali User menyelesaikan aktivitas belajar (chat AI, quiz, ujian simulasi).
2. THE Gamification_Engine SHALL menentukan Level User berdasarkan total XP yang dimiliki, dengan threshold level yang terdefinisi.
3. WHEN XP User mencapai threshold level berikutnya, THE Gamification_Engine SHALL menaikkan Level User dan menampilkan notifikasi level up.
4. THE Gamification_Engine SHALL melacak Streak harian User berdasarkan aktivitas belajar setiap hari.
5. WHEN User aktif belajar pada hari yang sama dengan hari sebelumnya, THE Gamification_Engine SHALL menambah nilai Streak User sebesar satu.
6. IF User tidak aktif belajar selama satu hari penuh, THEN THE Gamification_Engine SHALL mereset nilai Streak User ke nol.
7. THE Gamification_Engine SHALL memberikan Badge kepada User ketika User mencapai pencapaian tertentu (contoh: streak 7 hari, menyelesaikan 10 quiz, skor sempurna).
8. THE Gamification_Engine SHALL menampilkan informasi Level, XP, dan Streak User di sidebar dashboard.
9. THE Gamification_Engine SHALL menampilkan semua Badge yang dimiliki User di halaman Analitik Pribadi.

---

### Requirement 9: Analitik Pribadi

**User Story:** Sebagai mahasiswa, saya ingin melihat data performa belajar saya secara visual, sehingga saya dapat memahami kekuatan dan kelemahan saya.

#### Acceptance Criteria

1. THE Analytics_Engine SHALL menampilkan progress Level User dengan visualisasi progress bar XP menuju level berikutnya.
2. THE Analytics_Engine SHALL menampilkan metrik utama: total XP, Streak saat ini, jumlah quiz diselesaikan, dan rata-rata skor.
3. THE Analytics_Engine SHALL menampilkan grafik aktivitas belajar User dalam rentang waktu tertentu (harian/mingguan).
4. THE Analytics_Engine SHALL menampilkan performa User per topik/dokumen berdasarkan hasil quiz dan ujian.
5. THE Analytics_Engine SHALL menampilkan semua Badge yang dimiliki User beserta deskripsi cara mendapatkannya.
6. THE Analytics_Engine SHALL mengambil dan menampilkan data analitik dari Supabase secara real-time.

---

### Requirement 10: Riwayat Belajar

**User Story:** Sebagai mahasiswa, saya ingin melihat riwayat semua aktivitas belajar saya, sehingga saya dapat melacak progres dan mengulang materi yang diperlukan.

#### Acceptance Criteria

1. THE LECTOR SHALL menampilkan daftar semua aktivitas belajar User yang tersimpan, termasuk jenis aktivitas, dokumen terkait, skor (jika ada), XP yang diperoleh, dan tanggal aktivitas.
2. THE LECTOR SHALL menyediakan filter riwayat berdasarkan jenis aktivitas (chat, quiz, ujian) dan rentang tanggal.
3. WHEN User menerapkan filter, THE LECTOR SHALL memperbarui daftar riwayat sesuai kriteria filter yang dipilih.
4. THE LECTOR SHALL menampilkan riwayat dalam urutan kronologis terbaru di atas.
5. THE LECTOR SHALL mengambil data riwayat dari Supabase dan menampilkannya dengan pagination jika jumlah entri melebihi 20 item per halaman.

---

### Requirement 11: Dashboard dan Navigasi Aplikasi

**User Story:** Sebagai mahasiswa, saya ingin memiliki antarmuka dashboard yang mudah dinavigasi, sehingga saya dapat mengakses semua fitur LECTOR dengan cepat.

#### Acceptance Criteria

1. THE LECTOR SHALL menampilkan sidebar navigasi dengan tautan ke: Chat AI, Quiz & Latihan, Ujian Simulasi, Analitik Pribadi, dan Riwayat Belajar.
2. THE LECTOR SHALL menampilkan kartu informasi User di sidebar yang menunjukkan nama, Level, XP saat ini, dan nilai Streak.
3. WHEN User mengklik tautan navigasi di sidebar, THE LECTOR SHALL menampilkan konten tab yang sesuai tanpa reload halaman penuh.
4. THE LECTOR SHALL menggunakan dark theme dengan warna utama purple (#7c6af7), cyan (#4fd1c5), gold (#f6ad55), dan background gelap (#090b10).
5. THE LECTOR SHALL menggunakan font Syne untuk heading, DM Sans untuk body text, dan JetBrains Mono untuk elemen kode/monospace.
6. THE LECTOR SHALL berfungsi sebagai PWA yang dapat diinstal di perangkat User.
7. WHEN User mengakses halaman yang memerlukan autentikasi tanpa sesi aktif, THE LECTOR SHALL mengarahkan User ke halaman login.

---

### Requirement 12: Performa dan Keandalan

**User Story:** Sebagai mahasiswa, saya ingin platform LECTOR berjalan dengan cepat dan andal, sehingga pengalaman belajar saya tidak terganggu.

#### Acceptance Criteria

1. WHEN User membuka halaman LECTOR untuk pertama kali, THE LECTOR SHALL menampilkan konten utama dalam waktu kurang dari 3 detik pada koneksi broadband standar.
2. WHEN AI_Engine menghasilkan respons streaming, THE LECTOR SHALL menampilkan token pertama dalam waktu kurang dari 2 detik setelah permintaan dikirim.
3. IF koneksi internet User terputus saat menggunakan aplikasi, THEN THE LECTOR SHALL menampilkan notifikasi status koneksi yang informatif.
4. THE LECTOR SHALL mengimplementasikan error boundary sehingga kegagalan pada satu komponen tidak menyebabkan seluruh aplikasi crash.
5. IF permintaan ke AI_Engine gagal, THEN THE AI_Engine SHALL menampilkan pesan kesalahan yang deskriptif dan menyediakan opsi untuk mencoba kembali.
