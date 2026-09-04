import { useEffect, useRef } from 'react'
import { useAudioStore } from '../../stores/audioStore'

const TRACK_FADE_MS = 280

let audioElement: HTMLAudioElement | null = null
let loadedTrackId: string | null = null
let ignoreNextError = false

function getAudioElement(): HTMLAudioElement {
  if (!audioElement) {
    audioElement = new Audio()
    audioElement.preload = 'auto'
  }

  return audioElement
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function fadeVolume(
  audio: HTMLAudioElement,
  from: number,
  to: number,
  duration: number,
  isCancelled: () => boolean,
): Promise<void> {
  if (duration <= 0 || from === to) {
    audio.volume = to
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    const startedAt = performance.now()

    const step = (now: number) => {
      if (isCancelled()) {
        resolve()
        return
      }

      const progress = Math.min(1, (now - startedAt) / duration)
      audio.volume = from + (to - from) * progress

      if (progress < 1) {
        requestAnimationFrame(step)
        return
      }

      audio.volume = to
      resolve()
    }

    requestAnimationFrame(step)
  })
}

function waitForCanPlay(
  audio: HTMLAudioElement,
  isCancelled: () => boolean,
): Promise<void> {
  if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const finish = () => {
      audio.removeEventListener('canplay', onCanPlay)
      audio.removeEventListener('error', onError)
    }

    const onCanPlay = () => {
      finish()
      resolve()
    }

    const onError = () => {
      finish()
      reject(new Error('Unable to load audio'))
    }

    audio.addEventListener('canplay', onCanPlay)
    audio.addEventListener('error', onError)

    const pollCancelled = () => {
      if (isCancelled()) {
        finish()
        resolve()
        return
      }

      requestAnimationFrame(pollCancelled)
    }

    requestAnimationFrame(pollCancelled)
  })
}

export function AudioEngine() {
  const currentTrack = useAudioStore((state) => state.currentTrack)
  const isPlaying = useAudioStore((state) => state.isPlaying)
  const volume = useAudioStore((state) => state.volume)
  const generationRef = useRef(0)

  useEffect(() => {
    const audio = getAudioElement()

    const onTimeUpdate = () => {
      useAudioStore.getState().setCurrentTime(audio.currentTime)
    }

    const onDurationChange = () => {
      const nextDuration = Number.isFinite(audio.duration) ? audio.duration : 0
      useAudioStore.getState().setDuration(nextDuration)
    }

    const onEnded = () => {
      useAudioStore.getState().nextTrack()
    }

    const onError = () => {
      if (ignoreNextError) {
        ignoreNextError = false
        return
      }

      if (audio.error?.code === MediaError.MEDIA_ERR_ABORTED) {
        return
      }

      useAudioStore.getState().pause()
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
    }
  }, [])

  useEffect(() => {
    const audio = getAudioElement()
    const generation = generationRef.current + 1
    generationRef.current = generation
    const isCancelled = () => generation !== generationRef.current

    const syncPlayback = async () => {
      if (!currentTrack) {
        loadedTrackId = null
        audio.pause()
        audio.removeAttribute('src')
        audio.load()
        return
      }

      const isNewTrack = loadedTrackId !== currentTrack.id
      const fadeMs = prefersReducedMotion() ? 0 : TRACK_FADE_MS

      if (isNewTrack) {
        const shouldFadeOut =
          fadeMs > 0 &&
          isPlaying &&
          loadedTrackId !== null &&
          !audio.paused &&
          audio.volume > 0

        if (shouldFadeOut) {
          await fadeVolume(audio, audio.volume, 0, fadeMs, isCancelled)
          if (isCancelled()) return
        }

        ignoreNextError = true
        audio.pause()
        audio.src = currentTrack.audioSrc
        audio.load()
        loadedTrackId = currentTrack.id
        audio.volume = 0

        try {
          await waitForCanPlay(audio, isCancelled)
        } catch {
          if (!isCancelled()) {
            useAudioStore.getState().pause()
          }
          return
        }

        if (isCancelled()) return
      }

      if (!isPlaying) {
        audio.pause()
        audio.volume = volume
        return
      }

      try {
        await audio.play()
      } catch {
        if (!isCancelled()) {
          useAudioStore.getState().pause()
        }
        return
      }

      if (isCancelled()) return

      if (isNewTrack) {
        await fadeVolume(audio, 0, volume, fadeMs, isCancelled)
        return
      }

      audio.volume = volume
    }

    void syncPlayback()
  }, [currentTrack, isPlaying, volume])

  return null
}
