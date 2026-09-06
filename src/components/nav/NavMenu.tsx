import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useEffect } from 'react'
import { navLinks } from '../../data/navLinks'
import { useNavStore } from '../../stores/navStore'
import { cinematicEase } from '../../styles/motion'

const linkListVariants = {
  open: {
    transition: { staggerChildren: 0.08, delayChildren: 0.42 },
  },
  closed: {
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
}

const linkItemVariants = {
  open: { opacity: 1, y: 0 },
  closed: { opacity: 0, y: 16 },
}

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
      <motion.button
        type="button"
        aria-expanded={isOpen}
        aria-controls="site-menu"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        onClick={toggle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.28, ease: cinematicEase }}
        className="fixed top-[max(1.25rem,env(safe-area-inset-top))] right-[max(1.25rem,env(safe-area-inset-right))] z-50 flex h-[1.5em] w-10 items-center justify-end overflow-visible text-[1.25rem] outline-none sm:top-6 sm:right-8 sm:w-12 sm:text-[2.25rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
      >
        <span className="relative block size-4.5 overflow-visible text-white sm:size-6">
          <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="absolute inset-0 size-full"
            animate={{ opacity: isOpen ? 0 : 1 }}
            transition={{ duration: 0.2, ease: cinematicEase }}
          >
            <path d="M2 7h20" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2 12h20" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2 17h20" stroke="currentColor" strokeWidth="1.5" />
          </motion.svg>
          <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="absolute inset-0 size-full"
            animate={{ opacity: isOpen ? 1 : 0 }}
            transition={{ duration: 0.2, ease: cinematicEase }}
          >
            <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.5" />
            <path d="M20 4L4 20" stroke="currentColor" strokeWidth="1.5" />
          </motion.svg>
        </span>
      </motion.button>

      <motion.div
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!isOpen}
        initial={false}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ duration: 0.55, ease: cinematicEase }}
        className={`fixed inset-0 z-30 bg-[#0a0a0a] ${
          isOpen ? '' : 'pointer-events-none'
        }`}
      >
        <nav
          className="flex h-full flex-col px-[max(1.25rem,env(safe-area-inset-left))] pt-[28dvh] pr-[max(1.25rem,env(safe-area-inset-right))] sm:px-8"
          aria-label="Primary"
        >
          <motion.ul
            className="flex flex-col gap-2.5 sm:gap-4"
            initial={false}
            animate={isOpen ? 'open' : 'closed'}
            variants={linkListVariants}
          >
            {navLinks.map((link) => (
              <motion.li
                key={link.href}
                variants={linkItemVariants}
                transition={{ duration: 0.45, ease: cinematicEase }}
              >
                {'live' in link && link.live ? (
                  <Link
                    to="/enquiries"
                    onClick={close}
                    className="text-[0.95rem] tracking-[0.16em] text-white uppercase sm:text-[1.75rem] sm:tracking-[0.2em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    className="pointer-events-none text-[0.95rem] tracking-[0.16em] text-white/50 uppercase line-through sm:text-[1.75rem] sm:tracking-[0.2em]"
                  >
                    {link.label}
                  </span>
                )}
              </motion.li>
            ))}
          </motion.ul>
        </nav>
      </motion.div>
    </>
  )
}
