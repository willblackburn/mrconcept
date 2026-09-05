/// <reference types="vite/client" />

import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router';
import { MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';
import { AudioControls } from '../components/audio/AudioControls';
import { AudioEngine } from '../components/audio/AudioEngine';
import { NavMenu } from '../components/nav/NavMenu';
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from '../data/site';
import appCss from '../styles/app.css?url';
import { cinematicEase } from '../styles/motion';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, viewport-fit=cover',
      },
      { title: SITE_TITLE },
      { name: 'description', content: SITE_DESCRIPTION },
      { name: 'author', content: SITE_NAME },
      { name: 'robots', content: 'index, follow' },
      { name: 'theme-color', content: '#0a0a0a' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:title', content: SITE_TITLE },
      { property: 'og:description', content: SITE_DESCRIPTION },
      { property: 'og:url', content: `${SITE_URL}/` },
      { property: 'og:locale', content: 'en' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: SITE_TITLE },
      { name: 'twitter:description', content: SITE_DESCRIPTION },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: SITE_NAME,
          alternateName: 'MRC',
          jobTitle: 'Music Producer and Mixing Engineer',
          url: `${SITE_URL}/`,
          description: SITE_DESCRIPTION,
        },
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'canonical', href: `${SITE_URL}/` },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang='en'>
      <head>
        <HeadContent />
      </head>
      <body className='h-dvh overflow-hidden bg-neutral-950 text-neutral-50 antialiased'>
        <MotionConfig reducedMotion='user' transition={{ ease: cinematicEase }}>
          <div className='flex h-dvh flex-col'>
            {children}
            <AudioEngine />
            <AudioControls />
            <NavMenu />
          </div>
        </MotionConfig>
        <Scripts />
      </body>
    </html>
  );
}
