import { createFileRoute } from '@tanstack/react-router'
import { Logo } from '../components/branding/Logo'
import { HeroBackground } from '../components/landing/HeroBackground'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <HeroBackground />
      <div className="relative z-20 px-[max(1.5rem,env(safe-area-inset-left))] pt-[max(2rem,env(safe-area-inset-top))] sm:px-[max(2.25rem,env(safe-area-inset-left))] sm:pt-[max(2.5rem,env(safe-area-inset-top))]">
        <Logo />
      </div>
    </main>
  )
}
