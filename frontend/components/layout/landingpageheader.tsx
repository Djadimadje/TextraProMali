"use client"
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface LandingHeaderProps {
  onMenuClick?: () => void
}

export default function LandingHeader({ onMenuClick }: LandingHeaderProps) {
  const router = useRouter()

  const handleLogin = () => {
    router.push('/login')
  }

  return (
    <nav className="bg-green-700 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo */}
          <Link href="/" className="font-bold text-2xl flex items-center">
            🏭 CMDT
          </Link>

          {/* Right side - Login Button */}
          <button
            onClick={handleLogin}
            className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded text-white transition-colors font-medium"
          >
            Login
          </button>
        </div>
      </div>
    </nav>
  )
}