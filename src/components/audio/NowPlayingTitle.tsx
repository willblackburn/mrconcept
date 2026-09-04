import { useAudioStore } from '../../stores/audioStore'

export function NowPlayingTitle() {
  const currentTrack = useAudioStore((state) => state.currentTrack)

  return (
    <p
      aria-live="polite"
      className="max-w-[55%] truncate text-right text-[0.65rem] tracking-[0.2em] text-white/70"
    >
      {currentTrack?.title ?? ''}
    </p>
  )
}
