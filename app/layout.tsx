import type { Metadata, Viewport } from 'next';
import './theme.css';
import './globals.css';
import Reveal from '@/components/Reveal';
import AssistantWidget from '@/components/AssistantWidget';
import NativeInit from '@/components/NativeInit';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://painquotidien.app';
const INSTA = process.env.NEXT_PUBLIC_INSTAGRAM ?? 'lepainquotidien';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'Le Pain quotidien', template: '%s · Le Pain quotidien' },
  description: "La Parole chaque matin, une veillée chaque soir, un carnet de lecture biblique et un cursus théologique complet.",
  applicationName: 'Le Pain quotidien',
  openGraph: {
    type: 'website', locale: 'fr_FR', siteName: 'Le Pain quotidien',
    title: 'Le Pain quotidien', url: SITE
  },
  twitter: { card: 'summary_large_image' },
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Pain quotidien', statusBarStyle: 'default' },
  other: { 'instagram:creator': `@${INSTA}` }
};

export const viewport: Viewport = {
  viewportFit: 'cover', // les encoches / barre home (safe-area-inset) dans l'app native
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FBFBFC' },
    { media: '(prefers-color-scheme: dark)',  color: '#0E141A' }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-mode="matin" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){try{var m=localStorage.getItem('pq-mode');
          if(!m){var h=new Date().getHours();m=(h>=20||h<5)?'soir':'matin'}
          document.documentElement.dataset.mode=m}catch(e){}})();
        ` }} />
        {children}
        <AssistantWidget />
        <NativeInit />
        <Reveal />
      </body>
    </html>
  );
}
