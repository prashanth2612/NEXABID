import { useRef, useState } from 'react'
import { Camera, Loader2, User } from 'lucide-react'
import api from '@/lib/api'

interface Props {
  currentAvatar?: string
  name?: string
  size?: number
  onUpdate?: (avatar: string) => void
}

export default function AvatarUpload({ currentAvatar, name, size = 80, onUpdate }: Props) {
  const [avatar, setAvatar] = useState(currentAvatar || '')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return }
    if (file.size > 2 * 1024 * 1024) { setError('Image must be under 2MB'); return }
    setError('')
    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string
        try {
          const res = await api.post('/profile/avatar', { avatar: base64 })
          const newAvatar = res.data.data.avatar
          setAvatar(newAvatar)
          onUpdate?.(newAvatar)
        } catch (err: unknown) {
          const e = err as { response?: { data?: { message?: string } } }
          setError(e.response?.data?.message || 'Upload failed')
        } finally {
          setUploading(false)
        }
      }
      reader.readAsDataURL(file)
    } catch {
      setError('Failed to read file')
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative cursor-pointer group"
        style={{ width: size, height: size }}
        onClick={() => inputRef.current?.click()}
      >
        {/* Avatar circle */}
        <div
          className="w-full h-full rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          {uploading ? (
            <Loader2 size={size * 0.3} className="animate-spin text-gray-400" />
          ) : avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : name ? (
            <span className="font-bold text-gray-600" style={{ fontSize: size * 0.3 }}>{initials}</span>
          ) : (
            <User size={size * 0.4} className="text-gray-400" />
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera size={size * 0.25} className="text-white" />
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      <button
        onClick={() => inputRef.current?.click()}
        className="text-xs text-gray-500 hover:text-black transition-colors font-medium"
      >
        {avatar ? 'Change photo' : 'Upload photo'}
      </button>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
