import type { Metadata, Viewport } from 'next'
import '../../styles/globals.css'
import LayoutWrapper from "../components/layout/LayoutWrapper"
import { AuthProvider } from '../contexts/AuthContext'
import SessionWarning from '../components/auth/SessionWarning'

export const metadata: Metadata = {
  title: 'TexPro AI - Intelligent Textile Manufacturing | CMDT Mali',
  description: 'Revolutionize your textile production with TexPro AI. Smart monitoring, predictive maintenance, and quality control for the Mali textile industry.',
  keywords: 'textile, AI, manufacturing, Mali, CMDT, production, automation, quality control',
  authors: [{ name: 'CMDT Mali' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html suppressHydrationWarning={true}>
      <head>
        {/* FontAwesome for icons */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" 
        />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          {/* <SessionWarning /> */}
        </AuthProvider>
      </body>
    </html>
  )
}