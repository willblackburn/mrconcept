/// <reference types="vite/client" />

import {
  HeadContent,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { AudioControls } from '../components/audio/AudioControls'
import { AudioEngine } from '../components/audio/AudioEngine'
import appCss from '../styles/app.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, viewport-fit=cover',
      },
      { title: 'MRC' },
      {
        name: 'description',
        content: 'Mr Concept — artist, producer and mixing engineer.',
      },
      { name: 'theme-color', content: '#0a0a0a' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="h-dvh overflow-hidden bg-neutral-950 text-neutral-50 antialiased">
        <div className="flex h-dvh flex-col">
          {children}
          <AudioEngine />
          <AudioControls />
        </div>
        <Scripts />
      </body>
    </html>
  )
}
