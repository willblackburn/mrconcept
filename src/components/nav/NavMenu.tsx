import { useEffect } from 'react'
import { navLinks } from '../../data/navLinks'
import { useNavStore } from '../../stores/navStore'

export function NavMenu() {
  const isOpen = useNavStore((state) => state.isOpen)
  const toggle = useNavStore((state) => state.toggle)
  const close = useNavStore((state) => state.close)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [close, isOpen])

  return (
    <>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="site-menu"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        onClick={toggle}
        className="fixed top-[max(1.25rem,env(safe-area-inset-top))] right-[max(1.25rem,env(safe-area-inset-right))] z-50 flex size-10 flex-col items-center justify-center gap-1.5 sm:top-6 sm:right-8"
      >
        <span
          className={`h-px w-5 bg-white transition-transform duration-300 ${
            isOpen ? 'translate-y-[3.5px] rotate-45' : ''
          }`}
        />
        <span
          className={`h-px w-5 bg-white transition-opacity duration-200 ${
            isOpen ? 'opacity-0' : 'opacity-100'
          }`}
        />
        <span
          className={`h-px w-5 bg-white transition-transform duration-300 ${
            isOpen ? 'translate-y-[-3.5px] -rotate-45' : ''
          }`}
        />
      </button>

      <div
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-20 bg-[#0a0a0a] transition-transform duration-500 ease-out ${
          isOpen ? 'translate-x-0' : 'pointer-events-none -translate-x-full'
        }`}
      >
        <nav
          className="flex h-full flex-col px-[max(1.25rem,env(safe-area-inset-left))] pt-[28dvh] pr-[max(1.25rem,env(safe-area-inset-right))] sm:px-8"
          aria-label="Primary"
        >
          <ul className="flex flex-col gap-3 sm:gap-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <span
                  aria-disabled="true"
                  className="pointer-events-none text-[1.35rem] tracking-[0.2em] text-white/50 uppercase line-through sm:text-[1.75rem]"
                >
                  {link.label}
                </span>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  )
}
