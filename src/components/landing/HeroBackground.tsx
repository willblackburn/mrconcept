import { useEffect, useRef, useState } from 'react'

const YOUTUBE_VIDEO_ID = 'NvZBcsF3UHw'
const YOUTUBE_API_SRC = 'https://www.youtube.com/iframe_api'

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
    <div className="absolute inset-0 overflow-hidden bg-neutral-950" aria-hidden="true">
      {shouldPlayVideo ? (
        <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 aspect-video w-[max(250vw,400dvh)] -translate-x-1/2 -translate-y-1/2 [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0">
          <div ref={playerMountRef} className="h-full w-full" />
        </div>
      ) : null}
      <div className="absolute inset-0 z-10 bg-black/40" />
    </div>
  )
}
