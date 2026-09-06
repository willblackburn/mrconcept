import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useState } from 'react'
import { contactEmail } from '../data/contact'
import { SITE_TITLE, SITE_URL } from '../data/site'
import { cinematicEase } from '../styles/motion'

const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.28 },
  },
}

const lineVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

export const Route = createFileRoute('/enquiries')({
  component: Enquiries,
  head: () => ({
    meta: [
      { title: `Enquiries - ${SITE_TITLE}` },
      {
        name: 'description',
        content: 'Enquiries for Mr Concept production and mixing.',
      },
    ],
    links: [{ rel: 'canonical', href: `${SITE_URL}/enquiries` }],
  }),
})

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-3.5 sm:size-5"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="5.25"
        y="5.25"
        width="8"
        height="8"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M10.75 5.25V2.75H2.75V10.75H5.25"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-3.5 sm:size-5"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 8.25 6.5 11.25 12.5 4.75"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  )
}

function Enquiries() {
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contactEmail)
    } catch {
      const input = document.createElement('textarea')
      input.value = contactEmail
      input.setAttribute('readonly', '')
      input.style.position = 'fixed'
      input.style.left = '-9999px'
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      input.remove()
    }

    setCopied(true)
    window.setTimeout(() => {
      setCopied(false)
    }, 1600)
  }

  return (
    <main className="pointer-events-none fixed inset-0 z-30 bg-[#0a0a0a]">
      <motion.div
        className="flex h-full flex-col px-[max(1.25rem,env(safe-area-inset-left))] pt-[28dvh] pr-[max(1.25rem,env(safe-area-inset-right))] sm:px-8"
        initial="hidden"
        animate="visible"
        variants={listVariants}
      >
        <motion.p
          className="text-[0.95rem] tracking-[0.16em] text-white/50 uppercase sm:text-[1.75rem] sm:tracking-[0.2em]"
          variants={lineVariants}
          transition={{ duration: 0.45, ease: cinematicEase }}
        >
          Enquiries
        </motion.p>
        <motion.div
          className="mt-4 flex items-center gap-3 sm:mt-6 sm:gap-4"
          variants={lineVariants}
          transition={{ duration: 0.45, ease: cinematicEase }}
        >
          <a
            href={`mailto:${contactEmail}`}
            className="pointer-events-auto text-[0.95rem] tracking-[0.16em] text-white uppercase sm:text-[1.75rem] sm:tracking-[0.2em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
          >
            {contactEmail}
          </a>
          <button
            type="button"
            onClick={copyEmail}
            aria-label={copied ? 'Email copied' : 'Copy email address'}
            className="pointer-events-auto text-white/70 outline-none transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
        </motion.div>
      </motion.div>
    </main>
  )
}
