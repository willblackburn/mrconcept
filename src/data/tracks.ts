export type Track = {
  id: string
  title: string
  artist: string
  audioSrc: string
  thumbnailSrc: string
  heroVideoSrc?: string
  heroStartTime?: number
  heroAspect?: number
  heroCoverExtra?: number
  youtubeId?: string
  youtubePlaybackRate?: number
  youtubeAspect?: number
  youtubeCoverExtra?: number
}

export const tracks: Track[] = [
  {
    id: 'track-01',
    title: 'Prodigy Planet Asia',
    artist: 'Mr Concept',
    audioSrc: '/audio/mrconcept_prodigy_planetasia.mp3',
    thumbnailSrc: '/images/tracks/mrconcept_prodigy_planetasia.png',
    heroVideoSrc:
      'https://pub-4abdd2ac536542ff8d27ddc8937c2ce0.r2.dev/harlem_1970.mp4',
    heroAspect: 4 / 3,
    heroCoverExtra: 1.2,
  },
  {
    id: 'track-02',
    title: 'Ra Ruggedman',
    artist: 'Mr Concept',
    audioSrc: '/audio/mrconcept_raruggedman.mp3',
    thumbnailSrc: '/images/tracks/mrconcept_raruggedman.png',
    heroVideoSrc:
      'https://pub-4abdd2ac536542ff8d27ddc8937c2ce0.r2.dev/ruggedman_loser.mp4',
    heroStartTime: 1,
    heroCoverExtra: 1.7,
    youtubePlaybackRate: 0.75,
  },
]
