import { useEffect, useRef, useState } from 'react'

const YOUTUBE_VIDEO_ID = 'NvZBcsF3UHw'
const YOUTUBE_API_SRC = 'https://www.youtube.com/iframe_api'
const PAGE_BACKGROUND = '#0a0a0a'
const CUT_GUTTER = 14

type CutHole = {
  x: number
  y: number
  width: number
  height: number
}

function subtractPlaque(
  hole: CutHole,
  plaque: CutHole,
  gutter: number,
): CutHole[] {
  const limitX = plaque.x - gutter
  const limitY = plaque.y - gutter
  const overlaps =
    hole.x < plaque.x + plaque.width &&
    hole.x + hole.width > limitX &&
    hole.y < plaque.y + plaque.height &&
    hole.y + hole.height > limitY

  if (!overlaps) {
    return [hole]
  }

  const remaining: CutHole[] = []

  if (hole.x < limitX) {
    const width = Math.min(hole.width, limitX - hole.x)
    if (width > 1) {
      remaining.push({ ...hole, width })
    }
  }

  if (hole.y < limitY) {
    const x = Math.max(hole.x, limitX)
    const width = hole.x + hole.width - x
    const height = Math.min(hole.height, limitY - hole.y)
    if (width > 1 && height > 1) {
      remaining.push({ x, y: hole.y, width, height })
    }
  }

  return remaining
}

function measureCutLayout(width: number, height: number, gutter: number): {
  videos: CutHole[]
  plaque: CutHole | null
} {
  if (width <= gutter * 4 || height <= gutter * 4) {
    return { videos: [], plaque: null }
  }

  const bottomHeight = height * 0.17
  const workHeight = height - bottomHeight - gutter
  const bottomY = workHeight + gutter

  const rightWidth = width * 0.24
  const rightX = width - rightWidth
  const rightTopHeight = workHeight * 0.61
  const leftWidth = rightX - gutter

  const topHeight = workHeight * 0.3
  const topLeftWidth = leftWidth * 0.6
  const topMidWidth = leftWidth - topLeftWidth - gutter

  const leftMidX = leftWidth * 0.34
  const midY = topHeight + gutter
  const midHeight = rightTopHeight - midY
  const midRightWidth = leftWidth - leftMidX - gutter
  const leftTallHeight = workHeight - midY

  const lowerY = rightTopHeight + gutter
  const lowerHeight = workHeight - lowerY
  const lowerLeftX = leftMidX + gutter
  const lowerLeftWidth = (width - lowerLeftX - gutter) * 0.52
  const lowerRightX = lowerLeftX + lowerLeftWidth + gutter
  const lowerRightWidth = width - lowerRightX

  const videos = [
    { x: 0, y: 0, width: topLeftWidth, height: topHeight },
    { x: topLeftWidth + gutter, y: 0, width: topMidWidth, height: topHeight },
    { x: rightX, y: 0, width: rightWidth, height: rightTopHeight },
    { x: 0, y: midY, width: leftMidX, height: leftTallHeight },
    { x: lowerLeftX, y: midY, width: midRightWidth, height: midHeight },
    { x: lowerLeftX, y: lowerY, width: lowerLeftWidth, height: lowerHeight },
    { x: lowerRightX, y: lowerY, width: lowerRightWidth, height: lowerHeight },
    { x: 0, y: bottomY, width, height: bottomHeight },
  ]

  const plaqueWidth = Math.min(...videos.map((hole) => hole.width))
  const plaqueHeight = Math.min(...videos.map((hole) => hole.height))
  const plaque = {
    x: width - plaqueWidth,
    y: height - plaqueHeight,
    width: plaqueWidth,
    height: plaqueHeight,
  }

  return {
    videos: videos.flatMap((hole) => subtractPlaque(hole, plaque, gutter)),
    plaque,
  }
}

type YouTubePlayer = {
  mute: () => void
  playVideo: () => void
  destroy: () => void
  unloadModule: (moduleName: string) => void
  setOption?: (module: string, option: string, value: unknown) => void
}

type YouTubePlayerEvent = {
  target: YouTubePlayer
  data: number
}

type YouTubeNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string
      host?: string
      playerVars?: Record<string, number | string>
      events?: {
        onReady?: (event: YouTubePlayerEvent) => void
        onStateChange?: (event: YouTubePlayerEvent) => void
      }
    },
  ) => YouTubePlayer
  PlayerState: {
    ENDED: number
    PAUSED: number
    PLAYING: number
  }
}

function getYouTubeNamespace(): YouTubeNamespace | undefined {
  return (window as Window & { YT?: YouTubeNamespace }).YT
}

function sizeYouTubeFrame(root: HTMLElement) {
  const iframe = root.querySelector('iframe')
  if (!iframe) {
    return
  }

  iframe.removeAttribute('width')
  iframe.removeAttribute('height')
  iframe.style.width = '100%'
  iframe.style.height = '100%'
}

function VideoCutGrid() {
  const maskId = 'mrc-video-cuts'
  const rootRef = useRef<SVGSVGElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const root = rootRef.current
    if (!root) {
      return
    }

    const update = () => {
      setSize({ width: root.clientWidth, height: root.clientHeight })
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(root)

    return () => {
      observer.disconnect()
    }
  }, [])

  const { videos, plaque } = measureCutLayout(size.width, size.height, CUT_GUTTER)

  return (
    <>
      <svg
        ref={rootRef}
        className="pointer-events-none absolute inset-0 z-20 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <mask id={maskId}>
            <rect width="100%" height="100%" fill="white" />
            {videos.map((hole) => (
              <rect
                key={`${hole.x}-${hole.y}-${hole.width}-${hole.height}`}
                x={hole.x}
                y={hole.y}
                width={Math.max(hole.width, 0)}
                height={Math.max(hole.height, 0)}
                fill="black"
              />
            ))}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={PAGE_BACKGROUND}
          mask={`url(#${maskId})`}
        />
      </svg>
      {plaque ? (
        <div
          className="pointer-events-none absolute z-30 flex flex-col items-end justify-end text-right"
          style={{
            left: plaque.x,
            top: plaque.y,
            width: Math.max(plaque.width, 0),
            height: Math.max(plaque.height, 0),
            padding: '0.5rem',
          }}
        >
          <p className="text-[0.95rem] tracking-[0.16em] text-white/85">Mr Concept</p>
          <p className="mt-1.5 text-[0.7rem] leading-snug tracking-[0.12em] text-white/50">
            artist / producer / mixing
          </p>
        </div>
      ) : null}
    </>
  )
}

function hideCaptions(player: YouTubePlayer) {
  try {
    player.unloadModule('captions')
    player.unloadModule('cc')
    player.setOption?.('captions', 'track', {})
    player.setOption?.('cc', 'track', {})
  } catch {
    // YouTube throws if the caption module is not available yet.
  }
}

function loadYouTubeApi(): Promise<YouTubeNamespace> {
  const existing = getYouTubeNamespace()
  if (existing?.Player) {
    return Promise.resolve(existing)
  }

  return new Promise((resolve) => {
    const previousReady = (window as Window & { onYouTubeIframeAPIReady?: () => void })
      .onYouTubeIframeAPIReady

    ;(window as Window & { onYouTubeIframeAPIReady?: () => void }).onYouTubeIframeAPIReady =
      () => {
        previousReady?.()
        const youtube = getYouTubeNamespace()
        if (youtube) {
          resolve(youtube)
        }
      }

    if (!document.querySelector(`script[src="${YOUTUBE_API_SRC}"]`)) {
      const script = document.createElement('script')
      script.src = YOUTUBE_API_SRC
      document.head.appendChild(script)
    }
  })
}

export function HeroBackground() {
  const playerMountRef = useRef<HTMLDivElement>(null)
  const [shouldPlayVideo, setShouldPlayVideo] = useState(false)

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      setShouldPlayVideo(!motionQuery.matches)
    }

    update()
    motionQuery.addEventListener('change', update)

    return () => {
      motionQuery.removeEventListener('change', update)
    }
  }, [])

  useEffect(() => {
    const mountParent = playerMountRef.current
    if (!shouldPlayVideo || !mountParent) {
      return
    }

    const host = document.createElement('div')
    host.className = 'h-full w-full'
    mountParent.appendChild(host)

    let player: YouTubePlayer | null = null
    let cancelled = false

    void loadYouTubeApi().then((youtube) => {
      if (cancelled || !host.isConnected) {
        return
      }

      player = new youtube.Player(host, {
        videoId: YOUTUBE_VIDEO_ID,
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          autoplay: 1,
          mute: 1,
          loop: 1,
          playlist: YOUTUBE_VIDEO_ID,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          iv_load_policy: 3,
          cc_load_policy: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            event.target.mute()
            event.target.playVideo()
            hideCaptions(event.target)
            sizeYouTubeFrame(mountParent)
            window.setTimeout(() => hideCaptions(event.target), 250)
            window.setTimeout(() => hideCaptions(event.target), 1000)
          },
          onStateChange: (event) => {
            hideCaptions(event.target)

            if (event.data === youtube.PlayerState.PLAYING) {
              hideCaptions(event.target)
            }

            if (
              event.data === youtube.PlayerState.PAUSED ||
              event.data === youtube.PlayerState.ENDED
            ) {
              event.target.mute()
              event.target.playVideo()
            }
          },
        },
      })
    })

    return () => {
      cancelled = true
      player?.destroy()
      host.remove()
    }
  }, [shouldPlayVideo])

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden bg-neutral-950">
      {shouldPlayVideo ? (
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 z-0 h-full w-full -translate-x-1/2 -translate-y-1/2 scale-[2.75] [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0"
          aria-hidden="true"
        >
          <div ref={playerMountRef} className="h-full w-full" />
        </div>
      ) : null}
      <div className="absolute inset-0 z-10 bg-black/25" aria-hidden="true" />
      <VideoCutGrid />
    </div>
  )
}
