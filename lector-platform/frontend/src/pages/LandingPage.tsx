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
          <span className="inline-flex items-center gap-1.5 font-body text-xs font-semibold px-3 py-1 rounded-full border border-[#f6ad55]/40 text-[#f6ad55] mb-6 animate-fade-in">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            PKM-KC 2025
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
// SVG icons for feature cards
const FeatureIconSVG = {
  upload: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>,
  ai: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.414 2.798H4.213c-1.444 0-2.414-1.798-1.414-2.798L4.2 15.3" /></svg>,
  summary: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  quiz: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
  exam: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  history: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
}

const features = [
  { icon: FeatureIconSVG.upload, title: 'Upload PPT/PDF', desc: 'Unggah materi kuliah dalam format PDF atau PowerPoint hingga 50MB.' },
  { icon: FeatureIconSVG.ai, title: 'Penjelasan AI Streaming', desc: 'Tanya AI dan dapatkan penjelasan real-time token per token dari Gemini.' },
  { icon: FeatureIconSVG.summary, title: 'Ringkasan Otomatis', desc: 'Buat ringkasan terstruktur dari seluruh dokumen dalam Bahasa Indonesia.' },
  { icon: FeatureIconSVG.quiz, title: 'Generator Soal Adaptif', desc: 'Soal pilihan ganda A/B/C/D yang dibuat otomatis dari materi kamu.' },
  { icon: FeatureIconSVG.exam, title: 'Mode Ujian + Timer', desc: 'Simulasi ujian dengan timer countdown dan navigasi antar soal.' },
  { icon: FeatureIconSVG.history, title: 'Riwayat Dokumen', desc: 'Akses kembali semua dokumen dan sesi belajar yang pernah kamu lakukan.' },
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
      <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-200 inline-block text-[#7c6af7]">{f.icon}</div>
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
// SVG icons for gamification
const GamIcons = {
  xp: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  streak: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" /></svg>,
  badge: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
  analytics: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
}

const gamMechanisms = [
  { icon: GamIcons.xp, title: 'Level & XP', desc: 'Kumpulkan XP dari setiap aktivitas belajar dan naiki level dari 1 hingga 10.', color: 'text-[#7c6af7]', glow: 'rgba(124,106,247,0.15)' },
  { icon: GamIcons.streak, title: 'Streak Harian', desc: 'Pertahankan streak belajar harian untuk bonus motivasi dan badge eksklusif.', color: 'text-[#f6ad55]', glow: 'rgba(246,173,85,0.15)' },
  { icon: GamIcons.badge, title: 'Badge & Pencapaian', desc: 'Raih badge unik untuk pencapaian seperti streak 7 hari atau skor sempurna.', color: 'text-[#9d8ff9]', glow: 'rgba(157,143,249,0.15)' },
  { icon: GamIcons.analytics, title: 'Analytics Pribadi', desc: 'Pantau performa belajarmu dengan grafik aktivitas dan statistik detail.', color: 'text-green-400', glow: 'rgba(74,222,128,0.15)' },
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
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{ background: m.glow }}>
                <span className={m.color}>{m.icon}</span>
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
// SVG icons for steps
const StepIcons = [
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>,
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
]

const steps = [
  { num: '01', icon: StepIcons[0], title: 'Upload Dokumen', desc: 'Unggah file PDF atau PPT materi kuliahmu ke platform.' },
  { num: '02', icon: StepIcons[1], title: 'Pilih Fitur', desc: 'Pilih antara Chat AI, Ringkasan, Quiz, atau Ujian Simulasi.' },
  { num: '03', icon: StepIcons[2], title: 'Belajar Interaktif', desc: 'Berinteraksi dengan AI dan kerjakan soal dari materimu.' },
  { num: '04', icon: StepIcons[3], title: 'Pantau Progres', desc: 'Lihat perkembangan belajarmu lewat analytics dan gamifikasi.' },
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
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 border text-[#7c6af7] group-hover:border-[#7c6af7]/40 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#7c6af7]/10 transition-all duration-300 ${isLight ? 'bg-white border-gray-200' : 'bg-surface border-white/5'}`}>
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
// Avatar SVG for team
function TeamAvatar({ index }: { index: number }) {
  const colors = ['from-[#7c6af7] to-[#9d8ff9]', 'from-[#9d8ff9] to-[#f6ad55]', 'from-[#f6ad55] to-[#7c6af7]', 'from-green-400 to-[#9d8ff9]']
  return (
    <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 bg-gradient-to-br ${colors[index]} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </div>
  )
}

const team = [
  { name: 'Ahmad Hafizh Karunia Putra', role: 'Ketua Tim · 241111001' },
  { name: 'Alexander Saputra Nadeak', role: 'Anggota · 241111000' },
  { name: 'Muhammad Fachri Ramadhan', role: 'Anggota · 241111000' },
  { name: 'Nevan Nurrahman', role: 'Anggota · 241111000' },
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
              <TeamAvatar index={i} />
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
// SVG icons for tech stack
const TechIcons = {
  gemini: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.414 2.798H4.213c-1.444 0-2.414-1.798-1.414-2.798L4.2 15.3" /></svg>,
  react: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" /></svg>,
  node: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" /></svg>,
  db: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>,
  rag: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  pwa: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  ts: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  deploy: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>,
}

const techStack = [
  { name: 'Gemini API', icon: TechIcons.gemini, desc: 'AI generatif Google' },
  { name: 'React.js + Vite', icon: TechIcons.react, desc: 'Frontend modern' },
  { name: 'Node.js + Express', icon: TechIcons.node, desc: 'Backend REST API' },
  { name: 'Supabase', icon: TechIcons.db, desc: 'Database & Auth' },
  { name: 'RAG Architecture', icon: TechIcons.rag, desc: 'Retrieval-Augmented Gen' },
  { name: 'PWA', icon: TechIcons.pwa, desc: 'Installable web app' },
  { name: 'TypeScript', icon: TechIcons.ts, desc: 'Type-safe codebase' },
  { name: 'Vercel', icon: TechIcons.deploy, desc: 'Edge deployment' },
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
              <div className="text-[#7c6af7] mb-2 group-hover:scale-110 transition-transform duration-200 inline-block">{t.icon}</div>
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
            Mulai Sekarang — Gratis
            <svg className="w-4 h-4 ml-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
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
