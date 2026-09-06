import { useRouterState } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useAudioStore } from '../../stores/audioStore';
import {
  mediaToneFilterClassName,
  mediaToneOverlayClassName,
} from '../../styles/mediaTone';
import { cinematicEase } from '../../styles/motion';

const plaqueListVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.45 },
  },
};

const plaqueLineVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

const YOUTUBE_VIDEO_ID = 'B1l4Mxz5D0Y';
const YOUTUBE_API_SRC = 'https://www.youtube.com/iframe_api';
const PAGE_BACKGROUND = '#0a0a0a';
const CUT_GUTTER = 14;

type CutHole = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function subtractPlaque(
  hole: CutHole,
  plaque: CutHole,
  gutter: number,
): CutHole[] {
  const limitX = plaque.x - gutter;
  const limitY = plaque.y - gutter;
  const overlaps =
    hole.x < plaque.x + plaque.width &&
    hole.x + hole.width > limitX &&
    hole.y < plaque.y + plaque.height &&
    hole.y + hole.height > limitY;

  if (!overlaps) {
    return [hole];
  }

  const remaining: CutHole[] = [];

  if (hole.x < limitX) {
    const width = Math.min(hole.width, limitX - hole.x);
    if (width > 1) {
      remaining.push({ ...hole, width });
    }
  }

  if (hole.y < limitY) {
    const x = Math.max(hole.x, limitX);
    const width = hole.x + hole.width - x;
    const height = Math.min(hole.height, limitY - hole.y);
    if (width > 1 && height > 1) {
      remaining.push({ x, y: hole.y, width, height });
    }
  }

  return remaining;
}

function measureCutLayout(
  width: number,
  height: number,
  gutter: number,
): {
  videos: CutHole[];
  plaque: CutHole | null;
} {
  if (width <= gutter * 4 || height <= gutter * 4) {
    return { videos: [], plaque: null };
  }

  const bottomHeight = height * 0.17;
  const workHeight = height - bottomHeight - gutter;
  const bottomY = workHeight + gutter;

  const rightWidth = width * 0.24;
  const rightX = width - rightWidth;
  const rightTopHeight = workHeight * 0.61;
  const leftWidth = rightX - gutter;

  const topHeight = workHeight * 0.3;
  const topLeftWidth = leftWidth * 0.6;
  const topMidWidth = leftWidth - topLeftWidth - gutter;

  const leftMidX = leftWidth * 0.34;
  const midY = topHeight + gutter;
  const midHeight = rightTopHeight - midY;
  const midRightWidth = leftWidth - leftMidX - gutter;
  const leftTallHeight = workHeight - midY;

  const lowerY = rightTopHeight + gutter;
  const lowerHeight = workHeight - lowerY;
  const lowerLeftX = leftMidX + gutter;
  const lowerLeftWidth = (width - lowerLeftX - gutter) * 0.52;
  const lowerRightX = lowerLeftX + lowerLeftWidth + gutter;
  const lowerRightWidth = width - lowerRightX;

  const videos = [
    { x: 0, y: 0, width: topLeftWidth, height: topHeight },
    { x: topLeftWidth + gutter, y: 0, width: topMidWidth, height: topHeight },
    { x: rightX, y: 0, width: rightWidth, height: rightTopHeight },
    { x: 0, y: midY, width: leftMidX, height: leftTallHeight },
    { x: lowerLeftX, y: midY, width: midRightWidth, height: midHeight },
    { x: lowerLeftX, y: lowerY, width: lowerLeftWidth, height: lowerHeight },
    { x: lowerRightX, y: lowerY, width: lowerRightWidth, height: lowerHeight },
    { x: 0, y: bottomY, width, height: bottomHeight },
  ];

  const smallestWidth = Math.min(...videos.map((hole) => hole.width));
  const smallestHeight = Math.min(...videos.map((hole) => hole.height));
  const plaqueWidth =
    width < 640
      ? Math.max(smallestWidth, Math.min(width * 0.52, 240))
      : smallestWidth;
  const plaqueHeight = smallestHeight;
  const plaque = {
    x: width - plaqueWidth,
    y: height - plaqueHeight,
    width: plaqueWidth,
    height: plaqueHeight,
  };

  return {
    videos: videos.flatMap((hole) => subtractPlaque(hole, plaque, gutter)),
    plaque,
  };
}

type YouTubePlayer = {
  mute: () => void;
  playVideo: () => void;
  loadVideoById: (videoId: string) => void;
  setPlaybackRate: (suggestedRate: number) => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  destroy: () => void;
  unloadModule: (moduleName: string) => void;
  setOption?: (module: string, option: string, value: unknown) => void;
};

type YouTubePlayerEvent = {
  target: YouTubePlayer;
  data: number;
};

type YouTubeNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      host?: string;
      playerVars?: Record<string, number | string>;
      events?: {
        onReady?: (event: YouTubePlayerEvent) => void;
        onStateChange?: (event: YouTubePlayerEvent) => void;
      };
    },
  ) => YouTubePlayer;
  PlayerState: {
    ENDED: number;
    PAUSED: number;
    PLAYING: number;
  };
};

function getYouTubeNamespace(): YouTubeNamespace | undefined {
  return (window as Window & { YT?: YouTubeNamespace }).YT;
}

function sizeYouTubeFrame(root: HTMLElement) {
  const iframe = root.querySelector('iframe');
  if (!iframe) {
    return;
  }

  iframe.removeAttribute('width');
  iframe.removeAttribute('height');
  iframe.style.width = '100%';
  iframe.style.height = '100%';
}

function containSize(width: number, height: number, aspect: number) {
  if (width / height > aspect) {
    return { width: height * aspect, height };
  }

  return { width, height: width / aspect };
}

function heroCoverScale(
  width: number,
  height: number,
  mediaAspect: number,
  pictureAspect: number,
  extra: number,
) {
  if (
    width <= 0 ||
    height <= 0 ||
    mediaAspect <= 0 ||
    pictureAspect <= 0
  ) {
    return 2.75;
  }

  const media = containSize(width, height, mediaAspect);
  const picture = containSize(media.width, media.height, pictureAspect);
  return Math.max(width / picture.width, height / picture.height) * extra;
}

function VideoCutGrid({ hideMask }: { hideMask: boolean }) {
  const maskId = 'mrc-video-cuts';
  const rootRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0, left: 0, top: 0 });
  const currentTrackTitle = useAudioStore(
    (state) => state.currentTrack?.title ?? '',
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const update = () => {
      const box = root.getBoundingClientRect();
      setSize({
        width: root.clientWidth,
        height: root.clientHeight,
        left: box.left,
        top: box.top,
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(root);

    return () => {
      observer.disconnect();
    };
  }, []);

  const { videos, plaque } = measureCutLayout(
    size.width,
    size.height,
    CUT_GUTTER,
  );

  return (
    <>
      <svg
        ref={rootRef}
        className='pointer-events-none absolute inset-0 z-20 h-full w-full'
        aria-hidden='true'>
        {hideMask ? null : (
          <>
            <defs>
              <mask id={maskId}>
                <rect width='100%' height='100%' fill='white' />
                {videos.map((hole) => (
                  <rect
                    key={`${hole.x}-${hole.y}-${hole.width}-${hole.height}`}
                    x={hole.x}
                    y={hole.y}
                    width={Math.max(hole.width, 0)}
                    height={Math.max(hole.height, 0)}
                    fill='black'
                  />
                ))}
              </mask>
            </defs>
            <rect
              width='100%'
              height='100%'
              fill={PAGE_BACKGROUND}
              mask={`url(#${maskId})`}
            />
          </>
        )}
      </svg>
      {plaque ? (
        <motion.div
          className='pointer-events-none fixed z-40 flex flex-col items-end justify-end pt-[clamp(0.4rem,0.45vw,1.25rem)] pr-0 pb-0 pl-[clamp(0.4rem,0.45vw,1.25rem)] text-right'
          style={{
            left: size.left + plaque.x,
            top: size.top + plaque.y,
            width: Math.max(plaque.width, 0),
            height: Math.max(plaque.height, 0),
          }}
          initial='hidden'
          animate='visible'
          variants={plaqueListVariants}>
          <motion.p
            className='text-[clamp(0.75rem,0.55vw+0.5rem,1.85rem)] tracking-[0.16em] text-white/85'
            variants={plaqueLineVariants}
            transition={{ duration: 0.6, ease: cinematicEase }}>
            MR CONCEPT
          </motion.p>
          <motion.p
            className='mt-[clamp(0.25rem,0.18vw,0.5rem)] text-[clamp(0.55rem,0.36vw+0.4rem,1.1rem)] leading-snug tracking-[0.08em] text-white/50 uppercase sm:tracking-widest'
            variants={plaqueLineVariants}
            transition={{ duration: 0.6, ease: cinematicEase }}>
            producer | mixing engineer
          </motion.p>
          <motion.div
            className='mt-[clamp(0.4rem,0.2vw,0.65rem)]'
            variants={plaqueLineVariants}
            transition={{ duration: 0.6, ease: cinematicEase }}>
            <AnimatePresence mode='wait'>
              <motion.p
                key={currentTrackTitle || 'track'}
                className='text-[clamp(0.55rem,0.34vw+0.4rem,1.05rem)] tracking-[0.12em] text-brand uppercase'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: cinematicEase }}>
                {currentTrackTitle}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      ) : null}
    </>
  );
}

function hideCaptions(player: YouTubePlayer) {
  try {
    player.unloadModule('captions');
    player.unloadModule('cc');
    player.setOption?.('captions', 'track', {});
    player.setOption?.('cc', 'track', {});
  } catch {
    // YouTube throws if the caption module is not available yet.
  }
}

function loadYouTubeApi(): Promise<YouTubeNamespace> {
  const existing = getYouTubeNamespace();
  if (existing?.Player) {
    return Promise.resolve(existing);
  }

  return new Promise((resolve) => {
    const previousReady = (
      window as Window & { onYouTubeIframeAPIReady?: () => void }
    ).onYouTubeIframeAPIReady;

    (
      window as Window & { onYouTubeIframeAPIReady?: () => void }
    ).onYouTubeIframeAPIReady = () => {
      previousReady?.();
      const youtube = getYouTubeNamespace();
      if (youtube) {
        resolve(youtube);
      }
    };

    if (!document.querySelector(`script[src="${YOUTUBE_API_SRC}"]`)) {
      const script = document.createElement('script');
      script.src = YOUTUBE_API_SRC;
      document.head.appendChild(script);
    }
  });
}

function applyHeroVideo(
  player: YouTubePlayer,
  videoId: string,
  playbackRate: number,
  frameRoot?: HTMLElement | null,
) {
  player.mute();
  player.loadVideoById(videoId);
  applyPlaybackRate(player, playbackRate);
  hideCaptions(player);
  if (frameRoot) {
    sizeYouTubeFrame(frameRoot);
    window.requestAnimationFrame(() => sizeYouTubeFrame(frameRoot));
  }
}

function applyPlaybackRate(player: YouTubePlayer, playbackRate: number) {
  try {
    player.setPlaybackRate(playbackRate);
  } catch {
    // YouTube rejects rates the current video does not support.
  }
}

export function HeroBackground() {
  const panelRef = useRef<HTMLDivElement>(null);
  const playerMountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const videoIdRef = useRef(YOUTUBE_VIDEO_ID);
  const playbackRateRef = useRef(1);
  const isEnquiries = useRouterState({
    select: (state) => state.location.pathname === '/enquiries',
  });
  const [shouldPlayVideo, setShouldPlayVideo] = useState(false);
  const [coverScale, setCoverScale] = useState(2.75);
  const [fileAspect, setFileAspect] = useState(16 / 9);
  const panelSizeRef = useRef({ width: 0, height: 0 });
  const videoPlayingRef = useRef(false);
  const didSeekStartRef = useRef(false);
  const heroVideoSrc = useAudioStore(
    (state) => state.currentTrack?.heroVideoSrc,
  );
  const heroStartTime =
    useAudioStore((state) => state.currentTrack?.heroStartTime) ?? 0;
  const videoId =
    useAudioStore((state) => state.currentTrack?.youtubeId) ??
    YOUTUBE_VIDEO_ID;
  const playbackRate =
    useAudioStore((state) => state.currentTrack?.youtubePlaybackRate) ?? 1;
  const currentTrack = useAudioStore((state) => state.currentTrack);
  const pictureAspect =
    currentTrack?.heroAspect ?? currentTrack?.youtubeAspect ?? 16 / 9;
  const coverExtra =
    currentTrack?.heroCoverExtra ?? currentTrack?.youtubeCoverExtra ?? 1.2;
  const mediaAspect = heroVideoSrc ? fileAspect : 16 / 9;

  videoIdRef.current = videoId;
  playbackRateRef.current = playbackRate;

  useEffect(() => {
    setFileAspect(16 / 9);
    videoPlayingRef.current = false;
    didSeekStartRef.current = false;
  }, [heroVideoSrc]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) {
      return;
    }

    const update = (force = false) => {
      const width = panel.clientWidth;
      const height = panel.clientHeight;
      const previous = panelSizeRef.current;
      const widthChanged = Math.abs(width - previous.width) >= 32;

      if (
        !force &&
        videoPlayingRef.current &&
        !widthChanged
      ) {
        return;
      }

      panelSizeRef.current = { width, height };
      setCoverScale(
        heroCoverScale(width, height, mediaAspect, pictureAspect, coverExtra),
      );
    };

    update(true);
    const observer = new ResizeObserver(() => update(false));
    observer.observe(panel);

    return () => {
      observer.disconnect();
    };
  }, [coverExtra, mediaAspect, pictureAspect]);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setShouldPlayVideo(!motionQuery.matches);
    };

    update();
    motionQuery.addEventListener('change', update);

    return () => {
      motionQuery.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    const mountParent = playerMountRef.current;
    if (!shouldPlayVideo || heroVideoSrc || !mountParent) {
      return;
    }

    const host = document.createElement('div');
    host.className = 'h-full w-full';
    mountParent.appendChild(host);

    let player: YouTubePlayer | null = null;
    let cancelled = false;

    void loadYouTubeApi().then((youtube) => {
      if (cancelled || !host.isConnected) {
        return;
      }

      player = new youtube.Player(host, {
        videoId: videoIdRef.current,
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          autoplay: 1,
          mute: 1,
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
            playerRef.current = event.target;
            applyHeroVideo(
              event.target,
              videoIdRef.current,
              playbackRateRef.current,
              mountParent,
            );
            sizeYouTubeFrame(mountParent);
            window.setTimeout(() => hideCaptions(event.target), 250);
            window.setTimeout(() => hideCaptions(event.target), 1000);
          },
          onStateChange: (event) => {
            hideCaptions(event.target);

            if (event.data === youtube.PlayerState.PLAYING) {
              videoPlayingRef.current = true;
              hideCaptions(event.target);
              applyPlaybackRate(event.target, playbackRateRef.current);
              sizeYouTubeFrame(mountParent);
            }

            if (event.data === youtube.PlayerState.PAUSED) {
              event.target.mute();
              event.target.playVideo();
            }

            if (event.data === youtube.PlayerState.ENDED) {
              event.target.seekTo(0, true);
              event.target.mute();
              event.target.playVideo();
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current = null;
      player?.destroy();
      host.remove();
    };
  }, [heroVideoSrc, shouldPlayVideo]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || heroVideoSrc) {
      return;
    }

    applyHeroVideo(player, videoId, playbackRate, playerMountRef.current);
  }, [heroVideoSrc, playbackRate, videoId]);

  return (
    <div
      ref={panelRef}
      className='relative min-h-0 flex-1 overflow-hidden bg-neutral-950'>
      <motion.div
        className='absolute inset-0'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: cinematicEase }}>
        {!isEnquiries && shouldPlayVideo && heroVideoSrc ? (
          <div
            className={`pointer-events-none absolute top-1/2 left-1/2 z-0 h-full w-full ${mediaToneFilterClassName}`}
            style={{ transform: `translate(-50%, -50%) scale(${coverScale})` }}
            aria-hidden='true'>
            <video
              key={`${heroVideoSrc}-${heroStartTime}`}
              className='h-full w-full object-contain'
              src={heroVideoSrc}
              muted
              autoPlay
              loop={heroStartTime <= 0}
              playsInline
              preload='auto'
              onLoadedMetadata={(event) => {
                const video = event.currentTarget;
                if (video.videoWidth > 0 && video.videoHeight > 0) {
                  const nextAspect = video.videoWidth / video.videoHeight;
                  setFileAspect((current) =>
                    Math.abs(current - nextAspect) < 0.01 ? current : nextAspect,
                  );
                }
                video.playbackRate = playbackRate;
                if (heroStartTime > 0 && !didSeekStartRef.current) {
                  didSeekStartRef.current = true;
                  video.currentTime = heroStartTime;
                }
              }}
              onPlaying={() => {
                videoPlayingRef.current = true;
              }}
              onEnded={(event) => {
                if (heroStartTime <= 0) {
                  return;
                }

                const video = event.currentTarget;
                video.currentTime = heroStartTime;
                void video.play();
              }}
            />
          </div>
        ) : !isEnquiries && shouldPlayVideo ? (
          <div
            className={`pointer-events-none absolute top-1/2 left-1/2 z-0 h-full w-full [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0 ${mediaToneFilterClassName}`}
            style={{ transform: `translate(-50%, -50%) scale(${coverScale})` }}
            aria-hidden='true'>
            <div ref={playerMountRef} className='h-full w-full' />
          </div>
        ) : null}
        {isEnquiries ? null : (
          <div
            className={`absolute inset-0 z-10 ${mediaToneOverlayClassName}`}
            aria-hidden='true'
          />
        )}
      </motion.div>
      <VideoCutGrid hideMask={isEnquiries} />
    </div>
  );
}
