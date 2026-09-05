import { useEffect } from 'react'
import { AUDIO_ELEMENT_ID } from './player'
import { useAudioStore } from '../../stores/audioStore'

export function AudioEngine() {
  useEffect(() => {
    for (const stray of document.querySelectorAll('audio[data-playback-engine]')) {
      if (stray instanceof HTMLAudioElement) {
        stray.pause()
        stray.remove()
      }
    }

    const player = document.getElementById(AUDIO_ELEMENT_ID)
    if (!(player instanceof HTMLAudioElement)) {
      return
    }

    const onEnded = () => {
      useAudioStore.getState().nextTrack()
    }

    const pauseForBackground = () => {
      useAudioStore.getState().pause()
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        pauseForBackground()
      }
    }

    player.addEventListener('ended', onEnded)
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pagehide', pauseForBackground)
    window.addEventListener('freeze', pauseForBackground)

    return () => {
      player.removeEventListener('ended', onEnded)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pagehide', pauseForBackground)
      window.removeEventListener('freeze', pauseForBackground)
    }
  }, [])

  return <audio id={AUDIO_ELEMENT_ID} preload="auto" hidden />
}
