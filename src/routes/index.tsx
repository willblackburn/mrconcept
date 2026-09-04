import { createFileRoute } from '@tanstack/react-router'
import { Logo } from '../components/branding/Logo'
import { HeroBackground } from '../components/landing/HeroBackground'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <main className="flex min-h-0 flex-1 flex-col px-[max(1.25rem,env(safe-area-inset-left))] pt-[max(1.25rem,env(safe-area-inset-top))] pr-[max(1.25rem,env(safe-area-inset-right))] sm:px-8 sm:pt-6">
      <div className="invisible shrink-0 pb-3 sm:pb-4" aria-hidden="true">
        <p className="m-0 text-[1.75rem] tracking-[0.22em] sm:text-[2.25rem]">
          MRC
        </p>
      </div>
      <div className="fixed top-[max(1.25rem,env(safe-area-inset-top))] left-[max(1.25rem,env(safe-area-inset-left))] z-40 sm:top-6 sm:left-8">
        <Logo />
      </div>
      <HeroBackground />
    </main>
  )
}
