import { useEffect, useMemo, useRef } from 'react'
import { getPlayer } from './player'

const BAR_COUNT = 22

function waveformHeights(seed: string) {
  let value = 2166136261
  for (const character of seed) {
    value ^= character.charCodeAt(0)
    value = Math.imul(value, 16777619)
  }

  return Array.from({ length: BAR_COUNT }, () => {
    value = Math.imul(value ^ (value >>> 13), 1274126177)
    const unit = ((value >>> 0) % 1000) / 1000
    return 0.26 + unit * 0.74
  })
}

function progressFromPlayer(trackId: string) {
  const player = getPlayer()
  if (!player || player.dataset.trackId !== trackId) {
    return 0
  }

  const duration = player.duration
  if (!Number.isFinite(duration) || duration <= 0) {
    return 0
  }

  return Math.min(1, Math.max(0, player.currentTime / duration))
}

export function ThumbnailWaveform({ trackId }: { trackId: string }) {
  const fillRef = useRef<HTMLDivElement>(null)
  const heights = useMemo(() => waveformHeights(trackId), [trackId])

  useEffect(() => {
    const fill = fillRef.current
    if (fill) {
      fill.style.clipPath = `inset(${(1 - progressFromPlayer(trackId)) * 100}% 0 0 0)`
    }

    let frame = 0
    const tick = () => {
      const nextFill = fillRef.current
      if (nextFill) {
        nextFill.style.clipPath = `inset(${(1 - progressFromPlayer(trackId)) * 100}% 0 0 0)`
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
    }
  }, [trackId])

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <WaveformBars className="opacity-20" heights={heights} />
      <div ref={fillRef} className="absolute inset-0">
        <WaveformBars className="opacity-45" heights={heights} />
      </div>
    </div>
  )
}

function WaveformBars({
  className,
  heights,
}: {
  className: string
  heights: number[]
}) {
  return (
    <svg
      className={`absolute inset-0 h-full w-full ${className}`}
      viewBox={`0 0 ${BAR_COUNT} 100`}
      preserveAspectRatio="none"
    >
      {heights.map((height, index) => {
        const barHeight = height * 100
        return (
          <rect
            key={index}
            x={index + 0.12}
            y={100 - barHeight}
            width="0.76"
            height={barHeight}
            fill="white"
          />
        )
      })}
    </svg>
  )
}
