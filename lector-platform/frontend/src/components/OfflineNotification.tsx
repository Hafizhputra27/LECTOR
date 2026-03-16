import { useOnlineStatus } from '../hooks/useOnlineStatus'

export default function OfflineNotification() {
  const { isOnline } = useOnlineStatus()

  if (isOnline) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-3 bg-gray-900 border-t border-yellow-500/30 px-4 py-3">
      <span className="text-yellow-400 text-lg flex-shrink-0">⚠️</span>
      <p className="text-yellow-300 font-body text-sm">
        Tidak ada koneksi internet. Beberapa fitur mungkin tidak tersedia.
      </p>
    </div>
  )
}
