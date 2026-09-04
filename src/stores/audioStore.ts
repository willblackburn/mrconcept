import { create } from 'zustand'
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

function trackAt(queue: Track[], index: number): Track | null {
  return queue[index] ?? null
}

export const useAudioStore = create<AudioState>((set, get) => ({
  queue: tracks,
  currentTrackIndex: 0,
  currentTrack: trackAt(tracks, 0),
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,

  play: () => {
    if (!get().currentTrack) return
    set({ isPlaying: true })
  },

  pause: () => {
    set({ isPlaying: false })
  },

  togglePlayback: () => {
    const { currentTrack, isPlaying } = get()
    if (!currentTrack) return
    set({ isPlaying: !isPlaying })
  },

  nextTrack: () => {
    if (tracks.length === 0) return

    const nextIndex = (get().currentTrackIndex + 1) % tracks.length
    set({
      queue: tracks,
      currentTrackIndex: nextIndex,
      currentTrack: trackAt(tracks, nextIndex),
      currentTime: 0,
      duration: 0,
    })
  },

  previousTrack: () => {
    if (tracks.length === 0) return

    const previousIndex =
      (get().currentTrackIndex - 1 + tracks.length) % tracks.length
    set({
      queue: tracks,
      currentTrackIndex: previousIndex,
      currentTrack: trackAt(tracks, previousIndex),
      currentTime: 0,
      duration: 0,
    })
  },

  setTrack: (index) => {
    if (index < 0 || index >= tracks.length) return

    set({
      queue: tracks,
      currentTrackIndex: index,
      currentTrack: trackAt(tracks, index),
      currentTime: 0,
      duration: 0,
    })
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
