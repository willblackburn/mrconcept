import { Link } from '@tanstack/react-router'

export function Logo() {
  return (
    <h1 className="m-0 text-[1.75rem] font-normal tracking-[0.22em] text-white/95 sm:text-[2.25rem]">
      <Link
        to="/"
        className="rounded-sm focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-white/70"
      >
        MRC
      </Link>
    </h1>
  )
}
