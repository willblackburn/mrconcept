import { create } from 'zustand'
import { pausePlayer, startTrack } from '../components/audio/player'
import { tracks, type Track } from '../data/tracks'

type AudioState = {
  currentTrack: Track | null
  queue: Track[]
  currentTrackIndex: number
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  play: () => void
  pause: () => void
  togglePlayback: () => void
  nextTrack: () => void
  previousTrack: () => void
  setTrack: (index: number) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
}

function trackAt(index: number): Track | null {
  return tracks[index] ?? null
}

export const useAudioStore = create<AudioState>((set, get) => ({
  queue: tracks,
  currentTrackIndex: 0,
  currentTrack: trackAt(0),
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,

  play: () => {
    const track = get().currentTrack
    if (!track) return
    set({ isPlaying: true })
    startTrack(track)
  },

  pause: () => {
    set({ isPlaying: false })
    pausePlayer()
  },

  togglePlayback: () => {
    if (get().isPlaying) {
      get().pause()
      return
    }

    get().play()
  },

  nextTrack: () => {
    if (tracks.length === 0) return

    const nextIndex = (get().currentTrackIndex + 1) % tracks.length
    const track = trackAt(nextIndex)
    if (!track) return

    set({
      queue: tracks,
      currentTrackIndex: nextIndex,
      currentTrack: track,
      currentTime: 0,
      duration: 0,
      isPlaying: true,
    })
    startTrack(track)
  },

  previousTrack: () => {
    if (tracks.length === 0) return

    const previousIndex =
      (get().currentTrackIndex - 1 + tracks.length) % tracks.length
    const track = trackAt(previousIndex)
    if (!track) return

    set({
      queue: tracks,
      currentTrackIndex: previousIndex,
      currentTrack: track,
      currentTime: 0,
      duration: 0,
      isPlaying: true,
    })
    startTrack(track)
  },

  setTrack: (index) => {
    const track = trackAt(index)
    if (!track) return

    set({
      queue: tracks,
      currentTrackIndex: index,
      currentTrack: track,
      currentTime: 0,
      duration: 0,
      isPlaying: true,
    })
    startTrack(track)
  },

  setCurrentTime: (time) => {
    set({ currentTime: time })
  },

  setDuration: (duration) => {
    set({ duration })
  },

  setVolume: (volume) => {
    set({ volume: Math.min(1, Math.max(0, volume)) })
  },
}))
