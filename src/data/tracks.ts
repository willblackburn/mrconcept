export type Track = {
  id: string
  title: string
  artist: string
  audioSrc: string
  thumbnailSrc: string
  youtubeId?: string
  youtubePlaybackRate?: number
}

export const tracks: Track[] = [
  {
    id: 'track-01',
    title: 'Prodigy Planet Asia',
    artist: 'Mr Concept',
    audioSrc: '/audio/mrconcept_prodigy_planetasia.mp3',
    thumbnailSrc: '/images/tracks/mrconcept_prodigy_planetasia.png',
  },
  {
    id: 'track-02',
    title: 'Ra Ruggedman',
    artist: 'Mr Concept',
    audioSrc: '/audio/mrconcept_raruggedman.mp3',
    thumbnailSrc: '/images/tracks/mrconcept_raruggedman.png',
    youtubeId: 'qLuJSzs-3lE',
    youtubePlaybackRate: 0.75,
  },
]
