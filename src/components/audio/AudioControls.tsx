import { AnimatePresence, motion } from 'motion/react'
import { useRef } from 'react'
import { tracks } from '../../data/tracks'
import { useAudioStore } from '../../stores/audioStore'
import {
  mediaToneFilterClassName,
  mediaToneOverlayClassName,
} from '../../styles/mediaTone'
import { cinematicEase } from '../../styles/motion'
import { ThumbnailWaveform } from './ThumbnailWaveform'

const thumbnailListVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.7 },
  },
}

const SWIPE_THRESHOLD_PX = 48

export function AudioControls() {
  const currentTrack = useAudioStore((state) => state.currentTrack)
  const currentTrackIndex = useAudioStore((state) => state.currentTrackIndex)
  const isPlaying = useAudioStore((state) => state.isPlaying)
  const pause = useAudioStore((state) => state.pause)
  const setTrack = useAudioStore((state) => state.setTrack)
  const nextTrack = useAudioStore((state) => state.nextTrack)
  const previousTrack = useAudioStore((state) => state.previousTrack)
  const swipeStart = useRef<{ x: number; y: number } | null>(null)
  const didSwipe = useRef(false)

  const selectTrack = (index: number) => {
    if (currentTrackIndex === index && isPlaying) {
      pause()
      return
    }

    setTrack(index)
  }

  return (
    <div className="relative z-40 flex shrink-0 justify-end px-[max(1.25rem,env(safe-area-inset-left))] pt-3 pr-[max(1.25rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8 sm:pt-4 sm:pb-6">
      <motion.div
        role="group"
        aria-label="Track playlist"
        className="flex touch-pan-y items-end gap-3 text-white"
        initial="hidden"
        animate="visible"
        variants={thumbnailListVariants}
        onTouchStart={(event) => {
          const touch = event.touches[0]
          if (!touch) return
          didSwipe.current = false
          swipeStart.current = { x: touch.clientX, y: touch.clientY }
        }}
        onClickCapture={(event) => {
          if (!didSwipe.current) return
          didSwipe.current = false
          event.preventDefault()
          event.stopPropagation()
        }}
        onTouchCancel={() => {
          swipeStart.current = null
        }}
        onTouchEnd={(event) => {
          const start = swipeStart.current
          const touch = event.changedTouches[0]
          swipeStart.current = null
          if (!start || !touch) return

          const deltaX = touch.clientX - start.x
          const deltaY = touch.clientY - start.y
          if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return
          if (Math.abs(deltaX) < Math.abs(deltaY)) return

          didSwipe.current = true

          if (deltaX < 0) {
            nextTrack()
            return
          }

          previousTrack()
        }}
      >
        {tracks.map((track, index) => {
          const isCurrent = currentTrack?.id === track.id
          const label =
            isCurrent && isPlaying
              ? `Pause ${track.title}`
              : `Play ${track.title}`

          return (
            <motion.button
              key={track.id}
              type="button"
              aria-label={label}
              aria-current={isCurrent ? 'true' : undefined}
              aria-pressed={isCurrent && isPlaying}
              onClick={() => {
                selectTrack(index)
              }}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: isCurrent ? 1 : 0.7, y: 0 },
              }}
              transition={{ duration: 0.5, ease: cinematicEase }}
              className="relative size-14 overflow-hidden bg-neutral-900 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-white/80 sm:size-16"
            >
              <img
                src={track.thumbnailSrc}
                alt=""
                className={`h-full w-full object-cover ${mediaToneFilterClassName}`}
                onError={(event) => {
                  event.currentTarget.style.visibility = 'hidden'
                }}
              />
              <span
                aria-hidden="true"
                className={`absolute inset-0 ${mediaToneOverlayClassName}`}
              />
              <AnimatePresence>
                {isCurrent && isPlaying ? (
                  <motion.div
                    key={track.id}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: cinematicEase }}
                  >
                    <ThumbnailWaveform trackId={track.id} />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}
