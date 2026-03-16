import { useNavigate } from 'react-router-dom'
import { useRef, useState, useEffect } from 'react'
import ThemeToggle from '../components/ThemeToggle'
import { useThemeStore } from '../store/themeStore'

// ─── Smooth scroll helper ───────────────────────────────────────────────────
function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

// ─── Cursor-tracking background orbs ────────────────────────────────────────
function CursorOrbs() {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 })
  const rafRef = useRef<number>(0)
  const targetRef = useRef({ x: 0.5, y: 0.5 })
  const currentRef = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    function onMove(e: MouseEvent) {
      targetRef.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }
    }
    window.addEventListener('mousemove', onMove)

    function animate() {
      const t = targetRef.current
      const c = currentRef.current
      // smooth lerp
      c.x += (t.x - c.x) * 0.06
      c.y += (t.y - c.y) * 0.06
      setMouse({ x: c.x, y: c.y })
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const ox = mouse.x * 100
  const oy = mouse.y * 100

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Primary orb — follows cursor closely */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[120px]"
        style={{
          background: 'radial-gradient(circle, rgba(124,106,247,0.12) 0%, transparent 70%)',
          left: `calc(${ox}% - 300px)`,
          top: `calc(${oy}% - 300px)`,
          transition: 'left 0.05s linear, top 0.05s linear',
        }}
      />
      {/* Secondary orb — offset, slower feel */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full blur-[100px]"
        style={{
          background: 'radial-gradient(circle, rgba(157,143,249,0.08) 0%, transparent 70%)',
          left: `calc(${100 - ox}% - 200px)`,
          top: `calc(${100 - oy}% - 200px)`,
          transition: 'left 0.08s linear, top 0.08s linear',
        }}
      />
      {/* Static ambient glow — bottom left */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-[140px] bottom-[-100px] left-[-100px]"
        style={{ background: 'radial-gradient(circle, rgba(124,106,247,0.07) 0%, transparent 70%)' }}
      />
    </div>
  )
}

// ─── Academic Particles Logo ─────────────────────────────────────────────────
const SYMBOLS = [
  // Matematika
  { text: '∑', color: '#7c6af7' }, { text: '∫', color: '#9d8ff9' },
  { text: 'π', color: '#f6ad55' }, { text: 'λ', color: '#7c6af7' },
  { text: '∂', color: '#9d8ff9' }, { text: 'Δ', color: '#f6ad55' },
  { text: '√', color: '#7c6af7' }, { text: '∞', color: '#9d8ff9' },
  { text: 'α', color: '#f6ad55' }, { text: 'β', color: '#7c6af7' },
  { text: 'θ', color: '#9d8ff9' }, { text: '∇', color: '#f6ad55' },
  { text: 'μ', color: '#7c6af7' }, { text: 'ω', color: '#9d8ff9' },
  { text: 'γ', color: '#f6ad55' }, { text: 'ε', color: '#7c6af7' },
  { text: 'φ', color: '#9d8ff9' }, { text: 'ρ', color: '#f6ad55' },
  // Kode
  { text: '{}', color: '#9d8ff9' }, { text: 'f(x)', color: '#7c6af7' },
  { text: '=>', color: '#f6ad55' }, { text: '[]', color: '#9d8ff9' },
  { text: '&&', color: '#7c6af7' }, { text: '//', color: '#f6ad55' },
  { text: '<>', color: '#9d8ff9' }, { text: '!=', color: '#7c6af7' },
  // Fisika
  { text: 'E=mc²', color: '#f6ad55' }, { text: 'F=ma', color: '#7c6af7' },
  { text: 'ℏ', color: '#9d8ff9' }, { text: 'Ψ', color: '#f6ad55' },
  { text: 'σ', color: '#7c6af7' }, { text: 'τ', color: '#9d8ff9' },
  // Kimia
  { text: 'H₂O', color: '#f6ad55' }, { text: 'CO₂', color: '#7c6af7' },
  { text: 'NaCl', color: '#9d8ff9' }, { text: 'ATP', color: '#f6ad55' },
]

interface Particle {
  id: number
  sym: string
  color: string
  // base orbit position (angle in radians, radius)
  angle: number
  radius: number
  speed: number
  size: number
  opacity: number
  // current rendered position relative to center
  x: number
  y: number
}

function AcademicParticlesLogo() {
  const areaRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLImageElement>(null)
  const mouseRef = useRef({ x: 0, y: 0, inside: false })
  const rafRef = useRef<number>(0)
  const timeRef = useRef(0)
  const [particles] = useState<Particle[]>(() =>
    SYMBOLS.map((s, i) => {
      const ring = Math.floor(i / 12)
      const baseRadius = [145, 195, 245][ring]
      const jitter = (i % 4) * 8
      return {
        id: i,
        sym: s.text,
        color: s.color,
        angle: (i / SYMBOLS.length) * Math.PI * 2 + ring * 0.3,
        radius: baseRadius + jitter,
        speed: [0.004, 0.003, 0.0025][ring] + (i % 3) * 0.0005,
        size: [10, 11, 12][ring] + (i % 3) * 2,
        opacity: [0.22, 0.18, 0.14][ring],
        x: 0,
        y: 0,
      }
    })
  )
  const [positions, setPositions] = useState<{ x: number; y: number; scale: number; opacity: number }[]>(
    () => particles.map(() => ({ x: 0, y: 0, scale: 1, opacity: 0.2 }))
  )
  const [logoTilt, setLogoTilt] = useState({ rx: 0, ry: 0 })

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      const el = areaRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left - rect.width / 2,
        y: e.clientY - rect.top - rect.height / 2,
        inside: e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom,
      }
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  useEffect(() => {
    function tick() {
      timeRef.current += 1
      const t = timeRef.current
      const { x: mx, y: my, inside } = mouseRef.current

      const newPos = particles.map((p) => {
        const angle = p.angle + t * p.speed
        const bx = Math.cos(angle) * p.radius
        const by = Math.sin(angle) * p.radius

        let fx = bx
        let fy = by
        let scale = 1
        let opacity = p.opacity

        if (inside) {
          const dx = bx - mx
          const dy = by - my
          const dist = Math.sqrt(dx * dx + dy * dy)
          const repel = 90
          if (dist < repel) {
            const force = (repel - dist) / repel
            fx = bx + (dx / dist) * force * 55
            fy = by + (dy / dist) * force * 55
            scale = 1 + force * 0.5
            opacity = Math.min(0.7, p.opacity + force * 0.4)
          }
        }

        return { x: fx, y: fy, scale, opacity }
      })

      setPositions(newPos)

      // logo tilt
      if (inside) {
        const w = areaRef.current?.offsetWidth ?? 300
        const h = areaRef.current?.offsetHeight ?? 300
        setLogoTilt({ rx: -(my / (h / 2)) * 18, ry: (mx / (w / 2)) * 18 })
      } else {
        setLogoTilt((prev) => ({
          rx: prev.rx * 0.92,
          ry: prev.ry * 0.92,
        }))
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [particles])

  return (
    <div
      ref={areaRef}
      className="relative w-[480px] h-[480px] select-none cursor-crosshair"
      style={{ perspective: '800px' }}
    >
      {/* Subtle glow di belakang logo */}
      <div
        className="absolute rounded-full blur-2xl pointer-events-none"
        style={{
          width: 200, height: 200,
          left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(124,106,247,0.12) 0%, transparent 70%)',
        }}
      />
      {/* Particles */}
      {particles.map((p, i) => (
        <div
          key={p.id}
          className="absolute font-mono font-bold pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(calc(-50% + ${positions[i].x}px), calc(-50% + ${positions[i].y}px)) scale(${positions[i].scale})`,
            fontSize: `${p.size}px`,
            color: p.color,
            opacity: positions[i].opacity,
            transition: 'transform 0.08s linear, opacity 0.08s linear',
            textShadow: `0 0 8px ${p.color}60`,
          }}
        >
          {p.sym}
        </div>
      ))}

      {/* Logo — center dengan margin auto, bukan absolute positioning */}
      <div
        className="absolute pointer-events-none"
        style={{ left: '50%', top: '50%', marginLeft: -144, marginTop: -144 }}
      >
        <img
          ref={logoRef}
          src="/logo_lector.png"
          alt="LECTOR"
          draggable={false}
          className="w-72 h-72 object-contain"
          style={{
            transform: `perspective(800px) rotateX(${logoTilt.rx}deg) rotateY(${logoTilt.ry}deg) translateZ(20px)`,
            transition: 'transform 0.12s ease',
            filter: 'drop-shadow(0 6px 20px rgba(124,106,247,0.28)) drop-shadow(0 10px 30px rgba(157,143,249,0.12))',
            animation: 'float3d 5s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  )
}

// ─── Navbar ─────────────────────────────────────────────────────────────────
function Navbar() {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const isLight = theme === 'light'
  const links = [
    { label: 'Fitur', id: 'fitur' },
    { label: 'Gamifikasi', id: 'gamifikasi' },
    { label: 'Cara Kerja', id: 'cara-kerja' },
    { label: 'Tim', id: 'tim' },
  ]
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo_lector.png" alt="LECTOR" className="h-8 w-auto object-contain" />
          <span className="font-heading text-base font-bold bg-gradient-to-r from-[#7c6af7] to-[#9d8ff9] bg-clip-text text-transparent tracking-wide">
            LECTOR
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollTo(l.id)}
              className={`font-body text-sm transition-all duration-200 hover:translate-y-[-1px] ${isLight ? 'text-gray-600 hover:text-gray-900' : 'text-gray-400 hover:text-white'}`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => navigate('/auth')}
            className="relative font-body text-sm px-5 py-2 rounded-full text-white font-semibold overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#7c6af7]/40"
            style={{ background: 'linear-gradient(135deg, #7c6af7, #9d8ff9)' }}
          >
            <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none" />
            Mulai Sekarang
          </button>
        </div>
      </div>
    </nav>
  )
}

// ─── Hero Section ────────────────────────────────────────────────────────────
function HeroSection() {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const isLight = theme === 'light'

  const stats = [
    { value: '500+', label: 'Mahasiswa' },
    { value: '10K+', label: 'Soal Dibuat' },
    { value: '95%', label: 'Kepuasan' },
  ]

  return (
    <section className="relative pt-32 pb-20 px-6 z-10">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        {/* Left */}
        <div className="flex-1 text-left">
          <span className="inline-block font-body text-xs font-semibold px-3 py-1 rounded-full border border-[#f6ad55]/40 text-[#f6ad55] mb-6 animate-fade-in">
            🏆 PKM-KC 2025
          </span>
          <h1 className={`font-heading text-4xl md:text-6xl font-bold leading-tight mb-6 animate-slide-up ${isLight ? 'text-gray-900' : 'text-white'}`}>
            Belajar Lebih Cerdas dengan{' '}
            <span className="bg-gradient-to-r from-[#7c6af7] to-[#9d8ff9] bg-clip-text text-transparent">
              AI Interaktif
            </span>
          </h1>
          <p className={`font-body text-lg max-w-xl mb-10 animate-slide-up ${isLight ? 'text-gray-600' : 'text-gray-400'}`} style={{ animationDelay: '0.1s' }}>
            Upload materi kuliah, tanya AI, buat soal latihan, dan pantau progres belajarmu — semua dalam satu platform gamifikasi yang menyenangkan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={() => navigate('/auth')}
              className="relative font-body px-8 py-3 rounded-full text-white font-semibold overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#7c6af7]/35 btn-glow"
              style={{ background: 'linear-gradient(135deg, #7c6af7, #9d8ff9)' }}
            >
              <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none" />
              Mulai Gratis →
            </button>
            <button
              onClick={() => scrollTo('cara-kerja')}
              className={`font-body px-8 py-3 rounded-xl border transition-all duration-200 ${isLight ? 'border-gray-300 text-gray-600 hover:border-[#7c6af7]/50 hover:text-gray-900' : 'border-white/10 text-gray-300 hover:border-[#7c6af7]/50 hover:text-white'}`}
            >
              Lihat Cara Kerja
            </button>
          </div>
          <div className="flex gap-10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            {stats.map((s) => (
              <div key={s.label}>
                <div className={`font-heading text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{s.value}</div>
                <div className={`font-body text-sm ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: logo 3D + partikel simbol akademik */}
        <div className="flex-shrink-0 flex items-center justify-center lg:w-[480px]">
          <AcademicParticlesLogo />
        </div>
      </div>
    </section>
  )
}

// ─── Fitur Utama ─────────────────────────────────────────────────────────────
const features = [
  { icon: '📄', title: 'Upload PPT/PDF', desc: 'Unggah materi kuliah dalam format PDF atau PowerPoint hingga 50MB.' },
  { icon: '🤖', title: 'Penjelasan AI Streaming', desc: 'Tanya AI dan dapatkan penjelasan real-time token per token dari Gemini.' },
  { icon: '📝', title: 'Ringkasan Otomatis', desc: 'Buat ringkasan terstruktur dari seluruh dokumen dalam Bahasa Indonesia.' },
  { icon: '🎯', title: 'Generator Soal Adaptif', desc: 'Soal pilihan ganda A/B/C/D yang dibuat otomatis dari materi kamu.' },
  { icon: '⏱️', title: 'Mode Ujian + Timer', desc: 'Simulasi ujian dengan timer countdown dan navigasi antar soal.' },
  { icon: '📚', title: 'Riwayat Dokumen', desc: 'Akses kembali semua dokumen dan sesi belajar yang pernah kamu lakukan.' },
]

function FeatureCard({ f, i }: { f: typeof features[0]; i: number }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement>(null)
  const { theme } = useThemeStore()
  const isLight = theme === 'light'

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current!.getBoundingClientRect()
    const dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2)
    const dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2)
    setTilt({ x: dy * 6, y: dx * 6 })
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className={`rounded-2xl p-6 group cursor-default border transition-colors duration-200 ${isLight ? 'bg-white border-gray-200' : 'bg-surface border-surface-2'}`}
      style={{
        transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.15s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow: tilt.x !== 0 || tilt.y !== 0 ? '0 8px 32px rgba(124,106,247,0.1)' : 'none',
        animationDelay: `${i * 0.08}s`,
      }}
    >
      <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-200 inline-block">{f.icon}</div>
      <h3 className={`font-heading text-lg font-semibold mb-2 group-hover:text-[#7c6af7] transition-colors duration-200 ${isLight ? 'text-gray-900' : 'text-white'}`}>
        {f.title}
      </h3>
      <p className={`font-body text-sm group-hover:text-gray-600 transition-colors duration-200 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{f.desc}</p>
      <div className="mt-4 h-px bg-gradient-to-r from-[#7c6af7]/0 via-[#7c6af7]/30 to-[#7c6af7]/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </div>
  )
}

function FiturSection() {
  const { theme } = useThemeStore()
  const isLight = theme === 'light'
  return (
    <section id="fitur" className="relative py-20 px-6 z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className={`font-heading text-3xl md:text-4xl font-bold mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>Fitur Utama</h2>
          <p className={`font-body max-w-xl mx-auto ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
            Semua yang kamu butuhkan untuk belajar lebih efektif, dalam satu platform.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => <FeatureCard key={f.title} f={f} i={i} />)}
        </div>
      </div>
    </section>
  )
}

// ─── Gamifikasi ───────────────────────────────────────────────────────────────
const gamMechanisms = [
  { icon: '⚡', title: 'Level & XP', desc: 'Kumpulkan XP dari setiap aktivitas belajar dan naiki level dari 1 hingga 10.', color: 'text-[#7c6af7]', glow: 'rgba(124,106,247,0.15)' },
  { icon: '🔥', title: 'Streak Harian', desc: 'Pertahankan streak belajar harian untuk bonus motivasi dan badge eksklusif.', color: 'text-[#f6ad55]', glow: 'rgba(246,173,85,0.15)' },
  { icon: '🏅', title: 'Badge & Pencapaian', desc: 'Raih badge unik untuk pencapaian seperti streak 7 hari atau skor sempurna.', color: 'text-[#9d8ff9]', glow: 'rgba(157,143,249,0.15)' },
  { icon: '📊', title: 'Analytics Pribadi', desc: 'Pantau performa belajarmu dengan grafik aktivitas dan statistik detail.', color: 'text-green-400', glow: 'rgba(74,222,128,0.15)' },
]

function GamifikasiSection() {
  const { theme } = useThemeStore()
  const isLight = theme === 'light'
  return (
    <section id="gamifikasi" className={`relative py-20 px-6 z-10 ${isLight ? 'bg-gray-100' : 'bg-surface'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className={`font-heading text-3xl md:text-4xl font-bold mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>Sistem Gamifikasi</h2>
          <p className={`font-body max-w-xl mx-auto ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
            Belajar terasa seperti bermain game — setiap aktivitas memberi reward nyata.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {gamMechanisms.map((m, i) => (
            <div
              key={m.title}
              className={`rounded-2xl p-6 text-center group hover:scale-[1.03] transition-all duration-300 cursor-default border ${isLight ? 'bg-white border-gray-200' : 'bg-background border-white/5'}`}
              style={{ transitionDelay: `${i * 0.05}s` }}
            >
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300" style={{ background: m.glow }}>
                {m.icon}
              </div>
              <h3 className={`font-heading text-lg font-semibold mb-2 ${m.color}`}>{m.title}</h3>
              <p className={`font-body text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Cara Kerja ───────────────────────────────────────────────────────────────
const steps = [
  { num: '01', icon: '📤', title: 'Upload Dokumen', desc: 'Unggah file PDF atau PPT materi kuliahmu ke platform.' },
  { num: '02', icon: '🎛️', title: 'Pilih Fitur', desc: 'Pilih antara Chat AI, Ringkasan, Quiz, atau Ujian Simulasi.' },
  { num: '03', icon: '💡', title: 'Belajar Interaktif', desc: 'Berinteraksi dengan AI dan kerjakan soal dari materimu.' },
  { num: '04', icon: '📈', title: 'Pantau Progres', desc: 'Lihat perkembangan belajarmu lewat analytics dan gamifikasi.' },
]

function CaraKerjaSection() {
  const { theme } = useThemeStore()
  const isLight = theme === 'light'
  return (
    <section id="cara-kerja" className="relative py-20 px-6 z-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className={`font-heading text-3xl md:text-4xl font-bold mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>Cara Kerja</h2>
          <p className={`font-body max-w-xl mx-auto ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Mulai belajar lebih cerdas dalam empat langkah mudah.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={s.num} className="relative text-center group">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] right-[-50%] h-px bg-gradient-to-r from-[#7c6af7]/30 to-transparent" />
              )}
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl text-3xl mb-4 border group-hover:border-[#7c6af7]/40 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#7c6af7]/10 transition-all duration-300 ${isLight ? 'bg-white border-gray-200' : 'bg-surface border-white/5'}`}>
                {s.icon}
              </div>
              <div className="font-mono text-xs text-[#7c6af7] mb-1">{s.num}</div>
              <h3 className={`font-heading text-base font-semibold mb-2 group-hover:text-[#7c6af7] transition-colors duration-200 ${isLight ? 'text-gray-900' : 'text-white'}`}>{s.title}</h3>
              <p className={`font-body text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Tim Pengembang ───────────────────────────────────────────────────────────
const team = [
  { name: 'Ahmad Hafizh Karunia Putra', role: 'Ketua Tim · 241111001', avatar: '👨‍💻' },
  { name: 'Alexander Saputra Nadeak', role: 'Anggota · 241111000', avatar: '👨‍🔬' },
  { name: 'Muhammad Fachri Ramadhan', role: 'Anggota · 241111000', avatar: '🎨' },
  { name: 'Nevan Nurrahman', role: 'Anggota · 241111000', avatar: '⚙️' },
]

function TimSection() {
  const { theme } = useThemeStore()
  const isLight = theme === 'light'
  return (
    <section id="tim" className={`relative py-20 px-6 z-10 ${isLight ? 'bg-gray-100' : 'bg-surface'}`}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className={`font-heading text-3xl md:text-4xl font-bold mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>Tim Pengembang</h2>
          <p className={`font-body max-w-xl mx-auto ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Dikembangkan oleh mahasiswa berdedikasi untuk PKM-KC 2025.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((m, i) => (
            <div
              key={m.name}
              className={`rounded-2xl p-6 text-center group hover:border-[#7c6af7]/30 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#7c6af7]/8 transition-all duration-300 border ${isLight ? 'bg-white border-gray-200' : 'bg-background border-white/5'}`}
              style={{ transitionDelay: `${i * 0.06}s` }}
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">{m.avatar}</div>
              <h3 className={`font-heading text-base font-semibold mb-1 group-hover:text-[#7c6af7] transition-colors duration-200 ${isLight ? 'text-gray-900' : 'text-white'}`}>{m.name}</h3>
              <p className={`font-body text-xs ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>{m.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Tech Stack ───────────────────────────────────────────────────────────────
const techStack = [
  { name: 'Gemini API', icon: '✨', desc: 'AI generatif Google' },
  { name: 'React.js + Vite', icon: '⚛️', desc: 'Frontend modern' },
  { name: 'Node.js + Express', icon: '🟢', desc: 'Backend REST API' },
  { name: 'Supabase', icon: '🗄️', desc: 'Database & Auth' },
  { name: 'RAG Architecture', icon: '🔍', desc: 'Retrieval-Augmented Gen' },
  { name: 'PWA', icon: '📱', desc: 'Installable web app' },
  { name: 'TypeScript', icon: '🔷', desc: 'Type-safe codebase' },
  { name: 'Vercel', icon: '▲', desc: 'Edge deployment' },
]

function TechStackSection() {
  const { theme } = useThemeStore()
  const isLight = theme === 'light'
  return (
    <section className="relative py-20 px-6 z-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className={`font-heading text-3xl md:text-4xl font-bold mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>Tech Stack</h2>
          <p className={`font-body max-w-xl mx-auto ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Dibangun dengan teknologi terdepan untuk performa dan skalabilitas terbaik.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {techStack.map((t, i) => (
            <div
              key={t.name}
              className={`rounded-xl p-4 text-center group hover:border-[#7c6af7]/30 hover:scale-105 hover:shadow-lg hover:shadow-[#7c6af7]/8 transition-all duration-200 cursor-default border ${isLight ? 'bg-white border-gray-200' : 'bg-surface border-white/5'}`}
              style={{ transitionDelay: `${i * 0.04}s` }}
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200 inline-block">{t.icon}</div>
              <div className={`font-heading text-sm font-semibold group-hover:text-[#9d8ff9] transition-colors duration-200 ${isLight ? 'text-gray-900' : 'text-white'}`}>{t.name}</div>
              <div className={`font-body text-xs mt-1 ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA Section ─────────────────────────────────────────────────────────────
function CTASection() {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const isLight = theme === 'light'
  return (
    <section className={`relative py-20 px-6 z-10 ${isLight ? 'bg-gray-100' : 'bg-surface'}`}>
      <div className="max-w-3xl mx-auto text-center">
        <div className={`bg-gradient-to-br from-[#7c6af7]/10 to-[#9d8ff9]/10 border border-[#7c6af7]/20 rounded-3xl p-12 hover:border-[#7c6af7]/35 transition-colors duration-300 ${isLight ? 'bg-white/80' : ''}`}>
          <h2 className={`font-heading text-3xl md:text-4xl font-bold mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>Siap Belajar Lebih Cerdas?</h2>
          <p className={`font-body mb-8 max-w-lg mx-auto ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
            Bergabung dengan ratusan mahasiswa yang sudah merasakan manfaat LECTOR. Gratis untuk memulai.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="relative font-body px-10 py-4 rounded-full text-white font-semibold text-lg overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#7c6af7]/35 btn-glow"
            style={{ background: 'linear-gradient(135deg, #7c6af7, #9d8ff9)' }}
          >
            <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none" />
            Mulai Sekarang — Gratis 🚀
          </button>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const { theme } = useThemeStore()
  const isLight = theme === 'light'
  return (
    <footer className={`relative py-10 px-6 z-10 border-t ${isLight ? 'border-gray-200' : 'border-white/5'}`}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <img src="/logo_lector.png" alt="LECTOR" className="h-7 w-auto object-contain" />
            <span className="font-heading text-base font-bold bg-gradient-to-r from-[#7c6af7] to-[#9d8ff9] bg-clip-text text-transparent tracking-wide">
              LECTOR
            </span>
          </div>
          <p className={`font-body text-xs ${isLight ? 'text-gray-400' : 'text-gray-600'}`}>Platform Belajar AI untuk Mahasiswa Indonesia</p>
        </div>
        <div className={`flex gap-8 font-body text-sm ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
          {['fitur','gamifikasi','cara-kerja','tim'].map((id) => (
            <button key={id} onClick={() => scrollTo(id)} className={`hover:translate-y-[-1px] transition-all duration-150 capitalize ${isLight ? 'hover:text-gray-900' : 'hover:text-white'}`}>
              {id.replace('-', ' ')}
            </button>
          ))}
        </div>
        <p className={`font-body text-xs ${isLight ? 'text-gray-400' : 'text-gray-600'}`}>© 2025 LECTOR. PKM-KC 2025.</p>
      </div>
    </footer>
  )
}

// ─── LandingPage ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const theme = useThemeStore((s) => s.theme)
  const isLight = theme === 'light'
  return (
    <div className={`relative min-h-screen font-body overflow-x-hidden transition-colors duration-300 ${isLight ? 'bg-[#f4f5f9] text-gray-900' : 'bg-background text-white'}`}>
      <CursorOrbs />
      <Navbar />
      <HeroSection />
      <FiturSection />
      <GamifikasiSection />
      <CaraKerjaSection />
      <TimSection />
      <TechStackSection />
      <CTASection />
      <Footer />
    </div>
  )
}
