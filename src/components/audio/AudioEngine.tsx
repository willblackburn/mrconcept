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

    player.addEventListener('ended', onEnded)
    return () => {
      player.removeEventListener('ended', onEnded)
    }
  }, [])

  return <audio id={AUDIO_ELEMENT_ID} preload="auto" hidden />
}
