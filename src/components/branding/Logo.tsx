import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { cinematicEase } from '../../styles/motion'

export function Logo() {
  return (
    <motion.h1
      className="m-0 text-[1.25rem] font-normal tracking-[0.2em] text-white/95 sm:text-[2.25rem] sm:tracking-[0.22em]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9, ease: cinematicEase }}
    >
      <Link
        to="/"
        className="rounded-sm focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-white/70"
      >
        MRC
      </Link>
    </motion.h1>
  )
}
