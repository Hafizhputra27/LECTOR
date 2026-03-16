import { Component, ErrorInfo } from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex items-center justify-center min-h-screen bg-background px-4">
          <div className="max-w-md w-full bg-surface rounded-xl p-8 border border-white/5 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-white font-heading text-xl mb-2">Terjadi Kesalahan</h2>
            <p className="text-gray-400 font-body text-sm mb-6">
              {this.state.error?.message || 'Sesuatu yang tidak terduga terjadi.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-purple-500 hover:bg-purple-500/80 text-white rounded-lg font-body text-sm transition-colors"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
