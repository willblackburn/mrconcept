import { useAudioStore } from '../../stores/audioStore'

function PreviousIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M6 6h2.25v12H6V6Zm3.75 6L18 18.75V5.25L9.75 12Z" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 5.25v13.5L19.5 12 8 5.25Z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M6.75 5.25h3.5v13.5h-3.5V5.25Zm7 0h3.5v13.5h-3.5V5.25Z" />
    </svg>
  )
}

function NextIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M15.75 6H18v12h-2.25V6ZM6 18.75 14.25 12 6 5.25v13.5Z" />
    </svg>
  )
}

const controlButtonClassName =
  'inline-flex size-11 items-center justify-center text-white/90 transition-opacity duration-200 hover:text-white hover:opacity-100 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-white/80'

export function AudioControls() {
  const currentTrack = useAudioStore((state) => state.currentTrack)
  const isPlaying = useAudioStore((state) => state.isPlaying)
  const previousTrack = useAudioStore((state) => state.previousTrack)
  const togglePlayback = useAudioStore((state) => state.togglePlayback)
  const nextTrack = useAudioStore((state) => state.nextTrack)

  return (
    <div className="flex shrink-0 justify-end px-[max(1.25rem,env(safe-area-inset-left))] pt-3 pr-[max(1.25rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8 sm:pt-4 sm:pb-6">
      <div
        role="group"
        aria-label="Playback controls"
        className="flex items-center text-white"
      >
        <p className="sr-only" aria-live="polite">
          {currentTrack
            ? `${currentTrack.title} by ${currentTrack.artist}`
            : 'No track selected'}
        </p>
        <p
          aria-hidden="true"
          className="mr-3 max-w-[10rem] truncate text-[0.7rem] tracking-[0.16em] text-white/70 sm:max-w-[14rem]"
        >
          {currentTrack?.title ?? ''}
        </p>

        <button
          type="button"
          className={controlButtonClassName}
          aria-label="Previous track"
          onClick={previousTrack}
        >
          <PreviousIcon />
        </button>

        <button
          type="button"
          className={controlButtonClassName}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          onClick={togglePlayback}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        <button
          type="button"
          className={controlButtonClassName}
          aria-label="Next track"
          onClick={nextTrack}
        >
          <NextIcon />
        </button>
      </div>
    </div>
  )
}
