import type { Track } from '../../data/tracks'

export const AUDIO_ELEMENT_ID = 'mrc-player'

export function getPlayer(): HTMLAudioElement | null {
  if (typeof document === 'undefined') {
    return null
  }

  const player = document.getElementById(AUDIO_ELEMENT_ID)
  return player instanceof HTMLAudioElement ? player : null
}

export function startTrack(track: Track) {
  const player = getPlayer()
  if (!player) {
    return
  }

  if (player.dataset.trackId !== track.id) {
    player.src = track.audioSrc
    player.dataset.trackId = track.id
  }

  player.volume = 1
  void player.play()
}

export function pausePlayer() {
  getPlayer()?.pause()
}
