import { createFileRoute } from '@tanstack/react-router'
import { Logo } from '../components/branding/Logo'
import { HeroBackground } from '../components/landing/HeroBackground'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <main className="flex min-h-0 flex-1 flex-col px-[max(1.25rem,env(safe-area-inset-left))] pt-[max(1.25rem,env(safe-area-inset-top))] pr-[max(1.25rem,env(safe-area-inset-right))] sm:px-8 sm:pt-6">
      <div className="shrink-0 pb-3 sm:pb-4">
        <Logo />
      </div>
      <HeroBackground />
    </main>
  )
}
