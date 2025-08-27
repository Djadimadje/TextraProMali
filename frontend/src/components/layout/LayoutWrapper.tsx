'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import LandingHeader from "../../../components/layout/landingpageheader";
import LandingFooter from "../../../components/layout/landingpagefooter";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Routes that should not have header/footer
  const noLayoutRoutes = ['/login', '/register', '/forgot-password'];
  const isDashboardRoute = pathname.startsWith('/admin') || 
                          pathname.startsWith('/supervisor') || 
                          pathname.startsWith('/technician') || 
                          pathname.startsWith('/inspector') || 
                          pathname.startsWith('/analyst');
  
  const shouldShowLayout = mounted && !noLayoutRoutes.includes(pathname) && !isDashboardRoute;

  if (!mounted) {
    return <div className="min-h-screen">{children}</div>;
  }

  if (!shouldShowLayout) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />
      <main className="flex-1">
        {children}
      </main>
      <LandingFooter />
    </div>
  );
}
