import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TexPro AI - Login | CMDT Mali',
  description: 'Access your TexPro AI textile manufacturing dashboard',
}

interface PublicLayoutProps {
  children: React.ReactNode
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <>
      {children}
    </>
  )
}
